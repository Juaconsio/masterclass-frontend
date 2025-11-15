import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import { Icon } from '@/lib/icons';

export default function CoursesPage() {
  return (
    <div>
      <Navbar />
      
      <main className="pt-navbar min-h-screen">
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Nuestros Cursos
              </h1>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Descubre nuestros cursos de ingeniería. Clases en vivo, materiales exclusivos 
                y acompañamiento personalizado.
              </p>
            </div>

            {/* Placeholder for courses - will be populated from backend API */}
            <div className="bg-base-200 p-12 rounded-lg text-center">
              <Icon name="mdi:book" size={64} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Cursos Disponibles</h3>
              <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
                Los cursos se cargarán desde el backend. Para ver los cursos disponibles, 
                inicia sesión en la plataforma.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a href="/ingresar" className="btn btn-primary">
                  Iniciar Sesión
                </a>
                <a href="/#contact" className="btn btn-outline">
                  Contactar
                </a>
              </div>
            </div>

            <div className="mt-12 bg-primary/10 p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <Icon name="mdi:message-alert" size={32} className="text-primary shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">¿No encuentras tu curso?</h3>
                  <p className="text-base-content/70">
                    Contáctanos y veremos si podemos crearlo para ti. Estamos siempre expandiendo 
                    nuestra oferta de cursos según las necesidades de nuestros estudiantes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
