import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  name: string;
  profile: string;
  studies: string;
  comment: string;
  course: string;
  rating?: number;
  image?: string;
  date?: string;
}

interface ReviewsCarouselProps {
  reviews: Review[];
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkReducedMotion();
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkReducedMotion);

    return () => {
      mediaQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);

  const options = {
    type: 'loop' as const,
    gap: '1.5rem',
    arrows: true,
    autoplay: !prefersReducedMotion,
    interval: 5000,
    pauseOnHover: true,
    resetProgress: false,
    perPage: 3,
    perMove: 1,
    pagination: false,
    padding: { left: '5rem', right: '5rem' },
    breakpoints: {
      1280: {
        perPage: 3,
        gap: '1.5rem',
      },
      1024: {
        perPage: 2,
        gap: '1rem',
        padding: { left: '1rem', right: '1rem' },
      },
      768: {
        perPage: 1,
        gap: '1rem',
        arrows: false,
        padding: { left: '0', right: '0' },
      },
    },
  };

  return (
    <div className="w-full">
      <Splide
        aria-label="Reseñas de estudiantes"
        options={options}
        hasTrack={false}
        className="relative [mask-image:linear-gradient(to_right,transparent_0,black_var(--edge-fade),black_calc(100%_-_var(--edge-fade)),transparent_100%)] [--edge-fade:40px] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_var(--edge-fade),black_calc(100%_-_var(--edge-fade)),transparent_100%)] sm:[--edge-fade:24px] md:[--edge-fade:40px]"
      >
        <SplideTrack className="overflow-visible">
          {reviews.map((review) => (
            <SplideSlide key={review.id}>
              <div className="h-full px-4 py-3">
                <ReviewCard review={review} />
              </div>
            </SplideSlide>
          ))}
        </SplideTrack>
      </Splide>
    </div>
  );
}
