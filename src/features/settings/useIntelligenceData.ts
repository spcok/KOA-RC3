import { useState, useEffect } from 'react';
import { Animal } from '../../types';

export function useIntelligenceData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadAnimals = async () => {
      try {
        console.log("☢️ [Zero Dawn] Intelligence data loading is neutralized.");
        if (isMounted) {
          setAnimals([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load intelligence data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnimals();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const runIUCNScan = async () => {
    console.log("☢️ [Zero Dawn] IUCN Scan is neutralized.");
    alert("Database engine is neutralized. Scan cannot proceed.");
  };

  return { animals, isLoading, runIUCNScan };
}
