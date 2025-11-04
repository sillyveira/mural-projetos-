import { ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button className='bg-red-400 outline-1 hover:bg-red-500' onClick={onClick}>
      {children}
    </button>
  );
}
