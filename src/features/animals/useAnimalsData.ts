import { useState, useEffect } from 'react';
import { useDbStore } from '../../store/dbStore';
import { Subscription } from 'rxjs';

export const useAnimalsData = () => {
  const db = useDbStore(state => state.db);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safely wait for the database and table to be fully attached by the BootProvider
    if (!db || !db.collections || !db.collections.animals) {
      return; 
    }

    let sub: Subscription | null = null;
    let isMounted = true;

    const loadData = async () => {
      try {
        // NO SELECTOR - Pull everything, regardless of null vs false
        const query = db.collections.animals.find();

        // 1. Initial Native Fetch
        const rawDocs = await query.exec();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanData = JSON.parse(JSON.stringify(rawDocs.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
        
        if (isMounted) {
          // Filter in JavaScript where null is treated gracefully
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const activeAnimals = cleanData.filter((a: any) => !a.is_deleted && !a.archived);
          setAnimals(activeAnimals);
          setIsLoading(false);
        }

        // 2. Background Listener for Live Sync
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sub = query.$.subscribe((results: any[]) => {
          if (isMounted) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedData = JSON.parse(JSON.stringify(results.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activeAnimals = updatedData.filter((a: any) => !a.is_deleted && !a.archived);
            setAnimals(activeAnimals);
          }
        });
      } catch (err) {
        console.error("Failed to load animals:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [db]); // Re-runs automatically when Zustand provides the booted db

  return { animals, isLoading };
};
