import { useState, useEffect } from 'react';
import { FirstAidLog } from '../../types';

export function useFirstAidData() {
  const [logs, setLogs] = useState<FirstAidLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] First aid data loading is neutralized.");
        if (isMounted) {
          setLogs([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load first aid data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addFirstAid = async (log: Omit<FirstAidLog, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add first aid is neutralized.", log);
    alert("Database engine is neutralized. Log cannot be added.");
  };

  const deleteFirstAid = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete first aid is neutralized.", id);
    alert("Database engine is neutralized. Log cannot be deleted.");
  };

  return {
    logs,
    isLoading,
    addFirstAid,
    deleteFirstAid
  };
}
