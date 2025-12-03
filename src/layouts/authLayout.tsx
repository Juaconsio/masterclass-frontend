import { Outlet } from 'react-router';
import { useEffect } from 'react';
import { pingServer } from '@/client/ping';

export default function AuthLayout() {
  useEffect(() => {
    pingServer();
  }, []);

  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
