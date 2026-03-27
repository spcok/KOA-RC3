import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { bootCoreDatabase } from '../lib/bootCoreDatabase';

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
  
  const [permissions, setPermissions] = useState<Record<string, boolean | string>>(() => {
    const rawRole = currentUser?.role || (currentUser as unknown as { user_metadata?: { role?: string } })?.user_metadata?.role || 'GUEST';
    const role = String(rawRole).toUpperCase();
    
    if (role === 'OWNER' || role === 'ADMIN') {
      return { 
        ...unlockedPermissions, role, isAdmin: true, isOwner: role === 'OWNER',
        isSeniorKeeper: true, isVolunteer: false, isStaff: true
      };
    }
    return { ...lockedPermissions, role };
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLivePermissions = async () => {
      const rawRole = currentUser?.role || (currentUser as unknown as { user_metadata?: { role?: string } })?.user_metadata?.role;
      if (!rawRole) {
          if (isMounted) setIsLoading(false);
          return;
      }

      const currentRole = String(rawRole).toUpperCase();
      
      if (currentRole === 'OWNER' || currentRole === 'ADMIN') {
          if (isMounted) {
            setPermissions({ 
              ...unlockedPermissions, 
              role: currentRole, 
              isAdmin: true, 
              isOwner: currentRole === 'OWNER',
              isSeniorKeeper: true, 
              isVolunteer: false, 
              isStaff: true 
            });
            setIsLoading(false);
          }
          return;
      }

      try {
        const db = await bootCoreDatabase();
        if (!db.collections.role_permissions) {
          throw new Error('role_permissions collection not found');
        }

        const roleDoc = await db.collections.role_permissions
          .findOne({ selector: { role: currentRole } })
          .exec();

        if (isMounted) {
          if (roleDoc) {
            const roleData = roleDoc.toJSON();
            // Merge with lockedPermissions baseline
            const merged = { 
              ...lockedPermissions, 
              ...roleData, 
              role: currentRole,
              // Ensure core role flags are set based on the role name if not in DB
              isAdmin: currentRole === 'ADMIN',
              isOwner: currentRole === 'OWNER'
            };
            setPermissions(merged);
          } else {
            console.warn(`⚠️ [Permissions] Role ${currentRole} not found in DB. Defaulting to locked.`);
            setPermissions({ ...lockedPermissions, role: currentRole });
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ [Permissions] Failed to sync:', error);
        if (isMounted) {
          setPermissions({ ...lockedPermissions, role: currentRole });
          setIsLoading(false);
        }
      }
    };

    fetchLivePermissions();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return { ...permissions, isLoading };
}
