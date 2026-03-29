import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { AnimalCategory, OperationalList } from '../types';
import { bootCoreDatabase } from '../lib/bootCoreDatabase';

export function useOperationalLists(category: AnimalCategory = AnimalCategory.ALL) {
  const [lists, setLists] = useState<OperationalList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const loadData = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!db || !db.collections || !db.collections.operational_lists) {
          if (isMounted) setIsLoading(false);
          return;
        }

        sub = db.collections.operational_lists
          .find({ selector: { is_deleted: false } })
          .$.subscribe(docs => {
            if (isMounted) {
              setLists(docs.map(doc => doc.toJSON() as OperationalList));
              setIsLoading(false);
            }
          });
      } catch (err) {
        console.error('Failed to load operational lists:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const foodTypes = lists
    .filter(l => l.type === 'food' && (l.category === category || l.category === AnimalCategory.ALL))
    .sort((a, b) => a.value.localeCompare(b.value));
  const feedMethods = lists
    .filter(l => l.type === 'method' && (l.category === category || l.category === AnimalCategory.ALL))
    .sort((a, b) => a.value.localeCompare(b.value));
  const eventTypes = lists
    .filter(l => l.type === 'event')
    .sort((a, b) => a.value.localeCompare(b.value));
  const locations = lists
    .filter(l => l.type === 'location')
    .sort((a, b) => a.value.localeCompare(b.value));

  const addListItem = async (type: 'food' | 'method' | 'location' | 'event', value: string, itemCategory: AnimalCategory = category) => {
    try {
      const db = await bootCoreDatabase();
      await db.collections.operational_lists.insert({
        id: crypto.randomUUID(),
        type,
        value,
        category: itemCategory,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to add list item:', error);
      throw error;
    }
  };

  const updateListItem = async (id: string, value: string) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.operational_lists.findOne(id).exec();
      if (doc) {
        await doc.patch({ 
          value,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to update list item:', error);
      throw error;
    }
  };

  const removeListItem = async (id: string) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.operational_lists.findOne(id).exec();
      if (doc) {
        // Soft delete for sync
        await doc.patch({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to remove list item:', error);
      throw error;
    }
  };

  return {
    foodTypes,
    feedMethods,
    eventTypes,
    locations,
    addListItem,
    updateListItem,
    removeListItem,
    isLoading
  };
}
