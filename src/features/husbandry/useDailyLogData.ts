import { useCallback, useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType } from '../../types';
import { useAnimalsData } from '../animals/useAnimalsData';

export const useDailyLogData = (viewDate: string, activeCategory: string, animalId?: string) => {
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | undefined;

    const loadLogs = async () => {
      try {
        console.log("☢️ [Zero Dawn] Daily logs loading is neutralized.");
        if (isMounted) {
          setAllLogs([]);
          setIsLogsLoading(false);
        }
      } catch (err: unknown) {
        console.error('Failed to load daily logs:', err instanceof Error ? err.message : err);
        if (isMounted) setIsLogsLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [viewDate, animalId]);

  const logs = useMemo(() => allLogs, [allLogs]);

  const getTodayLog = useCallback((animalId: string, type: LogType) => {
    return logs.find(log => log.animal_id === animalId && log.log_type === type);
  }, [logs]);

  const addLogEntry = useCallback(async (entry: Partial<LogEntry>) => {
    console.log("☢️ [Zero Dawn] Add log entry is neutralized.", entry);
    alert("Database engine is neutralized. Log entry cannot be added.");
  }, []);

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => activeCategory === 'all' || a.category === activeCategory);
  }, [animals, activeCategory]);

  return { animals: filteredAnimals, getTodayLog, addLogEntry, dailyLogs: logs, isLoading: animalsLoading || isLogsLoading };
};