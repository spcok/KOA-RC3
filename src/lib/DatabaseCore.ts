import { replicateSupabase, RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';
import { supabase } from './supabase';
import { Subscription } from 'rxjs';
import { bootCoreDatabase } from './bootCoreDatabase';
import { SYNC_TABLES } from './appSchemas';

const activeReplications: RxSupabaseReplicationState<unknown>[] = [];
const errorSubs: Subscription[] = [];
let isSyncing = false;

export const startCoreSync = async () => {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const db = await bootCoreDatabase();
    console.log("📡 [Sync] Engaging 1:1 Supabase Sync v18...");

    await Promise.all(activeReplications.map(s => s.cancel()));
    activeReplications.length = 0;
    errorSubs.forEach(s => s.unsubscribe());
    errorSubs.length = 0;

    for (const table of SYNC_TABLES) {
      if (!db.collections[table]) continue;

      const state = replicateSupabase({
        collection: db.collections[table],
        replicationIdentifier: `koa_${table}_sync_v18`,
        client: supabase,
        tableName: table,
        deletedField: 'is_deleted',
        pull: { batchSize: 100 },
        push: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          modifier: (doc: Record<string, any>) => {
            const clean = { ...doc };
            
            // Translate RxDB tombstone to ZLA-compliant archive flag
            if (clean._deleted === true) {
              clean.is_deleted = true;
            }
            
            // Strip internal RxDB protocols so Supabase accepts the payload
            delete clean._rev;
            delete clean._meta;
            delete clean._attachments;
            delete clean._deleted; 
            
            return clean;
          }
        },
        live: true
      });

      activeReplications.push(state);

      // Ultra-Verbose X-Rays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorSubs.push(state.error$.subscribe((error: any) => {
        console.error(`🚨 [Sync X-Ray] ERROR in table '${table}':`, error);
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorSubs.push(state.received$.subscribe((data: any) => {
        console.log(`📥 [Sync X-Ray] '${table}' pulled ${data.length} records from Cloud.`);
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorSubs.push(state.sent$.subscribe((data: any) => {
        console.log(`📤 [Sync X-Ray] '${table}' pushed ${data.length} records to Cloud.`);
      }));
    }
  } finally {
    isSyncing = false;
  }
};
