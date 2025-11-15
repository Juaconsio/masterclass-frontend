import Navbar from './Navbar';
import Hero from './Hero';
import Stats from './Stats';
import Footer from './Footer';
import ContactUs from './contactUs/ContactUs';
import CourseCard from './courses/CourseCard';
import ReviewsCarousel from './reviews/ReviewsCarousel';
import { getCourses, getReviews } from '@/lib/content';
import { Icon } from '@/lib/icons';
import { Link } from 'react-router';

export default function LandingPage() {
  // Load courses and reviews from markdown files
  const allCourses = getCourses();
  const allReviews = getReviews();

  // Get featured courses (filter by featured flag, then fallback to first 4)
  const featuredCourses = allCourses.filter((course) => course.featured);
  const coursesToShow =
    featuredCourses.length >= 4 ? featuredCourses.slice(0, 4) : allCourses.slice(0, 4);

  // Get featured reviews (filter by featured flag, then fallback to first 6)
  const featuredReviews = allReviews.filter((review) => review.featured);
  const reviewsToShow =
    featuredReviews.length >= 6 ? featuredReviews.slice(0, 6) : allReviews.slice(0, 6);

  const aboutItems = [
    {
      title: 'Clases de excelencia para salvar ramos',
      icon: 'mdi:target-arrow',
      desc: 'Los mejores tips y técnicas para que rendir en tus evaluaciones',
    },
    {
      title: 'Sesiones en vivo',
      icon: 'mdi:account-voice',
      desc: 'Aquí aprenderás en tiempo real con resolución de dudas al instante',
    },
    {
      title: 'Recursos y materiales exclusivos',
      icon: 'mdi:book-open-page-variant',
      desc: 'Creados por el equipo para afrontar las evaluaciones más difíciles',
    },
    {
      title: 'Una comunidad que te acompaña',
      icon: 'mdi:account-group',
      desc: 'Compartimos el mismo objetivo y nos apoyamos para lograrlo',
    },
  ];

  const getUsalAnimation = (idx: number) => {
    switch (idx % 4) {
      case 0:
        return 'fade-r delay-100';
      case 1:
        return 'fade-r delay-300';
      case 2:
        return 'fade-r delay-500';
      case 3:
        return 'fade-r delay-700';
      default:
        return 'fade-u';
    }
  };

  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
      
      {/* Featured Courses Section */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            {coursesToShow.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/courses" className="btn btn-primary btn-md sm:btn-lg w-full sm:w-auto">
              Ver Todos los Cursos
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 h-hero">
        <div className="flex flex-col mx-auto px-4 sm:px-6 max-w-7xl gap-6 sm:gap-8 md:gap-10">
          <div className="px-4 text-center mb-2 sm:mb-4 flex gap-3 sm:gap-4 flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Más que una plataforma de cursos en línea.
              <Icon name="mdi:handshake" className="inline text-primary ml-2" />
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-base-content/70 leading-relaxed px-2">
              Clases hechas pa' remontar, materiales que te salvan y un equipo que te banca.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="flex flex-col justify-between h-full">
              <h3 className="text-base-content/50 pb-2 text-sm sm:text-base">Somos...</h3>
              <div className="flex flex-col justify-between h-full gap-4 sm:gap-6">
                {aboutItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 sm:gap-4"
                    data-usal={getUsalAnimation(index)}
                  >
                    <div className="flex justify-center items-center bg-primary text-primary-content rounded-xl p-3 sm:p-4 shrink-0">
                      <Icon name={item.icon} size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{item.title}</h3>
                      <p className="text-base-content/50 text-sm sm:text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🎓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
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

            {reviewsToShow.length > 0 ? (
              <ReviewsCarousel reviews={reviewsToShow} />
            ) : (
              <div className="text-center py-12">
                <p className="text-base-content/70">No hay reseñas disponibles en este momento.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <ContactUs />
      <Footer />
    </div>
  );
}
