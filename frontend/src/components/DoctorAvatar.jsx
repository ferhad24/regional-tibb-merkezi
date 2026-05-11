import { useState } from 'react';

export default function DoctorAvatar({ src, name, className = '' }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <span className={`doctor-avatar-fallback ${className}`}>
        <i className="bi bi-person-fill" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name || ''}
      className={`doctor-avatar ${className}`}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
