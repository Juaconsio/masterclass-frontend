interface ReviewCardProps {
  review: {
    id: string;
    name: string;
    profile: string;
    studies: string;
    comment: string;
    course: string;
    rating?: number;
    image?: string;
    date?: string;
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const hasRating = typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg sm:p-5 md:p-6">
      <span className="text-base-content/50 mb-3 text-xs font-medium uppercase tracking-wide sm:mb-4">
        {review.course}
      </span>

      <div className="relative min-h-[7rem] flex-1 sm:min-h-[8rem]">
        <span
          className="text-primary/30 absolute -top-1 left-0 font-serif text-4xl leading-none sm:text-5xl"
          aria-hidden
        >
          "
        </span>
        <p className="text-base-content line-clamp-5 pl-4 text-base font-medium leading-relaxed sm:pl-5 sm:text-lg sm:line-clamp-6">
          {review.comment}
        </p>
      </div>

      {hasRating && (
        <div className="mt-3 flex gap-0.5 sm:mt-4" aria-label={`${review.rating} de 5 estrellas`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                star <= (review.rating ?? 0)
                  ? 'text-warning'
                  : 'text-base-300'
              }
            >
              ★
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto flex items-center gap-3 pt-4 sm:pt-5">
        {review.image ? (
          <img
            src={review.image}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <div className="bg-primary text-primary-content flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-12 sm:w-12 sm:text-base">
            {getInitials(review.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-base-content sm:text-base">{review.name}</p>
          <p className="text-base-content/70 truncate text-xs sm:text-sm">
            {review.profile}
            {review.studies && (
              <>
                <span className="hidden sm:inline"> · </span>
                <span className="sm:inline">{review.studies}</span>
              </>
            )}
          </p>
        </div>
      </footer>
    </article>
  );
}
