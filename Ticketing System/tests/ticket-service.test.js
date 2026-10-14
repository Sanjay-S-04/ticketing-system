/**
 * ticket-service.test.js
 * Unit & Integration tests for ticket lifecycle, duplicate prevention, and subcollection logic
 * Bannari Amman Institute of Technology Helpdesk
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTicketNumber,
  createTicket,
  getStudentTickets,
  getDepartmentTickets,
  updateTicketStatus,
  addComment,
  getTicketComments,
  getTicketTimeline
} from '../js/ticket-service.js';

import { normalizeDepartmentId, getAllowedTransitions } from '../js/data.js';

test('Ticket Number: Generates canonical BIT-YYYY-XXXX format', () => {
  const num = generateTicketNumber();
  const year = new Date().getFullYear();
  const regex = new RegExp(`^BIT-${year}-\\d{4}$`);
  assert.match(num, regex);
});

test('Department Normalization: Maps snake_case and variations to official department IDs', () => {
  assert.equal(normalizeDepartmentId('nmc'), 'NMC');
  assert.equal(normalizeDepartmentId('NMC'), 'NMC');
  assert.equal(normalizeDepartmentId('ps'), 'PS');
  assert.equal(normalizeDepartmentId('coe'), 'COE');
  assert.equal(normalizeDepartmentId('office_academics'), 'Office Academics');
  assert.equal(normalizeDepartmentId('Office Academics'), 'Office Academics');
  assert.equal(normalizeDepartmentId('manual_review'), 'manual-review');
  assert.equal(normalizeDepartmentId('manual-review'), 'manual-review');
});

test('Ticket Lifecycle: Creation, Audit Timeline & Duplicate Prevention', async () => {
  // Clear any existing test store
  const mockUser = {
    uid: 'test_student_' + Date.now(),
    email: 'test.student@bitsathy.ac.in',
    displayName: 'Test Student',
    role: 'student'
  };

  const ticketData = {
    title: 'Biometric fingerprint reader down in Lab 2',
    description: 'The biometric punch machine has error code 404.',
    category: 'Biometric system issues',
    departmentId: 'nmc',
    classificationMethod: 'rule-based-keyword-v1',
    matchedKeywords: ['biometric', 'fingerprint'],
    requiresManualReview: false
  };

  // 1. Create ticket
  const created = await createTicket(ticketData, mockUser);
  assert.ok(created.id);
  assert.equal(created.departmentId, 'NMC'); // Normalized
  assert.equal(created.status, 'OPEN');
  assert.equal(created.userId, mockUser.uid);

  // 2. Verify subcollection timeline entry was logged
  const timeline = await getTicketTimeline(created.id);
  assert.ok(timeline.length > 0);
  assert.equal(timeline[0].action, 'CREATED');
  assert.equal(timeline[0].newStatus, 'OPEN');

  // 3. Duplicate ticket attempt should throw DUPLICATE_TICKET
  await assert.rejects(
    async () => {
      await createTicket(ticketData, mockUser);
    },
    (err) => {
      assert.ok(err.message.includes('DUPLICATE_TICKET'));
      return true;
    }
  );

  // 4. Update status to IN_PROGRESS
  const mockStaff = {
    uid: 'staff_nmc_01',
    email: 'staff.nmc@bitsathy.ac.in',
    displayName: 'NMC Tech Lead',
    role: 'department',
    departmentId: 'NMC'
  };

  const updated = await updateTicketStatus(created.id, 'IN_PROGRESS', mockStaff);
  assert.equal(updated, true);

  const updatedTimeline = await getTicketTimeline(created.id);
  assert.equal(updatedTimeline[0].newStatus, 'IN_PROGRESS');

  // 5. Add comment
  await addComment(created.id, 'Investigating hardware sensor in Lab 2.', mockStaff);
  const comments = await getTicketComments(created.id);
  assert.equal(comments.length, 1);
  assert.equal(comments[0].senderRole, 'department');
  assert.equal(comments[0].body, 'Investigating hardware sensor in Lab 2.');
});

test('Allowed Transitions: Staff role constraints enforced correctly', () => {
  // Staff transitions
  assert.deepEqual(getAllowedTransitions('OPEN', 'department'), ['IN_PROGRESS', 'ESCALATED']);
  assert.deepEqual(getAllowedTransitions('IN_PROGRESS', 'department'), ['RESOLVED', 'ESCALATED']);
  assert.deepEqual(getAllowedTransitions('ESCALATED', 'department'), ['IN_PROGRESS', 'RESOLVED']);

  // Admin has full transitions
  assert.deepEqual(getAllowedTransitions('OPEN', 'admin'), ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']);
});

test('Input Validation: Rejects too short, too long, or missing titles and descriptions', async () => {
  const mockUser = {
    uid: 'student_val_test',
    email: 'val.student@bitsathy.ac.in',
    role: 'student'
  };

  // 1. Title too short (< 5 chars)
  await assert.rejects(
    async () => {
      await createTicket({
        title: 'Wifi',
        description: 'Hostel wifi is down in room 302.'
      }, mockUser);
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );

  // 2. Title too long (> 150 chars)
  await assert.rejects(
    async () => {
      await createTicket({
        title: 'A'.repeat(151),
        description: 'Hostel wifi is down in room 302.'
      }, mockUser);
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );

  // 3. Description too short (< 10 chars)
  await assert.rejects(
    async () => {
      await createTicket({
        title: 'Valid Complaint Title',
        description: 'Short'
      }, mockUser);
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );
});

test('Status Transition Enforcement: Blocks student updates and enforces allowed transitions & resolution notes', async () => {
  const student = {
    uid: 'student_trans_' + Date.now(),
    email: 'trans.student@bitsathy.ac.in',
    role: 'student'
  };

  const staff = {
    uid: 'staff_trans_' + Date.now(),
    email: 'staff.trans@bitsathy.ac.in',
    role: 'department',
    departmentId: 'NMC'
  };

  // Create ticket
  const ticket = await createTicket({
    title: 'Lab 4 Switch failure affecting LAN',
    description: 'Switch port 24 is flashing amber and no packets transmit.',
    category: 'Wi-Fi and LAN connectivity issues',
    departmentId: 'NMC'
  }, student);

  // 1. Student attempting to update status directly should be blocked
  await assert.rejects(
    async () => {
      await updateTicketStatus(ticket.id, 'RESOLVED', student, 'Self resolved');
    },
    (err) => {
      assert.ok(err.message.includes('PERMISSION_DENIED'));
      return true;
    }
  );

  // 2. Staff jumping directly from OPEN to RESOLVED should be rejected (must be IN_PROGRESS or ESCALATED first)
  await assert.rejects(
    async () => {
      await updateTicketStatus(ticket.id, 'RESOLVED', staff, 'Premature resolve');
    },
    (err) => {
      assert.ok(err.message.includes('PERMISSION_DENIED'));
      return true;
    }
  );

  // 3. Valid transition: OPEN -> IN_PROGRESS
  const okProgress = await updateTicketStatus(ticket.id, 'IN_PROGRESS', staff);
  assert.equal(okProgress, true);

  // 4. Staff resolving without resolution notes should be rejected
  await assert.rejects(
    async () => {
      await updateTicketStatus(ticket.id, 'RESOLVED', staff, '');
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );

  // 5. Valid resolution with descriptive notes
  const okResolved = await updateTicketStatus(
    ticket.id,
    'RESOLVED',
    staff,
    'Replaced faulty patch cord on port 24; gigabit uplink restored.'
  );
  assert.equal(okResolved, true);

  // Verify timeline contains both transitions and resolution notes
  const timeline = await getTicketTimeline(ticket.id);
  assert.equal(timeline[0].newStatus, 'RESOLVED');
  assert.ok(timeline[0].details.includes('Replaced faulty patch cord'));
});

test('Comment Validation: Enforces length constraints on remarks', async () => {
  const student = { uid: 's_comm', email: 's@bitsathy.ac.in', role: 'student' };

  // Empty comment rejected
  await assert.rejects(
    async () => {
      await addComment('ticket_any', '   ', student);
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );

  // Oversized comment rejected
  await assert.rejects(
    async () => {
      await addComment('ticket_any', 'A'.repeat(1001), student);
    },
    (err) => {
      assert.ok(err.message.includes('VALIDATION_ERROR'));
      return true;
    }
  );
});

