import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useEffect, useState } from 'react';

export default function Carousel() {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkMobile();
    checkReducedMotion();
    window.addEventListener('resize', checkMobile);
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkReducedMotion);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);

  const options = {
    type: 'loop',
    gap: isMobile ? '0.75rem' : '1rem',
    arrows: false,
    autoplay: !prefersReducedMotion,
    pauseOnHover: false,
    resetProgress: false,
    perPage: 1,
    perMove: isMobile ? 1 : undefined,

    pagination: isMobile,
    width: isMobile ? '100%' : '100%',
    height: isMobile ? undefined : '26rem',
    fixedHeight: isMobile ? '20rem' : undefined,
  };

  return (
    <div className="w-full lg:w-auto">
      <Splide aria-label="My Favorite Images" options={options}>
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <SplideSlide key={index}>
              <div className="aspect-[9/16] w-full lg:aspect-auto lg:h-full lg:w-auto">
                <picture>
                  <source
                    srcSet={`/images/image${index}.webp`}
                    type="image/webp"
                  />
                  <img
                    src={`/images/image${index}.jp${index == 0 ? 'e' : ''}g`}
                    alt={`Estudiantes de Salva Ramos - Imagen ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover shadow-lg"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    width="1200"
                    height="1200"
                  />
                </picture>
              </div>
            </SplideSlide>
          ))}
      </Splide>
    </div>
  );
}
