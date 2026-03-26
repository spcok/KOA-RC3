import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { bootCoreDatabase, startCoreSync } from '../lib/DatabaseCore';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  currentUser: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isUiLocked: boolean;
  setUiLocked: (locked: boolean) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const withTimeout = <T>(promise: Promise<T>, ms: number, fallbackError: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(fallbackError)), ms))
  ]);
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  session: null,
  isLoading: true,
  error: null,
  isUiLocked: false,
  setUiLocked: (locked) => set({ isUiLocked: locked }),

  initialize: async () => {
    try {
      if (navigator.onLine) {
        const { data: { session } } = await withTimeout(
           supabase.auth.getSession(), 
           3000, 
           "Session check timed out"
        );
        if (session) {
          set({ session, isLoading: false });
          return;
        }
      }
      set({ isLoading: false });
    } catch (error: unknown) {
      console.warn('Auth init skipped/timed out:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      let isOnlineAuthSuccess = false;
      let activeSession = null;

      // 🚨 TIER 1: STRICT SEQUENTIAL ONLINE GATEKEEPER
      if (navigator.onLine) {
        try {
          console.log("📡 [Auth] Attempting Live Supabase Login...");
          
          const authResponse = await withTimeout(
            supabase.auth.signInWithPassword({ email, password }), 
            5000, 
            "Supabase connection timed out."
          );

          if (authResponse.error) {
            if (authResponse.error.message.toLowerCase().includes('credentials') || authResponse.error.message.toLowerCase().includes('invalid')) {
              throw new Error("Invalid email or password.");
            }
            throw new Error("Supabase rejected connection.");
          } 
          
          isOnlineAuthSuccess = true;
          activeSession = authResponse.data.session;
          console.log("✅ [Auth] Live Login Successful. Now fetching local profile...");
          startCoreSync().catch(e => console.warn(e));

        } catch (tier1Error: unknown) {
          if (tier1Error instanceof Error && tier1Error.message === "Invalid email or password.") {
            throw tier1Error; 
          }
          console.warn("⚠️ [Auth] Live Login Network Failure. Falling back to offline cache...", tier1Error instanceof Error ? tier1Error.message : String(tier1Error));
        }
      }

     // 🚨 TIER 2 & PROFILE HYDRATION: Only runs after Tier 1 finishes
      console.log("🛡️ [Auth] Booting local cache to retrieve user profile...");
      const db = await withTimeout(bootCoreDatabase(), 3000, "Local database failed to wake up.");
      
      let usersDoc = await withTimeout(
        db.users.find({ selector: {} }).exec(),
        4000,
        "Offline database query timed out. IndexedDB connection may be corrupted."
      );

      let rawUsers = usersDoc ? usersDoc.map(u => u.toJSON()) : [];
      let localUser = rawUsers.find(u => u.email?.toLowerCase() === email.toLowerCase() && !u.is_deleted);

      // 🚨 CRITICAL FIX: The "New Device" Catch-22 Waiter
      // If this is a fresh login, background sync hasn't finished pulling the profile yet.
      // We pause for 2.5 seconds to let the sync populate the database, then check again.
      if (!localUser && isOnlineAuthSuccess) {
         console.log("⏳ [Auth] Local profile not found. Waiting for background sync to catch up...");
         await new Promise(resolve => setTimeout(resolve, 2500)); 
         
         usersDoc = await db.users.find({ selector: {} }).exec();
         rawUsers = usersDoc ? usersDoc.map(u => u.toJSON()) : [];
         localUser = rawUsers.find(u => u.email?.toLowerCase() === email.toLowerCase() && !u.is_deleted);
      }

      if (!localUser) {
        throw new Error(navigator.onLine 
          ? "No profile found on this device. Please check your credentials or contact support." 
          : "No offline profile found. Connect to Wi-Fi to sync this device.");
      }
      
      // 🚨 TIER 3: OFFLINE VERIFICATION
      if (!isOnlineAuthSuccess) {
        console.log("🔒 [Auth] Engaging Offline Verification...");
        const storedPin = String(localUser.pin || '');
        const storedPass = String(localUser.password || '');
        const inputCredentials = String(password);
        
        if (storedPin !== inputCredentials && storedPass !== inputCredentials) {
          throw new Error("Invalid offline email or PIN/Password.");
        }
        console.log("✅ [Auth] Offline Login Successful.");
      }

      set({
        session: activeSession,
        currentUser: {
          id: String(localUser.id),
          email: localUser.email,
          name: localUser.name || 'Unknown User',
          role: localUser.role || 'GUEST',
          initials: localUser.initials || '??',
        },
        isLoading: false
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Auth] Final Rejection:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error; 
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (navigator.onLine) {
        await withTimeout(supabase.auth.signOut(), 2000, "Logout timeout").catch(e => console.warn(e));
      }
    } finally {
      set({ currentUser: null, session: null, isLoading: false, error: null });
    }
  }
}));