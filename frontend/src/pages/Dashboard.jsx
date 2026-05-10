import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';

const STATUS_LABELS = {
  BOOKED: 'Aktiv',
  CANCELLED: 'Ləğv edilmiş',
  COMPLETED: 'Tamamlanmış',
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/appointments/me')
      .then((res) => setAppointments(res.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <i className="bi bi-calendar-week me-2 text-primary" />
          Şəxsi Kabinet — Növbələrim
        </h2>
        <Link to="/" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Yeni növbə
        </Link>
      </div>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}
      {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-calendar-x" />
              <p className="mt-3">Hələ heç bir növbəniz yoxdur</p>
              <Link to="/" className="btn btn-outline-primary">Növbə təyin et</Link>
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
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>{a.doctorName}</td>
                      <td>{a.departmentName}</td>
                      <td>
                        <span className={`badge text-bg-light status-badge-${a.status}`} style={{ color: 'white' }}>
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
    </div>
  );
}
