import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      
      <main className="pt-navbar min-h-screen">
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center">
                Sobre Nosotros
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-center mb-12 text-base-content/70">
                  SalvaRamos es una plataforma dedicada a apoyar a estudiantes de ingeniería 
                  con clases en vivo de excelencia.
                </p>
                
                <div className="bg-base-200 p-8 rounded-lg mb-8">
                  <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
                  <p className="text-base-content/80">
                    Empoderamos a la próxima generación de ingenieros con cursos claros, 
                    prácticos y acompañamiento cercano. Creemos en la educación personalizada 
                    y en el poder de las clases en vivo para resolver dudas al instante.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-base-200 p-8 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">¿Quiénes somos?</h3>
                    <p className="text-base-content/80">
                      Somos un equipo de profesores expertos con más de 6 años de experiencia 
                      ayudando a estudiantes de ingeniería a salvar sus ramos más difíciles.
                    </p>
                  </div>

                  <div className="bg-base-200 p-8 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">¿Qué ofrecemos?</h3>
                    <p className="text-base-content/80">
                      Clases en vivo grupales y personales, materiales exclusivos, 
                      y una comunidad de estudiantes que comparten el mismo objetivo: 
                      aprobar y dominar las asignaturas de ingeniería.
                    </p>
                  </div>
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
