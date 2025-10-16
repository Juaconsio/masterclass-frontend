import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useEffect, useState } from 'react';

export default function Carousel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const options = {
    type: 'loop' as const,
    gap: isMobile ? '0.75rem' : '1rem',
    arrows: false,
    autoplay: true,
    pauseOnHover: false,
    resetProgress: false,
    perPage: isMobile ? 1 : undefined,
    perMove: isMobile ? 1 : undefined,
    pagination: isMobile,
    width: isMobile ? '100%' : '22rem',
    height: isMobile ? undefined : '26rem',
    fixedHeight: isMobile ? '20rem' : undefined,
  };

  return (
    <div className="w-full lg:w-auto">
      <Splide aria-label="My Favorite Images" options={options}>
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <SplideSlide key={index}>
              <div className="aspect-[9/16] w-full lg:aspect-auto lg:h-full lg:w-auto">
                <img
                  src={`/images/image${index}.jp${index == 0 ? 'e' : ''}g`}
                  alt={`Image ${index}`}
                  className="h-full w-full rounded-lg object-cover shadow-lg"
                />
              </div>
            </SplideSlide>
          ))}
      </Splide>
    </div>
  );
}
