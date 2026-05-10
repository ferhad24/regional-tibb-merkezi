import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(extractError(err)));
  }, []);

  const cards = [
    { key: 'doctors', label: 'Həkimlər', icon: 'bi-person-badge', to: '/admin/doctors', color: 'primary' },
    { key: 'departments', label: 'Şöbələr', icon: 'bi-building', to: '/admin/departments', color: 'success' },
    { key: 'appointments', label: 'Növbələr', icon: 'bi-calendar-week', to: '/admin/appointments', color: 'info' },
  ];

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        <i className="bi bi-speedometer2 me-2 text-primary" />
        Admin Panel
      </h2>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-md-4" key={c.key}>
            <Link to={c.to} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center">
                  <div className={`text-${c.color} me-3`} style={{ fontSize: '2.5rem' }}>
                    <i className={`bi ${c.icon}`} />
                  </div>
                  <div>
                    <div className="text-muted small">{c.label}</div>
                    <div className="fs-3 fw-bold">{stats?.[c.key] ?? '...'}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
