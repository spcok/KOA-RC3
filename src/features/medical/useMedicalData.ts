import { useState, useEffect } from 'react';
import { ClinicalNote, MARChart, QuarantineRecord, Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/DatabaseCore';

export function useMedicalData() {
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [marCharts, setMarCharts] = useState<MARChart[]>([]);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subs: { unsubscribe: () => void }[] = [];

    const loadData = async () => {
      try {
        const db = await bootCoreDatabase();
        if (!isMounted) return;

        subs = [
          // 🚨 Medical Logs
          db.medical_logs.find().$.subscribe(docs => {
            if (isMounted) {
              const rawData = docs.map(d => d.toJSON() as ClinicalNote);
              const active = rawData.filter(d => !(d as unknown as { is_deleted?: boolean }).is_deleted);
              setClinicalNotes(active.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
            }
          }),

          // 🚨 MAR Charts
          db.mar_charts.find().$.subscribe(docs => {
            if (isMounted) {
              const rawData = docs.map(d => d.toJSON() as MARChart);
              const active = rawData.filter(d => !(d as unknown as { is_deleted?: boolean }).is_deleted);
              setMarCharts(active.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()));
            }
          }),

          // 🚨 Quarantine
          db.quarantine_records.find().$.subscribe(docs => {
            if (isMounted) {
              const rawData = docs.map(d => d.toJSON() as QuarantineRecord);
              const active = rawData.filter(d => !(d as unknown as { is_deleted?: boolean }).is_deleted);
              setQuarantineRecords(active.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()));
            }
          }),

          // 🚨 Animals
          db.animals.find().$.subscribe(docs => {
            if (isMounted) {
              const rawData = docs.map(d => d.toJSON() as Animal);
              setAnimals(rawData.filter(a => !(a as unknown as { is_deleted?: boolean }).is_deleted).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
              setIsLoading(false);
            }
          })
        ];
      } catch (err) {
        console.error('Failed to load medical data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      subs.forEach(sub => sub.unsubscribe());
    };
  }, []);

  // ... (keep the add/update functions exactly the same as previous)
  const addClinicalNote = async (note: Omit<ClinicalNote, 'id' | 'animal_name'>) => {
    const db = await bootCoreDatabase();
    const animalDoc = await db.animals.findOne(note.animal_id).exec();
    const newNote = { ...note, id: crypto.randomUUID(), animal_name: animalDoc?.name || 'Unknown', updated_at: new Date().toISOString(), is_deleted: false } as ClinicalNote;
    await db.medical_logs.upsert(newNote);
  };

  const updateClinicalNote = async (note: ClinicalNote) => {
    const db = await bootCoreDatabase();
    await db.medical_logs.upsert({ ...note, updated_at: new Date().toISOString() });
  };

  const addMarChart = async (chart: Omit<MARChart, 'id' | 'animal_name' | 'administered_dates' | 'status'>) => {
    const db = await bootCoreDatabase();
    const animalDoc = await db.animals.findOne(chart.animal_id).exec();
    const newChart = { ...chart, id: crypto.randomUUID(), animal_name: animalDoc?.name || 'Unknown', administered_dates: [], status: 'Active', updated_at: new Date().toISOString(), is_deleted: false } as MARChart;
    await db.mar_charts.upsert(newChart);
  };

  const updateMarChart = async (chart: MARChart) => {
    const db = await bootCoreDatabase();
    await db.mar_charts.upsert({ ...chart, updated_at: new Date().toISOString() });
  };

  const signOffDose = async (chartId: string, dateIso: string) => {
    const db = await bootCoreDatabase();
    const chartDoc = await db.mar_charts.findOne(chartId).exec();
    if (chartDoc) {
      const chart = chartDoc.toJSON();
      await db.mar_charts.upsert({ ...chart, administered_dates: [...chart.administered_dates, dateIso], updated_at: new Date().toISOString() });
    }
  };

  const addQuarantineRecord = async (record: Omit<QuarantineRecord, 'id' | 'animal_name' | 'status'>) => {
    const db = await bootCoreDatabase();
    const animalDoc = await db.animals.findOne(record.animal_id).exec();
    const newRecord = { ...record, id: crypto.randomUUID(), animal_name: animalDoc?.name || 'Unknown', status: 'Active', updated_at: new Date().toISOString(), is_deleted: false } as QuarantineRecord;
    await db.quarantine_records.upsert(newRecord);
  };

  const updateQuarantineRecord = async (record: QuarantineRecord) => {
    const db = await bootCoreDatabase();
    await db.quarantine_records.upsert({ ...record, updated_at: new Date().toISOString() });
  };

  return { clinicalNotes, marCharts, quarantineRecords, animals, isLoading, addClinicalNote, updateClinicalNote, addMarChart, updateMarChart, signOffDose, addQuarantineRecord, updateQuarantineRecord };
}