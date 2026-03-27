import { useState, useEffect } from 'react';
import { Animal } from '../../types';
import { Subscription } from 'rxjs';

export function useAnimalsData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const sub: Subscription | null = null;

    const loadAnimals = async () => {
      try {
        console.log("☢️ [Zero Dawn] Animals data loading is neutralized.");
        if (isMounted) {
          setAnimals([]);
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
      if (sub) sub.unsubscribe();
    };
  }, []);

  return { animals, isLoading, error };
}