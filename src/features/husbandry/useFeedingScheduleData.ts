import { useState, useEffect } from 'react';
import { Animal, Task } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useFeedingScheduleData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const subs: { unsubscribe: () => void }[] = [];

        const loadData = async () => {
            try {
                const db = await bootCoreDatabase();
                if (!db.collections || !db.collections.animals || !db.collections.tasks) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // Subscribe to animals
                const animalsSub = db.collections.animals.find().$.subscribe(docs => {
                    if (isMounted) setAnimals(docs.map(doc => doc.toJSON() as Animal));
                });
                subs.push(animalsSub);

                // Subscribe to tasks
                const tasksSub = db.collections.tasks.find().$.subscribe(docs => {
                    if (isMounted) {
                        setTasks(docs.map(doc => doc.toJSON() as Task));
                        setIsLoading(false);
                    }
                });
                subs.push(tasksSub);

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
    try {
      const db = await bootCoreDatabase();
      await Promise.all(newTasks.map(task => 
        db.collections.tasks.insert({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...task
        })
      ));
    } catch (err) {
      console.error('Failed to add tasks:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.tasks.findOne({ selector: { id } }).exec();
      if (doc) {
        await doc.remove();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return {
    animals,
    tasks,
    isLoading,
    addTasks,
    deleteTask
  };
}
