import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight, Icon } from 'lucide-react';

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
  const options = {
    type: 'loop' as const,
    gap: '1rem',
    arrows: true,
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    resetProgress: false,
    perPage: 3,
    perMove: 1,
    pagination: false,
    padding: { left: '2rem', right: '2rem' },
    breakpoints: {
      1280: {
        perPage: 3,
        gap: '1.5rem',
        padding: { left: '2rem', right: '2rem' },
      },
      1024: {
        perPage: 2,
        gap: '1rem',
        padding: { left: '1rem', right: '1rem' },
      },
      768: {
        perPage: 1,
        pagination: true,
        gap: '0.75rem',
        padding: { left: '0.5rem', right: '0.5rem' },
      },
      640: {
        perPage: 1,
        pagination: true,
        gap: '0.5rem',
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
        className="relative"
      >
        {/* Track */}
        <SplideTrack className="overflow-visible px-8 pb-8">
          {reviews.map((review) => (
            <SplideSlide key={review.id}>
              <ReviewCard review={review} />
            </SplideSlide>
          ))}
        </SplideTrack>

        {/* Arrows custom */}
        <div className="splide__arrows pointer-events-none absolute inset-y-0 w-full">
          <button
            className="splide__arrow splide__arrow--prev pointer-events-auto absolute top-1/2 left-0 -translate-y-1/2"
            aria-label="Anterior"
          >
            <ChevronRight size={24} />
          </button>
          <button
            className="splide__arrow splide__arrow--next pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </Splide>
    </div>
  );
}
