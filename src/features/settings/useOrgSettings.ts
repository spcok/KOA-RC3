import { useState, useEffect } from 'react';
import { OrgProfileSettings } from '../../types';

const DEFAULT_SETTINGS: OrgProfileSettings = {
  id: 'profile',
  org_name: 'Kent Owl Academy',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  zla_license_number: '',
  official_website: '',
  adoption_portal: '',
};

export function useOrgSettings() {
  const [settings, setSettings] = useState<OrgProfileSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const sub: { unsubscribe: () => void } | null = null;

    const loadData = async () => {
      try {
        console.log("☢️ [Zero Dawn] Org settings loading is neutralized.");
        if (isMounted) {
          setSettings(DEFAULT_SETTINGS);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load org settings:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  const saveSettings = async (newSettings: OrgProfileSettings) => {
    console.log("☢️ [Zero Dawn] Org settings save is neutralized.", newSettings);
    alert("Database engine is neutralized. Settings cannot be saved.");
  };

  return { settings, isLoading, saveSettings };
}
