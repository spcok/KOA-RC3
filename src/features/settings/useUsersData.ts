import { useState, useEffect, useCallback } from 'react';
import { User, RolePermissionConfig } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    // No-op with RxDB since it's reactive
  }, []);

  useEffect(() => {
    let isMounted = true;
    const subs: { unsubscribe: () => void }[] = [];

    const loadData = async () => {
      try {
        const db = await bootCoreDatabase();
        
        if (!db.collections || !db.collections.users || !db.collections.role_permissions) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Subscribe to users
        const usersSub = db.collections.users.find().$.subscribe(docs => {
          if (isMounted) {
            setUsers(docs.map(doc => doc.toJSON() as User));
            setIsLoading(false);
          }
        });
        subs.push(usersSub);

        // Subscribe to role_permissions
        const rolesSub = db.collections.role_permissions.find().$.subscribe(docs => {
          if (isMounted) {
            setRolePermissions(docs.map(doc => doc.toJSON() as RolePermissionConfig));
          }
        });
        subs.push(rolesSub);

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
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.users.findOne({ selector: { id } }).exec();
      if (doc) {
        await doc.remove();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.users.findOne({ selector: { id } }).exec();
      if (doc) {
        await doc.patch(updates);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const updateRolePermissions = async (role: string, updates: Partial<RolePermissionConfig>) => {
    try {
      const db = await bootCoreDatabase();
      // For updateRolePermissions, ensure you are querying by id: role.toLowerCase()
      const doc = await db.collections.role_permissions.findOne({ 
        selector: { id: role.toLowerCase() } 
      }).exec();
      if (doc) {
        await doc.patch(updates);
      }
    } catch (err) {
      console.error('Failed to update role permissions:', err);
    }
  };

  return { users, rolePermissions, isLoading, deleteUser, updateUser, updateRolePermissions, refresh };
}
