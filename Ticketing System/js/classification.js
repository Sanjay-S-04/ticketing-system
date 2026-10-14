/**
 * classification.js - Deterministic, Explainable Rule-Based Classifier
 * Bannari Amman Institute of Technology Helpdesk
 *
 * NOTE: This is a 100% deterministic, rule-based keyword & phrase mapping engine.
 * It does NOT use artificial intelligence or randomized confidence scores.
 * All logic is inspectable, auditable, and unit-tested.
 */

import { DEPARTMENTS } from './data.js';

// Category specific keyword dictionaries for fine-grained root-cause category mapping
const CATEGORY_RULES = [
  // --- NMC (Network Maintenance Cell) ---
  {
    departmentId: 'NMC',
    category: 'Wi-Fi and LAN',
    phrases: ['wifi', 'wi-fi', 'lan', 'ethernet', 'hostel wifi', 'lab network', 'access point', 'ap router', 'no internet', 'slow internet'],
    weight: 2
  },
  {
    departmentId: 'NMC',
    category: 'Network connectivity',
    phrases: ['network connectivity', 'network down', 'dns failure', 'packet loss', 'bandwidth', 'ip address', 'mac address', 'switch port', 'firewall block'],
    weight: 2
  },
  {
    departmentId: 'NMC',
    category: 'Network access points',
    phrases: ['access point', 'router broken', 'ap not blinking', 'ap offline', 'cisco ap', 'aruba ap', 'signal strength'],
    weight: 3
  },
  {
    departmentId: 'NMC',
    category: 'Biometric system issues',
    phrases: ['biometric', 'fingerprint', 'face recognition', 'rfid punch', 'biometric machine', 'punch error', 'fingerprint scanner', 'biometric device'],
    weight: 3
  },

  // --- PS (PS Portal & Student Affairs) ---
  {
    departmentId: 'PS',
    category: 'PS Portal',
    phrases: ['ps portal', 'psportal', 'ps login', 'ps password', 'portal error', 'student portal', 'portal server error', 'profile update in ps'],
    weight: 3
  },
  {
    departmentId: 'PS',
    category: 'PCDP App',
    phrases: ['pcdp', 'pcdp app', 'pcdp crash', 'pcdp mobile', 'pcdp notification', 'pcdp playstore'],
    weight: 3
  },
  {
    departmentId: 'PS',
    category: 'Attendance issues',
    phrases: ['attendance', 'absent', 'attendance shortage', 'marked absent', 'hour attendance', 'day attendance', 'on duty', 'od entry', 'leave entry', 'mentor attendance'],
    weight: 2
  },

  // --- COE (Controller of Examinations) ---
  {
    departmentId: 'COE',
    category: 'Examination timetable',
    phrases: ['timetable', 'time table', 'exam timetable', 'timetable clash', 'exam clash', 'exam schedule', 'supplementary schedule'],
    weight: 3
  },
  {
    departmentId: 'COE',
    category: 'Results and grade-card issues',
    phrases: ['result', 'results', 'grade card', 'marksheet', 'mark sheet', 'gpa', 'cgpa', 'revaluation', 're-valuation', 'internal marks discrepancy', 'semester result'],
    weight: 3
  },
  {
    departmentId: 'COE',
    category: 'Examination-related issues',
    phrases: ['hall ticket', 'admit card', 'coe', 'controller of examinations', 'arrear fee', 'exam hall', 'invigilator issue', 'semester exam', 'end semester'],
    weight: 2
  },

  // --- Office Academics ---
  {
    departmentId: 'Office Academics',
    category: 'Mini-project issues',
    phrases: ['mini-project', 'mini project', 'mini project review', 'mini project guide', 'mini project evaluation', 'mini project batch', 'mini project guide approval'],
    weight: 4
  },
  {
    departmentId: 'Office Academics',
    category: 'Academic project matters',
    phrases: ['academic project', 'final year project', 'capstone project', 'project review', 'review 1', 'review 2', 'review 3', 'zeroth review', 'project viva'],
    weight: 3
  },
  {
    departmentId: 'Office Academics',
    category: 'Project-related academic coordination',
    phrases: ['project guide', 'guide approval', 'project coordinator', 'project coordination', 'office academics', 'project submission', 'change guide', 'project title change'],
    weight: 2
  }
];

/**
 * Normalizes user text for fair, deterministic matching.
 * Converts to lowercase, strips noisy punctuation, collapses spaces.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/['"’`]/g, '')               // remove quotes
    .replace(/[^\w\s-]/g, ' ')           // replace special symbols with space except hyphen
    .replace(/\s+/g, ' ')                // collapse whitespace
    .trim();
}

/**
 * Classifies a ticket complaint based on title and description.
 *
 * @param {string} title - Ticket title
 * @param {string} description - Ticket full description
 * @returns {Object} Classification result
 */
export function classifyComplaint(title = '', description = '') {
  const combinedText = `${title} ${description}`;
  const normalized = normalizeText(combinedText);

  if (!normalized) {
    return {
      suggestedCategory: 'General / Ambiguous Complaint',
      suggestedDepartmentId: 'manual-review',
      departmentName: DEPARTMENTS.MANUAL_REVIEW.name,
      matchedKeywords: [],
      departmentScores: {
        NMC: 0,
        PS: 0,
        COE: 0,
        'Office Academics': 0
      },
      classificationMethod: 'rule-based-keyword-v1',
      requiresManualReview: true,
      confidenceNote: 'Complaint text is empty. Routed to Manual Review.'
    };
  }

  // Score accumulator per department & category
  const deptScores = {
    NMC: 0,
    PS: 0,
    COE: 0,
    'Office Academics': 0
  };

  const categoryScores = {};
  const matchedKeywords = new Set();
  const matchedRules = [];

  // Match against fine-grained category rules
  for (const rule of CATEGORY_RULES) {
    for (const phrase of rule.phrases) {
      const phraseRegex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (phraseRegex.test(normalized)) {
        matchedKeywords.add(phrase);
        deptScores[rule.departmentId] = (deptScores[rule.departmentId] || 0) + rule.weight;

        const catKey = `${rule.departmentId}:::${rule.category}`;
        categoryScores[catKey] = (categoryScores[catKey] || 0) + rule.weight;

        matchedRules.push({
          departmentId: rule.departmentId,
          category: rule.category,
          phrase,
          weight: rule.weight
        });
      }
    }
  }

  // Also match general department keywords from DEPARTMENTS definition
  for (const [deptKey, deptObj] of Object.entries(DEPARTMENTS)) {
    if (deptObj.id === 'manual-review') continue;
    for (const keyword of deptObj.keywords) {
      if (matchedKeywords.has(keyword)) continue; // already counted
      const kwRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (kwRegex.test(normalized)) {
        matchedKeywords.add(keyword);
        deptScores[deptObj.id] = (deptScores[deptObj.id] || 0) + 1;
      }
    }
  }

  const keywordList = Array.from(matchedKeywords);

  // Sort departments by score descending
  const sortedDepts = Object.entries(deptScores).sort((a, b) => b[1] - a[1]);
  const [topDept, topScore] = sortedDepts[0];
  const [secondDept, secondScore] = sortedDepts[1];

  // Case 1: No keywords matched at all
  if (topScore === 0) {
    return {
      suggestedCategory: 'General / Ambiguous Complaint',
      suggestedDepartmentId: 'manual-review',
      departmentName: DEPARTMENTS.MANUAL_REVIEW.name,
      matchedKeywords: [],
      departmentScores: deptScores,
      classificationMethod: 'rule-based-keyword-v1',
      requiresManualReview: true,
      confidenceNote: 'No official department keywords recognized. Ticket flagged for Manual Review & Triage.'
    };
  }

  // Case 2: Conflicting match (tie or extremely close overlapping keywords across distinct departments)
  if (topScore > 0 && topScore === secondScore) {
    return {
      suggestedCategory: 'Cross-Departmental Issue',
      suggestedDepartmentId: 'manual-review',
      departmentName: DEPARTMENTS.MANUAL_REVIEW.name,
      matchedKeywords: keywordList,
      departmentScores: deptScores,
      classificationMethod: 'rule-based-keyword-v1',
      requiresManualReview: true,
      confidenceNote: `Conflicting keywords found between ${topDept} (score: ${topScore}) and ${secondDept} (score: ${secondScore}). Routed to Manual Review.`
    };
  }

  // Case 3: Clear winner department! Find the highest scoring specific category within that department
  let bestCategory = null;
  let bestCategoryScore = -1;

  for (const [catKey, score] of Object.entries(categoryScores)) {
    const [deptId, categoryName] = catKey.split(':::');
    if (deptId === topDept && score > bestCategoryScore) {
      bestCategoryScore = score;
      bestCategory = categoryName;
    }
  }

  // Fallback to first department category if none matched specifically
  if (!bestCategory) {
    const deptObj = Object.values(DEPARTMENTS).find(d => d.id === topDept);
    bestCategory = deptObj?.categories[0] || 'General Departmental Issue';
  }

  const deptInfo = Object.values(DEPARTMENTS).find(d => d.id === topDept) || DEPARTMENTS.MANUAL_REVIEW;

  return {
    suggestedCategory: bestCategory,
    suggestedDepartmentId: topDept,
    departmentName: deptInfo.name,
    matchedKeywords: keywordList,
    departmentScores: deptScores,
    classificationMethod: 'rule-based-keyword-v1',
    requiresManualReview: false,
    confidenceNote: `Matched ${keywordList.length} relevant keyword(s) with highest score (${topScore}) for ${deptInfo.name}.`
  };
}
