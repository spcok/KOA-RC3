import { useState, useEffect } from 'react';
import { Animal } from '../../types';
import { Subscription } from 'rxjs';
import { bootCoreDatabase } from '../../lib/DatabaseCore';

export function useAnimalsData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | undefined;

    const loadAnimals = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        // 🚨 Bulletproof Query: Ask for the record type, handle the booleans in-memory
        sub = db.animals.find({
          selector: {} 
        }).$.subscribe({
          next: (docs) => {
            if (isMounted) {
              const rawData = docs.map(d => d.toJSON() as Animal);
              
              // Filter out deleted items safely (handles undefined/null natively)
              const activeAnimals = rawData.filter(a => !a.is_deleted);
              
              // Sort safely
              const sortedData = activeAnimals.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
              
              setAnimals(sortedData);
              setIsLoading(false);
            }
          },
          error: (err: unknown) => {
            console.error('Error fetching animals:', err);
            if (isMounted) {
              setError(err instanceof Error ? err : new Error('Unknown error fetching animals'));
              setIsLoading(false);
            }
          }
        });
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
      if (sub) sub.unsubscribe();
    };
  }, []);

  return { animals, isLoading, error };
}