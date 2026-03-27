import { useState, useEffect } from 'react';
import { SafetyDrill } from '../../types';

export function useSafetyDrillData() {
  const [drills, setDrills] = useState<SafetyDrill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Safety drill data loading is neutralized.");
        if (isMounted) {
          setDrills([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load safety drill data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addDrillLog = async (drill: Omit<SafetyDrill, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add safety drill is neutralized.", drill);
    alert("Database engine is neutralized. Drill cannot be added.");
  };

  const deleteDrillLog = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete safety drill is neutralized.", id);
    alert("Database engine is neutralized. Drill cannot be deleted.");
  };

  return {
    drills,
    isLoading,
    addDrillLog,
    deleteDrillLog
  };
}
