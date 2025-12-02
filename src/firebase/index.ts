'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase configuration is not available. Please check your environment variables and src/firebase/config.ts.");
        }
        return initializeApp(firebaseConfig);
    } else {
        return getApp();
    }
  }
  return null;
}

// These are now functions that get the instance, ensuring they are called only when needed.
export function getFirebaseAuth(): Auth {
  const app = initializeFirebase();
  if (!app) throw new Error("Firebase not initialized");
  return getAuth(app);
}

export function getFirebaseFirestore(): Firestore {
  const app = initializeFirebase();
  if (!app) throw new Error("Firebase not initialized");
  return getFirestore(app);
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
