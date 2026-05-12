import { useEffect, useMemo, useState } from 'react';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/admin/patients')
      .then((res) => setPatients(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        (p.fullName || '').toLowerCase().includes(q) ||
        (p.username || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <i className="bi bi-people me-2 text-primary" />
          Xəstələr
          <span className="badge bg-light text-dark ms-2">{patients.length}</span>
        </h2>
        <div style={{ maxWidth: 320 }}>
          <input
            className="form-control"
            type="search"
            placeholder="Ad, email, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tam ad</th>
                  <th>İstifadəçi adı</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th className="text-center">Növbə sayı</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4">
                    {search ? 'Axtarışa uyğun nəticə yoxdur' : 'Xəstə yoxdur'}
                  </td></tr>
                )}
                {filtered.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="text-muted">{idx + 1}</td>
                    <td className="fw-semibold">{p.fullName}</td>
                    <td>
                      <code className="text-muted">{p.username}</code>
                    </td>
                    <td>{p.email || <span className="text-muted">—</span>}</td>
                    <td>{p.phone || <span className="text-muted">—</span>}</td>
                    <td className="text-center">
                      <span className="badge bg-primary-subtle text-primary">
                        {p.appointmentCount}
                      </span>
                    </td>
                    <td className="text-center">
                      {p.enabled ? (
                        <span className="badge bg-success-subtle text-success">
                          <i className="bi bi-check-circle me-1" /> Aktiv
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">
                          <i className="bi bi-pause-circle me-1" /> Deaktiv
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
