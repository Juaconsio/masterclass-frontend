import { Carousel } from '@components/UI';
import { Link } from 'react-router';

export default function Hero() {
  return (
    <div className="bg-[url('/images/Simple_Shiny.svg')] bg-center md:bg-cover h-hero">
      <section className="hero h-full relative">
        <div className="hero-content justify-center flex-col relative z-30 px-4 sm:px-6 md:px-8">
          <div className="flex w-full flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-24 mb-8 sm:mb-12">
            <div className="basis-full lg:basis-1/2">
              <h1 className="text-center lg:text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                Clases en vivo de
                <span className="text-primary relative border-b-2 sm:border-b-4 border-primary">
                  {' '}
                  Excelencia.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-center lg:text-left lg:text-2xl mb-6 sm:mb-8 leading-relaxed max-w-3xl">
                Aprende mediante sesiones grupales o personales, con foco a desarrollar herramientas
                para que rindas tus exámenes de la mejor forma posible.{' '}
                <span className="font-semibold text-primary">¡Salva tu ramo ahora!</span>
              </p>

              <div className="flex flex-col w-full justify-center items-center sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/courses"
                  className="btn w-full sm:btn-wide sm:btn-lg btn-primary border-none text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
                >
                  Busca tu curso!
                </Link>
                <a
                  href="#reviews"
                  className="btn w-full sm:btn-wide sm:btn-lg btn-soft btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
                >
                  Ver Reseñas
                </a>
              </div>
            </div>
            <div className="basis-full lg:basis-1/2 flex justify-center w-full">
              <Carousel />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
