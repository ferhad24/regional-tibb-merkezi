import { useEffect, useRef, useState } from 'react';

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];
const AZ_WEEKDAYS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'];

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCells(viewDate) {
  const first = startOfMonth(viewDate);
  // Mon=0 convention
  let firstDow = first.getDay() - 1;
  if (firstDow < 0) firstDow = 6;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PrettyDatePicker({ value, onChange, minDate }) {
  const [open, setOpen] = useState(false);
  const selected = fromIso(value);
  const [view, setView] = useState(selected || new Date());
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const min = fromIso(minDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const select = (d) => {
    if (min && d < min) return;
    onChange(toIso(d));
    setOpen(false);
  };

  const cells = buildCells(view);

  const label = selected
    ? selected.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Tarix seçin...';

  return (
    <div className="pretty-dropdown pretty-datepicker" ref={wrapRef}>
      <button
        type="button"
        className={`pretty-dropdown-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-truncate d-inline-flex align-items-center">
          <i className="bi bi-calendar3 me-2" />
          {label}
        </span>
        <i className="bi bi-chevron-down ms-2" />
      </button>
      {open && (
        <div className="pretty-dropdown-menu pretty-datepicker-menu">
          <div className="pretty-datepicker-header">
            <button
              type="button"
              className="pretty-datepicker-nav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              aria-label="Əvvəlki ay"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <span className="pretty-datepicker-title">
              {AZ_MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <button
              type="button"
              className="pretty-datepicker-nav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              aria-label="Növbəti ay"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
          <div className="pretty-datepicker-grid">
            {AZ_WEEKDAYS.map((w) => (
              <div key={w} className="pretty-datepicker-dow">{w}</div>
            ))}
            {cells.map((c, idx) => {
              if (!c) return <div key={idx} />;
              const disabled = min ? c < min : false;
              const isSelected = isSameDay(c, selected);
              const isToday = isSameDay(c, today);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(c)}
                  className={`pretty-datepicker-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  {c.getDate()}
                </button>
              );
            })}
          </div>
          <div className="pretty-datepicker-footer">
            <button
              type="button"
              className="pretty-datepicker-quick"
              onClick={() => {
                const t = new Date();
                t.setHours(0, 0, 0, 0);
                select(t);
              }}
            >
              Bugün
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
