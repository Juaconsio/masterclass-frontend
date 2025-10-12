import CalendarTemplate from './calendar/CalendarTemplate.tsx';
import { SessionProvider } from '../context/SessionContext.tsx';
import { BrowserRouter, Routes, Route } from 'react-router';
import AuthLayout from '@layouts/authLayout.tsx';
import SignInForm from '@components/auth/SignInForm.tsx';
import SignUpForm from '@components/auth/SignUpForm.tsx';
import NotFound from './UI/NotFound.tsx';
import Home from './home';
import Courses from './courses';

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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}
