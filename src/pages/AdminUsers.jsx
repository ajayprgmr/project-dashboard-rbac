import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LoginIcon from '@mui/icons-material/Login';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchUsers, updateUserRole } from '../features/admin/userManagementSlice';
import { fetchProjects } from '../features/projects/projectsSlice';
import { impersonateUser } from '../features/auth/authSlice';
import { pushNotification } from '../features/ui/uiSlice';
import RoleAssignmentDialog from '../components/common/admin/RoleAssignmentDialog';

const roleLabels = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  developer: 'Developer',
  viewer: 'Viewer',
};

const roleColors = {
  admin: 'primary',
  project_manager: 'secondary',
  developer: 'success',
  viewer: 'default',
};

const roleLandingRoute = {
  admin: '/admin/users',
  project_manager: '/projects',
  developer: '/tasks',
  viewer: '/projects',
};

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useAppSelector((state) => state.users);
  const projects = useAppSelector((state) => state.projects.items);
  const projectsStatus = useAppSelector((state) => state.projects.status);
  const authUser = useAppSelector((state) => state.auth.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogSaving, setDialogSaving] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!items.length && status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, items.length, status]);

  useEffect(() => {
    if (!projects.length && projectsStatus === 'idle') {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length, projectsStatus]);

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setLocalError(null);
  };

  const handleRoleChange = async (role) => {
    if (!selectedUser) return;
    setDialogSaving(true);
    setLocalError(null);
    try {
      await dispatch(updateUserRole({ userId: selectedUser.id, role })).unwrap();
      dispatch(
        pushNotification({
          title: 'Role updated',
          message: `${selectedUser.name} is now a ${roleLabels[role]}.`,
          variant: 'success',
        }),
      );
      setDialogOpen(false);
    } catch (err) {
      setLocalError(err.message || 'Unable to update role');
    } finally {
      setDialogSaving(false);
    }
  };

  const handleImpersonate = async (user) => {
    try {
      await dispatch(impersonateUser(user.id)).unwrap();
      dispatch(
        pushNotification({
          title: 'Impersonation enabled',
          message: `You are now browsing as ${user.name}.`,
          variant: 'info',
        }),
      );
      navigate(roleLandingRoute[user.role] || '/projects', { replace: true });
    } catch (err) {
      dispatch(
        pushNotification({
          title: 'Impersonation failed',
          message: err.message || 'Unable to impersonate this user',
          variant: 'error',
        }),
      );
    }
  };

  if (status === 'loading' || projectsStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update roles, monitor project access, and impersonate any account to verify permissions.
        </Typography>
      </Box>

      {(error || localError) && <Alert severity="error">{error || localError}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Assigned Projects</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((user) => {
              const assignedProjects = projects
                .filter(
                  (project) =>
                    project.memberIds?.includes(user.id) || project.projectManagerId === user.id,
                )
                .map((project) => project.name);
              return (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={roleLabels[user.role] || user.role}
                      color={roleColors[user.role]}
                      size="small"
                      icon={<ShieldIcon fontSize="inherit" />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {assignedProjects.length ? (
                        assignedProjects.map((name) => <Chip key={name} label={name} size="small" variant="outlined" />)
                      ) : (
                        <Chip label="No projects" size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Update role">
                        <IconButton color="primary" onClick={() => handleOpenDialog(user)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Impersonate">
                        <span>
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleImpersonate(user)}
                            disabled={authUser?.id === user.id}
                          >
                            <LoginIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <RoleAssignmentDialog
        open={dialogOpen}
        user={selectedUser}
        loading={dialogSaving}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleRoleChange}
      />
    </Stack>
  );
};

export default AdminUsersPage;
