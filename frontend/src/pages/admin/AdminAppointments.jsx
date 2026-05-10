import { useEffect, useState } from 'react';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';

const STATUS_LABELS = {
  BOOKED: 'Aktiv',
  CANCELLED: 'Ləğv edilmiş',
  COMPLETED: 'Tamamlanmış',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/appointments')
      .then((res) => setAppointments(res.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Bu növbəni ləğv etmək istədiyinizə əminsiniz?')) return;
    try {
      await api.post(`/admin/appointments/${id}/cancel`);
      setInfo('Növbə ləğv edildi');
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <i className="bi bi-calendar-week me-2 text-primary" />
          Bütün Növbələr
        </h2>
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">Hamısı</option>
          <option value="BOOKED">Aktiv</option>
          <option value="CANCELLED">Ləğv edilmiş</option>
          <option value="COMPLETED">Tamamlanmış</option>
        </select>
      </div>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}
      {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox" />
              <p className="mt-3">Heç bir növbə tapılmadı</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tarix</th>
                    <th>Vaxt</th>
                    <th>Xəstə</th>
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
                      <td>{a.patientName}</td>
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
