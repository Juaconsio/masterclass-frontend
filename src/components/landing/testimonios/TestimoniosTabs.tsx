import { useState } from 'react';
import TestimoniosSubcollection from './TestimoniosSubcollection';

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

interface SubcollectionData {
  subcollection: string;
  subcollectionLabel: string;
  subcollectionId: string;
  reviews: Review[];
}

interface TestimoniosTabsProps {
  subcollections: SubcollectionData[];
}

export default function TestimoniosTabs({ subcollections }: TestimoniosTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (subcollections.length === 0) {
    return (
      <div className="card shadow-xl">
        <div className="card-body items-center text-center">
          <div className="text-6xl">💬</div>
          <h2 className="card-title">Aún no hay testimonios</h2>
          <p className="text-base-content/70">
            Vuelve pronto para ver las experiencias de nuestros estudiantes.
          </p>
        </div>
      </div>
    );
  }

  const activeSubcollection = subcollections[activeTab];

  return (
    <div className="container mx-auto px-4">
      <div role="tablist" className="tabs tabs-border mb-6 [&_.tab:not(.tab-active)]:text-primary-content/60 [&_.tab:not(.tab-active):hover]:text-primary-content/80 [&_.tab:is
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      (.tab-active):hover]:text-primary-content/80">
        {subcollections.map(({ subcollectionLabel, reviews }, index) => (
          <button
            role="tab"
            key={index}
            className={`tab ${activeTab === index ? 'tab-active text-primary-content' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {subcollectionLabel} ({reviews.length})
          </button>
        ))}
      </div>

      {activeSubcollection && (
        <TestimoniosSubcollection
          key={activeSubcollection.subcollectionId}
          subcollection={activeSubcollection.subcollection}
          subcollectionLabel={activeSubcollection.subcollectionLabel}
          allReviews={activeSubcollection.reviews}
          subcollectionId={activeSubcollection.subcollectionId}
        />
      )}
    </div>
  );
}
