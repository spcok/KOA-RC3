import { useState, useEffect } from 'react';
import { Animal, ClinicalNote, LogEntry, Task } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useAnimalProfileData(animalId: string | undefined) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dailyLogs: LogEntry[] = [];
  const medicalLogs: ClinicalNote[] = [];
  const tasks: Task[] = [];

  useEffect(() => {
    if (!animalId) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const db = await bootCoreDatabase();
        if (!db || !db.collections || !db.collections.animals) return;

        const doc = await db.collections.animals.findOne({ selector: { id: animalId } }).exec();
        
        if (isMounted) {
          setAnimal(doc ? (doc.toJSON() as Animal) : null);
          // Note: Daily logs, medical logs, and tasks would also need to be fetched here
          // based on the animalId, but the request only specified the animal itself.
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load animal profile data:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [animalId]);

  return { animal, dailyLogs, medicalLogs, tasks, isLoading };
}
