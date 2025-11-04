'use client'

import { useState } from 'react';
import Button from './components/Button';

export default function Home() {
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    const response = await fetch('/api');
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h1>Home</h1>
      <Button onClick={handleClick}>Chamar API</Button>
      {message && <h2>{message}</h2>}
    </div>
  );
}
