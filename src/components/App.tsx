import CalendarTemplate from './calendar/CalendarTemplate';
import { SessionProvider, useSessionContext } from '../context/SessionContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import AuthLayout from '@layouts/authLayout';
import AppLayout from '@layouts/appLayout';
import AdminLayout from '@layouts/adminLayout';
import SignInForm from '@components/auth/SignInForm';
import SignUpForm from '@components/auth/SignUpForm';
import { NotFound, AccessDenied } from '@components/UI';
import Home from './home';
import { StudentCourses } from './courses';
import StudentCourseView from './StudentCourseView';
import Reservations from './reservations';
import Checkout from '@components/checkOut';
import {
  AdminDashboard,
  AdminCourses,
  AdminStudents,
  AdminPayments,
  AdminCourseDetail,
  AdminProfessors,
  AdminProfessorDetail,
} from '@components/admin';
import { ProfessorDashboard, ProfessorCourses } from '@components/professor';
import Profile from '@/components/profile/Profile';
import ForgotPassword from './auth/forgotPassword';
import ResetPassword from './auth/resetPassword';
import ClassMaterial from '@components/content/ClassMaterial';
import ReservationConfirm from '@components/reservations/ReservationConfirm';
import RescheduleReservation from '@components/reservations/RescheduleReservation';

export default function Spa() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useSessionContext();

    if (isLoading) return null;
    if (!isAuthenticated) return <Navigate to="/ingresar" replace />;
    if (user?.role !== 'user') {
      if (user?.role === 'professor') {
        return <Navigate to="/profesor" replace />;
      } else if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else {
        return <AccessDenied />;
      }
    }
    return <>{children}</>;
  };

  const ProtectedProfessorRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useSessionContext();

    if (isLoading) return null; // Could render a spinner here
    if (!isAuthenticated) return <Navigate to="/ingresar" replace />;

    const isProfessor = user?.role === 'professor';
    if (!isProfessor) {
      return <AccessDenied />;
    }

    return <>{children}</>;
  };

  const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useSessionContext();

    if (isLoading) return null; // Could render a spinner here
    if (!isAuthenticated) return <Navigate to="/admin/ingresar" replace />;

    const isAdmin = user?.role === 'admin';
    if (!isAdmin) {
      // Mostrar página de acceso denegado
      return <AccessDenied />;
    }

    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <SessionProvider>
        <Toaster position="bottom-right" />
        <Routes>
          {/* Rutas de autenticación */}
          <Route element={<AuthLayout />}>
            <Route path="/ingresar" element={<SignInForm />} />
            <Route path="/registrar" element={<SignUpForm />} />
            <Route path="/reiniciar-contraseña" element={<ForgotPassword />} />
            <Route path="/restablecer-contraseña" element={<ResetPassword />} />
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
            <Route path="reservas/:reservationId/reagendar" element={<RescheduleReservation />} />
            <Route path="confirmacion-pago" element={<ReservationConfirm />} />
            <Route path="cursos">
              <Route index element={<StudentCourses />} />
              <Route path=":courseId">
                <Route index element={<StudentCourseView />} />
                <Route path="clases/:classId">
                  <Route index element={<ClassMaterial />} />
                </Route>
              </Route>
            </Route>
            <Route path="perfil" element={<Profile />} />
          </Route>

          {/* Checkout público */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Rutas de profesores */}
          <Route
            path="/profesor"
            element={
              <ProtectedProfessorRoute>
                <AppLayout />
              </ProtectedProfessorRoute>
            }
          >
            <Route index element={<ProfessorDashboard />} />
            <Route path="cursos">
              <Route index element={<ProfessorCourses />} />
            </Route>
            <Route path="horarios" element={<CalendarTemplate />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

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
            <Route path="cursos">
              <Route index element={<AdminCourses />} />
              <Route path=":courseId" element={<AdminCourseDetail />} />
            </Route>
            <Route path="estudiantes" element={<AdminStudents />} />
            <Route path="profesores">
              <Route index element={<AdminProfessors />} />
              <Route path=":professorId" element={<AdminProfessorDetail />} />
            </Route>

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
