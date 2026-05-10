import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { extractError } from '../api/client.js';
import Alert from '../components/Alert.jsx';

const todayIso = () => new Date().toISOString().split('T')[0];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    api
      .get(`/public/doctors/${doctorId}`)
      .then((res) => setDoctor(res.data))
      .catch((err) => setError(extractError(err)));
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setTime('');
    api
      .get('/appointments/available-slots', { params: { doctorId, date } })
      .then((res) => setSlots(res.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoadingSlots(false));
  }, [doctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time) {
      setError('Vaxt seçilməlidir');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/appointments', {
        doctorId: Number(doctorId),
        date,
        time,
        notes,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="mb-1">
                <i className="bi bi-calendar-plus me-2 text-primary" />
                Növbə təyini
              </h3>
              {doctor && (
                <p className="text-muted mb-4">
                  <i className="bi bi-person-badge me-1" />
                  <strong>{doctor.fullName}</strong> — {doctor.specialization}
                  <span className="ms-2 badge text-bg-light">{doctor.departmentName}</span>
                </p>
              )}

              {error && <Alert type="danger" onClose={() => setError(null)}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tarix</label>
                  <input
                    type="date"
                    className="form-control"
                    min={todayIso()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Vaxt</label>
                  {loadingSlots ? (
                    <div className="text-muted small">
                      <div className="spinner-border spinner-border-sm me-2" />
                      Mövcud saatlar yüklənir...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-muted small">
                      Bu tarixə boş slot yoxdur. Başqa tarix seçin.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((s) => (
                        <button
                          type="button"
                          key={s}
                          className={`btn btn-sm ${time === s ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setTime(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Qeyd (opsional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting || !time}>
                    {submitting ? 'Göndərilir...' : 'Növbəni təsdiqlə'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Geri
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
