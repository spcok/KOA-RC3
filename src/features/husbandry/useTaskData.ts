import { useState, useMemo, useEffect } from 'react';
import { Task, User, UserRole, Animal } from '../../types';

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
        console.log("☢️ [Zero Dawn] Task data loading is neutralized.");
        if (isMounted) {
          setTasks([]);
          setAnimals([]);
          setIsLoading(false);
        }
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
    console.log("☢️ [Zero Dawn] Add task is neutralized.", newTask);
    alert("Database engine is neutralized. Task cannot be added.");
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    console.log("☢️ [Zero Dawn] Update task is neutralized.", id, updates);
    alert("Database engine is neutralized. Task cannot be updated.");
  };

  const deleteTask = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete task is neutralized.", id);
    alert("Database engine is neutralized. Task cannot be deleted.");
  };

  const toggleTaskCompletion = async (task: Task) => {
    console.log("☢️ [Zero Dawn] Toggle task completion is neutralized.", task.id);
    alert("Database engine is neutralized. Task completion cannot be toggled.");
  };

  return { tasks: filteredTasks, animals, users: mockUsers, isLoading, filter, setFilter, searchTerm, setSearchTerm, addTask, updateTask, deleteTask, toggleTaskCompletion, currentUser };
};