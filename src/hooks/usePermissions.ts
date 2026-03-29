import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { RxDocument } from 'rxdb';
import { useAuthStore } from '../store/authStore';
import { bootCoreDatabase } from '../lib/bootCoreDatabase';
import { User, RolePermissionConfig } from '../types';

const lockedPermissions = {
  isAdmin: false, isOwner: false, isSeniorKeeper: false, isVolunteer: false, isStaff: false,
  view_animals: false, add_animals: false, edit_animals: false, archive_animals: false,
  view_daily_logs: false, create_daily_logs: false, edit_daily_logs: false,
  view_tasks: false, complete_tasks: false, manage_tasks: false,
  view_daily_rounds: false, log_daily_rounds: false,
  view_medical: false, add_clinical_notes: false, prescribe_medications: false, administer_medications: false, manage_quarantine: false,
  view_movements: false, log_internal_movements: false, manage_external_transfers: false,
  view_incidents: false, report_incidents: false, manage_incidents: false,
  view_maintenance: false, report_maintenance: false, resolve_maintenance: false,
  view_safety_drills: false, view_first_aid: false,
  submit_timesheets: false, manage_all_timesheets: false,
  request_holidays: false, approve_holidays: false,
  view_missing_records: false, manage_zla_documents: false, generate_reports: false,
  view_settings: false, manage_users: false, manage_roles: false,
  canViewAnimals: false, canEditAnimals: false, canViewMedical: false, canEditMedical: false, 
  canViewReports: false, canManageStaff: false, canEditSettings: false, canViewSettings: false, 
  canGenerateReports: false, canManageUsers: false, canViewMovements: false, canEditMovements: false,
};

const unlockedPermissions = Object.keys(lockedPermissions).reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {} as Record<string, boolean>);

export function usePermissions(): Record<string, boolean | string> & { isLoading: boolean } {
  const { currentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean | string>>({ ...lockedPermissions });

  useEffect(() => {
    let isMounted = true;
    let userSub: Subscription | null = null;
    let roleSub: Subscription | null = null;

    const setupReactivePermissions = async () => {
      if (!currentUser?.id) {
          if (isMounted) setIsLoading(false);
          return;
      }

      // Extract role
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawRole = currentUser?.role || (currentUser as any)?.user_metadata?.role || 'GUEST';
      const currentRole = String(rawRole).toUpperCase();

      // Fast-track System Owners & Admins
      if (currentRole === 'OWNER' || currentRole === 'ADMIN') {
          if (isMounted) {
            setPermissions({ 
              ...unlockedPermissions, role: currentRole, isAdmin: true, isOwner: currentRole === 'OWNER',
              isSeniorKeeper: true, isVolunteer: false, isStaff: true
            });
            setIsLoading(false);
          }
          return;
      }

      try {
        const db = await bootCoreDatabase();
        
        if (!db.collections || !db.collections.users || !db.collections.role_permissions) {
          console.warn("⚠️ [Permissions] Collections not ready yet.");
          if (isMounted) {
            setPermissions({ ...lockedPermissions, role: 'GUEST' });
            setIsLoading(false);
          }
          return;
        }

        // 1. Listen to the local 'users' table. When the sync finishes, this fires again automatically!
        userSub = db.collections.users.findOne({ selector: { id: currentUser.id } }).$.subscribe((userDoc: RxDocument<User> | null) => {
          
          // Pull role from local DB first, fallback to the Supabase auth token, or default to GUEST
          const rawRole = userDoc?.get('role') || currentUser?.role || 'GUEST';
          const currentRole = String(rawRole).toUpperCase();

          // Fast-track System Owners & Admins
          if (currentRole === 'OWNER' || currentRole === 'ADMIN') {
              if (isMounted) {
                setPermissions({ 
                  ...unlockedPermissions, role: currentRole, isAdmin: true, isOwner: currentRole === 'OWNER',
                  isSeniorKeeper: true, isVolunteer: false, isStaff: true
                });
                setIsLoading(false);
              }
              return;
          }

          // 2. Listen to the role_permissions table based on the discovered role
          if (roleSub) roleSub.unsubscribe(); // Clean up if the role upgrades during sync
          
          roleSub = db.collections.role_permissions.findOne({ selector: { id: currentRole.toLowerCase() } }).$.subscribe((roleDoc: RxDocument<RolePermissionConfig> | null) => {
            if (isMounted) {
              if (roleDoc) {
                console.log(`🔓 [Permissions] Live sync unlocked role: ${currentRole}`);
                setPermissions({
                  ...lockedPermissions,
                  ...roleDoc.toJSON(),
                  role: currentRole
                });
              } else {
                console.warn(`⚠️ [Permissions] Role ${currentRole} not found yet. Waiting for sync...`);
                setPermissions({ ...lockedPermissions, role: currentRole });
              }
              setIsLoading(false);
            }
          });
        });

      } catch (error) {
        console.error('❌ [Permissions] Reactive sync failed:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    setupReactivePermissions();

    return () => {
      isMounted = false;
      if (userSub) userSub.unsubscribe();
      if (roleSub) roleSub.unsubscribe();
    };
  }, [currentUser]);

  return { ...permissions, isLoading };
}