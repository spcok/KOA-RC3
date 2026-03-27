import { useState, useEffect } from 'react';
import { ClinicalNote, MARChart, QuarantineRecord, Animal } from '../../types';

export function useMedicalData() {
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [marCharts, setMarCharts] = useState<MARChart[]>([]);
  const [quarantineRecords, setQuarantineRecords] = useState<QuarantineRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const subs: { unsubscribe: () => void }[] = [];

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Medical data loading is neutralized.");
        if (isMounted) {
          setClinicalNotes([]);
          setMarCharts([]);
          setQuarantineRecords([]);
          setAnimals([]);
          setIsLoading(false);
        }
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
    console.log("☢️ [Zero Dawn] Add clinical note is neutralized.", note);
    alert("Database engine is neutralized. Note cannot be added.");
  };

  const updateClinicalNote = async (note: ClinicalNote) => {
    console.log("☢️ [Zero Dawn] Update clinical note is neutralized.", note);
    alert("Database engine is neutralized. Note cannot be updated.");
  };

  const addMarChart = async (chart: Omit<MARChart, 'id' | 'animal_name' | 'administered_dates' | 'status'>) => {
    console.log("☢️ [Zero Dawn] Add MAR chart is neutralized.", chart);
    alert("Database engine is neutralized. Chart cannot be added.");
  };

  const updateMarChart = async (chart: MARChart) => {
    console.log("☢️ [Zero Dawn] Update MAR chart is neutralized.", chart);
    alert("Database engine is neutralized. Chart cannot be updated.");
  };

  const signOffDose = async (chartId: string, dateIso: string) => {
    console.log("☢️ [Zero Dawn] Sign off dose is neutralized.", { chartId, dateIso });
    alert("Database engine is neutralized. Dose cannot be signed off.");
  };

  const addQuarantineRecord = async (record: Omit<QuarantineRecord, 'id' | 'animal_name' | 'status'>) => {
    console.log("☢️ [Zero Dawn] Add quarantine record is neutralized.", record);
    alert("Database engine is neutralized. Record cannot be added.");
  };

  const updateQuarantineRecord = async (record: QuarantineRecord) => {
    console.log("☢️ [Zero Dawn] Update quarantine record is neutralized.", record);
    alert("Database engine is neutralized. Record cannot be updated.");
  };

  return { clinicalNotes, marCharts, quarantineRecords, animals, isLoading, addClinicalNote, updateClinicalNote, addMarChart, updateMarChart, signOffDose, addQuarantineRecord, updateQuarantineRecord };
}