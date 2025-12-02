'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, getFirebaseAuth, getFirebaseFirestore } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// By initializing here, inside a 'use client' component, we ensure this code
// only runs on the client where the environment variables are available.
const firebaseApp = initializeFirebase();

// We only proceed if Firebase initialized successfully.
const auth = firebaseApp ? getFirebaseAuth() : null;
const firestore = firebaseApp ? getFirebaseFirestore() : null;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {

  // We must handle the case where Firebase fails to initialize.
  if (!firebaseApp || !auth || !firestore) {
    // This could be a more user-friendly error screen
    return <div>Error: Could not initialize Firebase. Please check your configuration.</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
