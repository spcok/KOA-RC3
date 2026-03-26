import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { bootCoreDatabase } from '../../lib/DatabaseCore';
import { ZLADocument } from '../../types';

export function useZLADocsData() {
  const [documents, setDocuments] = useState<ZLADocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let sub: { unsubscribe: () => void } | null = null;

    const loadDocs = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        sub = db.zla_documents.find().$.subscribe(docs => {
          if (isMounted) {
            const rawData = docs.map(d => d.toJSON() as ZLADocument).filter(d => !(d as unknown as { is_deleted?: boolean }).is_deleted);
            const sortedData = rawData.sort((a, b) => new Date((b as unknown as { created_at?: string }).created_at || 0).getTime() - new Date((a as unknown as { created_at?: string }).created_at || 0).getTime());
            setDocuments(sortedData);
            setIsLoading(false);
          }
        });
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
    const db = await bootCoreDatabase();
    const id = uuidv4();
    const newDoc = {
      ...doc,
      id,
      is_deleted: false,
      updated_at: new Date().toISOString()
    };
    try {
      await db.zla_documents.upsert(newDoc);
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  const deleteDocument = async (id: string) => {
    const db = await bootCoreDatabase();
    try {
      const doc = await db.zla_documents.findOne(id).exec();
      if (doc) {
        await doc.patch({
          is_deleted: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return { documents, isLoading, addDocument, deleteDocument };
}
