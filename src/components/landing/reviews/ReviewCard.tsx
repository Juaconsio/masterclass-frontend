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

export default function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="card bg-base-200 flex h-full flex-col shadow-xl">
      <div className="card-body flex flex-col p-4 sm:p-5 md:p-6">
        {/* Course Badge */}
        <div className="mb-3 sm:mb-4">
          <div className="badge badge-accent badge-xs sm:badge-sm text-xs">{review.course}</div>
        </div>
        {/* Review Text */}
        <div className="mb-4 min-h-0 overflow-y-auto sm:mb-6">
          <p className="text-sm leading-relaxed italic sm:text-base md:text-lg">
            &quot;{review.comment}&quot;
          </p>
        </div>

        {/* Reviewer Info */}
        <div className="mt-auto flex items-center gap-2 sm:gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            {review.image ? (
              <div className="h-10 w-10 rounded-full sm:h-12 sm:w-12">
                <img src={review.image} alt={review.name} />
              </div>
            ) : (
              <div className="bg-primary text-primary-content flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12">
                <span className="text-base font-bold sm:text-lg">{getInitials(review.name)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <h4 className="truncate text-sm font-semibold sm:text-base">{review.name}</h4>
              {review.date && (
                <span className="text-base-content/60 shrink-0 text-xs">• {review.date}</span>
              )}
            </div>
            <p className="text-base-content/70 truncate text-xs sm:text-sm">
              {review.profile}
              {review.studies && <span className="hidden sm:inline"> • {review.studies}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
