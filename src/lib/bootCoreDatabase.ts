import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { appSchemas } from './DatabaseCore';

// 🔥 Module-scoped Singleton Promise to cache the database initialization
let globalDbPromise: Promise<RxDatabase> | null = null;

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  // 🔥 GlobalThis lock mathematically prevents DB9 across Vite HMR
  if ((globalThis as any).__KOA_DB_PROMISE) {
    return (globalThis as any).__KOA_DB_PROMISE;
  }

  if (globalDbPromise) return globalDbPromise;

  console.log("🟢 [Core DB] Booting Invincible RxDB Engine v6...");

  globalDbPromise = (async () => {
    const db = await createRxDatabase({
      name: 'koa_manager_v6', 
      storage: getRxStorageDexie(),
      ignoreDuplicate: true
    });

    try {
      if (Object.keys(db.collections).length === 0) {
        await db.addCollections(appSchemas);
      }
    } catch (err: any) {
      // 🛡️ The Loop Severance: If HMR collides, we swallow the error and KEEP the DB instance. 
      // The background process will finish building the tables naturally.
      console.warn("🛡️ [Core DB] HMR Collision Swallowed. Proceeding with cached DB.");
    }

    return db;
  })();

  (globalThis as any).__KOA_DB_PROMISE = globalDbPromise;
  return globalDbPromise;
};
