import { createRxDatabase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateSupabase, RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';
import { supabase } from './supabase';
import { Subscription } from 'rxjs';

interface KoaWindow extends Window {
  __KOA_DB_PROMISE?: Promise<RxDatabase> | null;
}

const SYNC_TABLES = [
  'animals', 'archived_animals', 'daily_logs', 'daily_rounds',
  'medical_logs', 'mar_charts', 'quarantine_records',
  'internal_movements', 'external_transfers', 'shifts',
  'holidays', 'timesheets', 'maintenance_logs', 'incidents',
  'first_aid_logs', 'safety_drills', 'operational_lists',
  'users', 'organisations', 'role_permissions', 'contacts',
  'zla_documents', 'bug_reports', 'tasks'
];

// The Immortal Schema: Blindly accepts all columns from Supabase
const universalSchema: RxJsonSchema<Record<string, unknown>> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'string', maxLength: 100 },
    is_deleted: { type: ['boolean', 'null'] },
    updated_at: { type: ['string', 'null'] }
  },
  required: ['id']
};

const appSchemas = SYNC_TABLES.reduce((acc, table) => {
  acc[table] = { schema: universalSchema };
  return acc;
}, {} as Record<string, any>);

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  const koaWindow = window as unknown as KoaWindow;

  if (koaWindow.__KOA_DB_PROMISE) {
    return koaWindow.__KOA_DB_PROMISE;
  }

  console.log("🟢 [Core DB] Booting Pristine RxDB Engine...");

  koaWindow.__KOA_DB_PROMISE = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'koa_manager_pristine_v1', 
        storage: getRxStorageDexie()
      });

      // Safe lock: Only add collections if the DB is truly empty
      if (Object.keys(db.collections).length === 0) {
        await db.addCollections(appSchemas);
      }

      return db;
    } catch (error: any) {
      koaWindow.__KOA_DB_PROMISE = null;
      throw error;
    }
  })();

  return koaWindow.__KOA_DB_PROMISE;
};

const activeReplications: RxSupabaseReplicationState<unknown>[] = [];
const errorSubs: Subscription[] = [];
let isSyncing = false;

export const startCoreSync = async () => {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const db = await bootCoreDatabase();
    console.log("📡 [Sync] Engaging Pristine 1:1 Supabase Sync...");

    await Promise.all(activeReplications.map(s => s.cancel()));
    activeReplications.length = 0;
    errorSubs.forEach(s => s.unsubscribe());
    errorSubs.length = 0;

    for (const table of SYNC_TABLES) {
      if (!db.collections[table]) continue;

      const state = replicateSupabase({
        collection: db.collections[table],
        replicationIdentifier: `pristine_${table}_sync`,
        client: supabase,
        tableName: table,
        deletedField: 'is_deleted',
        pull: { batchSize: 100 },
        push: {
          modifier: (doc: Record<string, unknown>) => {
            const clean = { ...doc };
            delete clean._rev;
            delete clean._meta;
            delete clean._attachments;
            return clean;
          }
        },
        live: true
      });

      activeReplications.push(state);
      errorSubs.push(state.error$.subscribe(err => {
        if (!err.message?.includes('Offline')) console.error(`[Sync] ${table}:`, err);
      }));
    }
  } finally {
    isSyncing = false;
  }
};
