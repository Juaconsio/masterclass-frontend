import { useRef, useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const AUTOPLAY_MS = 5000;

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = reviews.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const directionRef = useRef<1 | -1>(1);
  const [isVisible, setIsVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  const getSnapLeft = (el: HTMLDivElement) => {
    const container = containerRef.current;
    if (!container) return el.offsetLeft;
    const paddingLeft = Number.parseFloat(getComputedStyle(container).paddingLeft || '0') || 0;
    return el.offsetLeft - paddingLeft;
  };

  const scrollToSlide = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const el = slideRefs.current[index];
    const container = containerRef.current;
    if (el && container) container.scrollTo({ left: getSnapLeft(el), behavior });
    setCurrentIndex(index);
  };

  const goTo = (delta: number) => {
    if (n === 0) return;
    const next = Math.max(0, Math.min(n - 1, currentIndex + delta));
    scrollToSlide(next);
  };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (n === 0 || isPaused || !isVisible) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        if (n <= 1) return prev;

        const direction = directionRef.current;
        let next = prev + direction;
        let nextDirection: 1 | -1 = direction;

        if (next >= n) {
          nextDirection = -1;
          next = n - 2;
        } else if (next < 0) {
          nextDirection = 1;
          next = 1;
        }

        directionRef.current = nextDirection;

        const container = containerRef.current;
        const el = slideRefs.current[next];
        if (container && el) container.scrollTo({ left: getSnapLeft(el), behavior: 'smooth' });

        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [n, isPaused, isVisible]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      const left = container.scrollLeft;
      const paddingLeft = Number.parseFloat(getComputedStyle(container).paddingLeft || '0') || 0;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        const distance = Math.abs(el.offsetLeft - paddingLeft - left);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      setCurrentIndex(nearestIndex);
    });
  };

  if (reviews.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && wrapperRef.current?.contains(next)) return;
        setIsPaused(false);
      }}
    >
      <div
        ref={containerRef}
        className="hide-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-12 pb-4 sm:gap-6 sm:px-14 md:gap-6 lg:gap-8 lg:px-16"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
        aria-label="Reseñas de estudiantes"
        onScroll={handleScroll}
      >
        {reviews.map((review, i) => (
          <div
            key={review.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-[85%] shrink-0 scroll-mx-4 sm:w-[75%] md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4">
        <button
          type="button"
          className="pointer-events-auto btn btn-circle btn-ghost btn-sm shrink-0 opacity-80 hover:opacity-100 sm:btn-md"
          aria-label="Reseña anterior"
          onClick={() => goTo(-1)}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          type="button"
          className="pointer-events-auto btn btn-circle btn-ghost btn-sm shrink-0 opacity-80 hover:opacity-100 sm:btn-md"
          aria-label="Siguiente reseña"
          onClick={() => goTo(1)}
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
