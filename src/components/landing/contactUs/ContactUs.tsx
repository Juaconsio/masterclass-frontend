import ContactCard from './ContactCard';

const contactData = [
  {
    href: 'mailto:salvaramos@gmail.com',
    icon: 'mdi:alternate-email',
    title: 'Correo Electrónico',
    subtitle: 'salvaramos@gmail.com',
  },
  {
    href: 'https://wa.me/56934476377',
    icon: 'mdi:whatsapp',
    title: 'WhatsApp',
    subtitle: '+56 9 3447 6377',
  },
  {
    href: 'https://www.instagram.com/salvaramos_ing',
    icon: 'mdi:instagram',
    title: 'Instagram',
    subtitle: '@salvaramos_ing',
  },
];

export default function ContactUs() {
  return (
    <section id="contact" className="h-fit my-8 sm:mb-12 gap-8 flex flex-col">
      {/* Bento Grid Layout */}
      <div className="w-full max-w-5xl mx-auto text-center lg:hidden">
        <h2 id="contact-title" className="text-3xl sm:text-4xl font-extrabold">
          Contáctanos
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Por cualquiera de nuestras redes o vía email. Estamos para ayudarte.
        </p>
      </div>
      <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {/* QR Code - 1 column */}
        <div className="card bg-white shadow-xl overflow-hidden min-h-0 lg:col-span-1" data-usal="fade-l">
          <figure className="min-h-0 h-96 lg:h-full p-4 sm:p-6">
            <img
              src="/images/WA_QRcode.png"
              alt="WhatsApp QR Code"
              className="size-full object-contain"
            />
          </figure>
          <div className="card-body items-center p-4 sm:p-6">
            <div className="card-title text-sm sm:text-base text-center">
              Escanea el código para chatear ahora
            </div>
          </div>
        </div>

        {/* Imagen de contacto - 2 columns */}
        <div
          className="card card-sm bg-white shadow-xl overflow-hidden min-h-[200px] sm:min-h-[250px] lg:col-span-2 hidden lg:block"
          data-usal="fade-u"
        >
          <div className="p-0 h-full min-h-0">
            <div className="relative h-full rounded-lg overflow-hidden" data-usal="fade-r">
              <img
                src="/images/image0.jpeg"
                alt="Equipo SalvaRamos"
                className="h-full w-full object-cover"
              />
              <div className="absolute z-20 inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute z-30 bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Contactanos</h3>
                <p className="text-white text-sm sm:text-base">
                  Por cualquiera de nuestras redes o vía email. Estamos para ayudarte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Cards - 1 column */}
        <div className="flex flex-col gap-4 lg:col-span-1" data-usal="fade-r">
          {contactData.map((contact) => (
            <ContactCard
              key={contact.href}
              href={contact.href}
              icon={contact.icon}
              title={contact.title}
              subtitle={contact.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
