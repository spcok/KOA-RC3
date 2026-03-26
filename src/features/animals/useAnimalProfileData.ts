import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { bootCoreDatabase } from '../../lib/DatabaseCore';
import { Animal, ClinicalNote, LogEntry, Task } from '../../types';

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
    let subs: Subscription[] = [];

    const loadData = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        subs = [
          // 1. Animal Details
          db.animals.find({ selector: { id: animalId } }).$.subscribe(docs => {
            if (isMounted) {
              const raw = docs.map(d => d.toJSON() as Animal);
              const foundAnimal = raw.find(a => a.id === animalId && !(a as unknown as { is_deleted?: boolean }).is_deleted);
              setAnimal(foundAnimal || null);
            }
          }),

          // 2. Husbandry / Daily Logs
          db.daily_logs.find({ selector: { animal_id: animalId } }).$.subscribe(docs => {
            if (isMounted) {
              const raw = docs.map(d => d.toJSON() as LogEntry);
              const animalLogs = raw.filter(l => l.animal_id === animalId && !(l as unknown as { is_deleted?: boolean }).is_deleted);
              
              // 🚨 CRITICAL FIX: Robust Date Fallback Sort (Newest First)
              const sortedLogs = animalLogs.sort((a, b) => {
                const timeA = new Date(a.log_date || a.created_at || 0).getTime();
                const timeB = new Date(b.log_date || b.created_at || 0).getTime();
                return timeB - timeA; 
              });
              setDailyLogs(sortedLogs);
            }
          }),

          // 3. Medical Logs
          db.medical_logs.find({ selector: { animal_id: animalId } }).$.subscribe(docs => {
            if (isMounted) {
              const raw = docs.map(d => d.toJSON() as ClinicalNote);
              const animalMedLogs = raw.filter(m => m.animal_id === animalId && !(m as unknown as { is_deleted?: boolean }).is_deleted);
              
              const sortedMed = animalMedLogs.sort((a, b) => {
                const timeA = new Date(a.date || a.updated_at || 0).getTime();
                const timeB = new Date(b.date || b.updated_at || 0).getTime();
                return timeB - timeA;
              });
              setMedicalLogs(sortedMed);
            }
          }),

          // 4. Tasks
          db.tasks.find({ selector: { animal_id: animalId } }).$.subscribe(docs => {
            if (isMounted) {
              const raw = docs.map(d => d.toJSON() as Task);
              const animalTasks = raw.filter(t => t.animal_id === animalId && !(t as unknown as { is_deleted?: boolean }).is_deleted);
              
              const sortedTasks = animalTasks.sort((a, b) => {
                const timeA = new Date(a.due_date || a.updated_at || 0).getTime();
                const timeB = new Date(b.due_date || b.updated_at || 0).getTime();
                return timeB - timeA;
              });
              setTasks(sortedTasks);
            }
          })
        ];
        
        if (isMounted) setIsLoading(false);
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
