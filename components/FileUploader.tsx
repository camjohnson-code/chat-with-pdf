'use client';

import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from 'lucide-react';
import useUpload, { StatusText } from '@/hooks/useUpload';
import { useRouter } from 'next/navigation';

const FileUploader = () => {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) router.push(`/dashboard/files/${fileId}`);
  }, [fileId, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) await handleUpload(file);
    else {
      // do nothing
      // toast...
    }
  }, [handleUpload]);

  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: (
      <HammerIcon className='h-20 w-20 text-customPurple' />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className='h-20 w-20 text-customPurple' />
    ),
    [StatusText.SAVING]: <SaveIcon className='h-20 w-20 text-customPurple' />,
    [StatusText.GENERATING]: (
      <RocketIcon className='h-20 w-20 text-customPurple animate-bounce' />
    ),
  };

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        'application/pdf': ['.pdf'],
      },
    });

  const uploadInProgress =
    progress !== null && progress >= 0 && progress <= 100;

  return (
    <div className='flex flex-col gap-4 items-center max-w-7xl mx-auto'>
      {uploadInProgress && (
        <div className='mt-32 flex flex-col justify-center items-center gap-5'>
          <div
            className={`radial-progress bg-customPurple100 border-customPurple border-4 ${
              progress === 100 && 'hidden'
            }`}
            role='progresbar'
            style={{
              // @ts-ignore
              '--value': progress,
              '--size': '12rem',
              '--thickness': '1.3rem',
            }}
          >
            {progress}%
          </div>

          {
            //   @ts-ignore
            statusIcons[status!]
          }

          {/* @ts-ignore */}
          <p className='text-customPurple animate-pulse'>{status}</p>
        </div>
      )}

      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`p-10 border-customPurple text-customPurple border-2 border-dashed mt-10 w-[90%] rounded-lg h-96 flex justify-center items-center
            ${
              isFocused || isDragAccept
                ? 'bg-customPurple300'
                : 'bg-customPurple100'
            }`}
        >
          <input {...getInputProps()} />

          <div className='flex flex-col items-center justify-center'>
            {isDragActive ? (
              <>
                <RocketIcon className='h-20 w-20 animate-ping' />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className='h-20 w-10 animate-bounce' />
                <p>Drag and drop some files here, or click to select files</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
