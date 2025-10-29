import { Outlet } from 'react-router';
import NavBar from '@/components/UI/NavBar';
export default function AuthLayout() {
  return (
    <main>
      <div className="flex min-h-screen">
        <NavBar />
        <Outlet />
      </div>
    </main>
  );
}
