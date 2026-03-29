import { createRxDatabase, RxDatabase, RxJsonSchema, removeRxDatabase } from 'rxdb';
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

declare global {
  interface Window {
    __KOA_DB_PROMISE?: Promise<RxDatabase>;
  }
}

export const bootCoreDatabase = (): Promise<RxDatabase> => {
  if (window.__KOA_DB_PROMISE) {
    return window.__KOA_DB_PROMISE;
  }

  window.__KOA_DB_PROMISE = (async () => {
    console.log("☢️ [Nuclear Reset] Wiping old tablet caches...");
    
    // Silently clear out the corrupted ghost databases
    try { await removeRxDatabase('koa_manager_v12', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v13', getRxStorageDexie()); } catch { /* ignore */ }

    console.log("🟢 [Core DB] Booting Invincible RxDB Engine v14...");
    
    const db = await createRxDatabase({
      name: 'koa_manager_v14',
      storage: getRxStorageDexie()
    });

    // Generate blueprints AT RUNTIME so they cannot be empty
    const runtimeSchemas = SYNC_TABLES.reduce((acc, table) => {
      acc[table] = { schema: universalSchema };
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, { schema: RxJsonSchema<any> }>);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionsToAdd: any = {};
    for (const [name, schemaConfig] of Object.entries(runtimeSchemas)) {
      if (!db.collections[name]) {
        collectionsToAdd[name] = schemaConfig;
      }
    }

    if (Object.keys(collectionsToAdd).length > 0) {
      try {
        await db.addCollections(collectionsToAdd);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.code !== 'COL23' && !error.message?.includes('COL23')) {
          console.error("Collection addition failed:", error);
          throw error;
        }
      }
    }
    
    // The Ultimate Safety Check
    if (!db.collections.animals) {
      console.error("🚨 CRITICAL: RxDB failed to build the animals collection!");
      throw new Error("Database collections failed to attach.");
    }

    console.log("✅ [Core DB] v14 Initialized and Tables Attached.");
    return db;
  })();

  return window.__KOA_DB_PROMISE;
};
