import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Chip,
} from '@mui/material';
import { format, addDays } from 'date-fns';

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const TaskDialog = ({
  open,
  onClose,
  onSubmit,
  task,
  projects,
  users,
  loading,
  restrictStatus = false,
}) => {
  const defaultState = useMemo(
    () => ({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      assigneeId: '',
      status: 'todo',
      priority: 'medium',
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    }),
    [projects],
  );

  const [formState, setFormState] = useState(defaultState);

  useEffect(() => {
    if (task) {
      setFormState({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      });
    } else if (open) {
      setFormState(defaultState);
    }
  }, [task, open, defaultState]);

  const memberOptions = useMemo(() => {
    const project = projects.find((item) => item.id === formState.projectId);
    if (!project) return [];
    return users.filter((user) => project.memberIds?.includes(user.id));
  }, [projects, formState.projectId, users]);

  useEffect(() => {
    if (memberOptions.length && !memberOptions.some((user) => user.id === formState.assigneeId)) {
      setFormState((prev) => ({ ...prev, assigneeId: memberOptions[0].id }));
    }
  }, [memberOptions, formState.assigneeId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formState.title.trim() || !formState.projectId || !formState.assigneeId) return;
    onSubmit(formState);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            name="title"
            value={formState.title}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            multiline
            minRows={3}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="task-project-label">Project</InputLabel>
              <Select
                labelId="task-project-label"
                label="Project"
                name="projectId"
                value={formState.projectId}
                onChange={handleChange}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="task-assignee-label">Assignee</InputLabel>
              <Select
                labelId="task-assignee-label"
                label="Assignee"
                name="assigneeId"
                value={formState.assigneeId}
                onChange={handleChange}
              >
                {memberOptions.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                    <Chip
                      size="small"
                      sx={{ ml: 1 }}
                      label={member.role.replace('_', ' ')}
                      variant="outlined"
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth disabled={restrictStatus}>
              <InputLabel id="task-status-label">Status</InputLabel>
              <Select
                labelId="task-status-label"
                label="Status"
                name="status"
                value={formState.status}
                onChange={handleChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="task-priority-label">Priority</InputLabel>
              <Select
                labelId="task-priority-label"
                label="Priority"
                name="priority"
                value={formState.priority}
                onChange={handleChange}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due date"
              name="dueDate"
              type="date"
              value={formState.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
