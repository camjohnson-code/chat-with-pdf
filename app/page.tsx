import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-customPurple to-customPink'>
      <div className='bg-white py-24 sm:py-32 rounded-md drop-shadow-xl'>
        <div className='flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-3xl sm:text-center'>
            <h2 className='text-base font-semibold text-customPurple leading-7'>
              Your Interactive Document Companion
            </h2>
            <p className='mt-2 text-3xl font-bold tracking-light text-gray-900 sm:text-6xl'>
              Transform your PDFs into Interactive Conversations
            </p>
            <p className='text-gray-600 mt-6 text-lg leading-8'>
              Introducing{' '}
              <span className='font-bold text-customPurple'>
                Chat with PDF.
              </span>
              <br />
              <br />
              Upload your document, and our chatbot will answer your questions,
              summarize content, and answer all your Qs. Ideal for everyone,{' '}
              <span className='text-customPurple'>Chat with PDF</span> turns
              static documents into{' '}
              <span className='font-bold'>dynamic conversations</span>,
              enhancing productivity 10x fold effortlessly.
            </p>
          </div>

          <Button asChild className='mt-10'>
            <Link href='/dashboard'>Get Started</Link>
          </Button>
        </div>

        <div className='relative overflow-hidden pt-16'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <Image
              alt='App screenshot'
              src='https://i.imgur.com/VciRSTI.jpeg'
              width={2432}
              height={1442}
              className='mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10'
            />
            <div aria-hidden='true' className='relative'>
              <div className='absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]' />
            </div>
          </div>
        </div>

        {/* <div className='mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8'>
          <dl className='mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cold-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:fap-x-8 lg:gap-y-16'>
            {features.map(feature => {
              <div className='relative pl-9'>
                <dt className='inline font-semibold text-gray-900'>
                  <feature.icon aria-hidden='true' className='absolute left-1 top-1 h-5 w-5 text-customPurple' />
                </dt>

                <dd>{feature.description}</dd>
              </div>
            })}
          </dl>
        </div> */}
      </div>
    </main>
  );
}
