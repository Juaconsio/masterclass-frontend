import { useSessionContext } from '../../context/SessionContext';
import AdminProfile from './AdminProfile';
import ProfessorProfile from './ProfessorProfile';
import StudentProfile from './StudentProfile';

export default function Profile() {
  const { user } = useSessionContext();
  switch (user?.role) {
    case 'admin':
      return <AdminProfile />;
    case 'professor':
      return <ProfessorProfile />;
    case 'user':
      return <StudentProfile />;
    default:
      return <div>Rol de usuario no reconocido.</div>;
  }
}
