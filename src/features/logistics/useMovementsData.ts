import { useState, useEffect } from 'react';
import { InternalMovement } from '../../types';

export function useMovementsData() {
  const [movements, setMovements] = useState<InternalMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Movements data loading is neutralized.");
        if (isMounted) {
          setMovements([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load movements data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addMovement = async (movement: Omit<InternalMovement, 'id' | 'created_by'>) => {
    console.log("☢️ [Zero Dawn] Add movement is neutralized.", movement);
    alert("Database engine is neutralized. Movement cannot be added.");
  };

  return {
    movements,
    isLoading,
    addMovement
  };
}