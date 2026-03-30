import { createRxDatabase, RxDatabase, removeRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { appSchemas } from './appSchemas';

let dbPromise: Promise<RxDatabase> | null = null;

export const bootCoreDatabase = (): Promise<RxDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    console.log("☢️ [Nuclear Reset] Wiping old tablet caches...");
    
    // Silently clear out the corrupted ghost databases
    try { await removeRxDatabase('koa_manager_v6', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v7', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v8', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v9', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v10', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v11', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v12', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v13', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v14', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v15', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v16', getRxStorageDexie()); } catch { /* ignore */ }
    try { await removeRxDatabase('koa_manager_v17', getRxStorageDexie()); } catch { /* ignore */ }

    console.log("🟢 [Core DB] Booting Invincible RxDB Engine v18...");
    
    const db = await createRxDatabase({
      name: 'koa_manager_v18',
      storage: getRxStorageDexie()
    });

    // X-Ray Logging: Verify exactly what keys are being passed to addCollections
    console.log("🧪 [X-Ray] Collections to add:", Object.keys(appSchemas));
    
    for (const [name, schemaConfig] of Object.entries(appSchemas)) {
      if (!db.collections[name]) {
        try {
          console.log(`🛠️ [Phase 1] Attempting to build collection: ${name}...`);
          
          // Ensure strict schema format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedConfig: any = (schemaConfig as any).schema ? schemaConfig : { schema: schemaConfig };
          
          await db.addCollections({
            [name]: formattedConfig
          });
          console.log(`✅ [Phase 1] Built collection: ${name}`);
        } catch (error: unknown) {
          const err = error as { code?: string; message?: string };
          if (err.code !== 'COL23' && !err.message?.includes('COL23')) {
            console.error(`🚨 [Phase 1] FAILED TO BUILD '${name}'. RxDB Validation Error:`, error);
          }
        }
      }
    }
    
    // The Ultimate Safety Check
    if (!db.collections.animals) {
      console.error("🚨 CRITICAL: RxDB failed to build the animals collection!");
      throw new Error("Database collections failed to attach.");
    }

    console.log("✅ [Core DB] v18 Initialized and Tables Attached.");
    return db;
  })();

  return dbPromise;
};
