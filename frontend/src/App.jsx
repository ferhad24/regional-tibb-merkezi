import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookAppointment from './pages/BookAppointment.jsx';

import AdminHome from './pages/admin/AdminHome.jsx';
import AdminDoctors from './pages/admin/AdminDoctors.jsx';
import AdminDepartments from './pages/admin/AdminDepartments.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1">404</h1>
      <p className="lead">Səhifə tapılmadı</p>
      <a href="/" className="btn btn-primary">Ana səhifəyə qayıt</a>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="ROLE_PATIENT">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:doctorId"
          element={
            <ProtectedRoute role="ROLE_PATIENT">
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ROLE_ADMIN">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute role="ROLE_ADMIN">
              <AdminDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute role="ROLE_ADMIN">
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute role="ROLE_ADMIN">
              <AdminAppointments />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
