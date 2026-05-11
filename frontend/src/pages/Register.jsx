import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validators.js';

const initial = {
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  email: '',
  phone: '',
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const runValidation = (values) => {
    const v = values || form;
    const e = {};
    const fn = validateFullName(v.fullName);
    if (fn) e.fullName = fn;
    const un = validateUsername(v.username);
    if (un) e.username = un;
    const em = validateEmail(v.email);
    if (em) e.email = em;
    const ph = validatePhone(v.phone);
    if (ph) e.phone = ph;
    const pw = validatePassword(v.password);
    if (pw) e.password = pw;
    const cpw = validateConfirmPassword(v.confirmPassword, v.password);
    if (cpw) e.confirmPassword = cpw;
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) {
      setErrors(runValidation(next));
    }
    if (touched.confirmPassword && name === 'password') {
      // Confirm field-i yeni passworda gore yenile
      setErrors(runValidation(next));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(runValidation());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = runValidation();
    setErrors(fieldErrors);
    setTouched({
      fullName: true, username: true, email: true,
      phone: true, password: true, confirmPassword: true,
    });
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await register(form);
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const showError = (field) => touched[field] && errors[field];
  const cls = (field) => `form-control ${showError(field) ? 'is-invalid' : ''}`;

  return (
    <div className="auth-page">
      <div className="card auth-card auth-card-wide">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">
            <i className="bi bi-person-plus me-2 text-primary" />
            Qeydiyyat
          </h3>
          {serverError && (
            <Alert type="danger" onClose={() => setServerError(null)}>{serverError}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tam ad</label>
                <input
                  name="fullName"
                  className={cls('fullName')}
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                />
                {showError('fullName') && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="col-md-6">
                <label className="form-label">İstifadəçi adı</label>
                <input
                  name="username"
                  className={cls('username')}
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="username"
                />
                {showError('username') && <span className="field-error">{errors.username}</span>}
              </div>
              <div className="col-md-6">
                <label className="form-label">E-poçt</label>
                <input
                  type="email"
                  name="email"
                  className={cls('email')}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {showError('email') && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Telefon</label>
                <input
                  name="phone"
                  className={cls('phone')}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+994501234567"
                  autoComplete="tel"
                />
                {showError('phone') && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Şifrə</label>
                <input
                  type="password"
                  name="password"
                  className={cls('password')}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                {showError('password') && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Şifrəni təkrarla</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={cls('confirmPassword')}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                {showError('confirmPassword') && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mt-4"
              disabled={submitting}
            >
              {submitting ? 'Gözləyin...' : 'Qeydiyyatdan keç'}
            </button>
          </form>

          <hr className="my-4" />
          <p className="text-center mb-0 small">
            Artıq hesabınız var? <Link to="/login">Daxil olun</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
