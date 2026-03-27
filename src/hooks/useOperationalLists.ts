import { useState, useEffect } from 'react';
import { AnimalCategory, OperationalList } from '../types';

export function useOperationalLists(category: AnimalCategory = AnimalCategory.ALL) {
  const [lists, setLists] = useState<OperationalList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Operational lists loading is neutralized.");
        if (isMounted) {
          setLists([]);
          setIsLoading(false);
        }
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
    console.log("☢️ [Zero Dawn] Add list item is neutralized.", { type, value, itemCategory });
    alert("Database engine is neutralized. Item cannot be added.");
  };

  const updateListItem = async (id: string, value: string) => {
    console.log("☢️ [Zero Dawn] Update list item is neutralized.", { id, value });
    alert("Database engine is neutralized. Item cannot be updated.");
  };

  const removeListItem = async (id: string) => {
    console.log("☢️ [Zero Dawn] Remove list item is neutralized.", id);
    alert("Database engine is neutralized. Item cannot be removed.");
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
