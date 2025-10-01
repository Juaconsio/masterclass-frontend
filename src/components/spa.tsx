import CalendarTemplate from '../components/calendar/CalendarTemplate.tsx';
import { SessionProvider } from '../context/SessionContext';

export default function Spa() {
  return (
    <SessionProvider>
      <CalendarTemplate />
    </SessionProvider>
  );
}
