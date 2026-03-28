import { useState, useMemo, useEffect } from 'react';
import { Task, User, UserRole, Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

const mockUsers: User[] = [
  { id: 'u1', email: 'john@example.com', name: 'John Doe', initials: 'JD', role: UserRole.VOLUNTEER },
  { id: 'u2', email: 'jane@example.com', name: 'Jane Smith', initials: 'JS', role: UserRole.ADMIN }
];

export const useTaskData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const subs: { unsubscribe: () => void }[] = [];

        const loadData = async () => {
            try {
                const db = await bootCoreDatabase();
                if (!db.collections || !db.collections.tasks || !db.collections.animals) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // Subscribe to tasks
                const tasksSub = db.collections.tasks.find().$.subscribe(docs => {
                    if (isMounted) {
                        setTasks(docs.map(doc => doc.toJSON() as Task));
                        setIsLoading(false);
                    }
                });
                subs.push(tasksSub);

                // Subscribe to animals
                const animalsSub = db.collections.animals.find().$.subscribe(docs => {
                    if (isMounted) setAnimals(docs.map(doc => doc.toJSON() as Animal));
                });
                subs.push(animalsSub);

            } catch (err) {
                console.error('Failed to load task data:', err);
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            subs.forEach(sub => sub.unsubscribe());
        };
    }, []);

  const [filter, setFilter] = useState<'assigned' | 'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = mockUsers[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'completed' && !task.completed) return false;
      if (filter === 'pending' && task.completed) return false;
      if (filter === 'assigned' && (task.assigned_to !== currentUser.id || task.completed)) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const animalName = animals.find(a => a.id === task.animal_id)?.name.toLowerCase() || '';
        return (
          task.title.toLowerCase().includes(searchLower) ||
          animalName.includes(searchLower)
        );
      }
      return true;
    });
  }, [tasks, filter, searchTerm, currentUser.id, animals]);

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const db = await bootCoreDatabase();
      await db.collections.tasks.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...newTask
      });
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.tasks.findOne({ selector: { id } }).exec();
      if (doc) {
        await doc.patch(updates);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
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

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.tasks.findOne({ selector: { id: task.id } }).exec();
      if (doc) {
        await doc.patch({ 
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null
        });
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  return { tasks: filteredTasks, animals, users: mockUsers, isLoading, filter, setFilter, searchTerm, setSearchTerm, addTask, updateTask, deleteTask, toggleTaskCompletion, currentUser };
};