import { Outlet } from 'react-router';
import { BreadCrumb, NavBar } from '@components/UI';

export default function AdminLayout() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <NavBar />
      <div className="flex-1">
        <BreadCrumb homePath="/admin" />
        <div className="px-4 lg:px-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
