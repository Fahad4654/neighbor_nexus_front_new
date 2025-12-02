'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // This should not happen if called correctly from a client component effect
    throw new Error("Firebase must be initialized on the client side.");
  }
  
  if (getApps().length > 0) {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { firebaseApp: app, auth, firestore };
  }

  if (!firebaseConfig.apiKey) {
      throw new Error("Firebase configuration is not available. Please check your environment variables and src/firebase/config.ts.");
  }

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
