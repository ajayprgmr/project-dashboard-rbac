import {
  Box,
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
  Chip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

const TaskTable = ({ tasks, onEdit, onDelete, isReadOnly }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Project</TableCell>
          <TableCell>Assignee</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Due date</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} hover>
            <TableCell>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {task.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>{task.projectName}</TableCell>
            <TableCell>{task.assigneeName}</TableCell>
            <TableCell>
              <Chip label={statusLabels[task.status] || task.status} size="small" />
            </TableCell>
            <TableCell>
              <Chip
                label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                color={priorityColors[task.priority]}
                size="small"
              />
            </TableCell>
            <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</TableCell>
            <TableCell align="right">
              {!isReadOnly && (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {task.canEdit && (
                    <Tooltip title="Edit task">
                      <IconButton size="small" onClick={() => onEdit(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {task.canDelete && (
                    <Tooltip title="Delete task">
                      <IconButton size="small" color="error" onClick={() => onDelete(task)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default TaskTable;
