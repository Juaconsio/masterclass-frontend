import CalendarTemplate from './calendar/CalendarTemplate';
import { SessionProvider } from '../context/SessionContext';
import { BrowserRouter, Routes, Route } from 'react-router';
import AuthLayout from '@layouts/authLayout';
import SignInForm from '@components/auth/SignInForm';
import SignUpForm from '@components/auth/SignUpForm';
import NotFound from './UI/NotFound';
import Home from './home';
import Courses from './courses';
import UpcomingClasses from './courses/UpcomingClasses';
import ProfessorDashboard from './professor/ProfessorDashboard';

export default function Spa() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            {/* Rutas de autenticación */}
            <Route path="/ingresar" element={<SignInForm />} />
            <Route path="/registrar" element={<SignUpForm />} />
          </Route>
          {/* Rutas protegidas */}
          <Route path="/app">
            <Route index element={<Home />} />
            <Route path="reservas" element={<CalendarTemplate />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="professor" element={<ProfessorDashboard />} />
            <Route path="proximas-clases" element={<UpcomingClasses />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
