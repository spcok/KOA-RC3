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
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    let sub: Subscription | null = null;
    let isMounted = true;

    const loadData = async () => {
      try {
        const query = db.collections.animals.find({
          selector: { is_deleted: false, archived: false }
        });

        // 1. BRUTE FORCE INITIAL FETCH
        const initialResults = await query.exec();
        if (isMounted) {
          setAnimals(initialResults.map(d => d.toJSON() as Animal));
          setIsLoading(false);
        }

        // 2. BACKGROUND LISTENER FOR FUTURE SYNC UPDATES
        sub = query.$.subscribe(results => {
          if (isMounted) {
            setAnimals(results.map(d => d.toJSON() as Animal));
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
  }, [db]); 

  return { animals, isLoading };
};
