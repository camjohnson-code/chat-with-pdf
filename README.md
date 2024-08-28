# Chat With PDF

![Chat With PDF](https://www.chatwithpdf.dev/_next/image?url=https%3A%2F%2Fi.imgur.com%2FrZHmWT0.jpeg&w=3840&q=75)

**Chat With PDF** is an AI-powered web application that allows users to upload PDF documents to their account and interact with an AI chatbot to ask questions about the content of the PDF. Whether you need to extract specific information, summarize sections, or understand complex documents, Chat With PDF makes it easy to get answers quickly.

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Future Improvements](#future-improvements)

## Features
- **Upload PDFs**: Securely upload and store PDF documents in your account.
- **AI Chatbot**: Interact with an AI chatbot trained to understand and extract information from your uploaded PDFs.
- **Real-time Interaction**: Get instant responses to your queries about the PDF content.
- **Account Management**: Register, log in, and manage your uploaded documents easily.
- **Data Privacy**: All uploaded documents are stored securely with strict access control.

## Demo
Check out a live demo of Chat With PDF [here](https://www.chatwithpdf.dev/).

## Usage
- **Sign Up / Log In**: Create an account or log in to your existing account.
- **Upload PDF**: Upload the PDF you want to interact with.
- **Chat with AI**: Use the chat interface to ask questions about the PDF content.
- **Manage Documents**: Access and manage your uploaded documents from your account dashboard.

## Technologies Used
- **Frontend**: React, Next.js, Tailwind CSS, DaisyUI, ShadCN
- **Backend**: Serverless architecture using Next.js API routes on Vercel
- **Database**: Firestore (Firebase)
- **Storage**: Firebase Storage
- **Authentication**: Clerk authentication
- **AI Integration**: OpenAI GPT-4 for NLP, Pinecone for vector embeddings
- **Payments**: Stripe for subscription management
- **TypeScript**: Used throughout the stack for type safety

## Future Improvements
- **Server-side enhancements**: Currently, there are some bugs with the chatbot taking too long and timing out. The source of the bug is known, but further debugging is needed to improve efficiencies.
- **File Controls**: Giving users the ability to upload additional file types is a high-priority issue.
- **Further AI Enhancements**: Eventually, I'd love to build out additional tools under this SAAS umbrella. One on my mind is an AI image enhancer for enhancing and colorizing old photos.
