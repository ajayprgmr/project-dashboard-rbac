import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
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
  Typography,
  Chip,
} from '@mui/material';

const MemberAssignmentDialog = ({ open, project, users, onClose, onSave, loading }) => {
  const [selected, setSelected] = useState(project?.memberIds || []);

  useEffect(() => {
    if (project) {
      const unique = new Set(project.memberIds || []);
      if (project.projectManagerId) {
        unique.add(project.projectManagerId);
      }
      setSelected(Array.from(unique));
    }
  }, [project]);

  const options = useMemo(() => users, [users]);

  const manager = users.find((user) => user.id === project?.projectManagerId);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelected(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = () => {
    const memberSet = new Set(selected);
    if (project?.projectManagerId) {
      memberSet.add(project.projectManagerId);
    }
    onSave(Array.from(memberSet));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign team members</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {manager && (
            <Box>
              <Typography variant="subtitle2">Project lead</Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Avatar sx={{ width: 32, height: 32 }}>{manager.name.slice(0, 1)}</Avatar>
                <Box>
                  <Typography variant="body2">{manager.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {manager.role.replace('_', ' ')}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
          <FormControl fullWidth>
            <InputLabel id="member-select-label">Team members</InputLabel>
            <Select
              labelId="member-select-label"
              label="Team members"
              multiple
              value={selected}
              onChange={handleChange}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {value.map((memberId) => {
                    const member = users.find((user) => user.id === memberId);
                    return member ? <Chip key={member.id} label={member.name} /> : null;
                  })}
                </Box>
              )}
            >
              {options.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 28, height: 28 }}>{user.name.slice(0, 1)}</Avatar>
                    <Box>
                      <Typography variant="body2">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.role.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" mt={1}>
              The project lead stays on the team automatically.
            </Typography>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberAssignmentDialog;
