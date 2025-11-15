import Navbar from './Navbar';
import Hero from './Hero';
import Stats from './Stats';
import Footer from './Footer';
import ContactUs from './contactUs/ContactUs';

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
        
        {/* Placeholder for featured courses - to be migrated */}
        <section id="courses" className="h-hero">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Revisa los cursos que enseñamos
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-base-content/70 max-w-3xl mx-auto px-4">
                ¿No encuentras el que buscas? Contáctanos y veremos si podemos crearlo para ti.
              </p>
            </div>
          </div>
        </section>

        {/* Placeholder for about section - to be migrated */}
        <section id="about" className="py-12 sm:py-16 md:py-20 h-hero">
          <div className="flex flex-col mx-auto px-4 sm:px-6 max-w-7xl gap-6 sm:gap-8 md:gap-10">
            <div className="px-4 text-center mb-2 sm:mb-4 flex gap-3 sm:gap-4 flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Más que una plataforma de cursos en línea.
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-base-content/70 leading-relaxed px-2">
                Clases hechas pa' remontar, materiales que te salvan y un equipo que te banca.
              </p>
            </div>
          </div>
        </section>

        {/* Placeholder for reviews - to be migrated */}
        <div className="bg-base-200">
          <section id="reviews" className="pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                  Que te lo cuenten ellas y ellos
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-base-content/70 max-w-3xl mx-auto px-4">
                  Conoce la experiencia de quienes ya han confiado en nosotros.
                </p>
              </div>
            </div>
          </section>
        </div>

        <ContactUs />
        <Footer />
      </div>
  );
}
