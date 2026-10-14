/**
 * ticket-service.js - Firestore Ticket & Audit Data Management
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Implements full CRUD, subcollection audit timelines, comments,
 * and role-based queries. Supports both live Cloud Firestore and local
 * verified simulator for evaluation personas and pre-console developer testing.
 */

import {
  auth,
  db,
  isFirebaseConfigured,
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
} from './firebase.js';

import { TICKET_STATUS, DEPARTMENTS, normalizeDepartmentId, getAllowedTransitions } from './data.js';

const LOCAL_TICKETS_KEY = 'bit_helpdesk_tickets_store';
const LOCAL_USERS_KEY = 'bit_helpdesk_users_store';

/**
 * Generates an institutional ticket number, e.g. BIT-2026-0842
 */
export function generateTicketNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BIT-${year}-${randomSuffix}`;
}

/**
 * Determines whether operations should be executed against live Cloud Firestore.
 * Requires:
 *  - Running in browser (unless FORCE_LIVE_FIRESTORE is enabled in Node)
 *  - Firebase configured with valid project ID & credentials
 *  - Active Firebase Auth session (auth.currentUser)
 *  - User profile is not an evaluation/demo persona (starts with 'demo_')
 *  - User profile UID matches the active authenticated Firebase user
 */
export function isLiveFirestoreActive(userProfile = null) {
  if (typeof window === 'undefined') {
    return Boolean(typeof process !== 'undefined' && process.env && process.env.FORCE_LIVE_FIRESTORE === 'true');
  }

  if (window.__USE_FIREBASE_SIMULATOR__ === true) {
    return false;
  }

  // If userProfile is explicitly an evaluation persona or demo ID
  if (userProfile) {
    const uid = typeof userProfile === 'object' ? userProfile.uid : userProfile;
    if (typeof uid === 'string' && uid.startsWith('demo_')) {
      return false;
    }
  }

  // If no userProfile passed, check if active session is a demo persona
  if (!userProfile) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('bit_helpdesk_active_user');
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored && stored.uid && String(stored.uid).startsWith('demo_')) {
            return false;
          }
        }
      }
    } catch (e) {}
  }

  // Live Firestore requires active authenticated Firebase user
  if (!db || !isFirebaseConfigured() || !auth || !auth.currentUser) {
    return false;
  }

  // If userProfile provided, verify it matches the active Firebase Auth user
  if (userProfile) {
    const uid = typeof userProfile === 'object' ? userProfile.uid : userProfile;
    if (uid && auth.currentUser.uid !== uid) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Local Simulator Storage Helpers (used when Firebase keys are pending in console)
// ---------------------------------------------------------------------------
let memoryTicketsStore = [];
let memoryUsersStore = null;

function getInitialSeedTickets() {
  const now = new Date();
  const isoTime = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString();

  return [
    {
      id: 'ticket_seed_01',
      ticketNumber: 'BIT-2026-1042',
      title: 'Hostel Wi-Fi access point rebooting in C-Block corridor',
      description: 'The Wi-Fi access point on the 2nd floor corridor of C-Block keeps disconnecting students every 15 minutes.',
      userId: 'demo_student_21cs',
      userEmail: 'sanjay.cs22@bitsathy.ac.in',
      userDisplayName: 'Sanjay S',
      category: 'Wi-Fi and LAN connectivity issues',
      departmentId: 'NMC',
      classificationMethod: 'rule-based-keyword-v1',
      matchedKeywords: ['wi-fi', 'disconnect'],
      requiresManualReview: false,
      status: 'IN_PROGRESS',
      assignedTo: 'demo_staff_nmc',
      resolutionNotes: null,
      createdAt: isoTime(120),
      updatedAt: isoTime(30),
      comments: [
        {
          id: 'cm_seed_01',
          senderUid: 'demo_staff_nmc',
          senderDisplayName: 'Karthik R (NMC)',
          senderRole: 'department',
          body: 'We have dispatched a technician to inspect the PoE switch on C-Block 2nd floor.',
          timestamp: isoTime(30)
        }
      ],
      timeline: [
        {
          id: 'tl_seed_02',
          action: 'STATUS_CHANGE',
          actorUid: 'demo_staff_nmc',
          actorDisplayName: 'Karthik R (NMC)',
          previousStatus: 'OPEN',
          newStatus: 'IN_PROGRESS',
          details: 'Status changed to IN_PROGRESS',
          timestamp: isoTime(30)
        },
        {
          id: 'tl_seed_01',
          action: 'CREATED',
          actorUid: 'demo_student_21cs',
          actorDisplayName: 'Sanjay S',
          previousStatus: null,
          newStatus: 'OPEN',
          details: 'Ticket filed with suggested department: NMC (Wi-Fi and LAN connectivity issues)',
          timestamp: isoTime(120)
        }
      ]
    },
    {
      id: 'ticket_seed_02',
      ticketNumber: 'BIT-2026-1043',
      title: 'End semester exam result portal page timeout',
      description: 'CAMU student portal gives 504 Gateway Timeout when viewing 4th semester revaluation results.',
      userId: 'demo_student_21cs',
      userEmail: 'sanjay.cs22@bitsathy.ac.in',
      userDisplayName: 'Sanjay S',
      category: 'CAMU Portal Access',
      departmentId: 'COE',
      classificationMethod: 'rule-based-keyword-v1',
      matchedKeywords: ['portal', 'result', 'timeout'],
      requiresManualReview: false,
      status: 'OPEN',
      assignedTo: null,
      resolutionNotes: null,
      createdAt: isoTime(80),
      updatedAt: isoTime(80),
      comments: [],
      timeline: [
        {
          id: 'tl_seed_03',
          action: 'CREATED',
          actorUid: 'demo_student_21cs',
          actorDisplayName: 'Sanjay S',
          previousStatus: null,
          newStatus: 'OPEN',
          details: 'Ticket filed with suggested department: COE (CAMU Portal Access)',
          timestamp: isoTime(80)
        }
      ]
    },
    {
      id: 'ticket_seed_03',
      ticketNumber: 'BIT-2026-1044',
      title: 'Water filter maintenance required in D-Block ground floor',
      description: 'The drinking water cooler near the south wing elevator is dispensing warm water and filter indicator is red.',
      userId: 'student_vikram_23ee',
      userEmail: 'vikram.ee23@bitsathy.ac.in',
      userDisplayName: 'Vikram R',
      category: 'Hostel Maintenance',
      departmentId: 'PS',
      classificationMethod: 'rule-based-keyword-v1',
      matchedKeywords: ['water', 'cooler'],
      requiresManualReview: false,
      status: 'OPEN',
      assignedTo: null,
      resolutionNotes: null,
      createdAt: isoTime(45),
      updatedAt: isoTime(45),
      comments: [],
      timeline: [
        {
          id: 'tl_seed_04',
          action: 'CREATED',
          actorUid: 'student_vikram_23ee',
          actorDisplayName: 'Vikram R',
          previousStatus: null,
          newStatus: 'OPEN',
          details: 'Ticket filed with suggested department: PS (Hostel Maintenance)',
          timestamp: isoTime(45)
        }
      ]
    },
    {
      id: 'ticket_seed_04',
      ticketNumber: 'BIT-2026-1045',
      title: 'Attendance condonation letter approval pending',
      description: 'Medical certificate for 3 days hospitalization submitted to HOD office, need attendance shortage condonation updated in portal.',
      userId: 'student_meera_22it',
      userEmail: 'meera.it22@bitsathy.ac.in',
      userDisplayName: 'Meera K',
      category: 'Attendance & Leave Condonation',
      departmentId: 'Office Academics',
      classificationMethod: 'rule-based-keyword-v1',
      matchedKeywords: ['attendance', 'condonation'],
      requiresManualReview: false,
      status: 'RESOLVED',
      assignedTo: 'demo_staff_academics',
      resolutionNotes: 'Medical certificates verified and 8% attendance condonation granted in academic portal.',
      createdAt: isoTime(360),
      updatedAt: isoTime(60),
      comments: [
        {
          id: 'cm_seed_02',
          senderUid: 'demo_staff_academics',
          senderDisplayName: 'Prof. Anitha S (Academics)',
          senderRole: 'department',
          body: 'Verified hospital discharge summary. Condonation approved.',
          timestamp: isoTime(60)
        }
      ],
      timeline: [
        {
          id: 'tl_seed_06',
          action: 'RESOLVED',
          actorUid: 'demo_staff_academics',
          actorDisplayName: 'Prof. Anitha S (Academics)',
          previousStatus: 'IN_PROGRESS',
          newStatus: 'RESOLVED',
          details: 'Status changed to RESOLVED. Note: Medical certificates verified and 8% attendance condonation granted in academic portal.',
          timestamp: isoTime(60)
        },
        {
          id: 'tl_seed_05',
          action: 'CREATED',
          actorUid: 'student_meera_22it',
          actorDisplayName: 'Meera K',
          previousStatus: null,
          newStatus: 'OPEN',
          details: 'Ticket filed with suggested department: Office Academics',
          timestamp: isoTime(360)
        }
      ]
    },
    {
      id: 'ticket_seed_05',
      ticketNumber: 'BIT-2026-1046',
      title: 'Inter-disciplinary inquiry regarding drone project lab permission',
      description: 'Need permission from both physical safety and mechanical workshop for nocturnal outdoor drone flight testing.',
      userId: 'student_arun_22me',
      userEmail: 'arun.me22@bitsathy.ac.in',
      userDisplayName: 'Arun M',
      category: 'General',
      departmentId: 'manual-review',
      classificationMethod: 'fallback-manual-review',
      matchedKeywords: [],
      requiresManualReview: true,
      status: 'OPEN',
      assignedTo: null,
      resolutionNotes: null,
      createdAt: isoTime(15),
      updatedAt: isoTime(15),
      comments: [],
      timeline: [
        {
          id: 'tl_seed_07',
          action: 'CREATED',
          actorUid: 'student_arun_22me',
          actorDisplayName: 'Arun M',
          previousStatus: null,
          newStatus: 'OPEN',
          details: 'Ticket flagged for Admin Manual Review triage (cross-department / ambiguous keywords).',
          timestamp: isoTime(15)
        }
      ]
    }
  ];
}

function getLocalStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_TICKETS_KEY);
      if (raw) return JSON.parse(raw);
      const initial = getInitialSeedTickets();
      localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(initial));
      return initial;
    }
  } catch (e) {}
  return memoryTicketsStore;
}

function notifyDataChanged() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('bit_helpdesk_data_changed'));
  }
}

function saveLocalStore(tickets) {
  memoryTicketsStore = tickets;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_TICKETS_KEY, JSON.stringify(tickets));
    }
  } catch (e) {
    console.error('Failed to save to local ticket store:', e);
  }
  notifyDataChanged();
}

function getLocalUsersStore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}

  if (memoryUsersStore) return memoryUsersStore;

  // Initial seed of institutional users for verification
  const seed = [
    {
      uid: 'demo_student_21cs',
      email: 'sanjay.cs22@bitsathy.ac.in',
      displayName: 'Sanjay S',
      role: 'student',
      departmentId: null,
      active: true,
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      uid: 'demo_staff_nmc',
      email: 'staff.nmc@bitsathy.ac.in',
      displayName: 'Karthik R (NMC)',
      role: 'department',
      departmentId: 'NMC',
      active: true,
      createdAt: '2026-01-05T09:00:00.000Z'
    },
    {
      uid: 'demo_staff_ps',
      email: 'staff.ps@bitsathy.ac.in',
      displayName: 'Priya M (PS Affairs)',
      role: 'department',
      departmentId: 'PS',
      active: true,
      createdAt: '2026-01-05T09:00:00.000Z'
    },
    {
      uid: 'demo_staff_coe',
      email: 'staff.coe@bitsathy.ac.in',
      displayName: 'Dr. Ramesh K (COE)',
      role: 'department',
      departmentId: 'COE',
      active: true,
      createdAt: '2026-01-05T09:00:00.000Z'
    },
    {
      uid: 'demo_staff_academics',
      email: 'staff.academics@bitsathy.ac.in',
      displayName: 'Prof. Anitha S (Academics)',
      role: 'department',
      departmentId: 'Office Academics',
      active: true,
      createdAt: '2026-01-05T09:00:00.000Z'
    },
    {
      uid: 'demo_sysadmin_bit',
      email: 'admin.helpdesk@bitsathy.ac.in',
      displayName: 'Administrator (BIT IT Cell)',
      role: 'admin',
      departmentId: null,
      active: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    }
  ];
  saveLocalUsersStore(seed);
  return seed;
}

function saveLocalUsersStore(users) {
  memoryUsersStore = users;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to save to local users store:', e);
  }
}

// ---------------------------------------------------------------------------
// Ticket Operations
// ---------------------------------------------------------------------------

/**
 * Creates a new ticket in Firestore (or local store if persona or pending console setup).
 * Automatically logs initial CREATED event in the subcollection timeline.
 */
export async function createTicket(ticketData, userProfile) {
  if (!userProfile || !userProfile.uid) {
    throw new Error('Authentication required to create a ticket.');
  }

  if (!ticketData || !ticketData.title || typeof ticketData.title !== 'string') {
    throw new Error('VALIDATION_ERROR: Complaint title is required.');
  }
  const cleanTitle = ticketData.title.trim();
  if (cleanTitle.length < 5 || cleanTitle.length > 150) {
    throw new Error('VALIDATION_ERROR: Complaint title must be between 5 and 150 characters.');
  }

  if (!ticketData.description || typeof ticketData.description !== 'string') {
    throw new Error('VALIDATION_ERROR: Complaint description is required.');
  }
  const cleanDesc = ticketData.description.trim();
  if (cleanDesc.length < 10 || cleanDesc.length > 3000) {
    throw new Error('VALIDATION_ERROR: Complaint description must be between 10 and 3000 characters.');
  }

  const now = new Date().toISOString();
  const ticketNumber = generateTicketNumber();
  const canonicalDept = normalizeDepartmentId(ticketData.departmentId || 'manual-review');

  const record = {
    ticketNumber,
    title: cleanTitle,
    description: cleanDesc,
    userId: userProfile.uid,
    userEmail: userProfile.email,
    userDisplayName: userProfile.displayName || userProfile.email.split('@')[0],
    category: ticketData.category || 'General',
    departmentId: canonicalDept,
    classificationMethod: ticketData.classificationMethod || 'rule-based-keyword-v1',
    matchedKeywords: Array.isArray(ticketData.matchedKeywords) ? ticketData.matchedKeywords : [],
    requiresManualReview: Boolean(ticketData.requiresManualReview),
    status: TICKET_STATUS.OPEN.key,
    assignedTo: null,
    resolutionNotes: null,
    createdAt: now,
    updatedAt: now
  };

  if (isLiveFirestoreActive(userProfile)) {
    try {
      // Prevent duplicate submissions within OPEN state
      const dupQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', userProfile.uid),
        where('title', '==', record.title),
        where('status', '==', TICKET_STATUS.OPEN.key)
      );
      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) {
        throw new Error('DUPLICATE_TICKET: An open complaint with this exact title has already been submitted.');
      }

      const ticketsRef = collection(db, 'tickets');
      const docRef = await addDoc(ticketsRef, {
        ...record,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Subcollection timeline entry
      const timelineRef = collection(db, 'tickets', docRef.id, 'timeline');
      await addDoc(timelineRef, {
        action: 'CREATED',
        actorUid: userProfile.uid,
        actorDisplayName: record.userDisplayName,
        previousStatus: null,
        newStatus: TICKET_STATUS.OPEN.key,
        details: `Ticket filed with suggested department: ${record.departmentId} (${record.category})`,
        timestamp: serverTimestamp()
      });

      return { id: docRef.id, ...record };
    } catch (err) {
      if (err.message && err.message.includes('DUPLICATE_TICKET')) {
        throw err;
      }
      console.warn('[ticket-service] Live Firestore createTicket failed, falling back to local store:', err);
    }
  }

  // Local storage fallback
  const store = getLocalStore();

  // Check for duplicate ticket in local store
  const isDuplicate = store.some(
    t => t.userId === userProfile.uid &&
    t.title.toLowerCase() === record.title.toLowerCase() &&
    t.status === TICKET_STATUS.OPEN.key
  );
  if (isDuplicate) {
    throw new Error('DUPLICATE_TICKET: An open complaint with this exact title has already been submitted.');
  }

  const newId = 'ticket_' + Date.now();
  const newTicket = {
    id: newId,
    ...record,
    comments: [],
    timeline: [
      {
        id: 'tl_' + Date.now(),
        action: 'CREATED',
        actorUid: userProfile.uid,
        actorDisplayName: record.userDisplayName,
        previousStatus: null,
        newStatus: TICKET_STATUS.OPEN.key,
        details: `Ticket filed with suggested department: ${record.departmentId} (${record.category})`,
        timestamp: now
      }
    ]
  };

  store.unshift(newTicket);
  saveLocalStore(store);
  return newTicket;
}

/**
 * Fetches tickets created by a specific student
 */
export async function getStudentTickets(userId) {
  if (!userId) return [];

  if (isLiveFirestoreActive(userId)) {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('[ticket-service] Firestore query error getStudentTickets, falling back to local store:', err);
    }
  }

  const store = getLocalStore();
  return store.filter(t => t.userId === userId);
}

/**
 * Fetches tickets assigned to a specific department (or manual-review)
 */
export async function getDepartmentTickets(departmentId) {
  if (!departmentId) return [];
  const canonical = normalizeDepartmentId(departmentId);

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('departmentId', '==', canonical),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('[ticket-service] Firestore query error getDepartmentTickets, falling back to local store:', err);
    }
  }

  const store = getLocalStore();
  return store.filter(t => normalizeDepartmentId(t.departmentId) === canonical);
}

/**
 * Fetches all tickets (Admin only)
 */
export async function getAllTicketsAdmin() {
  if (isLiveFirestoreActive()) {
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('[ticket-service] Firestore query error getAllTicketsAdmin, falling back to local store:', err);
    }
  }

  return getLocalStore();
}

/**
 * Fetches a single ticket by its ID
 */
export async function getTicketById(ticketId) {
  if (!ticketId) return null;

  if (isLiveFirestoreActive()) {
    try {
      const snap = await getDoc(doc(db, 'tickets', ticketId));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    } catch (err) {
      console.warn('[ticket-service] Error in getTicketById, checking local store:', err);
    }
  }

  const store = getLocalStore();
  return store.find(t => t.id === ticketId) || null;
}

/**
 * Updates status of a ticket and logs to subcollection timeline
 */
export async function updateTicketStatus(ticketId, newStatus, userProfile, resolutionNotes = '') {
  if (!userProfile || !userProfile.uid) {
    throw new Error('Authentication required to update ticket status.');
  }
  if (!ticketId || !newStatus) throw new Error('Missing ticketId or status.');

  const role = userProfile.role || 'student';
  if (role === 'student') {
    throw new Error('PERMISSION_DENIED: Students cannot change ticket status.');
  }

  if (newStatus === 'RESOLVED') {
    if (!resolutionNotes || typeof resolutionNotes !== 'string' || resolutionNotes.trim().length < 5) {
      throw new Error('VALIDATION_ERROR: Resolution notes explaining the resolution must be provided (min 5 characters).');
    }
  }

  const now = new Date().toISOString();

  if (isLiveFirestoreActive(userProfile)) {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const currentSnap = await getDoc(ticketRef);
      if (!currentSnap.exists()) throw new Error('Ticket not found.');

      const prevStatus = currentSnap.data().status;
      const allowed = getAllowedTransitions(prevStatus, role);
      if (!allowed.includes(newStatus)) {
        throw new Error(`PERMISSION_DENIED: Unauthorized status transition from ${prevStatus} to ${newStatus} for role ${role}.`);
      }

      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes.trim();
      }
      await updateDoc(ticketRef, updateData);

      // Append timeline
      const tlRef = collection(db, 'tickets', ticketId, 'timeline');
      await addDoc(tlRef, {
        action: newStatus === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGE',
        actorUid: userProfile.uid,
        actorDisplayName: userProfile.displayName || userProfile.email,
        previousStatus: prevStatus,
        newStatus: newStatus,
        details: resolutionNotes ? `Status changed to ${newStatus}. Note: ${resolutionNotes.trim()}` : `Status changed to ${newStatus}`,
        timestamp: serverTimestamp()
      });

      return true;
    } catch (err) {
      if (err.message && (err.message.includes('PERMISSION_DENIED') || err.message.includes('VALIDATION_ERROR'))) {
        throw err;
      }
      console.warn('[ticket-service] Error updating live Firestore ticket status, falling back to local store:', err);
    }
  }

  // Local store
  const store = getLocalStore();
  const ticket = store.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found in local store.');

  const prevStatus = ticket.status;
  const allowed = getAllowedTransitions(prevStatus, role);
  if (!allowed.includes(newStatus)) {
    throw new Error(`PERMISSION_DENIED: Unauthorized status transition from ${prevStatus} to ${newStatus} for role ${role}.`);
  }

  ticket.status = newStatus;
  ticket.updatedAt = now;
  if (resolutionNotes) {
    ticket.resolutionNotes = resolutionNotes.trim();
  }
  if (!ticket.timeline) ticket.timeline = [];

  ticket.timeline.unshift({
    id: 'tl_' + Date.now(),
    action: newStatus === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGE',
    actorUid: userProfile.uid,
    actorDisplayName: userProfile.displayName || userProfile.email,
    previousStatus: prevStatus,
    newStatus: newStatus,
    details: resolutionNotes ? `Status changed to ${newStatus}. Note: ${resolutionNotes.trim()}` : `Status changed to ${newStatus}`,
    timestamp: now
  });

  saveLocalStore(store);
  return true;
}

/**
 * Reassigns ticket department (used during Escalation or Admin Manual Review triage)
 */
export async function reassignTicketDepartment(ticketId, newDepartmentId, userProfile, reason = '') {
  if (!ticketId || !newDepartmentId) throw new Error('Missing ticketId or newDepartmentId');

  const now = new Date().toISOString();

  if (isLiveFirestoreActive(userProfile)) {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const snap = await getDoc(ticketRef);
      if (!snap.exists()) throw new Error('Ticket not found.');

      const prevDept = snap.data().departmentId;
      await updateDoc(ticketRef, {
        departmentId: newDepartmentId,
        requiresManualReview: newDepartmentId === 'manual-review',
        updatedAt: serverTimestamp()
      });

      const tlRef = collection(db, 'tickets', ticketId, 'timeline');
      await addDoc(tlRef, {
        action: 'DEPARTMENT_TRANSFER',
        actorUid: userProfile.uid,
        actorDisplayName: userProfile.displayName || userProfile.email,
        previousStatus: snap.data().status,
        newStatus: snap.data().status,
        details: `Reassigned from ${prevDept} to ${newDepartmentId}. ${reason ? 'Reason: ' + reason : ''}`,
        timestamp: serverTimestamp()
      });

      return true;
    } catch (err) {
      console.warn('[ticket-service] Error reassigning ticket department in Firestore, falling back to local store:', err);
    }
  }

  const store = getLocalStore();
  const ticket = store.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found in local store.');

  const prevDept = ticket.departmentId;
  ticket.departmentId = newDepartmentId;
  ticket.requiresManualReview = newDepartmentId === 'manual-review';
  ticket.updatedAt = now;
  if (!ticket.timeline) ticket.timeline = [];

  ticket.timeline.unshift({
    id: 'tl_' + Date.now(),
    action: 'DEPARTMENT_TRANSFER',
    actorUid: userProfile.uid,
    actorDisplayName: userProfile.displayName || userProfile.email,
    previousStatus: ticket.status,
    newStatus: ticket.status,
    details: `Reassigned from ${prevDept} to ${newDepartmentId}. ${reason ? 'Reason: ' + reason : ''}`,
    timestamp: now
  });

  saveLocalStore(store);
  return true;
}

/**
 * Adds comment to `tickets/{ticketId}/comments/{commentId}`
 */
export async function addComment(ticketId, commentBody, userProfile) {
  if (!userProfile || !userProfile.uid) {
    throw new Error('Authentication required to add comment.');
  }
  if (!ticketId) throw new Error('Missing ticketId.');

  if (!commentBody || typeof commentBody !== 'string') {
    throw new Error('VALIDATION_ERROR: Comment body is required.');
  }
  const cleanBody = commentBody.trim();
  if (cleanBody.length < 1 || cleanBody.length > 1000) {
    throw new Error('VALIDATION_ERROR: Comment body must be between 1 and 1000 characters.');
  }

  const now = new Date().toISOString();

  if (isLiveFirestoreActive(userProfile)) {
    try {
      const commentsRef = collection(db, 'tickets', ticketId, 'comments');
      await addDoc(commentsRef, {
        senderUid: userProfile.uid,
        senderDisplayName: userProfile.displayName || userProfile.email,
        senderRole: userProfile.role || 'user',
        body: cleanBody,
        timestamp: serverTimestamp()
      });

      // Update ticket updatedAt timestamp
      await updateDoc(doc(db, 'tickets', ticketId), {
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (err) {
      console.warn('[ticket-service] Error adding live Firestore comment, falling back to local store:', err);
    }
  }

  const store = getLocalStore();
  const ticket = store.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found in local store.');

  if (!ticket.comments) ticket.comments = [];
  ticket.comments.push({
    id: 'cm_' + Date.now(),
    senderUid: userProfile.uid,
    senderDisplayName: userProfile.displayName || userProfile.email,
    senderRole: userProfile.role || 'user',
    body: cleanBody,
    timestamp: now
  });
  ticket.updatedAt = now;

  saveLocalStore(store);
  return true;
}

/**
 * Fetches comments for a ticket
 */
export async function getTicketComments(ticketId) {
  if (!ticketId) return [];

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets', ticketId, 'comments'),
        orderBy('timestamp', 'asc')
      );
      const snap = await getDocs(q);
      const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (comments.length > 0) return comments;
    } catch (err) {
      console.warn('[ticket-service] Error fetching comments from Firestore, checking local store:', err);
    }
  }

  const store = getLocalStore();
  const ticket = store.find(t => t.id === ticketId);
  return ticket?.comments || [];
}

/**
 * Fetches audit timeline for a ticket
 */
export async function getTicketTimeline(ticketId) {
  if (!ticketId) return [];

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets', ticketId, 'timeline'),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      const timeline = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (timeline.length > 0) return timeline;
    } catch (err) {
      console.warn('[ticket-service] Error fetching timeline from Firestore, checking local store:', err);
    }
  }

  const store = getLocalStore();
  const ticket = store.find(t => t.id === ticketId);
  return ticket?.timeline || [];
}

// ---------------------------------------------------------------------------
// Role & User Provisioning (Admin Service)
// ---------------------------------------------------------------------------

/**
 * Fetches user list for role provisioning (Admin only)
 */
export async function getAllUsersList() {
  if (isLiveFirestoreActive()) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('[ticket-service] Error fetching users list from Firestore, falling back to local users store:', err);
    }
  }

  return getLocalUsersStore();
}

/**
 * Updates a user's role and assigned department (Admin only)
 */
export async function updateUserRoleAssignment(targetUid, newRole, newDepartmentId, active = true) {
  if (!targetUid || !newRole) throw new Error('Missing targetUid or newRole');

  if (isLiveFirestoreActive()) {
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        role: newRole,
        departmentId: newRole === 'department' ? newDepartmentId : null,
        active: Boolean(active),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.warn('[ticket-service] Error updating user role in Firestore, falling back to local users store:', err);
    }
  }

  const users = getLocalUsersStore();
  const target = users.find(u => u.uid === targetUid);
  if (target) {
    target.role = newRole;
    target.departmentId = newRole === 'department' ? newDepartmentId : null;
    target.active = Boolean(active);
    target.updatedAt = new Date().toISOString();
    saveLocalUsersStore(users);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Real-Time Subscriptions (Firestore onSnapshot & Local Event Synchronization)
// ---------------------------------------------------------------------------

/**
 * Subscribes to real-time updates for tickets filed by a specific student.
 * Returns an unsubscribe callback.
 */
export function subscribeStudentTickets(userId, onUpdate, onError) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const setupLocalListener = () => {
    const emitCurrent = () => {
      const store = getLocalStore();
      const tickets = store.filter(t => t.userId === userId);
      onUpdate(tickets);
    };
    emitCurrent();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => emitCurrent();
      window.addEventListener('bit_helpdesk_data_changed', handler);
      return () => window.removeEventListener('bit_helpdesk_data_changed', handler);
    }
    return () => {};
  };

  if (isLiveFirestoreActive(userId)) {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(tickets);
        },
        (err) => {
          console.warn('[ticket-service] Snapshot error in subscribeStudentTickets, falling back to local store listener:', err);
          setupLocalListener();
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[ticket-service] Failed to attach listener for student tickets, falling back to local store listener:', err);
    }
  }

  return setupLocalListener();
}

/**
 * Subscribes to real-time updates for tickets assigned to a specific department.
 * Returns an unsubscribe callback.
 */
export function subscribeDepartmentTickets(departmentId, onUpdate, onError) {
  if (!departmentId) {
    onUpdate([]);
    return () => {};
  }
  const canonical = normalizeDepartmentId(departmentId);

  const setupLocalListener = () => {
    const emitCurrent = () => {
      const store = getLocalStore();
      const tickets = store.filter(t => normalizeDepartmentId(t.departmentId) === canonical);
      onUpdate(tickets);
    };
    emitCurrent();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => emitCurrent();
      window.addEventListener('bit_helpdesk_data_changed', handler);
      return () => window.removeEventListener('bit_helpdesk_data_changed', handler);
    }
    return () => {};
  };

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('departmentId', '==', canonical),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(tickets);
        },
        (err) => {
          console.warn('[ticket-service] Snapshot error in subscribeDepartmentTickets, falling back to local listener:', err);
          setupLocalListener();
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[ticket-service] Failed to attach listener for department tickets, falling back to local listener:', err);
    }
  }

  return setupLocalListener();
}

/**
 * Subscribes to real-time updates for all campus tickets (Admin only).
 * Returns an unsubscribe callback.
 */
export function subscribeAdminTickets(onUpdate, onError) {
  const setupLocalListener = () => {
    const emitCurrent = () => {
      onUpdate(getLocalStore());
    };
    emitCurrent();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => emitCurrent();
      window.addEventListener('bit_helpdesk_data_changed', handler);
      return () => window.removeEventListener('bit_helpdesk_data_changed', handler);
    }
    return () => {};
  };

  if (isLiveFirestoreActive()) {
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(tickets);
        },
        (err) => {
          console.warn('[ticket-service] Snapshot error in subscribeAdminTickets, falling back to local listener:', err);
          setupLocalListener();
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[ticket-service] Failed to attach listener for admin tickets, falling back to local listener:', err);
    }
  }

  return setupLocalListener();
}

/**
 * Subscribes to real-time comments for a single ticket (lazy-loaded on modal view).
 * Returns an unsubscribe callback.
 */
export function subscribeTicketComments(ticketId, onUpdate, onError) {
  if (!ticketId) {
    onUpdate([]);
    return () => {};
  }

  const setupLocalListener = () => {
    const emitCurrent = () => {
      const store = getLocalStore();
      const ticket = store.find(t => t.id === ticketId);
      onUpdate(ticket?.comments || []);
    };
    emitCurrent();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => emitCurrent();
      window.addEventListener('bit_helpdesk_data_changed', handler);
      return () => window.removeEventListener('bit_helpdesk_data_changed', handler);
    }
    return () => {};
  };

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets', ticketId, 'comments'),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(comments);
        },
        (err) => {
          console.warn('[ticket-service] Snapshot error in subscribeTicketComments, falling back to local listener:', err);
          setupLocalListener();
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[ticket-service] Failed to attach comments listener, falling back to local listener:', err);
    }
  }

  return setupLocalListener();
}

/**
 * Subscribes to real-time timeline events for a single ticket (lazy-loaded on modal view).
 * Returns an unsubscribe callback.
 */
export function subscribeTicketTimeline(ticketId, onUpdate, onError) {
  if (!ticketId) {
    onUpdate([]);
    return () => {};
  }

  const setupLocalListener = () => {
    const emitCurrent = () => {
      const store = getLocalStore();
      const ticket = store.find(t => t.id === ticketId);
      onUpdate(ticket?.timeline || []);
    };
    emitCurrent();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => emitCurrent();
      window.addEventListener('bit_helpdesk_data_changed', handler);
      return () => window.removeEventListener('bit_helpdesk_data_changed', handler);
    }
    return () => {};
  };

  if (isLiveFirestoreActive()) {
    try {
      const q = query(
        collection(db, 'tickets', ticketId, 'timeline'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const timeline = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(timeline);
        },
        (err) => {
          console.warn('[ticket-service] Snapshot error in subscribeTicketTimeline, falling back to local listener:', err);
          setupLocalListener();
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[ticket-service] Failed to attach timeline listener, falling back to local listener:', err);
    }
  }

  return setupLocalListener();
}
