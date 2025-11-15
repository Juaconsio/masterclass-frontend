import { Link } from 'react-router';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-content text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand / About */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 sm:gap-3">
              <img
                src="/images/logo.png"
                alt="SalvaRamos Logo"
                className="h-18 sm:h-22 w-auto"
                loading="lazy"
              />
              <span className="text-xl sm:text-2xl font-bold text-primary">SalvaRamos</span>
            </Link>
            <p className="text-neutral/80 text-sm sm:text-base">
              Empoderamos a la próxima generación de ingenieros con cursos claros, prácticos y
              acompañamiento cercano.
            </p>
          </div>

          {/* Navegación */}
          <nav aria-labelledby="footer-nav-title" className="space-y-3 sm:space-y-4">
            <h3 id="footer-nav-title" className="text-base sm:text-lg font-semibold">
              Navegación
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li>
                <Link className="link link-hover" to="/">
                  Inicio
                </Link>
              </li>
              <li>
                <Link className="link link-hover" to="/about">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link className="link link-hover" to="/courses">
                  Cursos
                </Link>
              </li>
              <li>
                <a className="link link-hover" href="/#contact">
                  Contacto
                </a>
              </li>
            </ul>
          </nav>

          {/* Contacto */}
          <div aria-labelledby="footer-contact-title" className="space-y-3 sm:space-y-4">
            <h3 id="footer-contact-title" className="text-base sm:text-lg font-semibold">
              Contacto
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-neutral/80 text-sm sm:text-base">
              <li>
                <a className="link link-hover break-all" href="mailto:contacto@salvaramos.cl">
                  salvaramos@gmail.com
                </a>
              </li>
              <li>
                <a
                  className="link link-hover"
                  href="https://wa.me/56934476377"
                  rel="noopener"
                  target="_blank"
                >
                  56 9 3447 6377
                </a>
              </li>
              <li>
                <a
                  className="link link-hover"
                  href="https://instagram.com/salvaramos"
                  rel="noopener"
                  target="_blank"
                >
                  @salvaramos
                </a>
              </li>
            </ul>
          </div>

          {/* Boletín (opcional) */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Mantente al día</h3>
            <p className="text-neutral/80 text-sm sm:text-base">
              Recibe novedades de cursos y fechas importantes.
            </p>
            <form className="join flex-col sm:flex-row max-w-sm">
              <input
                type="email"
                required
                placeholder="Tu correo"
                className="input input-bordered input-sm sm:input-md join-item w-full text-neutral-content"
              />
              <button
                className="btn btn-primary btn-sm sm:btn-md join-item mt-2 sm:mt-0"
                type="submit"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>

        <div className="divider my-6 sm:my-8"></div>

        {/* Legal / Credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-base-content/60 text-center md:text-left">
            © {year} SalvaRamos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
