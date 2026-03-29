import { useState, useEffect, useCallback } from 'react';
import { Subscription } from 'rxjs';
import { ClinicalNote, MARChart, QuarantineRecord, Animal } from '../../types';
import { bootCoreDatabase } from '../../lib/bootCoreDatabase';

export function useMedicalData() {
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [marCharts, setMarCharts] = useState<MARChart[]>([]);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const subs: Subscription[] = [];

    const loadData = async () => {
      try {
        setIsLoading(true);
        const db = await bootCoreDatabase();
        
        if (!db || !db.collections || !db.collections.medical_logs || !db.collections.mar_charts || !db.collections.quarantine_records || !db.collections.animals) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Subscribe to clinical notes (medical_logs)
        subs.push(
          db.collections.medical_logs
            .find({ selector: { is_deleted: false } })
            .$.subscribe(docs => {
              if (isMounted) setClinicalNotes(docs.map(doc => doc.toJSON() as ClinicalNote));
            })
        );

        // Subscribe to MAR charts
        subs.push(
          db.collections.mar_charts
            .find({ selector: { is_deleted: false } })
            .$.subscribe(docs => {
              if (isMounted) setMarCharts(docs.map(doc => doc.toJSON() as MARChart));
            })
        );

        // Subscribe to quarantine records
        subs.push(
          db.collections.quarantine_records
            .find({ selector: { is_deleted: false } })
            .$.subscribe(docs => {
              if (isMounted) setQuarantineRecords(docs.map(doc => doc.toJSON() as QuarantineRecord));
            })
        );

        // Subscribe to animals (for names)
        subs.push(
          db.collections.animals
            .find({ selector: { is_deleted: false } })
            .$.subscribe(docs => {
              if (isMounted) {
                setAnimals(docs.map(doc => doc.toJSON() as Animal));
                setIsLoading(false);
              }
            })
        );

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

  const addClinicalNote = useCallback(async (note: Omit<ClinicalNote, 'id' | 'animal_name'>) => {
    try {
      const db = await bootCoreDatabase();
      const animal = await db.collections.animals.findOne(note.animal_id).exec();
      await db.collections.medical_logs.insert({
        ...note,
        id: crypto.randomUUID(),
        animal_name: animal?.get('name') || 'Unknown',
        is_deleted: false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add clinical note:', err);
      throw err;
    }
  }, []);

  const updateClinicalNote = useCallback(async (note: ClinicalNote) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.medical_logs.findOne(note.id).exec();
      if (doc) {
        await doc.patch({
          ...note,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to update clinical note:', err);
      throw err;
    }
  }, []);

  const addMarChart = useCallback(async (chart: Omit<MARChart, 'id' | 'animal_name' | 'administered_dates' | 'status'>) => {
    try {
      const db = await bootCoreDatabase();
      const animal = await db.collections.animals.findOne(chart.animal_id).exec();
      await db.collections.mar_charts.insert({
        ...chart,
        id: crypto.randomUUID(),
        animal_name: animal?.get('name') || 'Unknown',
        administered_dates: [],
        status: 'Active',
        is_deleted: false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add MAR chart:', err);
      throw err;
    }
  }, []);

  const updateMarChart = useCallback(async (chart: MARChart) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.mar_charts.findOne(chart.id).exec();
      if (doc) {
        await doc.patch({
          ...chart,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to update MAR chart:', err);
      throw err;
    }
  }, []);

  const signOffDose = useCallback(async (chartId: string, dateIso: string) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.mar_charts.findOne(chartId).exec();
      if (doc) {
        const currentDates = doc.get('administered_dates') || [];
        if (!currentDates.includes(dateIso)) {
          await doc.patch({
            administered_dates: [...currentDates, dateIso],
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Failed to sign off dose:', err);
      throw err;
    }
  }, []);

  const addQuarantineRecord = useCallback(async (record: Omit<QuarantineRecord, 'id' | 'animal_name' | 'status'>) => {
    try {
      const db = await bootCoreDatabase();
      const animal = await db.collections.animals.findOne(record.animal_id).exec();
      await db.collections.quarantine_records.insert({
        ...record,
        id: crypto.randomUUID(),
        animal_name: animal?.get('name') || 'Unknown',
        status: 'Active',
        is_deleted: false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to add quarantine record:', err);
      throw err;
    }
  }, []);

  const updateQuarantineRecord = useCallback(async (record: QuarantineRecord) => {
    try {
      const db = await bootCoreDatabase();
      const doc = await db.collections.quarantine_records.findOne(record.id).exec();
      if (doc) {
        await doc.patch({
          ...record,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to update quarantine record:', err);
      throw err;
    }
  }, []);

  return { clinicalNotes, marCharts, quarantineRecords, animals, isLoading, addClinicalNote, updateClinicalNote, addMarChart, updateMarChart, signOffDose, addQuarantineRecord, updateQuarantineRecord };
}
