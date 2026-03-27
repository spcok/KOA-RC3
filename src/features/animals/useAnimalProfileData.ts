import { useState, useEffect } from 'react';
import { Animal, ClinicalNote, LogEntry, Task } from '../../types';
import { Subscription } from 'rxjs';

export function useAnimalProfileData(animalId: string | undefined) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [dailyLogs, setDailyLogs] = useState<LogEntry[]>([]);
  const [medicalLogs, setMedicalLogs] = useState<ClinicalNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!animalId) {
      setTimeout(() => setIsLoading(false), 0);
      return;
    }

    let isMounted = true;
    const subs: Subscription[] = [];

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Animal profile data loading is neutralized.");
        if (isMounted) {
          setAnimal(null);
          setDailyLogs([]);
          setMedicalLogs([]);
          setTasks([]);
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
      subs.forEach(sub => sub?.unsubscribe?.());
    };
  }, [animalId]);

  return { animal, dailyLogs, medicalLogs, tasks, isLoading };
}
