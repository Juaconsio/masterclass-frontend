import { useState } from 'react';
import ReviewCard from '../reviews/ReviewCard';

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

interface TestimoniosSubcollectionProps {
  subcollection: string;
  subcollectionLabel: string;
  allReviews: Review[];
  subcollectionId: string;
}

const REVIEWS_PER_PAGE = 12;

function shouldShowPage(page: number, currentPage: number, totalPages: number): boolean {
  if (page === 1 || page === totalPages) return true;
  if (Math.abs(page - currentPage) <= 1) return true;
  if (page === 2 && currentPage > 3) return true;
  if (page === totalPages - 1 && currentPage < totalPages - 2) return true;
  return false;
}

function shouldShowEllipsis(page: number, currentPage: number, totalPages: number): boolean {
  if (page === 2 && currentPage > 4) return true;
  if (page === totalPages - 1 && currentPage < totalPages - 3) return true;
  return false;
}

export default function TestimoniosSubcollection({
  subcollection,
  subcollectionLabel,
  allReviews,
  subcollectionId,
}: TestimoniosSubcollectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const paginatedReviews = allReviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
        {paginatedReviews.length === 0 ? (
          <p className="text-base-content/70 py-4">No hay testimonios en esta página.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled invisible' : ''}`}
                  aria-label="Página anterior"
                >
                  « Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isActive = page === currentPage;
                    const showPage = shouldShowPage(page, currentPage, totalPages);

                    if (!showPage) {
                      if (shouldShowEllipsis(page, currentPage, totalPages)) {
                        return (
                          <span key={page} className="btn btn-sm btn-disabled">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn btn-sm ${isActive ? 'btn-active' : ''}`}
                        aria-label={`Página ${page}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled invisible' : ''}`}
                  aria-label="Página siguiente"
                >
                  Siguiente »
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
}
