import { useState } from 'react';

// Reytinq dəyərinə görə rəng qaytarır
// 1 -> tünd qırmızı, 2 -> qırmızı, 3 -> narıncı, 4+ -> sarı-narıncı
export function ratingColor(value) {
  if (!value || value <= 0) return '#ced4da';
  if (value < 1.5) return '#7a1010';
  if (value < 2.5) return '#dc3545';
  if (value < 3.5) return '#fd7e14';
  if (value < 4.5) return '#ffb020';
  return '#ffc107';
}

// Statik display ulduzları (yarım ulduz dəstəkli)
export default function StarRating({ value = 0, count = 0, size = 'md', showCount = true }) {
  const stars = [];
  const v = Math.max(0, Math.min(5, value || 0));
  const color = ratingColor(v);

  for (let i = 1; i <= 5; i++) {
    let fill;
    if (v >= i) fill = 'full';
    else if (v >= i - 0.5) fill = 'half';
    else fill = 'empty';
    stars.push(<Star key={i} fill={fill} color={color} size={size} />);
  }

  const cls = size === 'lg' ? 'star-rating star-rating-lg' : 'star-rating';

  return (
    <span className={cls}>
      <span className="d-inline-flex align-items-center">{stars}</span>
      {showCount && (
        <span className="star-count ms-2">
          {v > 0 ? v.toFixed(1) : '—'} ({count})
        </span>
      )}
    </span>
  );
}

function Star({ fill, color, size }) {
  const px = size === 'lg' ? 22 : 16;
  if (fill === 'empty') {
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="#ced4da" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (fill === 'half') {
    const gradId = `half-${color.replace('#', '')}`;
    return (
      <svg width={px} height={px} viewBox="0 0 24 24">
        <defs>
          <linearGradient id={gradId}>
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" stopOpacity="1" />
          </linearGradient>
        </defs>
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={`url(#${gradId})`}
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill={color}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// İnteraktiv ulduz seçici (0.5 addım)
export function StarRatingInput({ value = 0, onChange }) {
  const [hover, setHover] = useState(null);
  const display = hover != null ? hover : value;
  const color = ratingColor(display || 1);

  const handleClick = (i, half) => {
    const v = half ? i - 0.5 : i;
    onChange(v);
  };

  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((i) => {
        let fill;
        if (display >= i) fill = 'full';
        else if (display >= i - 0.5) fill = 'half';
        else fill = 'empty';
        return (
          <span key={i} className="star-input-cell" style={{ position: 'relative' }}>
            <span
              onMouseEnter={() => setHover(i - 0.5)}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleClick(i, true)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer',
                zIndex: 2,
              }}
              aria-label={`${i - 0.5} ulduz`}
            />
            <span
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleClick(i, false)}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer',
                zIndex: 2,
              }}
              aria-label={`${i} ulduz`}
            />
            <Star fill={fill} color={color} size="lg" />
          </span>
        );
      })}
      <span className="ms-2 fw-semibold" style={{ color }}>
        {display > 0 ? display.toFixed(1) : '—'}
      </span>
    </div>
  );
}
