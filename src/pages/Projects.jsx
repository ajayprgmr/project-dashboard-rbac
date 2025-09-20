import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { createProject, deleteProject, fetchProjects, setProjectFilter, updateProject } from '../features/projects';
import { fetchUsers } from '../features/admin';
import ProjectDialog from '../components/common/projects/ProjectDialog';
import ConfirmDialog from '../components/common/feedback/ConfirmDialog';
import { pushNotification } from '../features/ui';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
];

const dueDateOptions = [
  { value: 'all', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_7', label: 'Due in 7 days' },
  { value: 'due_30', label: 'Due in 30 days' },
];

const statusChips = {
  planning: { label: 'Planning', color: 'default' },
  in_progress: { label: 'In Progress', color: 'info' },
  blocked: { label: 'Blocked', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
};

const ProjectsPage = () => {
  const dispatch = useAppDispatch();
  const { items, status, filters, error } = useAppSelector((state) => state.projects);
  const usersState = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);
  const globalSearch = (useAppSelector((state) => state.ui.globalSearch) || '').toLowerCase().trim();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!items.length && status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [dispatch, items.length, status]);

  useEffect(() => {
    if (!usersState.items.length && usersState.status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, usersState.items.length, usersState.status]);

  const canManageAll = currentUser?.role === 'admin';
  const canManageOwn = currentUser?.role === 'project_manager';

  const visibleProjects = useMemo(() => {
    const baseList = items.filter((project) => {
      if (canManageAll) return true;
      if (canManageOwn && project.projectManagerId === currentUser.id) return true;
      return project.memberIds?.includes(currentUser?.id);
    });

    return baseList
      .filter((project) => {
        if (filters.status === 'all') return true;
        return project.status === filters.status;
      })
      .filter((project) => {
        if (filters.dueDate === 'all') return true;
        if (!project.dueDate) return true;
        const diff = differenceInCalendarDays(parseISO(project.dueDate), new Date());
        if (filters.dueDate === 'overdue') {
          return diff < 0;
        }
        if (filters.dueDate === 'due_7') {
          return diff >= 0 && diff <= 7;
        }
        if (filters.dueDate === 'due_30') {
          return diff >= 0 && diff <= 30;
        }
        return true;
      })
      .filter((project) => {
        if (!globalSearch) return true;
        const haystack = `${project.name} ${project.description || ''} ${project.tag || ''}`.toLowerCase();
        return haystack.includes(globalSearch);
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [items, filters.status, filters.dueDate, currentUser, canManageAll, canManageOwn, globalSearch]);

  const handleOpenDialog = (mode, project = null) => {
    setDialogMode(mode);
    setSelectedProject(project);
    setDialogOpen(true);
    setLocalError(null);
  };

  const handleFilterChange = (key) => (event, value) => {
    const nextValue = event?.target ? event.target.value : value;
    if (nextValue === null || typeof nextValue === 'undefined') return;
    dispatch(setProjectFilter({ [key]: nextValue }));
  };

  const handleDialogSubmit = async (payload) => {
    setDialogLoading(true);
    setLocalError(null);
    try {
      const memberSet = new Set(payload.memberIds || []);
      if (payload.projectManagerId) {
        memberSet.add(payload.projectManagerId);
      }
      const body = {
        ...payload,
        memberIds: Array.from(memberSet),
      };
      if (dialogMode === 'create') {
        await dispatch(createProject(body)).unwrap();
        dispatch(
          pushNotification({
            title: 'Project created',
            message: `${body.name} is now live.`,
            variant: 'success',
          }),
        );
      } else if (selectedProject) {
        await dispatch(updateProject({ ...selectedProject, ...body })).unwrap();
        dispatch(
          pushNotification({
            title: 'Project updated',
            message: `${body.name} was updated successfully.`,
            variant: 'info',
          }),
        );
      }
      setDialogOpen(false);
    } catch (err) {
      setLocalError(err.message || 'Unable to save project');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    setConfirmLoading(true);
    try {
      await dispatch(deleteProject(selectedProject.id)).unwrap();
      dispatch(
        pushNotification({
          title: 'Project removed',
          message: `${selectedProject.name} was deleted.`,
          variant: 'warning',
        }),
      );
      setConfirmOpen(false);
      setSelectedProject(null);
    } catch (err) {
      setLocalError(err.message || 'Unable to delete project');
    } finally {
      setConfirmLoading(false);
    }
  };

  const renderTable = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due date</TableCell>
            <TableCell>Members</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleProjects.map((project) => {
            const statusChip = statusChips[project.status] ?? { label: project.status, color: 'default' };
            const memberNames = project.memberIds
              ?.map((memberId) => usersState.items.find((user) => user.id === memberId)?.name)
              .filter(Boolean) ?? [];
            const canEdit =
              canManageAll || (canManageOwn && project.projectManagerId === currentUser?.id);
            const canDelete = canManageAll;
            return (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusChip.label}
                    color={statusChip.color}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {memberNames.length ? (
                      memberNames.map((name) => <Chip key={name} label={name} size="small" />)
                    ) : (
                      <Chip label="No members" size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {canEdit && (
                      <Tooltip title="Edit project">
                        <IconButton size="small" onClick={() => handleOpenDialog('edit', project)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete project">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedProject(project);
                            setConfirmOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCards = () => (
    <Grid container columns={{ xs: 12, md: 12, lg: 12 }} rowSpacing={2} columnSpacing={2}>
      {visibleProjects.map((project) => {
        const statusChip = statusChips[project.status] ?? { label: project.status, color: 'default' };
        const canEdit =
          canManageAll || (canManageOwn && project.projectManagerId === currentUser?.id);
        const canDelete = canManageAll;
        const manager = usersState.items.find((user) => user.id === project.projectManagerId);
        const memberNames = project.memberIds
          ?.map((memberId) => usersState.items.find((user) => user.id === memberId)?.name)
          .filter(Boolean);
        return (
          <Grid key={project.id} item xs={12} md={6} lg={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip label={project.tag || 'General'} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label={statusChip.label} color={statusChip.color} variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Managed by {manager?.name || 'Unassigned'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {memberNames?.length ? (
                      memberNames.map((name) => <Chip key={name} label={name} size="small" />)
                    ) : (
                      <Chip label="No members" size="small" variant="outlined" />
                    )}
                  </Box>
                </Stack>
              </CardContent>
              {(canEdit || canDelete) && (
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {canEdit && (
                    <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenDialog('edit', project)}>
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => {
                        setSelectedProject(project);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              )}
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  if (status === 'loading' && !items.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage initiatives, track their status, and keep teammates aligned.
            </Typography>
          </Box>
          {(canManageAll || canManageOwn) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
            >
              New project
            </Button>
          )}
        </Stack>
      </Box>

      {(error || localError) && <Alert severity="error">{error || localError}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Select
          size="small"
          value={filters.status}
          onChange={handleFilterChange('status')}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={filters.dueDate}
          onChange={handleFilterChange('dueDate')}
        >
          {dueDateOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filters.view}
          onChange={handleFilterChange('view')}
        >
          <ToggleButton value="table">Table</ToggleButton>
          <ToggleButton value="cards">Cards</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {visibleProjects.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            No projects match the filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust the filters or create a new project to get started.
          </Typography>
        </Paper>
      ) : filters.view === 'table' ? (
        renderTable()
      ) : (
        renderCards()
      )}

      <ProjectDialog
        open={dialogOpen}
        project={dialogMode === 'edit' ? selectedProject : null}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        users={usersState.items}
        currentUser={currentUser}
        loading={dialogLoading}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete project"
        description={`This will remove ${selectedProject?.name} and its tasks. This action cannot be undone.`}
        confirmLabel={confirmLoading ? 'Deleting…' : 'Delete'}
        loading={confirmLoading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  );
};

export default ProjectsPage;
