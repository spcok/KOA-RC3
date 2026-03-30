import { useState, useEffect } from 'react';
import { useDbStore } from '../../store/dbStore';
import { supabase } from '../../lib/supabase';

export const useAnimalsData = () => {
  const db = useDbStore(state => state.db);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Online Primary: Fetch from Supabase
        const { data, error } = await supabase.from('animals').select('*');
        
        if (error) throw error;

        if (data && isMounted) {
          // JS Filtering
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const activeAnimals = data.filter((a: any) => !a.is_deleted && !a.archived);
          setAnimals(activeAnimals);
          setIsLoading(false);

          // Background Cache
          if (db?.collections?.animals) {
            try {
              await db.collections.animals.bulkUpsert(data);
            } catch (cacheErr) {
              console.error("Failed to cache animals to RxDB:", cacheErr);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to RxDB cache:", err);
        
        // Offline Failover
        if (db?.collections?.animals) {
          try {
            const query = db.collections.animals.find();
            const rawDocs = await query.exec();
            
            if (isMounted) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cleanData = JSON.parse(JSON.stringify(rawDocs.map((d: any) => typeof d.toJSON === 'function' ? d.toJSON() : d)));
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const activeAnimals = cleanData.filter((a: any) => !a.is_deleted && !a.archived);
              setAnimals(activeAnimals);
              setIsLoading(false);
            }
          } catch (localErr) {
            console.error("Failed to load animals from RxDB:", localErr);
            if (isMounted) setIsLoading(false);
          }
        } else {
          if (isMounted) setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [db]);

  return { animals, isLoading };
};
