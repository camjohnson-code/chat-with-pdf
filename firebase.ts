import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA8FiFG5nkPVx-hEEq6h-tsaorbY5y9viM',
  authDomain: 'chat-with-pdf-ccaff.firebaseapp.com',
  projectId: 'chat-with-pdf-ccaff',
  storageBucket: 'chat-with-pdf-ccaff.appspot.com',
  messagingSenderId: '800097431667',
  appId: '1:800097431667:web:9f3747bcbfc993dd72ba06',
  measurementId: 'G-SWMFK4G2EY',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
