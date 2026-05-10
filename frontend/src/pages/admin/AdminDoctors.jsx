import { useEffect, useState } from 'react';
import api, { extractError } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';

const empty = { id: null, fullName: '', specialization: '', bio: '', departmentId: '' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const loadAll = () => {
    Promise.all([
      api.get('/admin/doctors'),
      api.get('/admin/departments'),
    ])
      .then(([d, dep]) => {
        setDoctors(d.data);
        setDepartments(dep.data);
      })
      .catch((err) => setError(extractError(err)));
  };

  useEffect(() => loadAll(), []);

  const startNew = () => {
    setEditing('new');
    setForm({ ...empty, departmentId: departments[0]?.id || '' });
  };

  const startEdit = (d) => {
    setEditing(d.id);
    setForm({
      id: d.id,
      fullName: d.fullName,
      specialization: d.specialization,
      bio: d.bio || '',
      departmentId: d.departmentId,
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm(empty);
    setError(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, departmentId: Number(form.departmentId) };
      if (form.id) {
        await api.put(`/admin/doctors/${form.id}`, payload);
        setInfo('Həkim yeniləndi');
      } else {
        await api.post('/admin/doctors', payload);
        setInfo('Yeni həkim əlavə edildi');
      }
      cancel();
      loadAll();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Bu həkimi silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setInfo('Həkim silindi');
      loadAll();
    } catch (err) {
      setError(extractError(err));
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">
          <i className="bi bi-person-badge me-2 text-primary" />
          Həkimlərin İdarəsi
        </h2>
        {!editing && (
          <button className="btn btn-primary" onClick={startNew}>
            <i className="bi bi-plus-lg me-1" />
            Yeni həkim
          </button>
        )}
      </div>

      {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}
      {info && <Alert type="success" onClose={() => setInfo(null)}>{info}</Alert>}

      {editing && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">
              {editing === 'new' ? 'Yeni həkim' : 'Həkimi redaktə et'}
            </h5>
            <form onSubmit={save}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tam ad</label>
                  <input
                    className="form-control"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">İxtisas</label>
                  <input
                    className="form-control"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Şöbə</label>
                  <select
                    className="form-select"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Seçin...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Qısa məlumat (bio)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">Yadda saxla</button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancel}>İmtina</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ad</th>
                  <th>İxtisas</th>
                  <th>Şöbə</th>
                  <th className="text-end">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-4">Həkim yoxdur</td></tr>
                )}
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>{d.fullName}</td>
                    <td>{d.specialization}</td>
                    <td>{d.departmentName}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => startEdit(d)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(d.id)}>
                        <i className="bi bi-trash" />
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
