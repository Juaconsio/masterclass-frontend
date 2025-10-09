export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center rounded bg-white p-8 shadow-md">
        <h1 className="mb-4 text-6xl font-bold text-blue-600">404</h1>
        <p className="mb-6 text-xl text-gray-700">¿Te perdiste? Aquí no hay nada 😅</p>
        <a
          href="/"
          className="rounded bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
