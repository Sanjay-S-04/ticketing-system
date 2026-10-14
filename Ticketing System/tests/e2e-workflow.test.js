/**
 * e2e-workflow.test.js
 * End-to-end integration and workflow simulation test for Phase 3
 * Bannari Amman Institute of Technology Helpdesk
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTicket,
  getStudentTickets,
  getDepartmentTickets,
  getAllTicketsAdmin,
  getTicketById,
  updateTicketStatus,
  addComment,
  getTicketComments,
  getTicketTimeline,
  subscribeStudentTickets,
  subscribeDepartmentTickets,
  subscribeTicketComments,
  subscribeTicketTimeline
} from '../js/ticket-service.js';
import { classifyComplaint } from '../js/classification.js';
import { getAllowedTransitions } from '../js/data.js';

test('End-to-End Workflow: Student submission, live routing, department triage, remarks & resolution', async () => {
  // 1. Student Persona
  const studentSanjay = {
    uid: 'student_sanjay_22cs',
    email: 'sanjay.cs22@bitsathy.ac.in',
    displayName: 'Sanjay S',
    role: 'student'
  };

  // 2. Complaint text
  const title = 'Hostel Wi-Fi down in C-Block corridor';
  const description = 'The Wi-Fi access point in C-Block corridor 3 disconnected after the brief power surge and students cannot connect.';

  // 3. Automated classification engine
  const classification = classifyComplaint(title, description);
  assert.equal(classification.suggestedDepartmentId, 'NMC');
  assert.equal(classification.suggestedCategory, 'Wi-Fi and LAN');
  assert.ok(classification.matchedKeywords.includes('wi-fi'));
  assert.equal(classification.requiresManualReview, false);

  // 4. Student files complaint
  const ticket = await createTicket({
    title,
    description,
    category: classification.suggestedCategory,
    departmentId: classification.suggestedDepartmentId,
    classificationMethod: classification.classificationMethod,
    matchedKeywords: classification.matchedKeywords,
    requiresManualReview: classification.requiresManualReview
  }, studentSanjay);

  assert.ok(ticket.id);
  assert.match(ticket.ticketNumber, /^BIT-\d{4}-\d{4}$/);
  assert.equal(ticket.status, 'OPEN');
  assert.equal(ticket.departmentId, 'NMC');
  assert.equal(ticket.userId, studentSanjay.uid);

  // 5. Verify initial timeline event
  const initialTimeline = await getTicketTimeline(ticket.id);
  assert.ok(initialTimeline.length >= 1);
  assert.equal(initialTimeline[0].action, 'CREATED');
  assert.equal(initialTimeline[0].newStatus, 'OPEN');

  // 6. Student adds follow-up comment
  await addComment(ticket.id, 'Students in room 302 to 310 are affected.', studentSanjay);
  const commentsAfterStudent = await getTicketComments(ticket.id);
  assert.equal(commentsAfterStudent.length, 1);
  assert.equal(commentsAfterStudent[0].senderRole, 'student');
  assert.ok(commentsAfterStudent[0].body.includes('302 to 310'));

  // 7. Student ticket isolation
  const sanjayTickets = await getStudentTickets(studentSanjay.uid);
  assert.ok(sanjayTickets.some(t => t.id === ticket.id));

  const otherStudentTickets = await getStudentTickets('other_student_999');
  assert.ok(!otherStudentTickets.some(t => t.id === ticket.id));

  // 8. Department Queue Isolation
  const nmcStaff = {
    uid: 'staff_karthik_nmc',
    email: 'staff.nmc@bitsathy.ac.in',
    displayName: 'Karthik R (NMC)',
    role: 'department',
    departmentId: 'NMC'
  };

  const nmcQueue = await getDepartmentTickets('NMC');
  assert.ok(nmcQueue.some(t => t.id === ticket.id));

  const psQueue = await getDepartmentTickets('PS');
  assert.ok(!psQueue.some(t => t.id === ticket.id));

  // 9. Department transitions status: OPEN -> IN_PROGRESS
  const inProgressOk = await updateTicketStatus(ticket.id, 'IN_PROGRESS', nmcStaff);
  assert.equal(inProgressOk, true);

  // 10. Staff posts remark
  await addComment(ticket.id, 'Technician dispatched to C-Block with replacement PoE injector.', nmcStaff);
  const commentsAfterStaff = await getTicketComments(ticket.id);
  assert.equal(commentsAfterStaff.length, 2);
  assert.equal(commentsAfterStaff[1].senderRole, 'department');

  // 11. Staff resolves ticket with mandatory resolution notes
  const resolveOk = await updateTicketStatus(
    ticket.id,
    'RESOLVED',
    nmcStaff,
    'Replaced damaged PoE injector on 3rd floor rack; AP came online and all host clients re-authenticated.'
  );
  assert.equal(resolveOk, true);

  // 12. Final ticket inspection & complete audit trail verification
  const finalTicket = await getTicketById(ticket.id);
  assert.equal(finalTicket.status, 'RESOLVED');
  assert.ok(finalTicket.resolutionNotes.includes('Replaced damaged PoE injector'));

  const finalTimeline = await getTicketTimeline(ticket.id);
  assert.ok(finalTimeline.length >= 3);
  assert.equal(finalTimeline[0].action, 'RESOLVED');
  assert.equal(finalTimeline[1].action, 'STATUS_CHANGE');
  assert.equal(finalTimeline[1].newStatus, 'IN_PROGRESS');
  assert.equal(finalTimeline[2].action, 'CREATED');

  // 13. Admin metrics & global queue visibility
  const allTickets = await getAllTicketsAdmin();
  assert.ok(allTickets.some(t => t.id === ticket.id));

  const total = allTickets.length;
  const resolvedCount = allTickets.filter(t => t.status === 'RESOLVED').length;
  assert.ok(total >= 1);
  assert.ok(resolvedCount >= 1);
});
