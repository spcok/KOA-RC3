import { createRxDatabase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

declare global {
  interface Window {
    __KOA_DB_PROMISE: Promise<RxDatabase> | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __KOA_STORAGE: any;
  }
}

// 🛡️ Global Singleton Storage: RxDB requires the EXACT same storage instance across HMR reloads
const storage = window.__KOA_STORAGE || (window.__KOA_STORAGE = getRxStorageDexie());

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

// Module-level cache to prevent microtask race conditions
let localPromise: Promise<RxDatabase> | null = null;

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  // 1. The Global Lock: Check local cache first, then window
  if (localPromise) return localPromise;
  if (window.__KOA_DB_PROMISE) {
    localPromise = window.__KOA_DB_PROMISE;
    return localPromise;
  }

  console.log("🟢 [Core DB] Booting Invincible RxDB Engine v9...");

  // 2. Create the initialization routine and cache it IMMEDIATELY in both places
  localPromise = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'koa_manager_v9',
        storage, // Use the global singleton storage instance
        closeDuplicates: true, // Prevent DB9 race conditions and close old instances
        multiInstance: true,
        eventReduce: true
      });

      // 3. Safely add collections with collision protection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collectionsToAdd: any = {};
      for (const [name, schemaConfig] of Object.entries(appSchemas)) {
        if (!db.collections[name]) {
          collectionsToAdd[name] = schemaConfig;
        }
      }
      if (Object.keys(collectionsToAdd).length > 0) {
        await db.addCollections(collectionsToAdd);
      }

      return db;
    } catch (error) {
      // 4. On failure, clear the locks so the app can attempt a reboot
      localPromise = null;
      window.__KOA_DB_PROMISE = null;
      console.error("🚨 [Core DB] Fatal Boot Error:", error);
      throw error;
    }
  })();
  
  window.__KOA_DB_PROMISE = localPromise;
  return localPromise;
};
