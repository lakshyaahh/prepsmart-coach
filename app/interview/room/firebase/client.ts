import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCgeaggtjyjvhAnctisqF0PFSkKj6f6ZJg',
  authDomain: 'prepsmart-68849.firebaseapp.com',
  projectId: 'prepsmart-68849',
  storageBucket: 'prepsmart-68849.firebasestorage.app',
  messagingSenderId: '447568244898',
  appId: '1:447568244898:web:71c0d4608bc8abe047e7fb',
  measurementId: 'G-2GJ06TL7EB',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;