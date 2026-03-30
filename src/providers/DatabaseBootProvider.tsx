import { useEffect } from 'react';
import { bootCoreDatabase } from '../lib/bootCoreDatabase';
import { startCoreSync } from '../lib/DatabaseCore';
import { useDbStore } from '../store/dbStore';

export const DatabaseBootProvider = ({ children }: { children: React.ReactNode }) => {
  const { db, setDb } = useDbStore();

  useEffect(() => {
    let isMounted = true;
    const initDb = async () => {
      try {
        const database = await bootCoreDatabase();
        if (isMounted) {
          setDb(database);
          startCoreSync();
        }
      } catch (err) {
        console.error("Failed to boot database:", err);
      }
    };

    if (!db) {
      initDb();
    }

    return () => {
      isMounted = false;
    };
  }, [db, setDb]);

  if (!db) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <h2 className="text-xl font-semibold text-gray-700">Booting Secure Database...</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
