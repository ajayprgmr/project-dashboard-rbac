import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EventIcon from '@mui/icons-material/Event';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { differenceInCalendarDays } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchProjects, assignProjectMembers } from '../features/projects/projectsSlice';
import { fetchUsers } from '../features/admin/userManagementSlice';
import { fetchTasks } from '../features/tasks/tasksSlice';
import MemberAssignmentDialog from '../components/common/teams/MemberAssignmentDialog';
import { pushNotification } from '../features/ui/uiSlice';

const roleColors = {
  admin: 'primary',
  project_manager: 'secondary',
  developer: 'success',
  viewer: 'default',
};

const TeamsPage = () => {
  const dispatch = useAppDispatch();
  const projectsState = useAppSelector((state) => state.projects);
  const usersState = useAppSelector((state) => state.users);
  const tasksState = useAppSelector((state) => state.tasks);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!projectsState.items.length && projectsState.status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [dispatch, projectsState.items.length, projectsState.status]);

  useEffect(() => {
    if (!usersState.items.length && usersState.status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, usersState.items.length, usersState.status]);

  useEffect(() => {
    if (!tasksState.items.length && tasksState.status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, tasksState.items.length, tasksState.status]);

  const accessibleProjects = useMemo(() => {
    if (currentUser?.role === 'admin') return projectsState.items;
    if (currentUser?.role === 'project_manager') {
      return projectsState.items.filter((project) => project.projectManagerId === currentUser.id);
    }
    return projectsState.items.filter((project) => project.memberIds?.includes(currentUser?.id));
  }, [projectsState.items, currentUser]);

  useEffect(() => {
    if (!selectedProjectId && accessibleProjects.length) {
      setSelectedProjectId(accessibleProjects[0].id);
    }
    if (selectedProjectId && !accessibleProjects.find((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(accessibleProjects[0]?.id ?? null);
    }
  }, [accessibleProjects, selectedProjectId]);

  const selectedProject = accessibleProjects.find((project) => project.id === selectedProjectId) || null;

  const memberDetails = useMemo(() => {
    if (!selectedProject) return [];
    return (selectedProject.memberIds || [])
      .map((memberId) => usersState.items.find((user) => user.id === memberId))
      .filter(Boolean);
  }, [selectedProject, usersState.items]);

  const tasksByMember = useMemo(() => {
    if (!selectedProject) return new Map();
    const map = new Map();
    tasksState.items
      .filter((task) => task.projectId === selectedProject.id)
      .forEach((task) => {
        map.set(task.assigneeId, (map.get(task.assigneeId) || 0) + (task.status === 'done' ? 1 : 0));
      });
    return map;
  }, [tasksState.items, selectedProject]);

  const canManageTeam = useMemo(() => {
    if (!selectedProject || !currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'project_manager') {
      return selectedProject.projectManagerId === currentUser.id;
    }
    return false;
  }, [selectedProject, currentUser]);

  const handleSaveMembers = async (memberIds) => {
    if (!selectedProject) return;
    setDialogLoading(true);
    setLocalError(null);
    try {
      await dispatch(assignProjectMembers({ projectId: selectedProject.id, memberIds })).unwrap();
      dispatch(
        pushNotification({
          title: 'Team updated',
          message: `${selectedProject.name} now has ${memberIds.length} members.`,
          variant: 'success',
        }),
      );
      setDialogOpen(false);
    } catch (err) {
      setLocalError(err.message || 'Unable to update team');
    } finally {
      setDialogLoading(false);
    }
  };

  if (!accessibleProjects.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          No teams yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once you join or create a project, your team roster will appear here.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Teams & Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review team composition and keep membership aligned with project needs.
          </Typography>
        </Box>
        <Select
          size="small"
          value={selectedProjectId || ''}
          onChange={(event) => setSelectedProjectId(event.target.value)}
        >
          {accessibleProjects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {localError && <Alert severity="error">{localError}</Alert>}

      {selectedProject && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container columns={{ xs: 12, md: 12 }} rowSpacing={2} columnSpacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LeaderboardIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    {memberDetails.length} team members
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Due {selectedProject.dueDate ? new Date(selectedProject.dueDate).toLocaleDateString() : 'TBD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    Status:
                  </Typography>
                  <Chip size="small" label={selectedProject.status.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    Tag:
                  </Typography>
                  <Chip size="small" variant="outlined" label={selectedProject.tag || 'General'} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Countdown:{' '}
                  {selectedProject.dueDate
                    ? (() => {
                        const days = differenceInCalendarDays(new Date(selectedProject.dueDate), new Date());
                        if (Number.isNaN(days)) return '—';
                        if (days > 0) return `${days} days remaining`;
                        if (days === 0) return 'Due today';
                        return `${Math.abs(days)} days overdue`;
                      })()
                    : '—'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Team members
                  </Typography>
                  {canManageTeam && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GroupAddIcon />}
                      onClick={() => {
                        setDialogOpen(true);
                        setLocalError(null);
                      }}
                    >
                      Manage members
                    </Button>
                  )}
                </Box>
                <Divider />
                <List dense>
                  {memberDetails.map((member) => (
                    <ListItem key={member.id} secondaryAction={<Chip label={member.role.replace('_', ' ')} size="small" color={roleColors[member.role] || 'default'} />}
                    >
                      <ListItemAvatar>
                        <Avatar>{member.name.slice(0, 1)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={`${tasksByMember.get(member.id) || 0} tasks completed`}
                      />
                    </ListItem>
                  ))}
                  {!memberDetails.length && (
                    <ListItem>
                      <ListItemText primary="No members yet" secondary="Use the manage button to invite teammates." />
                    </ListItem>
                  )}
                </List>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      <MemberAssignmentDialog
        open={dialogOpen}
        project={selectedProject}
        users={usersState.items}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMembers}
        loading={dialogLoading}
      />
    </Stack>
  );
};

export default TeamsPage;
