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
