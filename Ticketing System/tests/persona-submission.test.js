/**
 * persona-submission.test.js
 * Verifies that Quick Evaluation Personas (demo_*) can submit tickets,
 * view tickets, receive real-time updates, and transition statuses seamlessly.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isLiveFirestoreActive,
  createTicket,
  getStudentTickets,
  getTicketById,
  updateTicketStatus,
  addComment,
  getTicketComments,
  getTicketTimeline,
  subscribeStudentTickets
} from '../js/ticket-service.js';

test('Evaluation Persona Submission: demo_student_21cs creates complaint without network permission-denied', async () => {
  const demoStudent = {
    uid: 'demo_student_21cs',
    email: 'sanjay.cs22@bitsathy.ac.in',
    displayName: 'Sanjay S',
    role: 'student'
  };

  // 1. isLiveFirestoreActive must be false for demo personas to prevent Firestore permission-denied errors
  assert.equal(isLiveFirestoreActive(demoStudent), false);
  assert.equal(isLiveFirestoreActive('demo_student_21cs'), false);

  // 2. Submit ticket
  const ticketData = {
    title: 'Hostel Wi-Fi intermittent disconnecting in C-Block corridor',
    description: 'The Wi-Fi access point in C-Block corridor 3 is dropping connection every few minutes during study hours.',
    category: 'Wi-Fi and LAN connectivity issues',
    departmentId: 'NMC',
    classificationMethod: 'rule-based-keyword-v1',
    matchedKeywords: ['wi-fi', 'disconnecting'],
    requiresManualReview: false
  };

  const created = await createTicket(ticketData, demoStudent);

  assert.ok(created.id);
  assert.match(created.ticketNumber, /^BIT-\d{4}-\d{4}$/);
  assert.equal(created.status, 'OPEN');
  assert.equal(created.departmentId, 'NMC');
  assert.equal(created.userId, 'demo_student_21cs');

  // 3. Verify subcollection timeline exists and has CREATED event
  const timeline = await getTicketTimeline(created.id);
  assert.ok(timeline.length > 0);
  assert.equal(timeline[0].action, 'CREATED');

  // 4. Verify student can fetch their tickets
  const myTickets = await getStudentTickets('demo_student_21cs');
  assert.ok(myTickets.some(t => t.id === created.id));

  // 5. Verify real-time subscription emits the ticket
  let received = null;
  const unsubscribe = subscribeStudentTickets('demo_student_21cs', (tickets) => {
    received = tickets;
  });
  assert.ok(received && received.length > 0);
  assert.ok(received.some(t => t.id === created.id));
  unsubscribe();

  // 6. Verify duplicate complaint prevention works
  await assert.rejects(
    async () => {
      await createTicket(ticketData, demoStudent);
    },
    (err) => {
      assert.ok(err.message.includes('DUPLICATE_TICKET'));
      return true;
    }
  );
});
