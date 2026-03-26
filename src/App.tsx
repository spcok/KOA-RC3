import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import { useAuthStore } from './store/authStore';

// 🛡️ Infrastructure Modules
import { DatabaseBootProvider } from './providers/DatabaseBootProvider';
import { AuthGuard } from './components/auth/AuthGuard';
import { A11yProvider } from './providers/A11yProvider';

// 📱 Main Feature Screens
const DashboardContainer = React.lazy(() => import('./features/dashboard/DashboardContainer'));
const WeatherView = React.lazy(() => import('./features/dashboard/WeatherView'));
const DailyLog = React.lazy(() => import('./features/husbandry/DailyLog'));
const DailyRounds = React.lazy(() => import('./features/husbandry/DailyRounds'));
const Tasks = React.lazy(() => import('./features/husbandry/Tasks'));
const FeedingSchedule = React.lazy(() => import('./features/husbandry/FeedingSchedule'));
const MedicalRecords = React.lazy(() => import('./features/medical/MedicalRecords'));
const Movements = React.lazy(() => import('./features/logistics/Movements'));
const FlightRecords = React.lazy(() => import('./features/logistics/FlightRecords'));
const SiteMaintenance = React.lazy(() => import('./features/safety/tabs/SiteMaintenance'));
const Incidents = React.lazy(() => import('./features/safety/tabs/Incidents'));
const FirstAid = React.lazy(() => import('./features/safety/tabs/FirstAid'));
const SafetyDrills = React.lazy(() => import('./features/safety/tabs/SafetyDrills'));
const Timesheets = React.lazy(() => import('./features/staff/Timesheets'));
const Holidays = React.lazy(() => import('./features/staff/Holidays'));
const StaffRota = React.lazy(() => import('./features/staff/StaffRota'));
const MissingRecords = React.lazy(() => import('./features/compliance/MissingRecords'));
const SettingsLayout = React.lazy(() => import('./features/settings/SettingsLayout'));
const HelpSupport = React.lazy(() => import('./features/help/HelpSupport'));

const ReportsDashboard = React.lazy(() => import('./features/reports/ReportsDashboard'));
const AnimalsList = React.lazy(() => import('./features/animals/AnimalsList'));
const AnimalProfile = React.lazy(() => import('./features/animals/AnimalProfile'));

const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <A11yProvider>
        <Router>
          <DatabaseBootProvider>
            <AuthGuard>
              <Suspense fallback={<div className="p-8 text-center flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<DashboardContainer />} />
                    <Route path="weather" element={<WeatherView />} />
                    <Route path="daily-log" element={<DailyLog />} />
                    <Route path="daily-rounds" element={<DailyRounds />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="feeding-schedule" element={<FeedingSchedule />} />
                    <Route path="animals" element={<AnimalsList />} />
                    <Route path="animals/:id" element={<AnimalProfile />} />
                    <Route path="medical" element={<MedicalRecords />} />
                    <Route path="movements" element={<Movements />} />
                    <Route path="flight-records" element={<FlightRecords />} />
                    <Route path="maintenance" element={<SiteMaintenance />} />
                    <Route path="incidents" element={<Incidents />} />
                    <Route path="first-aid" element={<FirstAid />} />
                    <Route path="safety-drills" element={<SafetyDrills />} />
                    <Route path="timesheets" element={<Timesheets />} />
                    <Route path="holidays" element={<Holidays />} />
                    <Route path="rota" element={<StaffRota />} />
                    <Route path="compliance" element={<MissingRecords />} />
                    <Route path="reports" element={<ReportsDashboard />} />
                    <Route path="settings/*" element={<SettingsLayout />} />
                    <Route path="help" element={<HelpSupport />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
          </AuthGuard>
        </DatabaseBootProvider>
      </Router>
      </A11yProvider>
    </ErrorBoundary>
  );
};

export default App;
