import { create } from 'zustand';
import { RxDatabase } from 'rxdb';

interface DbState {
  db: RxDatabase | null;
  setDb: (db: RxDatabase | null) => void;
}

export const useDbStore = create<DbState>((set) => ({
  db: null,
  setDb: (db) => set({ db })
}));
