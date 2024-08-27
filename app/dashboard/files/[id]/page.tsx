import Chat from '@/components/Chat';
import PDFView from '@/components/PDFView';
import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';

const ChatToFilePage = async ({
  params: { id },
}: {
  params: {
    id: string;
  };
}) => {
  auth().protect();
  const { userId } = await auth();

  const ref = await adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(id)
    .get();

    const url = ref.data()?.downloadUrl;

  return <div className='grid lg:grid-cols-5 h-full overflow-hidden'>
    {/* right section */}
    <div className='col-span-5 lg:col-span-2 overflow-y-auto'>
      {/* chat */}
      <Chat id={id} />
    </div>

    {/* left */}
    <div className='col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-customPurple lg:-order-1 overflow-auto'>
      <PDFView url={url} />
    </div>

  </div>;
};

export default ChatToFilePage;
