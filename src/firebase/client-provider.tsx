'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    try {
      const { firebaseApp, auth, firestore } = initializeFirebase();
      setServices({ app: firebaseApp, auth, firestore });
    } catch (e: any) {
      console.error("Firebase initialization failed:", e);
      setError(e.message || "Failed to initialize Firebase. Check console for details.");
    }
  }, []); // The empty dependency array ensures this runs only once.

  if (error) {
    // Render an error message if initialization fails.
    return <div>Error: {error}</div>;
  }

  if (!services) {
    // Render a loading state or null while Firebase is initializing.
    // This prevents children from trying to use Firebase before it's ready.
    return null; 
  }

  return (
    <FirebaseProvider
      firebaseApp={services.app}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
