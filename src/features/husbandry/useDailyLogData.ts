import { useCallback, useMemo, useState, useEffect } from 'react';
import { LogEntry, LogType } from '../../types';
import { useAnimalsData } from '../animals/useAnimalsData';
import { useDbStore } from '../../store/dbStore';
import { supabase } from '../../lib/supabase';

export const useDailyLogData = (viewDate: string, activeCategory: string, animalId?: string) => {
  const db = useDbStore(state => state.db);
  const { animals, isLoading: animalsLoading } = useAnimalsData();
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      try {
        // Online Primary
        const { data, error } = await supabase.from('daily_logs').select('*');
        
        if (error) throw error;

        if (data && isMounted) {
          // JS Filtering
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const activeLogs = data.filter((log: any) => !log.is_deleted);
          setAllLogs(activeLogs);
          setIsLogsLoading(false);

          // Background Cache
          if (db?.collections?.daily_logs) {
            try {
              await db.collections.daily_logs.bulkUpsert(data);
            } catch (cacheErr) {
              console.error("Failed to cache daily logs to RxDB:", cacheErr);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to RxDB cache:", err);
        
        // Offline Failover
        if (db?.collections?.daily_logs) {
          try {
            const query = db.collections.daily_logs.find();
            const rawDocs = await query.exec();
            
            if (isMounted) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cleanData = JSON.parse(JSON.stringify(rawDocs.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const activeLogs = cleanData.filter((log: any) => !log.is_deleted);
              setAllLogs(activeLogs);
              setIsLogsLoading(false);
            }
          } catch (localErr) {
            console.error("Failed to load daily logs from RxDB:", localErr);
            if (isMounted) setIsLogsLoading(false);
          }
        } else {
          if (isMounted) setIsLogsLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
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
