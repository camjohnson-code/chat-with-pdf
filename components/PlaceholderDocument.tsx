'use client';

import { PlusCircleIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const PlaceholderDocument = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/upload');
  };

  return (
    <Button
      onClick={handleClick}
      className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400'
    >
      <PlusCircleIcon className='h-12 w-12 mb-2' />
      <p>Add a document</p>
    </Button>
  );
};

export default PlaceholderDocument;
