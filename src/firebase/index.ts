'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }
  
  // When deployed to App Hosting, process.env.FIREBASE_CONFIG is automatically populated
  // and is the recommended way to initialize.
  if (process.env.FIREBASE_CONFIG) {
      try {
        const firebaseConfigFromEnv = JSON.parse(process.env.FIREBASE_CONFIG);
        return getSdks(initializeApp(firebaseConfigFromEnv));
      } catch (e) {
        console.error("Failed to parse FIREBASE_CONFIG", e);
      }
  }
  
  // For local development, fall back to using the manually provided config
  // from src/firebase/config.ts which uses NEXT_PUBLIC_ variables.
  // This is also a valid way to initialize, but FIREBASE_CONFIG is preferred for App Hosting.
  if (firebaseConfig.apiKey) {
    return getSdks(initializeApp(firebaseConfig));
  }

  // If neither are available, we can't initialize.
  throw new Error("Firebase configuration is not available. Please check your environment variables.");
}


export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';