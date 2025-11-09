import { Outlet } from 'react-router';
import NavBar from '@/components/UI/NavBar';
import { BreadCrumb } from '@components/UI/BreadCrumb';

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <NavBar />
      <div className="flex-1">
        <BreadCrumb homePath="/app" />
        <Outlet />
      </div>
    </main>
  );
}
