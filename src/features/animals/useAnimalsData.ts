import { useState, useEffect } from 'react';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export const useAnimalsData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sub: any;
    let isMounted = true;
    
    const init = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!db?.collections?.animals || !isMounted) return;

        // Establish the live query pipeline, filtering out archived/deleted
        const query = db.collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // Subscribe to changes (this fires immediately with current data, and again on any change/sync)
        sub = query.$.subscribe(results => {
          if (isMounted) {
            setAnimals(results.map(d => d.toJSON()));
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to subscribe to animals:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  return { animals, isLoading };
};
