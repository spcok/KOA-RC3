import React, { useEffect, useState } from 'react';
import { RxDatabase } from 'rxdb';
import { bootCoreDatabase } from '../lib/bootCoreDatabase';
import { startCoreSync } from '../lib/DatabaseCore';

export const DatabaseBootProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<RxDatabase | null>(null);

  useEffect(() => {
    const initDb = async () => {
      const database = await bootCoreDatabase();
      setDb(database);
      startCoreSync(); 
    };
    initDb();
  }, []);

  if (!db) return <div className="flex h-screen items-center justify-center">Booting Secure Database...</div>;

  return <>{children}</>;
};
