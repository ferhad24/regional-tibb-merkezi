import { useEffect, useState } from 'react';
import api, { extractError } from '../api/client.js';
import Modal from './Modal.jsx';
import { validatePassword, validateConfirmPassword } from '../utils/validators.js';

export default function PasswordChangeModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ cur: false, new: false, conf: false });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShow({ cur: false, new: false, conf: false });
      setErrors({});
      setTouched({});
      setServer(null);
    }
  }, [open]);

  const validate = (values = form) => {
    const e = {};
    if (!values.currentPassword) e.currentPassword = 'Cari şifrə tələb olunur';
    const np = validatePassword(values.newPassword);
    if (np) e.newPassword = np;
    const cp = validateConfirmPassword(values.confirmPassword, values.newPassword);
    if (cp) e.confirmPassword = cp;
    return e;
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setServer(null);
    try {
      await api.put('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServer(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ name, label, showKey }) => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <div className="password-wrap">
        <input
          type={show[showKey] ? 'text' : 'password'}
          className={`form-control ${touched[name] && errors[name] ? 'is-invalid' : ''}`}
          value={form[name]}
          onChange={(e) => setField(name, e.target.value)}
          onBlur={handleBlur(name)}
          autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          tabIndex={-1}
        >
          <i className={`bi ${show[showKey] ? 'bi-eye-slash' : 'bi-eye'}`} />
        </button>
      </div>
      <span className="field-error">{touched[name] ? errors[name] : ''}</span>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Şifrəni dəyişdir" icon="bi-key">
      <form onSubmit={submit} noValidate>
        {server && <div className="alert alert-danger py-2">{server}</div>}

        <Field name="currentPassword" label="Cari şifrə" showKey="cur" />
        <Field name="newPassword" label="Yeni şifrə" showKey="new" />
        <Field name="confirmPassword" label="Yeni şifrəni təkrar daxil edin" showKey="conf" />

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
            {saving ? 'Yenilənir...' : 'Şifrəni yenilə'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            İmtina
          </button>
        </div>
      </form>
    </Modal>
  );
}
