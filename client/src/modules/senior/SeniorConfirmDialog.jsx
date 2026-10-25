import { AlertTriangle } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const SeniorConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Yes, delete',
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="senior-button border-2 border-blush-pink bg-white text-deep-rose hover:bg-soft-petal disabled:opacity-60"
        >
          Keep this entry
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="senior-button bg-deep-rose text-white hover:bg-[#A3134C] disabled:opacity-60"
        >
          {loading ? 'Deleting…' : confirmLabel}
        </button>
      </>
    }
  >
    <div className="flex items-start gap-3 rounded-2xl bg-rose-mist p-4">
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-deep-rose" aria-hidden="true" />
      <p className="text-base leading-relaxed text-ink">
        This cannot be undone. Take a moment to be sure. Your privacy matters.
      </p>
    </div>
  </Modal>
);

export default SeniorConfirmDialog;
