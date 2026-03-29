import { createRxDatabase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

export const SYNC_TABLES = [
  'animals', 'archived_animals', 'daily_logs', 'daily_rounds',
  'medical_logs', 'mar_charts', 'quarantine_records',
  'internal_movements', 'external_transfers', 'shifts',
  'holidays', 'timesheets', 'maintenance_logs', 'incidents',
  'first_aid_logs', 'safety_drills', 'operational_lists',
  'users', 'organisations', 'role_permissions', 'contacts',
  'zla_documents', 'bug_reports', 'tasks'
];

// 🚨 CRITICAL FIX: additionalProperties MUST be true for Supabase wildcard sync
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const universalSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalProperties: true as any, 
  properties: {
    id: { type: 'string', maxLength: 100 },
    is_deleted: { type: ['boolean', 'null'] },
    updated_at: { type: ['string', 'null'] }
  },
  required: ['id']
};

export const appSchemas = SYNC_TABLES.reduce((acc, table) => {
  acc[table] = { schema: universalSchema };
  return acc;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}, {} as Record<string, { schema: RxJsonSchema<any> }>);

declare global {
  interface Window {
    __KOA_DB_PROMISE: Promise<RxDatabase> | null;
  }
}

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  // 1. The Global Lock: Attached to the window so it survives Vite HMR reloads
  if (window.__KOA_DB_PROMISE) {
    return window.__KOA_DB_PROMISE;
  }

  console.log("🟢 [Core DB] Booting Invincible RxDB Engine v7...");

  // 2. Create the initialization routine
  const initPromise = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'koa_manager_v7',
        storage: getRxStorageDexie()
      });

      // 3. Safely add collections with collision protection
      try {
        if (Object.keys(db.collections).length === 0) {
          await db.addCollections(appSchemas);
        }
      } catch (colError: unknown) {
        // 🛡️ The Loop Severance: If collections already exist (COL23), we swallow and proceed.
        const error = colError as { code?: string; message?: string };
        if (error.code === 'COL23' || error.message?.includes('COL23')) {
          console.warn("🛡️ [Core DB] Collection Collision Swallowed. Proceeding with existing collections.");
        } else {
          throw colError;
        }
      }

      return db;
    } catch (error) {
      // 4. On failure, clear the lock so the app can attempt a reboot
      window.__KOA_DB_PROMISE = null;
      console.error("🚨 [Core DB] Fatal Boot Error:", error);
      throw error;
    }
  })();

  // 5. Cache the promise globally IMMEDIATELY, before the async work finishes
  window.__KOA_DB_PROMISE = initPromise;
  
  return initPromise;
};
