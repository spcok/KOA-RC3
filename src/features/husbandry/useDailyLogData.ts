import { useCallback, useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType } from '../../types';
import { useAnimalsData } from '../animals/useAnimalsData';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export const useDailyLogData = (viewDate: string, activeCategory: string, animalId?: string) => {
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const subs: { unsubscribe: () => void }[] = [];

    const loadLogs = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!db.collections || !db.collections.daily_logs) {
          if (isMounted) setIsLogsLoading(false);
          return;
        }

        const query = db.collections.daily_logs.find();
        const sub = query.$.subscribe(docs => {
          if (isMounted) {
            setAllLogs(docs.map(doc => doc.toJSON() as LogEntry));
            setIsLogsLoading(false);
          }
        });
        subs.push(sub);
      } catch (err: unknown) {
        console.error('Failed to load daily logs:', err instanceof Error ? err.message : err);
        if (isMounted) setIsLogsLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
      subs.forEach(s => s.unsubscribe());
    };
  }, [viewDate, animalId]);

  const logs = useMemo(() => allLogs, [allLogs]);

  const getTodayLog = useCallback((animalId: string, type: LogType) => {
    return logs.find(log => log.animal_id === animalId && log.log_type === type);
  }, [logs]);

  const addLogEntry = useCallback(async (entry: Partial<LogEntry>) => {
    try {
      const db = await bootCoreDatabase();
      await db.collections.daily_logs.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...entry
      });
    } catch (err) {
      console.error('Failed to add log entry:', err);
    }
  }, []);

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => activeCategory === 'all' || a.category === activeCategory);
  }, [animals, activeCategory]);

  return { animals: filteredAnimals, getTodayLog, addLogEntry, dailyLogs: logs, isLoading: animalsLoading || isLogsLoading };
};
