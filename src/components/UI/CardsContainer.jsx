import React, { useEffect, useState } from 'react';
import Card from './Card.jsx';

// Simulación de request (puedes reemplazar por fetch real)
const fetchCardsInfo = async () => {
  // Aquí iría tu request real, por ejemplo fetch('/api/cards')
  return [
    {
      title: 'Agenda tu clase',
      description:
        'Reserva tu espacio en nuestras clases en línea y asegura tu lugar en el aprendizaje.',
      tags: [
        { name: 'Reserva', color: 'badge-primary' },
        { name: 'Clases', color: 'badge-secondary' },
      ],
    },
    {
      title: 'Explora cursos',
      description: 'Descubre una variedad de cursos en línea y encuentra el adecuado para ti.',
      tags: [
        { name: 'Explorar', color: 'badge-accent' },
        { name: 'Cursos', color: 'badge-warning' },
      ],
    },
    {
      title: 'Pagos',
      description:
        'Accede a tu historial de pagos y gestiona tus métodos de pago de manera segura.',
      tags: [
        { name: 'Pagos', color: 'badge-success' },
        { name: 'Seguridad', color: 'badge-info' },
      ],
    },
  ];
};

export default function CardsContainer({ titleSection }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCardsInfo().then(setCards);
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">{titleSection}</h2>
      <div className="flex flex-row gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} {...card} />
        ))}
      </div>
    </section>
  );
}
