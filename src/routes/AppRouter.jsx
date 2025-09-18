import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import ProjectsPage from '../pages/Projects';
import TasksPage from '../pages/Tasks';
import TeamsPage from '../pages/Teams';
import ReportsPage from '../pages/Reports';
import AdminUsersPage from '../pages/AdminUsers';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/projects" replace />} />
  </Routes>
);

export default AppRouter;
