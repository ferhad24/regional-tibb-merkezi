import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';

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
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      navigate('/login?registered=1', { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">
                <i className="bi bi-person-plus me-2 text-primary" />
                Qeydiyyat
              </h3>
              {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Tam ad</label>
                    <input name="fullName" className="form-control" value={form.fullName} onChange={update} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">İstifadəçi adı</label>
                    <input name="username" className="form-control" value={form.username} onChange={update} minLength={3} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">E-poçt</label>
                    <input type="email" name="email" className="form-control" value={form.email} onChange={update} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Telefon</label>
                    <input name="phone" className="form-control" value={form.phone} onChange={update} placeholder="+994..." required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Şifrə</label>
                    <input type="password" name="password" className="form-control" value={form.password} onChange={update} minLength={6} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Şifrəni təkrarla</label>
                    <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={update} minLength={6} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-4" disabled={submitting}>
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
      </div>
    </div>
  );
}
