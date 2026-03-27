import { useState, useEffect } from 'react';
import { ExternalTransfer } from '../../types';

export function useTransfersData() {
  const [transfers, setTransfers] = useState<ExternalTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Transfers data loading is neutralized.");
        if (isMounted) {
          setTransfers([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load transfers data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const addTransfer = async (transfer: Omit<ExternalTransfer, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add transfer is neutralized.", transfer);
    alert("Database engine is neutralized. Transfer cannot be added.");
  };

  return {
    transfers,
    isLoading,
    addTransfer
  };
}
