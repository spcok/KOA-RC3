import { useState, useEffect, useCallback } from 'react';
import { User, RolePermissionConfig } from '../../types';

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    // No-op with RxDB since it's reactive
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subs: { unsubscribe: () => void }[] = [];

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Users data loading is neutralized.");
        if (isMounted) {
          setUsers([]);
          setRolePermissions([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load users data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      subs.forEach(sub => sub.unsubscribe());
    };
  }, []);

  // --- SECURE USER DELETION PIPELINE ---
  const deleteUser = async (id: string) => {
    console.log("☢️ [Zero Dawn] User deletion is neutralized.", id);
    alert("Database engine is neutralized. User cannot be deleted.");
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    console.log("☢️ [Zero Dawn] User update is neutralized.", { id, updates });
    alert("Database engine is neutralized. User cannot be updated.");
  };

  const updateRolePermissions = async (role: string, updates: Partial<RolePermissionConfig>) => {
    console.log("☢️ [Zero Dawn] Role permissions update is neutralized.", { role, updates });
    alert("Database engine is neutralized. Permissions cannot be updated.");
  };

  return { users, rolePermissions, isLoading, deleteUser, updateUser, updateRolePermissions, refresh };
}
