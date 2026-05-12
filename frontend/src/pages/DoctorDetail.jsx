import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import DoctorAvatar from '../components/DoctorAvatar.jsx';
import StarRating, { StarRatingInput } from '../components/StarRating.jsx';

const QUICK = [
  { value: 'GOOD', label: 'Yaxşı', icon: 'bi-emoji-smile', cls: 'btn-outline-success' },
  { value: 'AVERAGE', label: 'Orta', icon: 'bi-emoji-neutral', cls: 'btn-outline-warning' },
  { value: 'BAD', label: 'Pis', icon: 'bi-emoji-frown', cls: 'btn-outline-danger' },
];

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();

  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [quick, setQuick] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get(`/public/doctors/${id}`)
      .then((res) => {
        setDetail(res.data);
        if (res.data.myReview) {
          setRating(res.data.myReview.rating || 0);
          setQuick(res.data.myReview.quickFeedback || null);
          setComment(res.data.myReview.comment || '');
        } else {
          setRating(0);
          setQuick(null);
          setComment('');
        }
      })
      .catch((e) => setError(e?.response?.status === 404 ? 'Həkim tapılmadı' : 'Yükləmə xətası'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Həkim məlumatları yüklənir...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }} />
        <p className="mt-3">{error || 'Məlumat tapılmadı'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Ana səhifə
        </button>
      </div>
    );
  }

  const { doctor, reviews, myReview } = detail;

  const submitReview = (e) => {
    e.preventDefault();
    setSubmitMsg(null);
    if (!user) {
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }
    if (!isPatient) {
      setSubmitMsg({ type: 'danger', text: 'Yalnız xəstələr rəy verə bilər' });
      return;
    }
    if (!rating || rating < 0.5) {
      setSubmitMsg({ type: 'warning', text: 'Zəhmət olmasa ən azı 0.5 ulduz seçin' });
      return;
    }
    setSubmitting(true);
    api
      .post('/reviews', {
        doctorId: Number(id),
        rating,
        quickFeedback: quick,
        comment: comment.trim() || null,
      })
      .then(() => {
        setSubmitMsg({ type: 'success', text: 'Rəyiniz qeydə alındı. Təşəkkürlər!' });
        load();
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Rəy göndərilə bilmədi';
        setSubmitMsg({ type: 'danger', text: msg });
      })
      .finally(() => setSubmitting(false));
  };

  const deleteMyReview = () => {
    if (!myReview) return;
    if (!confirm('Rəyinizi silmək istədiyinizə əminsiniz?')) return;
    api
      .delete(`/reviews/${myReview.id}`)
      .then(() => {
        setSubmitMsg({ type: 'info', text: 'Rəyiniz silindi' });
        load();
      })
      .catch(() => setSubmitMsg({ type: 'danger', text: 'Silinə bilmədi' }));
  };

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }
    if (!isPatient) {
      alert('Yalnız xəstələr növbə təyin edə bilər');
      return;
    }
    navigate(`/book/${id}`);
  };

  return (
    <div className="container py-4">
      <button className="btn btn-link mb-3 ps-0" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1" /> Geri
      </button>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card doctor-detail-card">
            <div className="card-body text-center">
              <DoctorAvatar
                src={doctor.avatarUrl}
                name={doctor.fullName}
                className="doctor-avatar-lg mx-auto mb-3"
              />
              <h3 className="mb-1">{doctor.fullName}</h3>
              <p className="text-primary fw-semibold mb-2">{doctor.specialization}</p>
              <span className="badge bg-light text-dark mb-3">
                <i className="bi bi-building me-1" />
                {doctor.departmentName}
              </span>
              <div className="d-flex justify-content-center mb-3">
                <StarRating
                  value={doctor.averageRating || 0}
                  count={doctor.reviewCount || 0}
                  size="lg"
                />
              </div>
              <button className="btn btn-primary btn-pill w-100" onClick={handleBook}>
                <i className="bi bi-calendar-plus me-1" /> Növbə təyin et
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === 'about' ? 'active' : ''}`}
                onClick={() => setTab('about')}
              >
                <i className="bi bi-person-vcard me-1" /> Haqqında
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === 'experience' ? 'active' : ''}`}
                onClick={() => setTab('experience')}
              >
                <i className="bi bi-briefcase me-1" /> Təcrübə
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === 'education' ? 'active' : ''}`}
                onClick={() => setTab('education')}
              >
                <i className="bi bi-mortarboard me-1" /> Təhsil
              </button>
            </li>
          </ul>

          <div className="card mb-4">
            <div className="card-body">
              {tab === 'about' && (
                <div className="prose">
                  {doctor.bio ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{doctor.bio}</p>
                  ) : (
                    <p className="text-muted mb-0">Bu həkim üçün təfsilatlı məlumat əlavə edilməyib.</p>
                  )}
                </div>
              )}
              {tab === 'experience' && (
                <div>
                  {doctor.experience ? (
                    <pre className="m-0 prose-pre" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {doctor.experience}
                    </pre>
                  ) : (
                    <p className="text-muted mb-0">Təcrübə məlumatı əlavə edilməyib.</p>
                  )}
                </div>
              )}
              {tab === 'education' && (
                <div>
                  {doctor.education ? (
                    <pre className="m-0 prose-pre" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {doctor.education}
                    </pre>
                  ) : (
                    <p className="text-muted mb-0">Təhsil məlumatı əlavə edilməyib.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-star me-2 text-warning" />
                Rəy yazın
              </h5>
            </div>
            <div className="card-body">
              {!user && (
                <div className="alert alert-info">
                  Rəy vermək üçün{' '}
                  <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login', { state: { from: `/doctors/${id}` } }); }}>
                    daxil olun
                  </a>
                  {' '}və ya{' '}
                  <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                    qeydiyyatdan keçin
                  </a>
                  .
                </div>
              )}
              {user && !isPatient && (
                <div className="alert alert-warning mb-0">
                  Yalnız xəstə hesabları rəy verə bilər.
                </div>
              )}

              {user && isPatient && (
                <form onSubmit={submitReview}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Reytinq</label>
                    <StarRatingInput value={rating} onChange={setRating} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-2">Həkim necə idi?</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {QUICK.map((q) => (
                        <button
                          key={q.value}
                          type="button"
                          className={`btn ${q.cls} ${quick === q.value ? 'active' : ''}`}
                          onClick={() => setQuick(quick === q.value ? null : q.value)}
                        >
                          <i className={`${q.icon} me-1`} />
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rəyiniz (istəyə bağlı)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      maxLength={2000}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Həkim haqqında düşüncələrinizi yazın..."
                    />
                    <div className="form-text text-end">{comment.length}/2000</div>
                  </div>

                  {submitMsg && (
                    <div className={`alert alert-${submitMsg.type} py-2`}>{submitMsg.text}</div>
                  )}

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Göndərilir...' : myReview ? 'Rəyi yenilə' : 'Rəyi göndər'}
                    </button>
                    {myReview && (
                      <button type="button" className="btn btn-outline-danger" onClick={deleteMyReview}>
                        Rəyi sil
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-quote me-2 text-primary" />
                Bütün rəylər ({reviews.length})
              </h5>
            </div>
            <div className="card-body">
              {reviews.length === 0 ? (
                <p className="text-muted mb-0">Hələ ki rəy yoxdur. İlk rəyi siz yazın!</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {reviews.map((r) => (
                    <li key={r.id} className="review-item">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <strong>{r.patientName}</strong>
                          <span className="ms-2">
                            <StarRating value={r.rating} count={0} showCount={false} />
                          </span>
                        </div>
                        <small className="text-muted">
                          {new Date(r.createdAt).toLocaleDateString('az-AZ')}
                        </small>
                      </div>
                      {r.quickFeedback && (
                        <span className={`badge me-2 quick-badge-${r.quickFeedback.toLowerCase()}`}>
                          {r.quickFeedback === 'GOOD' && 'Yaxşı'}
                          {r.quickFeedback === 'AVERAGE' && 'Orta'}
                          {r.quickFeedback === 'BAD' && 'Pis'}
                        </span>
                      )}
                      {r.comment && <p className="mb-0 mt-1">{r.comment}</p>}
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
