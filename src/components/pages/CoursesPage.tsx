import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';
import CourseCard from '../landing/courses/CourseCard';
import { getCourses } from '@/lib/content';
import { Icon } from '@/lib/icons';

export default function CoursesPage() {
  const courses = getCourses();

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

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {courses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-base-200 p-12 rounded-lg text-center">
                <Icon name="mdi:book" size={64} className="mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-4">Próximamente</h3>
                <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
                  Estamos preparando nuevos cursos para ti. Revisa pronto para ver las novedades.
                </p>
              </div>
            )}

            <div className="mt-12 bg-primary/10 p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <Icon name="mdi:message-alert" size={32} className="text-primary shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">¿No encuentras tu curso?</h3>
                  <p className="text-base-content/70 mb-4">
                    Contáctanos y veremos si podemos crearlo para ti. Estamos siempre expandiendo 
                    nuestra oferta de cursos según las necesidades de nuestros estudiantes.
                  </p>
                  <a href="/#contact" className="btn btn-primary">
                    Contactar
                  </a>
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
