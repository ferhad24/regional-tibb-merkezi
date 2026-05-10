import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="app-footer">
        <div className="container">
          <small>© {new Date().getFullYear()} Regional Tibb Mərkəzi — Bütün hüquqlar qorunur</small>
        </div>
      </footer>
    </>
  );
}
