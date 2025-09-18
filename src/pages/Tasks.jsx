import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { createTask, deleteTask, fetchTasks, setTaskFilter, updateTask } from '../features/tasks/tasksSlice';
import { fetchProjects } from '../features/projects/projectsSlice';
import { fetchUsers } from '../features/admin/userManagementSlice';
import TaskDialog from '../components/common/tasks/TaskDialog';
import TaskBoard from '../components/common/tasks/TaskBoard';
import TaskTable from '../components/common/tasks/TaskTable';
import ConfirmDialog from '../components/common/feedback/ConfirmDialog';
import { pushNotification } from '../features/ui/uiSlice';

const statusFilterOptions = [
  { value: 'all', label: 'Any status' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const priorityFilterOptions = [
  { value: 'all', label: 'Any priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const dueDateFilterOptions = [
  { value: 'all', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_7', label: 'Due in 7 days' },
  { value: 'due_30', label: 'Due in 30 days' },
];

const TasksPage = () => {
  const dispatch = useAppDispatch();
  const tasksState = useAppSelector((state) => state.tasks);
  const projectsState = useAppSelector((state) => state.projects);
  const usersState = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);
  const globalSearch = (useAppSelector((state) => state.ui.globalSearch) || '').toLowerCase().trim();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTask, setDialogTask] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!tasksState.items.length && tasksState.status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, tasksState.items.length, tasksState.status]);

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

  const canManageTasks = currentUser?.role === 'admin' || currentUser?.role === 'project_manager';
  const isReadOnly = currentUser?.role === 'viewer';

  const accessibleProjects = useMemo(() => {
    if (currentUser?.role === 'admin') return projectsState.items;
    if (currentUser?.role === 'project_manager') {
      return projectsState.items.filter((project) => project.projectManagerId === currentUser.id);
    }
    return projectsState.items.filter((project) => project.memberIds?.includes(currentUser?.id));
  }, [projectsState.items, currentUser]);

  const projectById = useMemo(() => {
    const map = new Map();
    projectsState.items.forEach((project) => map.set(project.id, project));
    return map;
  }, [projectsState.items]);

  const userById = useMemo(() => {
    const map = new Map();
    usersState.items.forEach((user) => map.set(user.id, user));
    return map;
  }, [usersState.items]);

  const enhancedTasks = useMemo(() => {
    return tasksState.items
      .map((task) => {
        const project = projectById.get(task.projectId);
        const assignee = userById.get(task.assigneeId);
        const isProjectManager = project?.projectManagerId === currentUser?.id;
        const isAssignee = task.assigneeId === currentUser?.id;
        const canEdit =
          currentUser?.role === 'admin' || (currentUser?.role === 'project_manager' && isProjectManager);
        const canDelete = canEdit;
        const canDrag =
          currentUser?.role === 'admin' ||
          (currentUser?.role === 'project_manager' && isProjectManager) ||
          (currentUser?.role === 'developer' && isAssignee);

        const visible = () => {
          if (currentUser?.role === 'admin') return true;
          if (currentUser?.role === 'project_manager') return isProjectManager;
          if (currentUser?.role === 'developer') {
            return task.assigneeId === currentUser.id;
          }
          if (currentUser?.role === 'viewer') {
            return project?.memberIds?.includes(currentUser.id) || isProjectManager;
          }
          return false;
        };

        return {
          ...task,
          projectName: project?.name || 'Unknown project',
          assigneeName: assignee?.name || 'Unassigned',
          canEdit,
          canDelete,
          canDrag,
          _visible: visible(),
        };
      })
      .filter((task) => task._visible);
  }, [tasksState.items, projectById, userById, currentUser]);

  const filteredTasks = useMemo(() => {
    const result = enhancedTasks
      .filter((task) => {
        if (tasksState.filters.projectId && tasksState.filters.projectId !== 'all') {
          return task.projectId === tasksState.filters.projectId;
        }
        return true;
      })
      .filter((task) => {
        if (tasksState.filters.status === 'all') return true;
        return task.status === tasksState.filters.status;
      })
      .filter((task) => {
        if (tasksState.filters.priority === 'all') return true;
        return task.priority === tasksState.filters.priority;
      })
      .filter((task) => {
        if (tasksState.filters.dueDate === 'all' || !task.dueDate) return true;
        const diff = differenceInCalendarDays(parseISO(task.dueDate), new Date());
        if (tasksState.filters.dueDate === 'overdue') return diff < 0;
        if (tasksState.filters.dueDate === 'due_7') return diff >= 0 && diff <= 7;
        if (tasksState.filters.dueDate === 'due_30') return diff >= 0 && diff <= 30;
        return true;
      })
      .filter((task) => {
        if (!globalSearch) return true;
        const haystack = `${task.title} ${task.description || ''} ${task.projectName || ''}`.toLowerCase();
        return haystack.includes(globalSearch);
      });

    return result.sort(
      (a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'),
    );
  }, [enhancedTasks, tasksState.filters, globalSearch]);

  const tasksByStatus = useMemo(() => {
    const grouped = filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      { todo: [], in_progress: [], review: [], done: [] },
    );

    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
    });

    return grouped;
  }, [filteredTasks]);

  const handleFilterChange = (key) => (event, value) => {
    const nextValue = event?.target ? event.target.value : value;
    if (nextValue === null || typeof nextValue === 'undefined') return;
    dispatch(setTaskFilter({ [key]: nextValue }));
  };

  const handleCreate = () => {
    setDialogTask(null);
    setDialogOpen(true);
    setLocalError(null);
  };

  const handleEdit = (task) => {
    setDialogTask(task);
    setDialogOpen(true);
    setLocalError(null);
  };

  const handleDialogSubmit = async (payload) => {
    setDialogLoading(true);
    try {
      if (dialogTask) {
        await dispatch(updateTask({ ...dialogTask, ...payload })).unwrap();
        dispatch(
          pushNotification({
            title: 'Task updated',
            message: `${payload.title} updated successfully.`,
            variant: 'info',
          }),
        );
      } else {
        await dispatch(createTask(payload)).unwrap();
        dispatch(
          pushNotification({
            title: 'Task created',
            message: `${payload.title} added to the board.`,
            variant: 'success',
          }),
        );
      }
      setDialogOpen(false);
    } catch (err) {
      setLocalError(err.message || 'Unable to save task');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTask) return;
    setConfirmLoading(true);
    try {
      await dispatch(deleteTask(confirmTask.id)).unwrap();
      dispatch(
        pushNotification({
          title: 'Task deleted',
          message: `${confirmTask.title} was removed.`,
          variant: 'warning',
        }),
      );
      setConfirmOpen(false);
      setConfirmTask(null);
    } catch (err) {
      setLocalError(err.message || 'Unable to delete task');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDrag = async ({ taskId, to }) => {
    const task = filteredTasks.find((item) => item.id === taskId);
    if (!task) return;
    if (!task.canDrag || task.status === to) return;
    try {
      await dispatch(updateTask({ ...task, status: to })).unwrap();
    } catch (err) {
      setLocalError(err.message || 'Unable to move task');
    }
  };

  const handleDeleteRequest = (task) => {
    setConfirmTask(task);
    setConfirmOpen(true);
  };

  if (tasksState.status === 'loading' && !tasksState.items.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualise work in Kanban or table view. Developers can update their own tasks.
          </Typography>
        </Box>
        {canManageTasks && accessibleProjects.length > 0 && usersState.items.length > 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New task
          </Button>
        )}
      </Stack>

      {(tasksState.error || localError) && (
        <Alert severity="error">{tasksState.error || localError}</Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Select size="small" value={tasksState.filters.status} onChange={handleFilterChange('status')}>
          {statusFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select size="small" value={tasksState.filters.priority} onChange={handleFilterChange('priority')}>
          {priorityFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select size="small" value={tasksState.filters.dueDate} onChange={handleFilterChange('dueDate')}>
          {dueDateFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select size="small" value={tasksState.filters.projectId || 'all'} onChange={handleFilterChange('projectId')}>
          <MenuItem value="all">All projects</MenuItem>
          {accessibleProjects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={tasksState.filters.view}
          onChange={handleFilterChange('view')}
        >
          <ToggleButton value="board">Board</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {filteredTasks.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            No tasks match the filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust the filters or create a new task to populate the board.
          </Typography>
        </Box>
      ) : tasksState.filters.view === 'board' ? (
        <TaskBoard
          tasksByStatus={tasksByStatus}
          onDragEnd={handleDrag}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          canDrag={(task) => task.canDrag && !isReadOnly}
          isReadOnly={isReadOnly}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          isReadOnly={isReadOnly}
        />
      )}

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        task={dialogTask}
        projects={accessibleProjects}
        users={usersState.items}
        loading={dialogLoading}
        restrictStatus={currentUser?.role === 'developer'}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        description={`This will delete ${confirmTask?.title}.`}
        confirmLabel={confirmLoading ? 'Deleting…' : 'Delete'}
        loading={confirmLoading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  );
};

export default TasksPage;
