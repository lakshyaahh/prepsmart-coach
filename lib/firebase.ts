import { initializeApp, FirebaseOptions, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

/**
 * Utility function to clean the Firebase config object by removing undefined values.
 * This prevents Firebase from failing initialization if optional env vars are missing.
 */
function cleanConfig(config: Record<string, any>): FirebaseOptions {
  return Object.keys(config).reduce((acc, key) => {
    // Only include the key if the value is defined (not null or undefined)
    if (config[key] !== undefined && config[key] !== null) {
      (acc as any)[key] = config[key];
    }
    return acc;
  }, {} as FirebaseOptions);
}

// All keys are loaded from environment variables (set in .env.local and Vercel)
// NEXT_PUBLIC_ is essential for client-side variables in Next.js
const rawFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Use the cleanConfig function to ensure no 'undefined' values are passed to initializeApp
const firebaseConfig = cleanConfig(rawFirebaseConfig);

let app: FirebaseApp | null = null;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;

// Use the standard check for app existence (getApps().length) to avoid initialization errors
// in Next.js Hot Module Replacement (HMR) and prevent type confusion for the compiler.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    if (getApps().length) {
        // App already initialized (e.g., during HMR), retrieve the default instance
        app = getApp();
    } else {
        // Initialize the app
        app = initializeApp(firebaseConfig);
    }
    
    // Initialize services only if the app was successfully retrieved or created
    if (app) {
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
        storageInstance = getStorage(app);
    }

} else {
    console.warn("Firebase App not initialized: Missing required NEXT_PUBLIC environment variables (apiKey or projectId).");
}

// Export the instances, ensuring they are typed correctly for consumers.
// They will be undefined if initialization failed, and consumers must handle this possibility.
export const auth = authInstance as Auth | undefined;
export const db = dbInstance as Firestore | undefined;
export const storage = storageInstance as FirebaseStorage | undefined;

export default app;