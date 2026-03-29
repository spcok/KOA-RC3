import { replicateSupabase, RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';
import { supabase } from './supabase';
import { Subscription } from 'rxjs';
import { bootCoreDatabase, SYNC_TABLES } from './bootCoreDatabase';

const activeReplications: RxSupabaseReplicationState<unknown>[] = [];
const errorSubs: Subscription[] = [];
let isSyncing = false;

export const startCoreSync = async () => {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const db = await bootCoreDatabase();
    console.log("📡 [Sync] Engaging 1:1 Supabase Sync v16...");

    await Promise.all(activeReplications.map(s => s.cancel()));
    activeReplications.length = 0;
    errorSubs.forEach(s => s.unsubscribe());
    errorSubs.length = 0;

    for (const table of SYNC_TABLES) {
      if (!db.collections[table]) continue;

      const state = replicateSupabase({
        collection: db.collections[table],
        replicationIdentifier: `koa_${table}_sync_v16`,
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
        if (!err.message?.includes('Offline')) console.error(`[Sync Error] ${table}:`, err);
      }));
    }
  } finally {
    isSyncing = false;
  }
};
