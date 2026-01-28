import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import { Layout } from './components/layout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectCreatePage from './pages/projects/ProjectCreatePage';
import SourceUploadPage from './pages/sources/SourceUploadPage';
import SourceDetailPage from './pages/sources/SourceDetailPage';
import ProcessingRunsListPage from './pages/processing/ProcessingRunsListPage';
import ProcessingRunDetailPage from './pages/processing/ProcessingRunDetailPage';
import DatasetsListPage from './pages/datasets/DatasetsListPage';
import DatasetDetailPage from './pages/datasets/DatasetDetailPage';
import IntegrationsListPage from './pages/integrations/IntegrationsListPage';
import IntegrationDetailPage from './pages/integrations/IntegrationDetailPage';
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import OrganizationSettingsPage from './pages/settings/OrganizationSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsListPage /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><ProjectCreatePage /></ProtectedRoute>} />
      <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/sources/upload" element={<ProtectedRoute><SourceUploadPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/sources/:sourceId" element={<ProtectedRoute><SourceDetailPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/processing" element={<ProtectedRoute><ProcessingRunsListPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/processing/:runId" element={<ProtectedRoute><ProcessingRunDetailPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/datasets" element={<ProtectedRoute><DatasetsListPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/datasets/:datasetId" element={<ProtectedRoute><DatasetDetailPage /></ProtectedRoute>} />
      <Route path="/datasets" element={<ProtectedRoute><DatasetsListPage /></ProtectedRoute>} />
      <Route path="/datasets/:datasetId" element={<ProtectedRoute><DatasetDetailPage /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><IntegrationsListPage /></ProtectedRoute>} />
      <Route path="/integrations/:integrationId" element={<ProtectedRoute><IntegrationDetailPage /></ProtectedRoute>} />
      <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
      <Route path="/settings/organization" element={<ProtectedRoute><OrganizationSettingsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
