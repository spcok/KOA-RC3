import { useState, useEffect } from 'react';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';
import { Subscription } from 'rxjs';
import { Animal } from '../../types';

export const useAnimalsData = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let sub: Subscription | null = null;
    
    const init = async () => {
      try {
        const db = await bootCoreDatabase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collections = (db as any).collections;
        if (!collections?.animals) {
          setIsLoading(false);
          return;
        }

        const query = collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // Safe, simple subscription
        sub = query.$$.subscribe(results => {
          setAnimals(results);
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Failed to subscribe to animals:", err);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  return { animals, isLoading };
};
