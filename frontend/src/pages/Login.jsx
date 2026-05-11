import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import { validateUsername, validateLoginPassword } from '../utils/validators.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const expired = params.get('expired') === '1';
  const registered = params.get('registered') === '1';

  const runValidation = (values = { username, password }) => {
    const e = {};
    const u = validateUsername(values.username);
    if (u) e.username = u;
    const p = validateLoginPassword(values.password);
    if (p) e.password = p;
    return e;
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(runValidation());
  };

  const handleChange = (field, setter) => (e) => {
    const val = e.target.value;
    setter(val);
    if (touched[field]) {
      setErrors(runValidation({ username, password, [field]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = runValidation();
    setErrors(fieldErrors);
    setTouched({ username: true, password: true });
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const user = await login(username, password);
      const fallback = user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard';
      const target = location.state?.from || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const showErr = (field) => touched[field] && errors[field];

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">
            <i className="bi bi-box-arrow-in-right me-2 text-primary" />
            Daxil Ol
          </h3>

          {expired && <Alert type="warning">Sessiyanız bitib, yenidən daxil olun.</Alert>}
          {registered && (
            <Alert type="success">Qeydiyyat tamamlandı. İndi daxil ola bilərsiniz.</Alert>
          )}
          {serverError && (
            <Alert type="danger" onClose={() => setServerError(null)}>{serverError}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-2">
              <label className="form-label">İstifadəçi adı</label>
              <input
                type="text"
                className={`form-control ${showErr('username') ? 'is-invalid' : ''}`}
                value={username}
                onChange={handleChange('username', setUsername)}
                onBlur={handleBlur('username')}
                autoFocus
                autoComplete="username"
              />
              <span className="field-error">{showErr('username') ? errors.username : ''}</span>
            </div>
            <div className="mb-3">
              <label className="form-label">Şifrə</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${showErr('password') ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={handleChange('password', setPassword)}
                  onBlur={handleBlur('password')}
                  autoComplete="current-password"
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
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? 'Gözləyin...' : 'Daxil ol'}
            </button>
          </form>

          <hr className="my-4" />
          <p className="text-center mb-0 small">
            Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
