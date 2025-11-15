import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
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
    <div className="w-full px-2 sm:px-4">
      <Splide
        aria-label="Reseñas de estudiantes"
        options={options}
        hasTrack={false}
        className="relative [mask-image:linear-gradient(to_right,transparent_0,black_var(--edge-fade),black_calc(100%_-_var(--edge-fade)),transparent_100%)] [--edge-fade:20px] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_var(--edge-fade),black_calc(100%_-_var(--edge-fade)),transparent_100%)] sm:[--edge-fade:24px] md:[--edge-fade:40px] [&_.splide__arrow--next]:!-right-4 [&_.splide__arrow--next]:sm:!-right-8 [&_.splide__arrow--next]:md:!-right-12 [&_.splide__arrow--prev]:!-left-4 [&_.splide__arrow--prev]:sm:!-left-8 [&_.splide__arrow--prev]:md:!-left-12 [&_.splide__arrows]:px-4 [&_.splide__arrows]:sm:px-8 [&_.splide__arrows]:md:px-12 [&_.splide__pagination]:!mt-6 [&_.splide__pagination]:sm:!mt-8"
      >
        <SplideTrack className="overflow-visible">
          {reviews.map((review) => (
            <SplideSlide key={review.id}>
              <div className="h-full px-2 py-2 sm:px-3 sm:py-3 md:px-4">
                <ReviewCard review={review} />
              </div>
            </SplideSlide>
          ))}
        </SplideTrack>
      </Splide>
    </div>
  );
}
