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
    if (!db?.collections?.daily_logs) {
      return;
    }

    let sub: Subscription | null = null;

    try {
      const query = db.collections.daily_logs.find({
        selector: { is_deleted: false }
      });
      
      // Synchronous subscription using $$ for pure JSON
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sub = (query.$$ as any).subscribe((docs: LogEntry[]) => {
        setAllLogs(docs);
        setIsLogsLoading(false);
      });
    } catch (err) {
      console.error('Failed to load daily logs:', err);
      setTimeout(() => setIsLogsLoading(false), 0);
    }

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [db, viewDate, animalId]);

  const logs = useMemo(() => allLogs, [allLogs]);

  const getTodayLog = useCallback((animalId: string, type: LogType) => {
    return logs.find(log => log.animal_id === animalId && log.log_type === type);
  }, [logs]);

  const addLogEntry = useCallback(async (entry: Partial<LogEntry>) => {
    if (!db) return;
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
