import { Outlet } from 'react-router';
import { NavBar, BreadCrumb } from '@components/UI';
import { BreadCrumbRouteProvider } from '@/context/BreadCrumbRouteContext';

export default function AppLayout() {
  return (
    <BreadCrumbRouteProvider>
      <main className="flex h-[var(--app-dvh)] flex-col overflow-hidden lg:flex-row">
        <NavBar />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="border-base-300 bg-base-100 sticky top-0 z-10 border-b">
            <BreadCrumb homePath="/app" />
          </div>
          <div className="px-4 py-4 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </div>
      </main>
    </BreadCrumbRouteProvider>
  );
}
