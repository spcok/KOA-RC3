import { useState, useEffect } from 'react';
import { useDbStore } from '../../store/dbStore';
import { Subscription } from 'rxjs';

export const useAnimalsData = () => {
  const db = useDbStore(state => state.db);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db?.collections?.animals) return;

    let sub: Subscription | null = null;
    let isMounted = true;

    const loadData = async () => {
      try {
        const query = db.collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // 1. Initial Fetch + Purification
        const rxDocs = await query.exec();
        const cleanData = JSON.parse(JSON.stringify(rxDocs.map(d => d.toJSON())));
        
        console.log(`🦁 [Animals Heartbeat] Database returned ${cleanData.length} records.`);

        if (isMounted) {
          setAnimals(cleanData);
          setIsLoading(false);
        }

        // 2. Background Listener
        sub = query.$.subscribe(results => {
          const updatedData = JSON.parse(JSON.stringify(results.map(d => d.toJSON())));
          if (isMounted) {
            setAnimals(updatedData);
          }
        });
      } catch (err) {
        console.error("🚨 [Animals Heartbeat] Query Failed:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [db]);

  return { animals, isLoading };
};
