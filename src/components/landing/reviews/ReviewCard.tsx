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
    <div className="card flex h-[400px] flex-col bg-white shadow-xl">
      <div className="card-body flex flex-col">
        {/* Review Text */}
        <p className="text-base-content/80 mb-6 line-clamp-4 flex-grow text-lg leading-relaxed">
          "{review.comment}"
        </p>

        {/* Course Badge */}
        <div className="mb-4">
          <div className="badge badge-accent badge-sm">{review.course}</div>
        </div>

        {/* Reviewer Info */}
        <div className="mt-auto flex items-center gap-3">
          <div className="avatar avatar-placeholder">
            {review.image ? (
              <div className="h-12 w-12 rounded-full">
                <img src={review.image} alt={review.name} />
              </div>
            ) : (
              <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full">
                <span className="text-lg font-bold">{getInitials(review.name)}</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{review.name}</h4>
              {review.date && <span className="text-base-content/60 text-xs">• {review.date}</span>}
            </div>
            <p className="text-base-content/70 text-sm">
              {review.profile}
              {review.studies && <span> • {review.studies}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
