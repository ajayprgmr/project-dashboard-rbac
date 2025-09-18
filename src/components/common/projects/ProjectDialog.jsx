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
  Typography,
  Chip,
} from '@mui/material';
import { addDays, format } from 'date-fns';

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
];

const ProjectDialog = ({
  open,
  project,
  onClose,
  onSubmit,
  users,
  loading,
  currentUser,
}) => {
  const defaultState = useMemo(
    () => ({
      name: '',
      description: '',
      status: 'planning',
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      projectManagerId: currentUser?.role === 'project_manager' ? currentUser.id : '',
      memberIds: currentUser ? [currentUser.id] : [],
      tag: '',
    }),
    [currentUser],
  );

  const [formState, setFormState] = useState(defaultState);

  const projectManagers = useMemo(
    () => users.filter((user) => user.role === 'project_manager' || user.role === 'admin'),
    [users],
  );

  const members = useMemo(() => users, [users]);

  useEffect(() => {
    if (project) {
      const memberIds = new Set(project.memberIds || []);
      if (project.projectManagerId) {
        memberIds.add(project.projectManagerId);
      }
      setFormState({
        name: project.name,
        description: project.description,
        status: project.status,
        dueDate: project.dueDate,
        projectManagerId: project.projectManagerId,
        memberIds: Array.from(memberIds),
        tag: project.tag || '',
      });
    } else if (open) {
      setFormState(defaultState);
    }
  }, [project, open, defaultState]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormState((prev) => ({
      ...prev,
      memberIds: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = () => {
    if (!formState.name.trim()) return;
    const payload = {
      ...formState,
      dueDate: formState.dueDate,
    };
    onSubmit(payload);
  };

  const title = project ? 'Edit Project' : 'Create Project';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Project name"
            name="name"
            value={formState.name}
            onChange={handleFieldChange}
            required
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={formState.description}
            onChange={handleFieldChange}
            multiline
            minRows={3}
            fullWidth
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Due date"
              name="dueDate"
              type="date"
              value={formState.dueDate}
              onChange={handleFieldChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Tag"
              name="tag"
              value={formState.tag}
              onChange={handleFieldChange}
              placeholder="Marketing, Platform…"
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="project-status-label">Status</InputLabel>
              <Select
                labelId="project-status-label"
                label="Status"
                name="status"
                value={formState.status}
                onChange={handleFieldChange}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="project-manager-label">Project manager</InputLabel>
              <Select
                labelId="project-manager-label"
                label="Project manager"
                name="projectManagerId"
                value={formState.projectManagerId}
                onChange={handleFieldChange}
              >
                {projectManagers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role === 'admin' ? 'Admin' : 'PM'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <FormControl fullWidth>
            <InputLabel id="project-members-label">Team members</InputLabel>
            <Select
              labelId="project-members-label"
              label="Team members"
              name="memberIds"
              value={formState.memberIds}
              onChange={handleMembersChange}
              multiple
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selected.map((memberId) => {
                    const member = users.find((item) => item.id === memberId);
                    return member ? <Chip key={member.id} label={member.name} /> : null;
                  })}
                </Box>
              )}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} — {member.role.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary">
              Developers and project managers can be assigned as members; viewers stay read-only.
            </Typography>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
