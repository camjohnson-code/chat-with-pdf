import { ChatOpenAI } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import pineconeClient from './pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { PineconeConflictError } from '@pinecone-database/pinecone/dist/errors';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { adminDb } from '@/firebaseAdmin';
import { auth } from '@clerk/nextjs/server';
import { split } from 'postcss/lib/list';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o',
});

export const indexName = 'chat-with-pdf';

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (namespace === null) throw new Error('No namespace value provided.');
  const { namespaces } = await index.describeIndexStats();
  console.log('NAMESPACES:', namespaces);
  return namespaces?.[namespace] !== undefined;
}

export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not found');

  console.log('Fetching the download URL from Firebase');
  const firebaseRef = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;

  if (!downloadUrl) throw new Error('Download URL not found');

  console.log(`Download url fetched successfully: ${downloadUrl}`);
  const response = await fetch(downloadUrl);
  const data = await response.blob();
  console.log('loading pdf document');
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log('Splitting the document into smaller parts');
  const splitter = new RecursiveCharacterTextSplitter();

  const splitDocs = await splitter.splitDocuments(docs);
  console.log('split into parts:', splitDocs.length);

  return splitDocs;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not found');

  let pineconeVectorStore;

  console.log('Generating embeddings for the split documents...');
  const embeddings = new OpenAIEmbeddings();
  const index = await pineconeClient.index(indexName);
  const nameSpaceAlreadyExists = await namespaceExists(index, docId);

  if (nameSpaceAlreadyExists) {
    console.log('Namespace already exists. Use existing embeddings');

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    const splitDocs = await generateDocs(docId);

    console.log(
      `storing the embeddings in the namespace ${docId} in the ${indexName} Pinecone vector store`
    );

    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}

async function fetchMessagesFromDatabase(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('User not found');

  const chats = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', 'desc')
    .get();

  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === 'human'
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  return chatHistory;
}

async function generateLangChainCompletion(docId: string, question: string) {
  console.log('generateLangChainCompletion started');

  let pineconeVectorStore;

  console.log('Calling generateEmbeddingsInPineconeVectorStore');
  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
  if (!pineconeVectorStore) throw new Error('Pinecone vector store not found');
  console.log('Pinecone vector store obtained');

  const retriever = pineconeVectorStore.asRetriever();
  console.log('Retriever created');

  console.log('Fetching chat history from database');
  const chatHistory = await fetchMessagesFromDatabase(docId);
  console.log('Chat history fetched:', chatHistory.length, 'messages');

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation.',
    ],
  ]);
  console.log('History aware prompt created');

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });
  console.log('History aware retriever chain created');

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    ...chatHistory,
    ['user', '{input}'],
  ]);
  console.log('History aware retrieval prompt created');

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });
  console.log('History aware combine docs chain created');

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });
  console.log('Conversational retrieval chain created');

  console.log('Invoking conversational retrieval chain');
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });
  console.log('Conversational retrieval chain invoked');

  console.log('generateLangChainCompletion completed');
  return reply.answer;
}

export {model, generateLangChainCompletion}