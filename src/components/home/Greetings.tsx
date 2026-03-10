import React, { useMemo } from 'react';
import { getGreeting } from '../../lib/greetings';

const Greetings: React.FC<{ name: string }> = ({ name }) => {
  const greeting = useMemo(() => getGreeting(name ?? ''), [name]);
  return <h1 className="text-primary text-2xl font-bold">{greeting}</h1>;
};

export default Greetings;
