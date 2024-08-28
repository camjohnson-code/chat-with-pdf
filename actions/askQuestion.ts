'use server';

import { Message } from '@/components/Chat';
import { adminDb } from '@/firebaseAdmin';
import { generateLangChainCompletion } from '@/lib/langchain';
import { auth } from '@clerk/nextjs/server';

const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

export async function askQuestion(id: string, question: string) {
  auth().protect();
  const { userId } = await auth();

  const chatRef = adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(id)
    .collection('chat');

  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === 'human'
  );

  const userRef = await adminDb.collection('users').doc(userId!).get();

  if (!userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= FREE_LIMIT)
      return {
        success: false,
        message: `You'll need to upgrade to PRO to ask more than ${FREE_LIMIT} questions! 😢`,
      };
  }

  if (userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= PRO_LIMIT)
      return {
        success: false,
        message: `You've reached the PRO limit of ${PRO_LIMIT} questions per documemnt! 😢`,
      };
  }

  const userMessage: Message = {
    role: 'human',
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Function timed out')), 15000)
  );

  try {
    const reply = await Promise.race([
      generateLangChainCompletion(id, question),
      timeoutPromise,
    ]);

    const aiMessage: Message = {
      role: 'ai',
      message: reply as string,
      createdAt: new Date(),
    };

    await chatRef.add(aiMessage);

    return { success: true, message: null };
  } catch (error) {
    console.error('Error in askQuestion function:', error);

    const errorMessage: Message = {
      role: 'ai',
      message:
        'Sorry, the server took too long to respond. Please try again later.',
      createdAt: new Date(),
    };

    await chatRef.add(errorMessage);

    return { success: false, message: errorMessage.message };
  }
}
