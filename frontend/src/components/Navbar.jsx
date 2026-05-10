import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isAdmin, isPatient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-hospital me-2" />
          Regional Tibb Mərkəzi
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>Ana Səhifə</NavLink>
            </li>
            {isPatient && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard">Şəxsi Kabinet</NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">Admin Panel</NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Daxil Ol</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-light btn-sm ms-2 mt-1" to="/register">
                    Qeydiyyat
                  </NavLink>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item d-flex align-items-center text-light me-3">
                  <i className="bi bi-person-circle me-1" />
                  {user.fullName}
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1" />
                    Çıxış
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
