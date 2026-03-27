import { useState, useEffect } from 'react';
import { ZLADocument } from '../../types';

export function useZLADocsData() {
  const [documents, setDocuments] = useState<ZLADocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadDocs = async () => {
      try {
        console.log("☢️ [Zero Dawn] ZLA docs loading is neutralized.");
        if (isMounted) {
          setDocuments([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load ZLA docs data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadDocs();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addDocument = async (doc: Omit<ZLADocument, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add document is neutralized.", doc);
    alert("Database engine is neutralized. Document cannot be added.");
  };

  const deleteDocument = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete document is neutralized.", id);
    alert("Database engine is neutralized. Document cannot be deleted.");
  };

  return { documents, isLoading, addDocument, deleteDocument };
}
