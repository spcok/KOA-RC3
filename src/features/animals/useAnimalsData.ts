import { useState, useEffect } from 'react';
import { Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useAnimalsData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnimals = async () => {
      try {
        setIsLoading(true);
        const db = await bootCoreDatabase();
        if (!db || !db.collections || !db.collections.animals) return;

        const animalDocs = await db.collections.animals.find().exec();
        
        if (isMounted) {
          setAnimals(animalDocs.map(doc => doc.toJSON() as Animal));
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error loading animals'));
          setIsLoading(false);
        }
      }
    };

    loadAnimals();

    return () => {
      isMounted = false;
    };
  }, []);

  return { animals, isLoading, error };
}
