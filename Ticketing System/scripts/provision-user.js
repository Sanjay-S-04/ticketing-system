/**
 * provision-user.js - Trusted Administrative Role Provisioning Script
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Usage:
 *   node scripts/provision-user.js <email> <role> [departmentId]
 *
 * Example:
 *   node scripts/provision-user.js admin@bitsathy.ac.in admin
 *   node scripts/provision-user.js staff.nmc@bitsathy.ac.in department NMC
 *
 * NOTE: Never expose service account credentials in client code.
 * This script runs in a secure server-side environment.
 */

import { DEPARTMENTS, USER_ROLES } from '../js/data.js';

const args = process.argv.slice(2);
const [email, role, departmentId] = args;

if (!email || !role) {
  console.log(`
======================================================================
  BIT Helpdesk - Server-Side Role Provisioning Utility
======================================================================

Usage:
  node scripts/provision-user.js <email> <role> [departmentId]

Arguments:
  <email>          Verified institutional email ending in @bitsathy.ac.in
  <role>           student | department | admin
  [departmentId]   Required if role is 'department':
                   NMC | PS | COE | Office Academics

Examples:
  node scripts/provision-user.js admin@bitsathy.ac.in admin
  node scripts/provision-user.js staff.nmc@bitsathy.ac.in department NMC
  node scripts/provision-user.js staff.coe@bitsathy.ac.in department COE
  node scripts/provision-user.js sanjay.cs22@bitsathy.ac.in student
======================================================================
`);
  process.exit(0);
}

// Validation
if (!email.endsWith('@bitsathy.ac.in')) {
  console.error(`\n[ERROR] Rejected: "${email}" is not an authorized @bitsathy.ac.in email.`);
  process.exit(1);
}

const validRoles = [USER_ROLES.STUDENT, USER_ROLES.DEPARTMENT, USER_ROLES.ADMIN];
if (!validRoles.includes(role)) {
  console.error(`\n[ERROR] Invalid role: "${role}". Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

if (role === USER_ROLES.DEPARTMENT) {
  const allowedDepts = ['NMC', 'PS', 'COE', 'Office Academics'];
  if (!departmentId || !allowedDepts.includes(departmentId)) {
    console.error(`\n[ERROR] Department role requires a valid departmentId: ${allowedDepts.join(', ')}`);
    process.exit(1);
  }
}

console.log(`\n======================================================`);
console.log(`[PROVISIONING READY]`);
console.log(`Account Email:   ${email}`);
console.log(`Assigned Role:   ${role}`);
console.log(`Department:      ${role === 'department' ? departmentId : 'N/A'}`);
console.log(`Active Status:   true`);
console.log(`Target Project:  helpdesk-ticketing-syste-a1b39`);
console.log(`======================================================`);
console.log(`
To deploy this assignment directly to production Cloud Firestore:
1. Ensure your serviceAccountKey.json is placed in your secure server environment.
2. The user doc 'users/{uid}' will be updated with:
   {
     "email": "${email}",
     "role": "${role}",
     "departmentId": ${role === 'department' ? `"${departmentId}"` : 'null'},
     "active": true,
     "updatedAt": new Date()
   }
3. The user can also be provisioned immediately via the Admin Dashboard UI.
`);
