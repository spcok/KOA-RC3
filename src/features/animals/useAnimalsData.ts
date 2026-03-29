import { useState, useEffect, useCallback } from 'react';
import { Subscription } from 'rxjs';
import { Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useAnimalsData() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const loadAnimals = async () => {
      try {
        setIsLoading(true);
        const db = await bootCoreDatabase();
        
        if (!db || !db.collections || !db.collections.animals) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // 5. Setup a reactive RxJS subscription
        sub = db.collections.animals
          .find({ selector: { is_deleted: false } })
          .$.subscribe(docs => {
            if (isMounted) {
              setAnimals(docs.map(doc => doc.toJSON() as Animal));
              setIsLoading(false);
            }
          });

      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error loading animals'));
          setIsLoading(false);
        }
      }
    };

    loadAnimals();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addAnimal = useCallback(async (animal: Omit<Animal, 'id'>) => {
    try {
      const db = await bootCoreDatabase();
      await db.collections.animals.insert({
        ...animal,
        id: crypto.randomUUID(),
        is_deleted: false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add animal:', err);
      throw err;
    }
  }, []);

  const updateAnimal = useCallback(async (id: string, updates: Partial<Animal>) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.animals.findOne(id).exec();
      if (doc) {
        await doc.patch({
          ...updates,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to update animal:', err);
      throw err;
    }
  }, []);

  const deleteAnimal = useCallback(async (id: string) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.animals.findOne(id).exec();
      if (doc) {
        // Soft delete for sync engine
        await doc.patch({
          is_deleted: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to delete animal:', err);
      throw err;
    }
  }, []);

  return { animals, isLoading, error, addAnimal, updateAnimal, deleteAnimal };
}
