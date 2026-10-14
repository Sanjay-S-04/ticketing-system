/**
 * data.js - Institutional Constants & Configuration
 * Bannari Amman Institute of Technology, Sathyamangalam, India
 */

export const INSTITUTION = {
  name: 'Bannari Amman Institute of Technology',
  shortName: 'BIT Sathy',
  location: 'Sathyamangalam, Tamil Nadu, India',
  allowedDomain: '@bitsathy.ac.in',
  domainRegex: /^[a-zA-Z0-9._%+-]+@bitsathy\.ac\.in$/i
};

export const DEPARTMENTS = {
  NMC: {
    id: 'NMC',
    code: 'NMC',
    name: 'Network Maintenance Cell',
    description: 'Manages campus Wi-Fi, LAN connectivity, network access points, and biometric attendance hardware.',
    icon: 'wifi',
    color: '#2563eb',
    badgeClass: 'badge-nmc',
    categories: [
      'Network connectivity',
      'Wi-Fi and LAN',
      'Network access points',
      'Biometric system issues'
    ],
    keywords: [
      'wifi', 'wi-fi', 'lan', 'ethernet', 'internet', 'network',
      'access point', 'ap', 'router', 'switch', 'bandwidth',
      'biometric', 'fingerprint', 'face recognition', 'punch', 'rfid punch',
      'nmc', 'connectivity', 'no signal', 'packet loss', 'dns',
      'hostel wifi', 'lab network', 'ip address', 'mac address'
    ]
  },
  PS: {
    id: 'PS',
    code: 'PS',
    name: 'PS & Student Affairs',
    description: 'Handles PS Portal software issues, PCDP mobile app bugs, and student attendance record discrepancies.',
    icon: 'user-check',
    color: '#7c3aed',
    badgeClass: 'badge-ps',
    categories: [
      'PS Portal',
      'PCDP App',
      'Attendance issues'
    ],
    keywords: [
      'ps portal', 'psportal', 'pcdp', 'pcdp app', 'attendance', 'absent',
      'od', 'on duty', 'leave application', 'mentor attendance',
      'ps login', 'ps password', 'student portal', 'attendance shortage',
      'punch missing in portal', 'day attendance', 'hour attendance',
      'placement portal', 'pcdp crash', 'profile update in ps'
    ]
  },
  COE: {
    id: 'COE',
    code: 'COE',
    name: 'Controller of Examinations',
    description: 'Oversees semester examination schedules, hall tickets, timetable clashes, results, revaluation, and grade cards.',
    icon: 'award',
    color: '#0891b2',
    badgeClass: 'badge-coe',
    categories: [
      'Examination-related issues',
      'Examination timetable',
      'Results and grade-card issues'
    ],
    keywords: [
      'exam', 'examination', 'coe', 'controller of examinations',
      'timetable', 'time table', 'clash', 'hall ticket', 'admit card',
      'result', 'results', 'grade', 'grade card', 'marksheet', 'mark sheet',
      'gpa', 'cgpa', 'revaluation', 're-valuation', 'arrear',
      'supplementary exam', 'semester exam', 'end semester', 'internal mark discrepancy'
    ]
  },
  OFFICE_ACADEMICS: {
    id: 'Office Academics',
    code: 'Office Academics',
    name: 'Office of Academic Affairs',
    description: 'Coordinates mini-projects, final year academic project reviews, guide allocations, and curriculum coordination.',
    icon: 'book-open',
    color: '#059669',
    badgeClass: 'badge-academics',
    categories: [
      'Mini-project issues',
      'Academic project matters',
      'Project-related academic coordination'
    ],
    keywords: [
      'mini-project', 'mini project', 'academic project', 'final year project',
      'capstone', 'project guide', 'guide approval', 'project review',
      'review 1', 'review 2', 'review 3', 'project viva', 'project marks',
      'project coordination', 'office academics', 'project submission',
      'project team', 'project mentor', 'zeroth review', 'project title change'
    ]
  },
  MANUAL_REVIEW: {
    id: 'manual-review',
    code: 'manual-review',
    name: 'Manual Review & Triage',
    description: 'Complaints with conflicting keywords, ambiguous descriptions, or requiring human administrator triage.',
    icon: 'help-circle',
    color: '#d97706',
    badgeClass: 'badge-review',
    categories: [
      'General / Ambiguous Complaint',
      'Cross-Departmental Issue',
      'Needs Human Review'
    ],
    keywords: []
  }
};

export const TICKET_STATUS = {
  OPEN: {
    key: 'OPEN',
    label: 'Open',
    badgeClass: 'status-open',
    description: 'Ticket submitted, awaiting department action'
  },
  IN_PROGRESS: {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    badgeClass: 'status-progress',
    description: 'Department technician is currently investigating'
  },
  RESOLVED: {
    key: 'RESOLVED',
    label: 'Resolved',
    badgeClass: 'status-resolved',
    description: 'Issue addressed and resolution notes recorded'
  },
  ESCALATED: {
    key: 'ESCALATED',
    label: 'Escalated',
    badgeClass: 'status-escalated',
    description: 'Escalated to senior management or administrator'
  }
};

export const USER_ROLES = {
  STUDENT: 'student',
  DEPARTMENT: 'department',
  ADMIN: 'admin',
  PENDING: 'pending'
};

/**
 * Returns allowed next statuses for a given current status
 */
export function getAllowedTransitions(currentStatus, role) {
  if (role === 'admin') {
    return ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];
  }
  switch (currentStatus) {
    case 'OPEN':
      return ['IN_PROGRESS', 'ESCALATED'];
    case 'IN_PROGRESS':
      return ['RESOLVED', 'ESCALATED'];
    case 'ESCALATED':
      return ['IN_PROGRESS', 'RESOLVED'];
    case 'RESOLVED':
      return ['IN_PROGRESS']; // Reopen if needed
    default:
      return [];
  }
}

/**
 * Normalizes any department ID format (e.g. 'office_academics', 'NMC', 'manual_review')
 * to standard canonical format.
 */
export function normalizeDepartmentId(deptId) {
  if (!deptId || typeof deptId !== 'string') return 'manual-review';
  const clean = deptId.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (clean === 'nmc') return 'NMC';
  if (clean === 'ps') return 'PS';
  if (clean === 'coe') return 'COE';
  if (clean === 'office_academics' || clean === 'academics') return 'Office Academics';
  if (clean === 'manual_review' || clean === 'review') return 'manual-review';
  return deptId;
}

/**
 * Helper to get department object safely by ID or alias
 */
export function getDepartmentById(deptId) {
  if (!deptId) return DEPARTMENTS.MANUAL_REVIEW;
  const canonical = normalizeDepartmentId(deptId);
  for (const key of Object.keys(DEPARTMENTS)) {
    if (
      DEPARTMENTS[key].id === deptId ||
      DEPARTMENTS[key].code === deptId ||
      DEPARTMENTS[key].id === canonical ||
      DEPARTMENTS[key].code === canonical
    ) {
      return DEPARTMENTS[key];
    }
  }
  return DEPARTMENTS.MANUAL_REVIEW;
}
