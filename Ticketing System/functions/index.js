/**
 * functions/index.js - Trusted Server-Side Privileged Operations
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Enforces server-side authority for role provisioning and department assignments.
 * Never stores or exposes service account credentials in frontend code.
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();

const ALLOWED_ROLES = ['student', 'department', 'admin', 'pending'];
const ALLOWED_DEPTS = [
  'NMC', 'PS', 'COE', 'Office Academics', 'manual-review',
  'nmc', 'ps', 'coe', 'office_academics', 'manual_review'
];

/**
 * Callable Function: setUserRoleAndDepartment
 * Only verified administrators can execute this function.
 */
export const setUserRoleAndDepartment = onCall(async (request) => {
  // 1. Verify caller authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerEmail = request.auth.token.email || '';
  if (!callerEmail.endsWith('@bitsathy.ac.in')) {
    throw new HttpsError('permission-denied', 'Only institutional @bitsathy.ac.in accounts are permitted.');
  }

  // 2. Verify caller has admin role in Firestore
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin' || callerDoc.data()?.active !== true) {
    throw new HttpsError('permission-denied', 'Unauthorized. Only institutional administrators can provision roles.');
  }

  // 3. Validate input parameters
  const { targetUid, role, departmentId, active } = request.data;

  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'Missing or invalid targetUid.');
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Invalid role: ${role}. Must be one of: ${ALLOWED_ROLES.join(', ')}`);
  }

  if (role === 'department') {
    if (!departmentId || !ALLOWED_DEPTS.includes(departmentId)) {
      throw new HttpsError('invalid-argument', `Department role requires a valid departmentId: ${ALLOWED_DEPTS.join(', ')}`);
    }
  }

  // 4. Update target user document in Firestore
  const targetUserRef = db.collection('users').doc(targetUid);
  const targetDoc = await targetUserRef.get();

  if (!targetDoc.exists) {
    throw new HttpsError('not-found', 'Target user does not exist.');
  }

  const updateData = {
    role,
    departmentId: role === 'department' ? departmentId : null,
    active: active !== undefined ? Boolean(active) : true,
    updatedAt: FieldValue.serverTimestamp()
  };

  await targetUserRef.update(updateData);

  return {
    success: true,
    message: `User ${targetUid} successfully provisioned as ${role}${role === 'department' ? ` (${departmentId})` : ''}.`
  };
});
