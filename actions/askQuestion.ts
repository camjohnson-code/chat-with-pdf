'use server';

import { Message } from '@/components/Chat';
import { adminDb } from '@/firebaseAdmin';
import { generateLangChainCompletion } from '@/lib/langchain';
import { auth } from '@clerk/nextjs/server';

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
  console.log('Starting askQuestion function');
  const startTime = Date.now();

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

  const userMessage: Message = {
    role: 'human',
    message: question,
    createdAt: new Date(),
  };

  // Add user message and generate AI reply in parallel
  const addUserMessagePromise = chatRef.add(userMessage);
  const generateReplyPromise = generateLangChainCompletion(id, question);

  const [_, reply] = await Promise.all([addUserMessagePromise, generateReplyPromise]);

  const aiMessage: Message = {
    role: 'ai',
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);

  const endTime = Date.now();
  console.log(`askQuestion function took ${endTime - startTime}ms`);

  return { success: true, message: null };
}