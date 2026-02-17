import { Outlet } from 'react-router';
import { NavBar, BreadCrumb } from '@components/UI';

export default function AuthLayout() {
  return (
    <main className="flex h-[var(--app-dvh)] flex-col overflow-hidden lg:flex-row">
      <NavBar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <BreadCrumb homePath="/app" />
        <div className="px-4 pb-4 lg:px-6 lg:pb-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
