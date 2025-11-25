import CalendarTemplate from './calendar/CalendarTemplate';
import { SessionProvider, useSessionContext } from '../context/SessionContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AuthLayout from '@layouts/authLayout';
import AppLayout from '@layouts/appLayout';
import AdminLayout from '@layouts/adminLayout';
import SignInForm from '@components/auth/SignInForm';
import SignUpForm from '@components/auth/SignUpForm';
import AdminSignInForm from '@components/auth/AdminSignInForm';
import { NotFound, AccessDenied } from '@components/UI';
import Home from './home';
import Courses from './courses';
import StudentCourseView from './StudentCourseView';
import Reservations from './reservations';
import Checkout from '@components/checkOut';
import { AdminDashboard, AdminCourses, AdminStudents, AdminPayments } from '@components/admin';

export default function Spa() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Lazy import to avoid circulars
    const { isAuthenticated, isLoading } = useSessionContext();
    if (isLoading) return null; // Could render a spinner here
    if (!isAuthenticated) return <Navigate to="/ingresar" replace />;
    return <>{children}</>;
  };

  const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useSessionContext();

    if (isLoading) return null; // Could render a spinner here
    if (!isAuthenticated) return <Navigate to="/admin/ingresar" replace />;

    // Verificar que el usuario tenga rol de admin
    // El backend debe incluir role: 'admin' en el JWT token
    const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
    if (!isAdmin) {
      // Mostrar página de acceso denegado
      return <AccessDenied />;
    }

    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          {/* Rutas de autenticación */}
          <Route element={<AuthLayout />}>
            <Route path="/ingresar" element={<SignInForm />} />
            <Route path="/registrar" element={<SignUpForm />} />
            <Route path="/admin/ingresar" element={<AdminSignInForm />} />
          </Route>

          {/* Rutas protegidas */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="reservas" element={<Reservations />} />
            <Route path="cursos">
              <Route index element={<Courses />} />
              <Route path=":courseId" element={<StudentCourseView />} />
            </Route>
            <Route path="perfil" element={<Profile />} />
          </Route>

          {/* Checkout público */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Rutas de administración */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="cursos" element={<AdminCourses />} />
            <Route path="estudiantes" element={<AdminStudents />} />
            <Route
              path="profesores"
              element={<div className="text-2xl">Profesores (En desarrollo)</div>}
            />
            <Route path="reservas" element={<CalendarTemplate />} />
            <Route path="pagos" element={<AdminPayments />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
