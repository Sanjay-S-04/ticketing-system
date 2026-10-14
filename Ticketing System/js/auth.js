/**
 * auth.js - Institutional Authentication & Role Enforcement
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Enforces @bitsathy.ac.in domain, manages user profiles in Firestore,
 * and guards protected routes.
 */

import {
  auth,
  db,
  provider,
  isFirebaseConfigured,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from './firebase.js';

import { INSTITUTION, USER_ROLES } from './data.js';

const LOCAL_USER_KEY = 'bit_helpdesk_active_user';

/**
 * Normalizes email address for consistent validation
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Checks whether an email belongs to the institutional domain @bitsathy.ac.in
 */
export function isInstitutionalEmail(email) {
  const norm = normalizeEmail(email);
  return norm.endsWith(INSTITUTION.allowedDomain);
}

/**
 * Gets currently signed-in user profile from session or local state
 */
export function getCurrentUserProfile() {
  try {
    const raw = sessionStorage.getItem(LOCAL_USER_KEY) || localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Persists user profile in session storage
 */
export function setCurrentUserProfile(profile) {
  if (!profile) {
    sessionStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_USER_KEY);
  } else {
    sessionStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  }
}

/**
 * Fetches user profile document from Firestore `users/{uid}`,
 * or creates initial student record if this is their first login.
 */
export async function getOrCreateUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  const email = normalizeEmail(firebaseUser.email);
  if (!isInstitutionalEmail(email)) {
    throw new Error(`Unauthorized domain. Only verified ${INSTITUTION.allowedDomain} accounts are permitted.`);
  }

  // If live Firestore is available
  if (db && isFirebaseConfigured()) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const profile = {
          uid: firebaseUser.uid,
          email: data.email || email,
          displayName: data.displayName || firebaseUser.displayName || email.split('@')[0],
          photoURL: firebaseUser.photoURL || null,
          role: data.role || USER_ROLES.STUDENT,
          departmentId: data.departmentId || null,
          active: data.active !== undefined ? data.active : true,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        };
        setCurrentUserProfile(profile);
        return profile;
      } else {
        // Initial registration as student
        const newProfile = {
          email,
          displayName: firebaseUser.displayName || email.split('@')[0],
          role: USER_ROLES.STUDENT,
          departmentId: null,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, newProfile);

        const profile = {
          uid: firebaseUser.uid,
          email,
          displayName: newProfile.displayName,
          photoURL: firebaseUser.photoURL || null,
          role: USER_ROLES.STUDENT,
          departmentId: null,
          active: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUserProfile(profile);
        return profile;
      }
    } catch (err) {
      console.error('[auth.js] Error fetching/creating user doc from Firestore:', err);
      throw err;
    }
  }

  // Fallback if running in local simulator mode
  let existing = getCurrentUserProfile();
  if (existing && existing.uid === firebaseUser.uid) {
    return existing;
  }

  const simulatedProfile = {
    uid: firebaseUser.uid,
    email,
    displayName: firebaseUser.displayName || email.split('@')[0],
    photoURL: firebaseUser.photoURL || null,
    role: USER_ROLES.STUDENT,
    departmentId: null,
    active: true,
    createdAt: new Date().toISOString()
  };
  setCurrentUserProfile(simulatedProfile);
  return simulatedProfile;
}

/**
 * Initiates Google Sign-In with institutional domain check
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured() || !auth || !provider) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const email = normalizeEmail(user.email);

    if (!isInstitutionalEmail(email)) {
      await signOut(auth);
      setCurrentUserProfile(null);
      throw new Error(`Access Denied: ${email} is not an authorized BIT Sathy institutional account (${INSTITUTION.allowedDomain}).`);
    }

    const profile = await getOrCreateUserProfile(user);
    return profile;
  } catch (error) {
    console.error('[auth.js] Sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed before completing authentication.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Google sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network communication error. Please check your internet connection.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in request was cancelled. Another authentication request was started.');
    }
    throw error;
  }
}

/**
 * Signs out active user and clears profile
 */
export async function logoutUser() {
  try {
    if (auth && isFirebaseConfigured()) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn('Error during firebase signOut:', e);
  } finally {
    setCurrentUserProfile(null);
    window.location.href = 'login.html';
  }
}

/**
 * Routes user to their appropriate dashboard based on their role
 */
export function redirectByRole(profile) {
  if (!profile || !profile.role) {
    window.location.href = 'login.html';
    return;
  }

  if (!profile.active) {
    window.location.href = 'login.html?error=account_deactivated';
    return;
  }

  switch (profile.role) {
    case USER_ROLES.ADMIN:
      window.location.href = 'admin-dashboard.html';
      break;
    case USER_ROLES.DEPARTMENT:
      window.location.href = 'department-dashboard.html';
      break;
    case USER_ROLES.STUDENT:
      window.location.href = 'student-dashboard.html';
      break;
    case USER_ROLES.PENDING:
      window.location.href = 'pending-authorization.html';
      break;
    default:
      window.location.href = 'student-dashboard.html';
  }
}

/**
 * Guards a page: checks if current user is authenticated and possesses the required role.
 * If unauthorized, redirects to login.html or appropriate dashboard.
 *
 * @param {string} requiredRole - 'student' | 'department' | 'admin' | null (any authenticated)
 * @returns {Object|null} Authorized user profile or null (if redirecting)
 */
export function protectPage(requiredRole = null) {
  const profile = getCurrentUserProfile();

  if (!profile || !profile.email) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `login.html?redirect=${returnUrl}`;
    return null;
  }

  if (!isInstitutionalEmail(profile.email)) {
    logoutUser();
    return null;
  }

  if (!profile.active) {
    window.location.href = 'login.html?error=account_deactivated';
    return null;
  }

  if (profile.role === USER_ROLES.PENDING) {
    window.location.href = 'pending-authorization.html';
    return null;
  }

  if (requiredRole && profile.role !== requiredRole && profile.role !== USER_ROLES.ADMIN) {
    // If not matching required role (and not an admin who can access all), redirect to their proper dashboard
    redirectByRole(profile);
    return null;
  }

  return profile;
}

/**
 * Sets up Firebase Auth listener to keep state synchronized across page loads
 */
export function initAuthListener(onUserChange) {
  if (auth && isFirebaseConfigured()) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getOrCreateUserProfile(user);
          if (onUserChange) onUserChange(profile);
        } catch (err) {
          console.error('[auth.js] Error in onAuthStateChanged:', err);
          if (onUserChange) onUserChange(null, err);
        }
      } else {
        const active = getCurrentUserProfile();
        if (active && active.uid && active.uid.startsWith('demo_')) {
          if (onUserChange) onUserChange(active);
        } else {
          setCurrentUserProfile(null);
          if (onUserChange) onUserChange(null);
        }
      }
    });
  } else {
    // When in local/simulator mode, check stored profile
    const profile = getCurrentUserProfile();
    if (onUserChange) onUserChange(profile);
  }
}

/**
 * Developer helper for testing environments before Firebase Console keys are placed.
 * Allows switching demo institutional personas (@bitsathy.ac.in).
 */
export function switchDemoPersona(role, departmentId = null) {
  const personas = {
    student: {
      uid: 'demo_student_21cs',
      email: 'sanjay.cs22@bitsathy.ac.in',
      displayName: 'Sanjay S (Student - CSE)',
      role: USER_ROLES.STUDENT,
      departmentId: null,
      active: true,
      createdAt: new Date().toISOString()
    },
    department_nmc: {
      uid: 'demo_staff_nmc',
      email: 'staff.nmc@bitsathy.ac.in',
      displayName: 'Karthik R (NMC Tech Lead)',
      role: USER_ROLES.DEPARTMENT,
      departmentId: 'NMC',
      active: true,
      createdAt: new Date().toISOString()
    },
    department_ps: {
      uid: 'demo_staff_ps',
      email: 'staff.ps@bitsathy.ac.in',
      displayName: 'Priya M (PS Affairs Officer)',
      role: USER_ROLES.DEPARTMENT,
      departmentId: 'PS',
      active: true,
      createdAt: new Date().toISOString()
    },
    department_coe: {
      uid: 'demo_staff_coe',
      email: 'staff.coe@bitsathy.ac.in',
      displayName: 'Dr. Ramesh K (COE Superintendent)',
      role: USER_ROLES.DEPARTMENT,
      departmentId: 'COE',
      active: true,
      createdAt: new Date().toISOString()
    },
    department_academics: {
      uid: 'demo_staff_academics',
      email: 'staff.academics@bitsathy.ac.in',
      displayName: 'Prof. Anitha S (Academic Coordinator)',
      role: USER_ROLES.DEPARTMENT,
      departmentId: 'Office Academics',
      active: true,
      createdAt: new Date().toISOString()
    },
    admin: {
      uid: 'demo_sysadmin_bit',
      email: 'admin.helpdesk@bitsathy.ac.in',
      displayName: 'Chief Technology Officer (BIT Admin)',
      role: USER_ROLES.ADMIN,
      departmentId: null,
      active: true,
      createdAt: new Date().toISOString()
    }
  };

  const key = departmentId ? `department_${departmentId.toLowerCase().replace(/[^a-z]/g, '')}` : role;
  const chosen = personas[key] || personas[role] || personas.student;
  setCurrentUserProfile(chosen);
  return chosen;
}
