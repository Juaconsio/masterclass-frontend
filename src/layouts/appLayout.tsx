import { Outlet } from 'react-router';
import { NavBar, BreadCrumb } from '@components/UI';

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
