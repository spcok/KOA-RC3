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
        if (!db?.collections?.animals) {
          setIsLoading(false);
          return;
        }

        const query = db.collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // Safe, simple subscription
        sub = query.$.subscribe(results => {
          setAnimals(results.map(d => d.toJSON()));
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
