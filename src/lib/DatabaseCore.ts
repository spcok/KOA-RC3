import { createRxDatabase, RxDatabase, RxJsonSchema } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { replicateSupabase, RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';
import { supabase } from './supabase';
import { Subscription } from 'rxjs';

interface KoaWindow extends Window {
  __KOA_DB_PROMISE?: Promise<RxDatabase> | null;
  __KOA_DB_INSTANCE?: RxDatabase | null;
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

const universalSchema: RxJsonSchema<Record<string, unknown>> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'string', maxLength: 100 },
    is_deleted: { type: ['boolean', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] }
  },
  required: ['id']
};

const appSchemas = SYNC_TABLES.reduce((acc, table) => {
  acc[table] = { schema: universalSchema };
  return acc;
}, {} as Record<string, { schema: RxJsonSchema<Record<string, unknown>> }>);

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  const koaWindow = window as unknown as KoaWindow;
  
  if (koaWindow.__KOA_DB_PROMISE) return koaWindow.__KOA_DB_PROMISE;

  console.log("🛡️ [Core DB] Booting Project Phoenix v8 (Ironclad Engine v2)...");

  koaWindow.__KOA_DB_PROMISE = (async () => {
    try {
      const db = await createRxDatabase({
        name: 'koa_manager_ironclad_v2',
        storage: getRxStorageDexie()
      });

      if (!db.collections.animals) {
        await db.addCollections(appSchemas);
      }

      koaWindow.__KOA_DB_INSTANCE = db;
      return db;
    } catch (error: unknown) {
      koaWindow.__KOA_DB_PROMISE = null;
      koaWindow.__KOA_DB_INSTANCE = null;
      throw error;
    }
  })();

  return koaWindow.__KOA_DB_PROMISE;
};

const activeReplications: RxSupabaseReplicationState<unknown>[] = [];
const errorSubscriptions: Subscription[] = [];
let isSyncStarting = false;

export const startCoreSync = async () => {
  if (isSyncStarting) return;
  isSyncStarting = true;

  try {
    const db = await bootCoreDatabase();
    if (!navigator.onLine) return;

    console.log("📡 [Sync] Online. Engaging 1:1 Supabase Replication...");

    await Promise.all(activeReplications.map(state => state.cancel()));
    activeReplications.length = 0;

    errorSubscriptions.forEach(sub => sub.unsubscribe());
    errorSubscriptions.length = 0;

    for (const table of SYNC_TABLES) {
      const collection = db.collections[table];
      if (!collection) continue;

      const state = replicateSupabase({
        collection,
        replicationIdentifier: `ironclad_${table}_sync_v2`,
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
      errorSubscriptions.push(state.error$.subscribe(err => {
        if (!err.message?.includes('Offline')) console.error(`[Sync Error] ${table}:`, err);
      }));
    }
  } finally {
    isSyncStarting = false;
  }
};
