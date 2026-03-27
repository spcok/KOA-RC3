import { useState, useEffect } from 'react';
import { Holiday } from '../../types';

export function useHolidayData() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Holiday data loading is neutralized.");
        if (isMounted) {
          setHolidays([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load holiday data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add holiday is neutralized.", holiday);
    alert("Database engine is neutralized. Holiday cannot be added.");
  };

  const deleteHoliday = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete holiday is neutralized.", id);
    alert("Database engine is neutralized. Holiday cannot be deleted.");
  };

  return {
    holidays,
    isLoading,
    addHoliday,
    deleteHoliday
  };
}
