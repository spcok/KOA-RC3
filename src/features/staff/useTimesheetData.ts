import { useState, useEffect } from 'react';
import { Timesheet } from '../../types';

export function useTimesheetData() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Timesheet data loading is neutralized.");
        if (isMounted) {
          setTimesheets([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load timesheet data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const clockIn = async (staff_name: string) => {
    console.log("☢️ [Zero Dawn] Clock in is neutralized.", staff_name);
    alert("Database engine is neutralized. Clock in cannot proceed.");
  };

  const clockOut = async (id: string) => {
    console.log("☢️ [Zero Dawn] Clock out is neutralized.", id);
    alert("Database engine is neutralized. Clock out cannot proceed.");
  };

  const getCurrentlyClockedInStaff = async () => {
    console.log("☢️ [Zero Dawn] Get currently clocked in staff is neutralized.");
    return [];
  };

  const addTimesheet = async (timesheet: Omit<Timesheet, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add timesheet is neutralized.", timesheet);
    alert("Database engine is neutralized. Timesheet cannot be added.");
  };

  const deleteTimesheet = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete timesheet is neutralized.", id);
    alert("Database engine is neutralized. Timesheet cannot be deleted.");
  };

  return {
    timesheets,
    isLoading,
    clockIn,
    clockOut,
    getCurrentlyClockedInStaff,
    addTimesheet,
    deleteTimesheet
  };
}
