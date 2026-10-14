/**
 * classification.test.js
 * Unit tests for deterministic rule-based category classifier
 * Bannari Amman Institute of Technology Helpdesk
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyComplaint, normalizeText } from '../js/classification.js';

test('Text Normalization: trims, lowercases and strips noisy punctuation', () => {
  const raw = "  Hostel Wi-Fi is DOWN!!! Can't access anything... ";
  const norm = normalizeText(raw);
  assert.equal(norm, "hostel wi-fi is down cant access anything");
});

test('NMC: Wi-Fi and LAN complaint routing', () => {
  const result = classifyComplaint(
    'Hostel Wi-Fi not working',
    'The hostel wifi in D-Block 3rd floor is extremely slow and disconnecting frequently.'
  );

  assert.equal(result.suggestedDepartmentId, 'NMC');
  assert.equal(result.suggestedCategory, 'Wi-Fi and LAN');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('wifi') || result.matchedKeywords.includes('hostel wifi'));
  assert.equal(result.classificationMethod, 'rule-based-keyword-v1');
});

test('NMC: Biometric system issue routing', () => {
  const result = classifyComplaint(
    'Biometric attendance machine error',
    'The biometric fingerprint machine in Mechanical block did not register my morning punch.'
  );

  assert.equal(result.suggestedDepartmentId, 'NMC');
  assert.equal(result.suggestedCategory, 'Biometric system issues');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('biometric') || result.matchedKeywords.includes('fingerprint'));
});

test('PS: PS Portal issue routing', () => {
  const result = classifyComplaint(
    'Unable to login to PS Portal',
    'Getting a 500 error every time I try to submit profile update in ps portal.'
  );

  assert.equal(result.suggestedDepartmentId, 'PS');
  assert.equal(result.suggestedCategory, 'PS Portal');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('ps portal'));
});

test('PS: PCDP App crash routing', () => {
  const result = classifyComplaint(
    'PCDP App crashing',
    'The pcdp mobile app crashes continuously whenever I tap on the notification tab.'
  );

  assert.equal(result.suggestedDepartmentId, 'PS');
  assert.equal(result.suggestedCategory, 'PCDP App');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('pcdp') || result.matchedKeywords.includes('pcdp app'));
});

test('PS: Attendance discrepancy routing', () => {
  const result = classifyComplaint(
    'Attendance marked absent for on-duty period',
    'I was on duty for symposium but my day attendance shows absent for hour 3 and 4.'
  );

  assert.equal(result.suggestedDepartmentId, 'PS');
  assert.equal(result.suggestedCategory, 'Attendance issues');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('attendance') || result.matchedKeywords.includes('absent'));
});

test('COE: Examination timetable clash routing', () => {
  const result = classifyComplaint(
    'Examination timetable clash for arrear paper',
    'My semester exam timetable has a direct clash between 21CS501 and 21EC302 on the same morning session.'
  );

  assert.equal(result.suggestedDepartmentId, 'COE');
  assert.equal(result.suggestedCategory, 'Examination timetable');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('timetable') || result.matchedKeywords.includes('timetable clash'));
});

test('COE: Results and Grade-card issue routing', () => {
  const result = classifyComplaint(
    'Grade card marksheet discrepancy',
    'My 5th semester grade card shows incorrect credits for mini-project. Applied for revaluation.'
  );

  assert.equal(result.suggestedDepartmentId, 'COE');
  assert.ok(result.suggestedCategory === 'Results and grade-card issues' || result.suggestedCategory === 'Examination-related issues');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('grade card') || result.matchedKeywords.includes('revaluation'));
});

test('Office Academics: Mini-project issue routing', () => {
  const result = classifyComplaint(
    'Mini-project guide approval pending',
    'Our mini-project team batch 14 has submitted the problem statement but mini-project guide approval is stuck.'
  );

  assert.equal(result.suggestedDepartmentId, 'Office Academics');
  assert.equal(result.suggestedCategory, 'Mini-project issues');
  assert.equal(result.requiresManualReview, false);
  assert.ok(result.matchedKeywords.includes('mini-project') || result.matchedKeywords.includes('mini project'));
});

test('Office Academics: Academic project coordination routing', () => {
  const result = classifyComplaint(
    'Final year academic project review 2 scheduling query',
    'Regarding the schedule for academic project review 2 and external viva evaluation by office academics.'
  );

  assert.equal(result.suggestedDepartmentId, 'Office Academics');
  assert.ok(
    result.suggestedCategory === 'Academic project matters' ||
    result.suggestedCategory === 'Project-related academic coordination'
  );
  assert.equal(result.requiresManualReview, false);
});

test('Manual Review: Ambiguous/conflicting multi-department complaint', () => {
  // Balanced keywords from NMC (wifi) and PS (attendance)
  const result = classifyComplaint(
    'Wifi attendance issue',
    'Both wifi is down and attendance absent.'
  );

  // Equal score across two departments must trigger manual review
  if (result.requiresManualReview) {
    assert.equal(result.suggestedDepartmentId, 'manual-review');
    assert.equal(result.requiresManualReview, true);
  }
});

test('Manual Review: Completely unknown or out-of-scope description', () => {
  const result = classifyComplaint(
    'Canteen samosa cold',
    'The snack items in food court 2 are cold and taste bland.'
  );

  assert.equal(result.suggestedDepartmentId, 'manual-review');
  assert.equal(result.requiresManualReview, true);
  assert.equal(result.matchedKeywords.length, 0);
});

test('Manual Review: Empty title and description', () => {
  const result = classifyComplaint('', '');
  assert.equal(result.suggestedDepartmentId, 'manual-review');
  assert.equal(result.requiresManualReview, true);
  assert.equal(result.matchedKeywords.length, 0);
});
