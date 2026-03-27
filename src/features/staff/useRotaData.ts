import { useState, useEffect } from 'react';
import { Shift } from '../../types';

export const useRotaData = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Rota data loading is neutralized.");
        if (isMounted) {
          setShifts([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load rota data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const createShift = async (shift: Omit<Shift, 'id' | 'pattern_id'>, repeatDays: number[], weeksToRepeat: number) => {
    console.log("☢️ [Zero Dawn] Create shift is neutralized.", { shift, repeatDays, weeksToRepeat });
    alert("Database engine is neutralized. Shift cannot be created.");
  };

  const updateShift = async (id: string, updates: Partial<Shift>, updateSeries: boolean = false) => {
    console.log("☢️ [Zero Dawn] Update shift is neutralized.", { id, updates, updateSeries });
    alert("Database engine is neutralized. Shift cannot be updated.");
  };

  const replaceShiftPattern = async (existingShift: Shift, newShiftData: Omit<Shift, 'id' | 'pattern_id'>, repeatDays: number[], weeksToRepeat: number) => {
    console.log("☢️ [Zero Dawn] Replace shift pattern is neutralized.", { existingShift, newShiftData, repeatDays, weeksToRepeat });
    alert("Database engine is neutralized. Pattern cannot be replaced.");
  };

  const deleteShift = async (shift: Shift, deleteSeries: boolean = false) => {
    console.log("☢️ [Zero Dawn] Delete shift is neutralized.", { shift, deleteSeries });
    alert("Database engine is neutralized. Shift cannot be deleted.");
  };

  return { shifts, isLoading, createShift, updateShift, replaceShiftPattern, deleteShift };
};
