import { useCallback, useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType } from '../../types';
import { useAnimalsData } from '../animals/useAnimalsData';
import { useDbStore } from '../../store/dbStore';
import { Subscription } from 'rxjs';

export const useDailyLogData = (viewDate: string, activeCategory: string, animalId?: string) => {
  const db = useDbStore(state => state.db);
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  useEffect(() => {
    // Safely wait for the database and table to be fully attached
    if (!db || !db.collections || !db.collections.daily_logs) {
      return;
    }

    let sub: Subscription | null = null;
    let isMounted = true;

    const loadLogs = async () => {
      try {
        // NO SELECTOR
        const query = db.collections.daily_logs.find();

        // 1. Initial Native Fetch
        const rawDocs = await query.exec();
        if (isMounted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cleanData = JSON.parse(JSON.stringify(rawDocs.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const activeLogs = cleanData.filter((log: any) => !log.is_deleted);
          setAllLogs(activeLogs);
          setIsLogsLoading(false);
        }

        // 2. Background Listener
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sub = query.$.subscribe((docs: any[]) => {
          if (isMounted) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedData = JSON.parse(JSON.stringify(docs.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activeLogs = updatedData.filter((log: any) => !log.is_deleted);
            setAllLogs(activeLogs);
          }
        });
      } catch (err) {
        console.error('Failed to load daily logs:', err);
        if (isMounted) setIsLogsLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, [db, viewDate, animalId]);

  const logs = useMemo(() => allLogs, [allLogs]);

  const getTodayLog = useCallback((animalId: string, type: LogType) => {
    return logs.find(log => log.animal_id === animalId && log.log_type === type);
  }, [logs]);

  const addLogEntry = useCallback(async (entry: Partial<LogEntry>) => {
    if (!db?.collections?.daily_logs) return;
    try {
      await db.collections.daily_logs.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        is_deleted: false,
        ...entry
      });
    } catch (err) {
      console.error('Failed to add log entry:', err);
    }
  }, [db]);

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => activeCategory === 'all' || a.category === activeCategory);
  }, [animals, activeCategory]);

  return { 
    animals: filteredAnimals, 
    getTodayLog, 
    addLogEntry, 
    dailyLogs: logs, 
    isLoading: animalsLoading || isLogsLoading 
  };
};
