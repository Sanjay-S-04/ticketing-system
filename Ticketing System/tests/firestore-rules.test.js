/**
 * firestore-rules.test.js
 * Unit & validation tests for Firestore Security Rules constraints and access controls
 * Bannari Amman Institute of Technology Helpdesk
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Helper simulating security rule logic directly from firestore.rules
const institutionalEmailRegex = /^[a-zA-Z0-9._%+-]+@bitsathy\.ac\.in$/i;

function checkInstitutionalEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return institutionalEmailRegex.test(email);
}

function canCreateTicket(auth, ticketData) {
  if (!auth || !checkInstitutionalEmail(auth.email)) return false;
  if (ticketData.userId !== auth.uid) return false;
  if (ticketData.userEmail !== auth.email) return false;
  if (ticketData.status !== 'OPEN') return false;
  if (typeof ticketData.ticketNumber !== 'string' || !ticketData.ticketNumber) return false;
  if (typeof ticketData.title !== 'string' || !ticketData.title) return false;
  if (typeof ticketData.description !== 'string' || !ticketData.description) return false;
  const allowedDepts = [
    'NMC', 'PS', 'COE', 'Office Academics', 'manual-review',
    'nmc', 'ps', 'coe', 'office_academics', 'manual_review'
  ];
  if (!allowedDepts.includes(ticketData.departmentId)) return false;
  return true;
}

function normalizeDept(d) {
  if (!d) return '';
  const clean = String(d).trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (clean === 'nmc') return 'NMC';
  if (clean === 'ps') return 'PS';
  if (clean === 'coe') return 'COE';
  if (clean === 'office_academics' || clean === 'academics') return 'Office Academics';
  if (clean === 'manual_review') return 'manual-review';
  return d;
}

function canReadTicket(user, ticket) {
  if (!user || !user.active) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'student' && ticket.userId === user.uid) return true;
  if (user.role === 'department' && normalizeDept(ticket.departmentId) === normalizeDept(user.departmentId)) return true;
  return false;
}

function canUpdateTicketStatus(user, currentTicket, newStatus) {
  if (!user || !user.active) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'department' && normalizeDept(currentTicket.departmentId) === normalizeDept(user.departmentId)) {
    const allowed = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];
    return allowed.includes(newStatus);
  }
  // Students CANNOT change status
  return false;
}

function canUserModifyRole(actor, targetUser, newRole, newDepartmentId) {
  // Only admin can change role and departmentId
  if (actor.role === 'admin' && actor.active) return true;
  return false;
}

test('Rules: Institutional email domain validation strictly requires @bitsathy.ac.in', () => {
  assert.equal(checkInstitutionalEmail('student.cs21@bitsathy.ac.in'), true);
  assert.equal(checkInstitutionalEmail('staff.nmc@bitsathy.ac.in'), true);
  assert.equal(checkInstitutionalEmail('admin@bitsathy.ac.in'), true);

  // Unauthorized domains must be rejected
  assert.equal(checkInstitutionalEmail('hacker@gmail.com'), false);
  assert.equal(checkInstitutionalEmail('test@bitsathy.ac.in.attacker.org'), false);
  assert.equal(checkInstitutionalEmail('spoof@yahoo.com'), false);
  assert.equal(checkInstitutionalEmail('bitsathy.ac.in@fake.com'), false);
  assert.equal(checkInstitutionalEmail(''), false);
  assert.equal(checkInstitutionalEmail(null), false);
});

test('Rules: Student can create ticket only with matching auth and OPEN status', () => {
  const auth = { uid: 'stud_123', email: 'sanjay.cs22@bitsathy.ac.in' };

  // Valid ticket
  const validTicket = {
    ticketNumber: 'BIT-2026-0001',
    title: 'Wi-Fi not working',
    description: 'Hostel access point offline',
    userId: 'stud_123',
    userEmail: 'sanjay.cs22@bitsathy.ac.in',
    departmentId: 'NMC',
    status: 'OPEN'
  };
  assert.equal(canCreateTicket(auth, validTicket), true);

  // Attempting to spoof another user's UID
  const spoofedUid = { ...validTicket, userId: 'other_user' };
  assert.equal(canCreateTicket(auth, spoofedUid), false);

  // Attempting to create a ticket that is already pre-marked RESOLVED
  const preResolved = { ...validTicket, status: 'RESOLVED' };
  assert.equal(canCreateTicket(auth, preResolved), false);

  // Non-institutional email
  const outsider = { uid: 'ext_456', email: 'external@gmail.com' };
  assert.equal(canCreateTicket(outsider, validTicket), false);
});

test('Rules: Department isolation enforces staff can only view and update their department tickets', () => {
  const nmcStaff = { uid: 'nmc_staff_1', role: 'department', departmentId: 'NMC', active: true };
  const psStaff = { uid: 'ps_staff_1', role: 'department', departmentId: 'PS', active: true };

  const nmcTicket = { id: 't1', userId: 'stud_999', departmentId: 'NMC', status: 'OPEN' };
  const psTicket = { id: 't2', userId: 'stud_999', departmentId: 'PS', status: 'OPEN' };

  // NMC staff can read NMC ticket but NOT PS ticket
  assert.equal(canReadTicket(nmcStaff, nmcTicket), true);
  assert.equal(canReadTicket(nmcStaff, psTicket), false);

  // PS staff can read PS ticket but NOT NMC ticket
  assert.equal(canReadTicket(psStaff, psTicket), true);
  assert.equal(canReadTicket(psStaff, nmcTicket), false);

  // NMC staff can transition NMC ticket status
  assert.equal(canUpdateTicketStatus(nmcStaff, nmcTicket, 'IN_PROGRESS'), true);
  assert.equal(canUpdateTicketStatus(nmcStaff, nmcTicket, 'RESOLVED'), true);

  // PS staff CANNOT transition NMC ticket status
  assert.equal(canUpdateTicketStatus(psStaff, nmcTicket, 'RESOLVED'), false);
});

test('Rules: Students CANNOT read other students tickets or modify ticket status', () => {
  const studentAlice = { uid: 'alice_01', role: 'student', active: true };
  const studentBob = { uid: 'bob_02', role: 'student', active: true };

  const aliceTicket = { id: 't10', userId: 'alice_01', departmentId: 'NMC', status: 'OPEN' };

  // Alice can read her own ticket
  assert.equal(canReadTicket(studentAlice, aliceTicket), true);

  // Bob CANNOT read Alice's ticket
  assert.equal(canReadTicket(studentBob, aliceTicket), false);

  // Alice CANNOT mark her own ticket as RESOLVED (only staff or admin can)
  assert.equal(canUpdateTicketStatus(studentAlice, aliceTicket, 'RESOLVED'), false);
});

test('Rules: Snake_case department identifiers (nmc, office_academics) are supported and isolated correctly', () => {
  const academicsStaff = { uid: 'acad_staff_1', role: 'department', departmentId: 'Office Academics', active: true };
  const ticketWithSnakeCase = { id: 't_snake', userId: 'stud_123', departmentId: 'office_academics', status: 'OPEN' };
  const nmcTicket = { id: 't_nmc', userId: 'stud_123', departmentId: 'nmc', status: 'OPEN' };

  // Staff with 'Office Academics' can access 'office_academics' ticket
  assert.equal(canReadTicket(academicsStaff, ticketWithSnakeCase), true);
  // Staff cannot access 'nmc' ticket
  assert.equal(canReadTicket(academicsStaff, nmcTicket), false);
});

test('Rules: Role self-promotion is strictly blocked for non-admins', () => {
  const regularStudent = { uid: 'stud_01', role: 'student', active: true };
  const regularStaff = { uid: 'staff_01', role: 'department', departmentId: 'NMC', active: true };
  const adminUser = { uid: 'admin_01', role: 'admin', active: true };

  // Student trying to promote themselves to admin
  assert.equal(canUserModifyRole(regularStudent, regularStudent, 'admin', null), false);

  // Staff trying to promote themselves to admin
  assert.equal(canUserModifyRole(regularStaff, regularStaff, 'admin', null), false);

  // Admin can provision roles
  assert.equal(canUserModifyRole(adminUser, regularStudent, 'department', 'NMC'), true);
  assert.equal(canUserModifyRole(adminUser, regularStudent, 'admin', null), true);
});


