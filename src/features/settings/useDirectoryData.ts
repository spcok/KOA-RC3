import { useState, useEffect } from 'react';
import { Contact } from '../../types';

export function useDirectoryData() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadContacts = async () => {
      try {
        console.log("☢️ [Zero Dawn] Directory data loading is neutralized.");
        if (isMounted) {
          setContacts([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load directory data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadContacts();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add contact is neutralized.", contact);
    alert("Database engine is neutralized. Contact cannot be added.");
  };

  const updateContact = async (contact: Contact) => {
    console.log("☢️ [Zero Dawn] Update contact is neutralized.", contact);
    alert("Database engine is neutralized. Contact cannot be updated.");
  };

  const deleteContact = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete contact is neutralized.", id);
    alert("Database engine is neutralized. Contact cannot be deleted.");
  };

  return { contacts, isLoading, addContact, updateContact, deleteContact };
}
