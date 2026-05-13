import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractError } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import PasswordChangeModal from '../components/PasswordChangeModal.jsx';

const STATUS_LABELS = {
  BOOKED: 'Aktiv',
  CANCELLED: 'Ləğv edilmiş',
  COMPLETED: 'Tamamlanmış',
};

function initials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = () => {
    setLoading(true);
    api
      .get('/appointments/me')
      .then((res) => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Bu növbəni ləğv etmək istədiyinizə əminsiniz?')) return;
    try {
      await api.post(`/appointments/${id}/cancel`);
      setInfo('Növbə uğurla ləğv edildi');
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const active = appointments.filter((a) => a.status === 'BOOKED').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    return { total, active, completed, cancelled };
  }, [appointments]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const onProfileSaved = async (updated) => {
    setInfo('Profil yeniləndi');
    if (refreshUser) await refreshUser();
    else window.location.reload();
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        <i className="bi bi-person-circle me-2 text-primary" />
        Şəxsi Kabinet
      </h2>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}
      {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

      {/* 1. Fərdi məlumatlar bloku */}
      <div className="card profile-card mb-4">
        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            <div className="col-md-auto text-center text-md-start">
              <div className="profile-avatar">{initials(user?.fullName)}</div>
            </div>
            <div className="col-md">
              <h4 className="mb-1">{user?.fullName || '—'}</h4>
              <p className="text-muted mb-2">
                <i className="bi bi-person-badge me-1" />
                <code className="text-muted">{user?.username}</code>
              </p>
              <div className="row g-2">
                <div className="col-sm-6">
                  <div className="profile-info-row">
                    <i className="bi bi-envelope" />
                    <span className="label">E-poçt:</span>
                    <span className="value">{user?.email || '—'}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="profile-info-row">
                    <i className="bi bi-telephone" />
                    <span className="label">Telefon:</span>
                    <span className="value">{user?.phone || '—'}</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="profile-info-row">
                    <i className="bi bi-shield-check" />
                    <span className="label">Status:</span>
                    <span className="value">
                      <span className="badge bg-success-subtle text-success">
                        <i className="bi bi-check-circle me-1" /> Aktiv
                      </span>
                    </span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="profile-info-row">
                    <i className="bi bi-person-check" />
                    <span className="label">Rol:</span>
                    <span className="value">
                      <span className="badge bg-primary-subtle text-primary">Xəstə</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-auto">
              <div className="d-flex flex-md-column gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => setEditOpen(true)}>
                  <i className="bi bi-pencil me-1" /> Profili redaktə et
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setPwdOpen(true)}>
                  <i className="bi bi-key me-1" /> Şifrəni dəyişdir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Növbə statistika */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <button
            type="button"
            className={`stat-card w-100 text-start ${filter === 'ALL' ? 'stat-card-active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            <div className="stat-card-icon" style={{ background: '#0d6efd' }}>
              <i className="bi bi-list-ul" />
            </div>
            <div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-label">Ümumi</div>
            </div>
          </button>
        </div>
        <div className="col-sm-6 col-lg-3">
          <button
            type="button"
            className={`stat-card w-100 text-start ${filter === 'BOOKED' ? 'stat-card-active' : ''}`}
            onClick={() => setFilter('BOOKED')}
          >
            <div className="stat-card-icon" style={{ background: '#198754' }}>
              <i className="bi bi-clock" />
            </div>
            <div>
              <div className="stat-card-value">{stats.active}</div>
              <div className="stat-card-label">Aktiv (gözləyir)</div>
            </div>
          </button>
        </div>
        <div className="col-sm-6 col-lg-3">
          <button
            type="button"
            className={`stat-card w-100 text-start ${filter === 'COMPLETED' ? 'stat-card-active' : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            <div className="stat-card-icon" style={{ background: '#0dcaf0' }}>
              <i className="bi bi-check2-circle" />
            </div>
            <div>
              <div className="stat-card-value">{stats.completed}</div>
              <div className="stat-card-label">Tamamlanmış</div>
            </div>
          </button>
        </div>
        <div className="col-sm-6 col-lg-3">
          <button
            type="button"
            className={`stat-card w-100 text-start ${filter === 'CANCELLED' ? 'stat-card-active' : ''}`}
            onClick={() => setFilter('CANCELLED')}
          >
            <div className="stat-card-icon" style={{ background: '#dc3545' }}>
              <i className="bi bi-x-circle" />
            </div>
            <div>
              <div className="stat-card-value">{stats.cancelled}</div>
              <div className="stat-card-label">Ləğv edilmiş</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Növbə tarixçəsi */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0">
            <i className="bi bi-calendar-week me-2 text-primary" />
            Növbə tarixçəsi
            {filter !== 'ALL' && (
              <span className="badge bg-light text-dark ms-2">
                {STATUS_LABELS[filter]}
                <button
                  type="button"
                  className="btn-close btn-close-sm ms-2"
                  style={{ fontSize: '0.65rem' }}
                  onClick={() => setFilter('ALL')}
                  aria-label="Filtri sıfırla"
                />
              </span>
            )}
          </h5>
          <Link to="/" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-lg me-1" />
            Yeni növbə
          </Link>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-calendar-x" />
              <p className="mt-3">
                {filter === 'ALL'
                  ? 'Hələ heç bir növbəniz yoxdur'
                  : `${STATUS_LABELS[filter]} statusunda növbə yoxdur`}
              </p>
              {filter === 'ALL' && (
                <Link to="/" className="btn btn-outline-primary">Növbə təyin et</Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tarix</th>
                    <th>Vaxt</th>
                    <th>Həkim</th>
                    <th>Şöbə</th>
                    <th>Status</th>
                    <th className="text-end">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>{a.doctorName}</td>
                      <td>{a.departmentName}</td>
                      <td>
                        <span className={`badge status-badge-${a.status}`}>
                          {STATUS_LABELS[a.status] || a.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {a.status === 'BOOKED' && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => cancel(a.id)}
                          >
                            <i className="bi bi-x-circle me-1" />
                            Ləğv et
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSaved={onProfileSaved}
      />
      <PasswordChangeModal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSuccess={() => setInfo('Şifrə uğurla yeniləndi')}
      />
    </div>
  );
}
