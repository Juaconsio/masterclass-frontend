import { Outlet } from 'react-router';
import { NavBar, BreadCrumb } from '@components/UI';

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <NavBar />
      <div className="flex-1">
        <BreadCrumb homePath="/app" />
        <div className="px-4 pb-4 lg:px-6 lg:pb-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
