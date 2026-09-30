import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../config/firebaseConfig';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native AsyncStorage persistence
let auth: Auth;
try {
  // Require at runtime to leverage Metro React Native entry point for persistence
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authModule = require('firebase/auth');
  if (typeof authModule.getReactNativePersistence === 'function') {
    auth = authModule.initializeAuth(app, {
      persistence: authModule.getReactNativePersistence(AsyncStorage),
    });
  } else {
    auth = getAuth(app);
  }
} catch {
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db: Firestore = getFirestore(app);

// Initialize Realtime Database
const realtimeDb: Database = getDatabase(app);

export { app, auth, db, realtimeDb };
