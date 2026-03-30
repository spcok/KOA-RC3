import { useState, useEffect } from 'react';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export const useAnimalsData = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let sub: any;
    let isMounted = true;
    
    const init = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!db?.collections?.animals || !isMounted) return;

        const query = db.collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // The exact fix for the polling loop: ensure we only set state if mounted.
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