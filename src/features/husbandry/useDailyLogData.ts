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
      setTimeout(() => setIsLogsLoading(false), 0);
      return;
    }

    let sub: Subscription | null = null;
    let isMounted = true;

    const loadLogs = async () => {
      try {
        const query = db.collections.daily_logs.find({
          selector: { is_deleted: false }
        });

        // 1. BRUTE FORCE INITIAL FETCH
        const initialResults = await query.exec();
        if (isMounted) {
          setAllLogs(initialResults.map(d => d.toJSON() as LogEntry));
          setIsLogsLoading(false);
        }

        // 2. BACKGROUND LISTENER FOR FUTURE SYNC UPDATES
        sub = query.$.subscribe(docs => {
          if (isMounted) {
            setAllLogs(docs.map(doc => doc.toJSON() as LogEntry));
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
