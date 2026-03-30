import { useState, useEffect } from 'react';
import { useDbStore } from '../../store/dbStore';
import { Subscription } from 'rxjs';
import { Animal } from '../../types';

export const useAnimalsData = () => {
  const db = useDbStore(state => state.db);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db?.collections?.animals) {
      return;
    }

    let sub: Subscription | null = null;
    
    try {
      const query = db.collections.animals.find({
        selector: { is_deleted: false, archived: false }
      });

      // Synchronous subscription using $$ for pure JSON
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sub = (query.$$ as any).subscribe((results: Animal[]) => {
        setAnimals(results);
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Failed to subscribe to animals:", err);
      setTimeout(() => setIsLoading(false), 0);
    }

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [db]); // Re-run if db changes

  return { animals, isLoading };
};
