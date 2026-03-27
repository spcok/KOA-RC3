import { useState, useEffect } from 'react';
import { Incident } from '../../types';

export const useIncidentData = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Incident data loading is neutralized.");
        if (isMounted) {
          setIncidents([]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load incident data:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || i.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const addIncident = async (incident: Omit<Incident, 'id'>) => {
    console.log("☢️ [Zero Dawn] Add incident is neutralized.", incident);
    alert("Database engine is neutralized. Incident cannot be added.");
  };

  const deleteIncident = async (id: string) => {
    console.log("☢️ [Zero Dawn] Delete incident is neutralized.", id);
    alert("Database engine is neutralized. Incident cannot be deleted.");
  };

  return {
    incidents: filteredIncidents,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterSeverity,
    setFilterSeverity,
    addIncident,
    deleteIncident
  };
};
