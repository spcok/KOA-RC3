import { useState } from 'react';

// Define Legacy Interfaces for Type Safety
interface LegacyLog {
  id: string;
  date: string;
  type: string;
  value?: string;
  notes?: string;
  user?: string;
  // Movement specific
  movementType?: string;
  source?: string;
  destination?: string;
  // Medical specific
  treatment?: string;
  // Weight specific
  weight?: string;
}

interface LegacyAnimal {
  id: string;
  name: string;
  species: string;
  latinName?: string;
  sex: string;
  category: string;
  dob: string;
  isGroup: boolean;
  hasNoId: boolean;
  imageUrl: string;
  weightUnit: string;
  hazardRating?: string;
  origin?: string;
  arrivalDate?: string;
  redListStatus?: string;
  specialRequirements?: string;
  logs: LegacyLog[];
}

interface LegacyImportData {
  data: {
    animals: LegacyAnimal[];
  }
}

export const useMigrationData = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    animalCount: number;
    logCount: number;
    animals: LegacyAnimal[];
  } | null>(null);

  const parseFile = async (file: File) => {
    setError(null);
    setPreviewData(null);
    
    try {
      const text = await file.text();
      const json = JSON.parse(text) as LegacyImportData;

      if (!json.data || !Array.isArray(json.data.animals)) {
        throw new Error("Invalid JSON structure. Expected { data: { animals: [] } }");
      }

      const totalLogs = json.data.animals.reduce((acc, animal) => acc + (animal.logs?.length || 0), 0);

      setPreviewData({
        animalCount: json.data.animals.length,
        logCount: totalLogs,
        animals: json.data.animals
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON file");
    }
  };

  const runImport = async () => {
    if (!previewData) return;
    
    setIsImporting(true);
    setProgress(0);
    setError(null);

    try {
      console.log("☢️ [Zero Dawn] Migration engine is neutralized.");
      alert("Database engine is neutralized. Migration cannot proceed.");
      setPreviewData(null); // Clear preview on success
    } catch (err) {
      console.error("Migration failed:", err);
      setError(err instanceof Error ? err.message : "Migration failed during database commit.");
    } finally {
      setIsImporting(false);
    }
  };

  return {
    parseFile,
    runMigration: runImport,
    previewData,
    isImporting,
    progress,
    error,
    reset: () => {
      setPreviewData(null);
      setError(null);
      setProgress(0);
    }
  };
};
