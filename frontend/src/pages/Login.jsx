import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const expired = params.get('expired') === '1';
  const registered = params.get('registered') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(username, password);
      const fallback = user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard';
      const target = location.state?.from || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">
                <i className="bi bi-box-arrow-in-right me-2 text-primary" />
                Daxil Ol
              </h3>

              {expired && (
                <Alert type="warning">Sessiyanız bitib, yenidən daxil olun.</Alert>
              )}
              {registered && (
                <Alert type="success">Qeydiyyat tamamlandı. İndi daxil ola bilərsiniz.</Alert>
              )}
              {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">İstifadəçi adı</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Şifrə</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
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
      </div>
    </div>
  );
}
