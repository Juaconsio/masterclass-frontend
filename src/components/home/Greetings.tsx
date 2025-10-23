import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getGreeting } from '../../lib/greetings';

const Greetings: React.FC = () => {
  const greeting = getGreeting();
  return <h1 className="mb-2 text-2xl font-bold">{greeting}</h1>;
};

export default Greetings;
