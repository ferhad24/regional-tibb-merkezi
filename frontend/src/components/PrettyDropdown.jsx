import { useEffect, useRef, useState } from 'react';

export default function PrettyDropdown({ options, value, onChange, placeholder = 'Seçin', style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const escHandler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="pretty-dropdown" ref={ref} style={style}>
      <button
        type="button"
        className={`pretty-dropdown-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-truncate">{selected?.label || placeholder}</span>
        <i className="bi bi-chevron-down ms-2" />
      </button>
      {open && (
        <ul className="pretty-dropdown-menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`pretty-dropdown-item ${opt.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
