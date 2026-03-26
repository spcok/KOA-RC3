import { useCallback, useMemo, useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { LogEntry, LogType } from '../../types';
import { bootCoreDatabase } from '../../lib/DatabaseCore';
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
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        sub = db.daily_records.find().$.subscribe(docs => {
          if (isMounted) {
            const rawData = docs.map(d => d.toJSON() as LogEntry);
            
            const filtered = rawData.filter(log => 
              log.record_type === 'daily_logs_v2' && 
              (animalId ? log.animal_id === animalId : log.log_date === viewDate) && 
              !log.is_deleted
            );
            
            const sorted = filtered.sort((a, b) => {
              const timeA = new Date(a.log_date || a.created_at || 0).getTime();
              const timeB = new Date(b.log_date || b.created_at || 0).getTime();
              return timeB - timeA;
            });

            setAllLogs(sorted);
            setIsLogsLoading(false);
          }
        });
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
    const db = await bootCoreDatabase();
    const payload = {
      ...entry,
      id: entry.id || crypto.randomUUID(),
      record_type: 'daily_logs_v2',
      updated_at: new Date().toISOString(),
      is_deleted: false
    };
    await db.daily_records.upsert(payload);
  }, []);

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => activeCategory === 'all' || a.category === activeCategory);
  }, [animals, activeCategory]);

  return { animals: filteredAnimals, getTodayLog, addLogEntry, dailyLogs: logs, isLoading: animalsLoading || isLogsLoading };
};