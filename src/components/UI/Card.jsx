// Dumb Card component for display
import React from 'react';

export default function Card({ title, description, tags }) {
  return (
    <div className="card bg-base-200 hover:shadow-accent/10 shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <div>
          {tags.map((tag, idx) => (
            <div key={idx} className={`badge ${tag.color} mr-2`}>
              {tag.name}
            </div>
          ))}
        </div>
        <p>{description}</p>
      </div>
    </div>
  );
}
