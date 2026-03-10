import { Outlet } from 'react-router';
import { BreadCrumb, NavBar } from '@components/UI';

export default function AdminLayout() {
  return (
    <main className="flex h-[var(--app-dvh)] flex-col overflow-hidden lg:flex-row">
      <NavBar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-base-300 bg-base-100">
          <BreadCrumb homePath="/admin" />
        </div>
        <div className="px-4 pb-4 lg:px-6 lg:pb-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
