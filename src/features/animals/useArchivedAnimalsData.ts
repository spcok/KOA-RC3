import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useArchivedAnimalsData() {
  const [archivedAnimals, setArchivedAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const loadArchivedAnimals = async () => {
      try {
        setIsLoading(true);
        const db = await bootCoreDatabase();
        
        if (!db || !db.collections || !db.collections.animals) {
          if (isMounted) setIsLoading(false);
          return;
        }

        sub = db.collections.animals
          .find({ selector: { is_deleted: true } })
          .$.subscribe(docs => {
            if (isMounted) {
              setArchivedAnimals(docs.map(doc => doc.toJSON() as Animal));
              setIsLoading(false);
            }
          });

      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error loading archived animals'));
          setIsLoading(false);
        }
      }
    };

    loadArchivedAnimals();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  return { archivedAnimals, isLoading, error };
}
