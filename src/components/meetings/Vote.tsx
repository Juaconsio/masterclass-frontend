import CardsContainer from '@components/UI/CardsContainer';
import React from 'react';
import Card from '@components/UI/Card';

type FormData = {
  nombre: string;
  email: string;
};

const mettings = [
  {
    title: 'Clase 1',
    description: 'Martes 19:00',
    tags: [
      { name: 'Algebra', color: 'badge-accent' },
      { name: 'Prof. Juan Soto', color: 'badge-warning' },
    ],
  },
  {
    title: 'Clase 1',
    description: 'Miercoles 14:00',
    tags: [
      { name: 'Algebra', color: 'badge-info' },
      { name: 'Prof. Juan Soto', color: 'badge-warning' },
    ],
  },
  {
    title: 'Clase 1',
    description: 'Martes 14:00',
    tags: [
      { name: 'Algebra', color: 'badge-accent' },
      { name: 'Prof. Juan Soto', color: 'badge-primary' },
    ],
  },
];

const fakeSubmit = async (data: FormData) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 1000));
};

const Vote: React.FC = () => {
  const course = null;

  return (
    <div className="mx-auto max-w-xl p-6">
      <h2 className="mb-4 text-2xl font-bold">Inscribirse a una clase</h2>
      <CardsContainer titleSection={'Cursos inscritos'} />
      {/* Cards de clases */}
      <div className="flex w-full flex-wrap gap-6 py-4">
        {mettings.map(({ title, description, tags }) => (
          <Card title={title} description={description} tags={tags} />
        ))}
      </div>
    </div>
  );
};

export default Vote;
