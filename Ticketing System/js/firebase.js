/**
 * firebase.js - Modular Firebase SDK Initialization & Config Management
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Reported Project ID: helpdesk-ticketing-syste-a1b39
 *
 * NOTE: As per architectural guidelines, we never fabricate credentials.
 * If the API key is not yet configured, the app cleanly reports the pending
 * Firebase Console configuration and guides the user.
 */

// Modular Firebase SDK v10 (ESM via official Google CDN for bundlerless execution)
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Default configuration template with the user's reported project ID
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCxF2d4ftJ0i50P24G40d-RRokSzCo-SbY",
  authDomain: "helpdesk-ticketing-syste-a1b39.firebaseapp.com",
  projectId: "helpdesk-ticketing-syste-a1b39",
  storageBucket: "helpdesk-ticketing-syste-a1b39.firebasestorage.app",
  messagingSenderId: "728641685459",
  appId: "1:728641685459:web:34249b81c72c8a00661126",
  measurementId: "G-RM0471Z1MB"
};

const STORAGE_KEY = 'bit_helpdesk_firebase_config';

/**
 * Retrieves the active Firebase configuration.
 * Checks localStorage first (in case administrator pasted it into the setup UI),
 * then window.__FIREBASE_CONFIG__, then DEFAULT_FIREBASE_CONFIG.
 */
export function getActiveFirebaseConfig() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY") {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read saved firebase config:', e);
  }

  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ && window.__FIREBASE_CONFIG__.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY") {
    return window.__FIREBASE_CONFIG__;
  }

  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Saves a new Firebase config from the configuration helper modal
 */
export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('Invalid Firebase configuration object.');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Checks if a real, valid Firebase config has been supplied and active for the environment.
 * In browser: uses live Firebase with the configured credentials.
 * In Node.js unit tests: defaults to simulator to avoid unauthenticated permission-denied errors.
 */
export function isFirebaseConfigured() {
  if (typeof window === 'undefined') {
    return Boolean(typeof process !== 'undefined' && process.env && process.env.FORCE_LIVE_FIRESTORE === 'true');
  }

  if (window.__USE_FIREBASE_SIMULATOR__ === true) {
    return false;
  }

  const config = getActiveFirebaseConfig();
  return Boolean(
    config &&
    config.apiKey &&
    config.apiKey !== "REPLACE_WITH_YOUR_FIREBASE_API_KEY" &&
    config.projectId === "helpdesk-ticketing-syste-a1b39"
  );
}

// Global Firebase instance references
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let googleProvider = null;

/**
 * Initializes Firebase App and services if config is valid.
 */
export function initFirebase() {
  const config = getActiveFirebaseConfig();

  if (!isFirebaseConfigured()) {
    console.info(
      '%c[BIT Helpdesk] Firebase configuration pending.',
      'color: #2563eb; font-weight: bold;',
      'Please register your web app in Firebase Console for project: helpdesk-ticketing-syste-a1b39'
    );
    return {
      app: null,
      auth: null,
      db: null,
      provider: null,
      configured: false
    };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      hd: 'bitsathy.ac.in', // prompt institutional domain in Google login
      prompt: 'select_account'
    });

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      provider: googleProvider,
      configured: true
    };
  } catch (err) {
    console.error('[BIT Helpdesk] Failed to initialize Firebase:', err);
    return {
      app: null,
      auth: null,
      db: null,
      provider: null,
      configured: false,
      error: err.message
    };
  }
}

// Auto initialize on module load
const initialized = initFirebase();
export const app = initialized.app;
export const auth = initialized.auth;
export const db = initialized.db;
export const provider = initialized.provider;

// Re-export SDK primitives for clean consumption in service modules
export {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
};
