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

const PHONE_PREFIX = '+994';
const PHONE_MAX = PHONE_PREFIX.length + 9; // +994 + 9 reqem

const initial = {
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  email: '',
  phone: PHONE_PREFIX,
};

// Telefon dəyərini həmişə +994 ile başlayan, yalnız rəqəm olan formaya çevir
function sanitizePhone(raw) {
  let v = raw || '';
  // Bütün hərf və digər simvolları çıxar (+ və rəqəm qalsın)
  v = v.replace(/[^\d+]/g, '');
  // +994 prefiksini məcburi qoy
  if (v.startsWith(PHONE_PREFIX)) {
    v = PHONE_PREFIX + v.slice(PHONE_PREFIX.length).replace(/\D/g, '');
  } else {
    // İstifadəçi prefiksi silmək istəyibsə, geri qoy
    const digits = v.replace(/\D/g, '');
    const stripped = digits.startsWith('994') ? digits.slice(3) : digits;
    v = PHONE_PREFIX + stripped;
  }
  if (v.length > PHONE_MAX) v = v.slice(0, PHONE_MAX);
  return v;
}

export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (touched[name] || (touched.confirmPassword && name === 'password')) {
      setErrors(runValidation(next));
    }
  };

  // Telefon ucun ayri handler - yalniz reqem icaze ver, prefiks kilidli
  const handlePhoneChange = (e) => {
    const clean = sanitizePhone(e.target.value);
    const next = { ...form, phone: clean };
    setForm(next);
    if (touched.phone) {
      setErrors(runValidation(next));
    }
  };

  // Telefon focus oldugda kursoru rəqəm hissəsinə qoy ki istifadəçi +994-ü silməsin
  const handlePhoneFocus = (e) => {
    const len = e.target.value.length;
    // Kursoru sonuna apar
    setTimeout(() => e.target.setSelectionRange(len, len), 0);
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

  const showErr = (field) => touched[field] && errors[field];
  const cls = (field) => `form-control ${showErr(field) ? 'is-invalid' : ''}`;

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
                <span className="field-error">{showErr('fullName') ? errors.fullName : ''}</span>
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
                <span className="field-error">{showErr('username') ? errors.username : ''}</span>
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
                <span className="field-error">{showErr('email') ? errors.email : ''}</span>
              </div>
              <div className="col-md-6">
                <label className="form-label">Telefon</label>
                <input
                  name="phone"
                  className={cls('phone')}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onFocus={handlePhoneFocus}
                  onBlur={handleBlur}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={PHONE_MAX}
                />
                <span className="field-error">{showErr('phone') ? errors.phone : ''}</span>
              </div>
              <div className="col-md-6">
                <label className="form-label">Şifrə</label>
                <div className="password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={cls('password')}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
                <span className="field-error">{showErr('password') ? errors.password : ''}</span>
              </div>
              <div className="col-md-6">
                <label className="form-label">Şifrəni təkrarla</label>
                <div className="password-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={cls('confirmPassword')}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
                <span className="field-error">
                  {showErr('confirmPassword') ? errors.confirmPassword : ''}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
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
