import { useEffect } from 'react';

export default function Modal({ open, onClose, title, icon, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="app-modal-backdrop" onMouseDown={onClose}>
      <div
        className={`app-modal app-modal-${size}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="app-modal-header">
          <h5 className="app-modal-title">
            {icon && <i className={`bi ${icon} me-2 text-primary`} />}
            {title}
          </h5>
          <button type="button" className="app-modal-close" onClick={onClose} aria-label="Bağla">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
}
