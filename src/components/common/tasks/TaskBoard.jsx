import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columnConfig = {
  todo: { title: 'To Do', color: 'default' },
  in_progress: { title: 'In Progress', color: 'info' },
  review: { title: 'Review', color: 'warning' },
  done: { title: 'Done', color: 'success' },
};

const formatPriority = (priority) => priority.charAt(0).toUpperCase() + priority.slice(1);

const TaskBoard = ({
  tasksByStatus,
  onDragEnd,
  onEdit,
  onDelete,
  canDrag,
  isReadOnly,
}) => (
  <DragDropContext
    onDragEnd={(result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;
      onDragEnd({
        taskId: draggableId,
        from: source.droppableId,
        to: destination.droppableId,
      });
    }}
  >
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
      {Object.entries(columnConfig).map(([status, config]) => {
        const tasks = tasksByStatus[status] || [];
        return (
          <Box key={status} sx={{ flex: 1, minWidth: { xs: 'auto', lg: 250 } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {config.title} ({tasks.length})
            </Typography>
            <Droppable droppableId={status} isDropDisabled={isReadOnly}>
              {(provided, snapshot) => (
                <Stack
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  spacing={1.5}
                  sx={{
                    minHeight: 200,
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'background.paper',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                      isDragDisabled={!canDrag(task)}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <Card
                          variant="outlined"
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          sx={{
                            opacity: dragSnapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <CardContent>
                            <Stack spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {task.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={task.projectName} size="small" variant="outlined" />
                                <Chip label={`Due ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}`} size="small" />
                                <Chip
                                  label={formatPriority(task.priority)}
                                  size="small"
                                  color={
                                    task.priority === 'high'
                                      ? 'error'
                                      : task.priority === 'medium'
                                      ? 'warning'
                                      : 'default'
                                  }
                                />
                              </Stack>
                              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {task.assigneeName}
                                </Typography>
                                {!isReadOnly && (
                                  <Stack direction="row" spacing={1}>
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
                                  </Stack>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          </Box>
        );
      })}
    </Stack>
  </DragDropContext>
);

export default TaskBoard;
