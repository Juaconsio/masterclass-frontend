import { Icon } from '@/lib/icons';

export default function Stats() {
  return (
    <div className="bg-base-200">
      {/* Stats Section */}
      <section className="flex flex-col justify-around items-center px-4 sm:px-6 py-8 sm:py-12 gap-6 sm:gap-8">
        <h2 className="py-2 sm:py-4 text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-center">
          Hemos logrado grandes resultados
        </h2>
        <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12 lg:flex-row justify-around w-full max-w-6xl">
          <div className="flex items-center gap-3 sm:gap-4 justify-center" data-usal="fade-l">
            <div className="flex items-center h-full gap-3 sm:gap-4 py-2 sm:py-4">
              <Icon name="mdi:book-open-variant" size={48} className="text-primary sm:w-16 sm:h-16" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">
                +<span data-usal="count-[6]">6</span>
              </div>
              <div className="w-28 sm:w-32 text-sm sm:text-base">años de experiencia</div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 justify-center" data-usal="fade-u delay-[200]">
            <div className="flex items-center h-full gap-3">
              <Icon name="mdi:user-group" size={48} className="text-primary sm:w-16 sm:h-16" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">
                + <span data-usal="count-[500]">500</span>
              </div>
              <div className="w-28 sm:w-32 text-sm sm:text-base">Estudiantes acompañados</div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 justify-center" data-usal="fade-r delay-[400]">
            <div className="flex items-center h-full gap-3">
              <Icon name="mdi:refresh-circle" size={48} className="text-primary sm:w-16 sm:h-16" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">
                ~<span data-usal="count-[80]">80</span>%
              </div>
              <div className="w-28 sm:w-32 text-sm sm:text-base">Volvió a confiar en nosotros</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
