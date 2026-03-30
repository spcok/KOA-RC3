import { useCallback, useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType } from '../../types';
import { useAnimalsData } from '../animals/useAnimalsData';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';
import { Subscription } from 'rxjs';

export const useDailyLogData = (viewDate: string, activeCategory: string, animalId?: string) => {
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  useEffect(() => {
    let sub: Subscription | null = null;

    const loadLogs = async () => {
      try {
        const db = await bootCoreDatabase();
        
        if (!db?.collections?.daily_logs) {
          setIsLogsLoading(false);
          return;
        }

        const query = db.collections.daily_logs.find({
          selector: { is_deleted: false }
        });
        
        sub = query.$.subscribe(docs => {
          setAllLogs(docs.map(doc => doc.toJSON() as LogEntry));
          setIsLogsLoading(false);
        });
      } catch (err: unknown) {
        console.error('Failed to load daily logs:', err);
        setIsLogsLoading(false);
      }
    };

    loadLogs();

    return () => {
      if (sub) sub.unsubscribe();
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
        is_deleted: false,
        ...entry
      });
    } catch (err) {
      console.error('Failed to add log entry:', err);
    }
  }, []);

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
