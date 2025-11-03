import CalendarTemplate from './calendar/CalendarTemplate';
import { SessionProvider, useSessionContext } from '../context/SessionContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import AuthLayout from '@layouts/authLayout';
import AppLayout from '@layouts/appLayout';

import SignInForm from '@components/auth/SignInForm';
import SignUpForm from '@components/auth/SignUpForm';
import NotFound from './UI/NotFound';
import Home from './home';
import Courses from './courses';
import StudentCourseView from './StudentCourseView';
import Checkout from '@components/checkOut';

export default function Spa() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Lazy import to avoid circulars
    const { isAuthenticated, isLoading } = useSessionContext();
    if (isLoading) return null; // Could render a spinner here
    if (!isAuthenticated) return <Navigate to="/ingresar" replace />;
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
            <Route path="reservas" element={<CalendarTemplate />} />
            <Route path="cursos">
              <Route index element={<Courses />} />
              <Route path=":courseId" element={<StudentCourseView />} />
            </Route>
          </Route>

          {/* Checkout público */}
          <Route path="/checkout" element={<Checkout />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
