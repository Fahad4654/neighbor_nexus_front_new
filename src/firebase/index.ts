'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function initializes Firebase and returns the SDK instances.
// It's safe to call this multiple times, as it will only initialize once.
export function initializeFirebase() {
  if (!getApps().length) {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase configuration is not available. Please check your environment variables and src/firebase/config.ts.");
    }
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}


export function getSdks() {
  // This ensures Firebase is initialized before we try to get the SDKs
  if (!firebaseApp) {
    initializeFirebase();
  }
  return {
    firebaseApp,
    auth,
    firestore,
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