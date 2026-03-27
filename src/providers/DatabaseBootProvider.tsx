import React, { useEffect, useState } from 'react';
import { bootCoreDatabase, startCoreSync } from '../lib/DatabaseCore';
import { useAuthStore } from '../store/authStore';

export const DatabaseBootProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { session } = useAuthStore();
  const [isBooting, setIsBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initDb = async () => {
      try {
        await bootCoreDatabase();
        if (session) {
           startCoreSync().catch(e => console.warn(e));
        }
        if (isMounted) setIsBooting(false);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to initialize local database.");
      }
    };
    
    initDb();
    return () => { isMounted = false; };
  }, [session]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1c1c1e] text-rose-500 font-mono text-xs">
        <p>Fatal Database Error: {error}</p>
        <button onClick={() => window.location.reload()} className="ml-4 underline">Restart</button>
      </div>
    );
  }

  if (isBooting) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#18181b]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <p className="text-emerald-500 font-mono text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
          Building Pristine Engine...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
