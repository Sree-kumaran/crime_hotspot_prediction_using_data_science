import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DesignSystemShowcase from "./components/DesignSystemShowcase";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import MapPage from "./pages/Map/MapPage";
import IncidentsPage from "./pages/Incidents/IncidentsPage";
import IncidentDetailsPage from "./pages/Incidents/IncidentDetailsPage";
import PredictionPage from "./pages/Prediction/PredictionPage";
import AnalyticsPage from "./pages/Analytics/AnalyticsPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import SettingsPage from "./pages/Settings/SettingsPage";

function App() {
  return (
    <Routes>
      {/* Keep Phase 1 showcase accessible */}
      <Route path="/design-system" element={<DesignSystemShowcase />} />

      {/* Phase 2 app routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
