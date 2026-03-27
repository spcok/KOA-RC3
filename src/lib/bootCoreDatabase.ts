import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { appSchemas } from './DatabaseCore';

export const bootCoreDatabase = async (): Promise<RxDatabase> => {
  // 1. The Global Lock: Attached to the window so it survives Vite HMR reloads
  if ((window as any).__KOA_DB_PROMISE) {
    return (window as any).__KOA_DB_PROMISE;
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
      } catch (colError: any) {
        // 🛡️ The Loop Severance: If collections already exist (COL23), we swallow and proceed.
        if (colError.code === 'COL23' || colError.message?.includes('COL23')) {
          console.warn("🛡️ [Core DB] Collection Collision Swallowed. Proceeding with existing collections.");
        } else {
          throw colError;
        }
      }

      return db;
    } catch (error) {
      // 4. On failure, clear the lock so the app can attempt a reboot
      (window as any).__KOA_DB_PROMISE = null;
      console.error("🚨 [Core DB] Fatal Boot Error:", error);
      throw error;
    }
  })();

  // 5. Cache the promise globally IMMEDIATELY, before the async work finishes
  (window as any).__KOA_DB_PROMISE = initPromise;
  
  return initPromise;
};
