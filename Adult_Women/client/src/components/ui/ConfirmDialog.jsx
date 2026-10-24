import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  children,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="flex items-start gap-3 rounded-xl bg-rose-mist p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-deep-rose" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-ink">
        This action cannot be undone. Your privacy matters — take a moment to be sure.
      </p>
    </div>
    {children}
  </Modal>
);

export default ConfirmDialog;
