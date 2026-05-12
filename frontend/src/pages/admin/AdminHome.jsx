import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import StarRating from '../../components/StarRating.jsx';

const CARDS = [
  { key: 'doctors', label: 'Həkimlər', icon: 'bi-person-badge', to: '/admin/doctors', color: '#0d6efd' },
  { key: 'departments', label: 'Şöbələr', icon: 'bi-building', to: '/admin/departments', color: '#198754' },
  { key: 'appointments', label: 'Növbələr', icon: 'bi-calendar-week', to: '/admin/appointments', color: '#0dcaf0' },
  { key: 'patients', label: 'Xəstələr', icon: 'bi-people', to: '/admin/patients', color: '#6f42c1' },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit' });
}

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const chartData = (stats?.appointmentsLast7Days || []).map((p) => ({
    name: formatDate(p.date),
    Növbələr: Number(p.count) || 0,
  }));

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        <i className="bi bi-speedometer2 me-2 text-primary" />
        Admin Panel
      </h2>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div className="row g-3 mb-4">
        {CARDS.map((c) => (
          <div className="col-md-6 col-lg-3" key={c.key}>
            <Link to={c.to} className="text-decoration-none text-dark">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: c.color }}>
                  <i className={`bi ${c.icon}`} />
                </div>
                <div>
                  <div className="stat-card-value">
                    {loading ? '...' : (stats?.[c.key] ?? 0)}
                  </div>
                  <div className="stat-card-label">{c.label}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3 admin-row-equal align-items-stretch">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2 text-primary" />
                Son 7 günün növbələri
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ef" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Növbələr"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0d6efd' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2 text-warning" />
                Top reytinqli həkimlər
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : !stats?.topDoctors?.length ? (
                <p className="text-muted mb-0">Hələ rəy verilməyib.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {stats.topDoctors.map((d, i) => (
                    <li key={d.id} className="top-doctor-row">
                      <span className="top-doctor-rank">{i + 1}.</span>
                      <div className="top-doctor-info">
                        <Link to={`/doctors/${d.id}`} className="top-doctor-name">
                          {d.fullName}
                        </Link>
                        <div className="top-doctor-spec">{d.specialization}</div>
                      </div>
                      <div className="top-doctor-rating">
                        <StarRating value={d.averageRating || 0} count={d.reviewCount || 0} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
