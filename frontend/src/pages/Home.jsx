import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import DoctorAvatar from '../components/DoctorAvatar.jsx';
import PrettyDropdown from '../components/PrettyDropdown.jsx';
import StarRating from '../components/StarRating.jsx';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/public/departments'),
      api.get('/public/doctors'),
    ])
      .then(([deptRes, docRes]) => {
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors =
    filter === 'all' ? doctors : doctors.filter((d) => d.departmentId === Number(filter));

  const grouped = filteredDoctors.reduce((acc, d) => {
    (acc[d.departmentName] ||= []).push(d);
    return acc;
  }, {});

  const openDoctor = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
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
          <div style={{ width: 280 }}>
            <PrettyDropdown
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'Bütün şöbələr' },
                ...departments.map((d) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yüklənir...</span>
            </div>
            <p className="mt-3">Həkimlər yüklənir...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle text-warning" />
            <p className="mt-3">Server hazırda əlçatan deyil. Bir azdan yenidən cəhd edin.</p>
          </div>
        )}

        {!loading && !error && Object.keys(grouped).length === 0 && (
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
                  <div
                    className="card doctor-card doctor-card-clickable h-100"
                    onClick={() => openDoctor(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDoctor(doc.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <DoctorAvatar src={doc.avatarUrl} name={doc.fullName} className="me-3" />
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">{doc.fullName}</h5>
                          <p className="text-primary mb-0 small fw-semibold">
                            {doc.specialization}
                          </p>
                        </div>
                      </div>
                      {doc.bio && <p className="card-text small text-muted mb-2">{doc.bio}</p>}
                    </div>
                    <div className="card-footer bg-white border-0 pb-3 pt-0">
                      <StarRating value={doc.averageRating || 0} count={doc.reviewCount || 0} />
                      <div className="text-end mt-2">
                        <span className="small text-muted">
                          <i className="bi bi-chevron-right" /> Ətraflı
                        </span>
                      </div>
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
