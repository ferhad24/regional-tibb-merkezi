import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="container">
          <small>© {new Date().getFullYear()} MediRegSys — Bütün hüquqlar qorunur</small>
        </div>
      </footer>
    </div>
  );
}
