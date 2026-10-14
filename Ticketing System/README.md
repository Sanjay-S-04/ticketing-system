# Intelligent Helpdesk Ticketing System with Automated Root-Cause Category Mapping

**Bannari Amman Institute of Technology, Sathyamangalam, India**  
**Authorized Institutional Domain:** `@bitsathy.ac.in`  
**Firebase Project ID:** `helpdesk-ticketing-syste-a1b39`

---

## 1. Project Objective

A secure, campus-wide helpdesk platform designed for Bannari Amman Institute of Technology (BIT Sathy). It allows students to submit technical and academic grievances, utilizes a deterministic rule-based classifier to automatically suggest root-cause categories and route tickets to the appropriate campus department, and provides transparent audit tracking with timeline and comment subcollections.

---

## 2. Technology Stack

- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript (ES modules)
- **Styling:** Custom CSS design system with CSS Variables, Poppins typography, and light/dark theme toggle
- **Authentication:** Firebase Authentication with Google Sign-in restricted to `@bitsathy.ac.in`
- **Database:** Cloud Firestore with strict role-based `firestore.rules`
- **Analytics:** Chart.js for real-time, database-derived metrics
- **Hosting:** Firebase Hosting with cache-control and security headers
- **Testing:** Node.js native test runner (`node:test`) for zero-dependency execution

---

## 3. Official Department Hierarchy & Root-Cause Categories

| Department Code | Full Department Name | Scope & Official Categories | Primary Keywords |
| :--- | :--- | :--- | :--- |
| **NMC** | Network Maintenance Cell | 1. Network connectivity<br>2. Wi-Fi and LAN<br>3. Network access points<br>4. Biometric system issues | `wifi`, `wi-fi`, `lan`, `ethernet`, `access point`, `router`, `biometric`, `fingerprint`, `hostel wifi`, `mac address` |
| **PS** | PS & Student Affairs | 1. PS Portal<br>2. PCDP App<br>3. Attendance issues | `ps portal`, `ps login`, `pcdp`, `pcdp app`, `attendance`, `absent`, `on duty`, `od entry`, `leave application` |
| **COE** | Controller of Examinations | 1. Examination-related issues<br>2. Examination timetable<br>3. Results and grade-card issues | `exam`, `timetable`, `hall ticket`, `results`, `grade card`, `marksheet`, `gpa`, `cgpa`, `revaluation`, `arrear` |
| **Office Academics** | Office of Academic Affairs | 1. Mini-project issues<br>2. Academic project matters<br>3. Project-related academic coordination | `mini-project`, `mini project`, `academic project`, `final year project`, `project guide`, `guide approval`, `project review` |
| **Manual Review** | Manual Review & Triage | 1. General / Ambiguous Complaint<br>2. Cross-Departmental Issue<br>3. Needs Human Review | Fallback when complaint text has conflicting keywords across departments, zero matches, or empty input |

---

## 4. Architecture & Folder Structure

```
Intelligent-Helpdesk-Ticketing-System/
├── index.html                   # Landing page with hero, department cards, workflow & live simulator
├── login.html                   # Google OAuth portal with @bitsathy.ac.in enforcement & test sandbox
├── student-dashboard.html       # Student grievance submission, live recommendation & personal queue
├── department-dashboard.html    # Department queue, permitted status updates & escalation modal
├── admin-dashboard.html         # Chart.js analytics, manual review triage & user role provisioning
├── css/
│   ├── variables.css            # Tokens, blue/indigo/purple palette, Poppins font, dark mode
│   ├── main.css                 # Base resets, buttons, department/status badges, modals, toasts
│   ├── landing.css              # Landing hero, department cards grid, workflow stepper
│   ├── login.css                # Split card layout, Google sign-in styling, domain badge
│   └── dashboard.css            # Top navigation, metric cards, ticket table, audit timeline
├── js/
│   ├── firebase.js              # Modular Firebase v10 initialization & config detection
│   ├── auth.js                  # @bitsathy.ac.in domain validation, role enforcement & route guards
│   ├── data.js                  # Institutional constants, department catalog & status definitions
│   ├── ticket-service.js        # Full CRUD, subcollections (timeline, comments) & dual driver
│   ├── classification.js        # Deterministic, explainable rule-based classifier
│   ├── app.js                   # Toast system, light/dark theme toggle, modals & dashboard header
│   ├── student.js               # Student submission, live recommendation & personal tickets
│   ├── department.js            # Department queue management, status updates & remarks
│   ├── admin.js                 # Chart.js analytics, manual triage & role provisioning
│   └── charts.js                # Chart.js renderers (Department load, Status, Monthly trend)
├── tests/
│   ├── classification.test.js   # 13 unit tests for NMC, PS, COE, Academics, conflicts & edge cases
│   └── firestore-rules.test.js  # 5 validation tests for Firestore security constraints
├── scripts/
│   ├── serve.js                 # Zero-dependency local static development server
│   └── provision-user.js        # Trusted server-side administrative role provisioning utility
├── firestore.rules              # Production security rules (role enforcement & subcollection audits)
├── firestore.indexes.json       # Compound queries indexing definitions
├── firebase.json                # Hosting configuration & emulator ports
├── .firebaserc                  # Project ID alias (helpdesk-ticketing-syste-a1b39)
├── .gitignore                   # Standard ignore rules
├── package.json                 # Project scripts & metadata
└── README.md                    # Comprehensive documentation
```

---

## 5. Classification Engine Details

Located in `js/classification.js`, the classifier is **100% deterministic, rule-based, and explainable**:
- **Text Normalization:** Converts complaint text to lowercase, strips punctuation, and collapses whitespace.
- **Weighted N-Gram & Keyword Scoring:** High-specificity phrases carry greater weight (e.g. `mini-project guide` = 4 pts, `ps portal` = 3 pts) than single words (`wifi` = 2 pts).
- **Conflict Handling:** If two different departments tie for the top score or match overlapping keywords, the ticket is flagged with `requiresManualReview = true` and routed to `manual-review` so human staff can triage without arbitrary guessing.
- **Zero-Match Fallback:** Completely unmapped or out-of-scope complaints route safely to `manual-review`.
- **Explainability:** Returns exact matched keywords and transparent rationale. Never invents confidence percentages or claims AI without an actual trained ML model.

---

## 6. Firestore Database Schema

### `users/{uid}`
- `email` (string): Must end in `@bitsathy.ac.in`
- `displayName` (string): Student or staff name
- `role` (string): `'student'` | `'department'` | `'admin'` | `'pending'`
- `departmentId` (string | null): `'NMC'` | `'PS'` | `'COE'` | `'Office Academics'` | `null`
- `active` (boolean): Login authorization status
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `tickets/{ticketId}`
- `ticketNumber` (string): e.g. `BIT-2026-1042`
- `title` (string): Subject line
- `description` (string): Full issue explanation
- `userId` (string): Author UID
- `userEmail` (string): Author institutional email
- `userDisplayName` (string)
- `category` (string): Specific root cause category
- `departmentId` (string): Target department code or `'manual-review'`
- `classificationMethod` (string): `'rule-based-keyword-v1'`
- `matchedKeywords` (array of strings): Matched keyword tokens
- `requiresManualReview` (boolean)
- `status` (string): `'OPEN'` | `'IN_PROGRESS'` | `'RESOLVED'` | `'ESCALATED'`
- `resolutionNotes` (string | null): Mandatory notes recorded when resolved
- `assignedTo` (string | null)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `tickets/{ticketId}/comments/{commentId}`
- `senderUid` (string): Author UID
- `senderDisplayName` (string): Author display name
- `senderRole` (string): `'student'` | `'department'` | `'admin'`
- `body` (string): Comment content
- `timestamp` (timestamp)

### `tickets/{ticketId}/timeline/{eventId}`
- `action` (string): `'CREATED'` | `'STATUS_CHANGE'` | `'DEPARTMENT_TRANSFER'` | `'RESOLVED'`
- `actorUid` (string)
- `actorDisplayName` (string)
- `previousStatus` (string | null)
- `newStatus` (string)
- `details` (string)
- `timestamp` (timestamp)

---

## 7. Security Rules Highlights (`firestore.rules`)

- **Domain Restriction:** `request.auth.token.email.matches('^[a-zA-Z0-9._%+-]+@bitsathy\\.ac\\.in$')`
- **Student Ownership:** Students can only read tickets matching `resource.data.userId == request.auth.uid`.
- **Department Isolation:** Department staff can only read and manage tickets where `resource.data.departmentId == getUserData().departmentId`.
- **Immutability Protection:** Ordinary users cannot modify historical timeline events, comments, or ticket numbers.
- **Role Tampering Defense:** Users cannot promote their own role or alter department assignments; only administrators can update privileged fields.

---

## 8. Firebase Console Setup Steps

To connect the application to the live Firebase backend for project `helpdesk-ticketing-syste-a1b39`:

1. **Open Firebase Console:** Navigate to [https://console.firebase.google.com](https://console.firebase.google.com) and select project `helpdesk-ticketing-syste-a1b39`.
2. **Register Web App:** Under Project Settings > General > Your Apps, click **Web (</>)**, name it `BIT Helpdesk Web`, and copy the generated `firebaseConfig`.
3. **Enable Google Authentication:** Go to **Build > Authentication > Sign-in method**, enable **Google**, and ensure `localhost` is added to Authorized Domains.
4. **Create Cloud Firestore:** Go to **Build > Firestore Database**, click **Create Database** (choose region `asia-south1` or `us-central1`).
5. **Deploy Security Rules:** Run `npm run deploy:rules` to deploy `firestore.rules` and `firestore.indexes.json`.
6. **Connect Config in App:** Click the **⚙️ Firebase Setup** button on the top nav of any dashboard or login page and paste the `firebaseConfig` object.

---

## 9. Local Development & Testing Commands

### Run Unit Tests
```bash
# Run classification engine tests (13 test cases)
npm test

# Run firestore rules validation tests (5 test cases)
npm run test:rules

# Run all test suites
npm run test:all
```

### Start Local Development Server
```bash
npm run serve
# Access: http://localhost:3000/index.html
```

### Role Provisioning Utility
```bash
# Provision an administrator
node scripts/provision-user.js admin@bitsathy.ac.in admin

# Provision department staff
node scripts/provision-user.js staff.nmc@bitsathy.ac.in department NMC
node scripts/provision-user.js staff.ps@bitsathy.ac.in department PS
node scripts/provision-user.js staff.coe@bitsathy.ac.in department COE
node scripts/provision-user.js staff.academics@bitsathy.ac.in department "Office Academics"
```

### Firebase Deployment
```bash
# Login to Firebase CLI
npx firebase-tools login

# Select project
npx firebase-tools use helpdesk-ticketing-syste-a1b39

# Deploy Security Rules & Indexes
npm run deploy:rules

# Deploy Hosting
npm run deploy:hosting
```
