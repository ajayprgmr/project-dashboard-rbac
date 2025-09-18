import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onClose,
  onConfirm,
  loading = false,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    {title ? <DialogTitle>{title}</DialogTitle> : null}
    {description ? (
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
    ) : null}
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
