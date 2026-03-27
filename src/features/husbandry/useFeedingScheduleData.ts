import { useState, useEffect } from 'react';
import { Animal, Task } from '../../types';

export function useFeedingScheduleData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const subs: { unsubscribe: () => void }[] = [];

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Feeding schedule data loading is neutralized.");
        if (isMounted) {
          setAnimals([]);
          setTasks([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load feeding schedule data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      subs.forEach(sub => sub.unsubscribe());
    };
  }, []);

  const addTasks = async (newTasks: Task[]) => {
    console.log("☢️ [Zero Dawn] Add tasks is neutralized.", newTasks);
    alert("Database engine is neutralized. Tasks cannot be added.");
  };

  const deleteTask = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete task is neutralized.", id);
    alert("Database engine is neutralized. Task cannot be deleted.");
  };

  return {
    animals,
    tasks,
    isLoading,
    addTasks,
    deleteTask
  };
}
