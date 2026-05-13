import { useEffect, useState } from 'react';
import api, { extractError } from '../api/client.js';
import Modal from './Modal.jsx';
import {
  validateFullName,
  validateEmail,
  validatePhone,
} from '../utils/validators.js';

const sanitizePhone = (raw) => {
  if (!raw) return '+994';
  let v = raw.startsWith('+994') ? raw : '+994';
  const tail = v.slice(4).replace(/\D/g, '').slice(0, 9);
  return '+994' + tail;
};

export default function ProfileEditModal({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '+994' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [server, setServer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '+994',
      });
      setErrors({});
      setTouched({});
      setServer(null);
    }
  }, [open, user]);

  const validate = (values = form) => {
    const e = {};
    const fn = validateFullName(values.fullName);
    if (fn) e.fullName = fn;
    const em = validateEmail(values.email);
    if (em) e.email = em;
    const ph = validatePhone(values.phone);
    if (ph) e.phone = ph;
    return e;
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  };

  const setField = (field, value) => {
    const newValue = field === 'phone' ? sanitizePhone(value) : value;
    const next = { ...form, [field]: newValue };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ fullName: true, email: true, phone: true });
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setServer(null);
    try {
      const res = await api.put('/users/me', form);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setServer(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const phoneKey = (e) => {
    const start = e.target.selectionStart;
    if ((e.key === 'Backspace' || e.key === 'Delete') && start <= 4) {
      e.preventDefault();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Profili redaktə et" icon="bi-person-gear">
      <form onSubmit={submit} noValidate>
        {server && <div className="alert alert-danger py-2">{server}</div>}

        <div className="mb-3">
          <label className="form-label fw-semibold">Tam ad</label>
          <input
            type="text"
            className={`form-control ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            onBlur={handleBlur('fullName')}
            maxLength={120}
          />
          <span className="field-error">{touched.fullName ? errors.fullName : ''}</span>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">E-poçt</label>
          <input
            type="email"
            className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={handleBlur('email')}
            maxLength={120}
          />
          <span className="field-error">{touched.email ? errors.email : ''}</span>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Telefon</label>
          <input
            type="tel"
            className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            onBlur={handleBlur('phone')}
            onKeyDown={phoneKey}
            onClick={(e) => {
              if (e.target.selectionStart < 4) e.target.setSelectionRange(4, 4);
            }}
            maxLength={13}
          />
          <span className="field-error">{touched.phone ? errors.phone : ''}</span>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
            {saving ? 'Yadda saxlanır...' : 'Yadda saxla'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            İmtina
          </button>
        </div>
      </form>
    </Modal>
  );
}
