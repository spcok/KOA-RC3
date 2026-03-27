import { useState, useEffect } from 'react';
import { MaintenanceLog } from '../../types';

export function useMaintenanceData() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Maintenance data loading is neutralized.");
        if (isMounted) {
          setLogs([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load maintenance data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addLog = async (log: Omit<MaintenanceLog, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add maintenance log is neutralized.", log);
    alert("Database engine is neutralized. Log cannot be added.");
  };

  const updateLog = async (log: MaintenanceLog) => {
    console.log("☢️ [Zero Dawn] Update maintenance log is neutralized.", log);
    alert("Database engine is neutralized. Log cannot be updated.");
  };

  const deleteLog = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete maintenance log is neutralized.", id);
    alert("Database engine is neutralized. Log cannot be deleted.");
  };

  return {
    logs,
    isLoading,
    addLog,
    updateLog,
    deleteLog
  };
}
