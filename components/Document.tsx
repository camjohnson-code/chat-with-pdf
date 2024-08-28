'use client';

import { useRouter } from 'next/navigation';
import byteSize from 'byte-size';
import useSubscription from '@/hooks/useSubscription';
import { useTransition, useState } from 'react';
import { DownloadCloud, Trash2Icon } from 'lucide-react';
import { Button } from './ui/button';
import { deleteDocument } from '@/actions/deleteDocument';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Document = ({
  id,
  name,
  size,
  downloadUrl,
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}) => {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const { hasActiveMembership } = useSubscription();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDocument(id);
    });
  };

  return (
    <div
      className='flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all
  transform hover:scale-105 hover:bg-customPurple hover:text-white cursor-pointer group'
    >
      <div
        className='flex-1'
        onClick={() => {
          router.push(`/dashboard/files/${id}`);
        }}
      >
        <p className='font-semibold line-clamp-2'>{name}</p>
        <p className='text-sm text-gray-500 group-hover:text-customPurple100'>
          {byteSize(size).value} KB
        </p>
      </div>

      {/* actions */}
      <div className='flex space-x-2 justify-end'>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              disabled={isDeleting || !hasActiveMembership}
            >
              <Trash2Icon className='h-6 w-6 text-red-500' />
              {!hasActiveMembership && (
                <span className='text-red-500 ml-2'>PRO Feature</span>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant='outline' asChild>
          <a href={downloadUrl} download>
            <DownloadCloud className='h-6 w-6 text-customPurple' />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Document;
