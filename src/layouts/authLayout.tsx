import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl md:flex-row">
        <div className="bg-base-100 hidden items-center justify-center md:flex md:w-1/2">
          <img
            src="/images/engineering.jpg"
            alt="Imagen de grupo de personas trabajando en equipo"
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
