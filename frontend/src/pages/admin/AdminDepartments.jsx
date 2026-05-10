import { useEffect, useState } from 'react';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const load = () =>
    api
      .get('/admin/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => setError(extractError(err)));

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/admin/departments', { name, description });
      setName('');
      setDescription('');
      setInfo('Şöbə əlavə edildi');
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Bu şöbəni silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setInfo('Şöbə silindi');
      load();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        <i className="bi bi-building me-2 text-primary" />
        Şöbələrin İdarəsi
      </h2>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}
      {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Yeni şöbə əlavə et</h5>
          <form onSubmit={add}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Ad</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Təsvir (opsional)</label>
                <input
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-plus-lg me-1" />
                  Əlavə et
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ad</th>
                  <th>Təsvir</th>
                  <th className="text-end">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-muted py-4">Şöbə yoxdur</td></tr>
                )}
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td className="text-muted">{d.description || '—'}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(d.id)}>
                        <i className="bi bi-trash me-1" />
                        Sil
                      </button>
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
