import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { dismissNotification } from '../../../features/ui/uiSlice';

const autoHideDuration = 4000;

const NotificationCenter = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!notifications.length) {
      setOpen(false);
      setCurrent(null);
      return;
    }
    const [latest] = notifications;
    setCurrent(latest);
    setOpen(true);
  }, [notifications]);

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    if (current) {
      dispatch(dismissNotification(current.id));
    }
  };

  if (!current) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity={current.variant || 'info'} variant="filled" onClose={handleClose} sx={{ minWidth: 300 }}>
        <strong>{current.title}</strong>
        <br />
        {current.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationCenter;
