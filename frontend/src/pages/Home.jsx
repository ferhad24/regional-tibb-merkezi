import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { STATIC_DEPARTMENTS, STATIC_DOCTORS } from '../data/staticDoctors.js';

export default function Home() {
  const [doctors, setDoctors] = useState(STATIC_DOCTORS);
  const [departments, setDepartments] = useState(STATIC_DEPARTMENTS);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { isPatient, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/public/departments'),
      api.get('/public/doctors'),
    ])
      .then(([deptRes, docRes]) => {
        if (Array.isArray(deptRes.data) && deptRes.data.length > 0) {
          setDepartments(deptRes.data);
        }
        if (Array.isArray(docRes.data) && docRes.data.length > 0) {
          setDoctors(docRes.data);
        }
      })
      .catch(() => {
        // Backend yoxdur ya da xeta verir - statik fallback istifade olunur
      });
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
          <p className="lead mb-0 opacity-75">
            MediRegSys-də mütəxəssis həkimlərimiz və müasir avadanlıqlarla sizin
            xidmətinizdəyik. İndi onlayn növbə təyin edin.
          </p>
        </div>
      </section>

      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">
            <i className="bi bi-people me-2 text-primary" />
            Həkimlərimiz
          </h2>
          <select
            className="form-select select-pretty"
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

        {Object.keys(grouped).length === 0 && (
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
                      <div className="d-flex align-items-center mb-3">
                        {doc.avatarUrl ? (
                          <img
                            src={doc.avatarUrl}
                            alt={doc.fullName}
                            className="doctor-avatar me-3"
                            loading="lazy"
                          />
                        ) : (
                          <span className="doctor-avatar-fallback me-3">
                            <i className="bi bi-person-fill" />
                          </span>
                        )}
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">{doc.fullName}</h5>
                          <p className="text-primary mb-0 small fw-semibold">
                            {doc.specialization}
                          </p>
                        </div>
                      </div>
                      {doc.bio && <p className="card-text small text-muted mb-0">{doc.bio}</p>}
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
