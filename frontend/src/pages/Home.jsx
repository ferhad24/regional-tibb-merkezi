import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { extractError } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isPatient, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/public/departments'),
      api.get('/public/doctors'),
    ])
      .then(([deptRes, docRes]) => {
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
        if (!Array.isArray(docRes.data)) {
          setError('Backend-dən gözlənilməyən cavab gəldi. VITE_API_BASE_URL düzgün təyin olunubmu?');
        }
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors =
    filter === 'all' ? doctors : doctors.filter((d) => d.departmentId === Number(filter));

  const grouped = filteredDoctors.reduce((acc, d) => {
    (acc[d.departmentName] ||= []).push(d);
    return acc;
  }, {});

  const handleBook = (doctorId) => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${doctorId}` } });
      return;
    }
    if (!isPatient) {
      alert('Yalnız xəstələr növbə təyin edə bilər');
      return;
    }
    navigate(`/book/${doctorId}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">
            <i className="bi bi-heart-pulse me-2" />
            Sağlamlığınız bizim prioritetimizdir
          </h1>
          <p className="lead mb-3 opacity-75">
            Regional Tibb Mərkəzində mütəxəssis həkimlərimiz və müasir avadanlıqlarla sizin
            xidmətinizdəyik. İndi onlayn növbə təyin edin.
          </p>
          {!user && (
            <div>
              <Link to="/register" className="btn btn-light btn-lg me-2">
                <i className="bi bi-person-plus me-1" />
                Qeydiyyatdan keç
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Daxil ol
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="container pb-5">
        {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">
            <i className="bi bi-people me-2 text-primary" />
            Həkimlərimiz
          </h2>
          <select
            className="form-select"
            style={{ maxWidth: 280 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Bütün şöbələr</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        )}

        {!loading && Object.keys(grouped).length === 0 && (
          <div className="empty-state">
            <i className="bi bi-emoji-frown" />
            <p className="mt-3">Hələlik həkim əlavə edilməyib</p>
          </div>
        )}

        {Object.entries(grouped).map(([deptName, docs]) => (
          <section key={deptName} className="mb-5">
            <div className="d-flex align-items-center mb-3">
              <span className="dept-icon me-3">
                <i className="bi bi-building" />
              </span>
              <h3 className="mb-0">{deptName}</h3>
            </div>
            <div className="row g-3">
              {docs.map((doc) => (
                <div className="col-md-6 col-lg-4" key={doc.id}>
                  <div className="card doctor-card h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-person-badge me-1 text-primary" />
                        {doc.fullName}
                      </h5>
                      <p className="text-muted mb-2 small">
                        <i className="bi bi-mortarboard me-1" />
                        {doc.specialization}
                      </p>
                      {doc.bio && <p className="card-text small">{doc.bio}</p>}
                    </div>
                    <div className="card-footer bg-white border-0 pb-3">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleBook(doc.id)}
                      >
                        <i className="bi bi-calendar-plus me-1" />
                        Növbəyə yaz
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
