/**
 * app.js - Shared UI Orchestration, Modals, Toasts & Theme Controls
 * Bannari Amman Institute of Technology Helpdesk
 */

import { getCurrentUserProfile, logoutUser } from './auth.js';
import { isFirebaseConfigured, getActiveFirebaseConfig, saveFirebaseConfig } from './firebase.js';

// SVG Icons Dictionary for consistent crisp rendering
export const ICONS = {
  wifi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  userCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`,
  award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  helpCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  logOut: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

/**
 * Toast Notification System
 */
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none;border:none;color:inherit;cursor:pointer;font-size:1.1rem;line-height:1;" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 200);
    }
  }, duration);
}

/**
 * Light / Dark Theme Management
 */
export function initTheme() {
  const saved = localStorage.getItem('bit_helpdesk_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const active = saved || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', active);
  updateThemeIcon(active);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bit_helpdesk_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const toggles = document.querySelectorAll('.theme-toggle-btn');
  toggles.forEach(btn => {
    btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

/**
 * Modal Dialog Open/Close Helpers
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, textarea, select, button.btn-primary');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Renders Top Dashboard Header Bar
 */
export function setupDashboardHeader(activeRole) {
  const user = getCurrentUserProfile();
  const navContainer = document.getElementById('dashboard-nav-container');
  if (!navContainer) return;

  const roleLabels = {
    student: 'Student Portal',
    department: user?.departmentId ? `${user.departmentId} Staff` : 'Department Staff',
    admin: 'IT Admin Central'
  };

  const rolePillClasses = {
    student: 'role-pill-student',
    department: 'role-pill-department',
    admin: 'role-pill-admin'
  };

  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';

  navContainer.innerHTML = `
    <nav class="dashboard-nav" aria-label="Main Navigation">
      <div class="container dashboard-nav-inner">
        <a href="index.html" class="dash-brand">
          <div class="dash-brand-emblem">BIT</div>
          <div class="dash-brand-info">
            <h1>Helpdesk System</h1>
            <span>Bannari Amman Institute of Technology</span>
          </div>
        </a>

        <div class="dash-nav-center">
          <span class="role-pill ${rolePillClasses[user?.role || activeRole]}">
            ${roleLabels[user?.role || activeRole]}
          </span>
          ${
            !isFirebaseConfigured()
              ? `<button id="btn-open-config-modal" class="btn btn-sm btn-outline" style="font-size:0.75rem;padding:0.25rem 0.5rem;color:var(--color-review);border-color:var(--color-review);" title="Firebase Console configuration pending">
                  ${ICONS.settings} Firebase Setup
                </button>`
              : ''
          }
        </div>

        <div class="dash-nav-actions">
          <button class="btn-icon theme-toggle-btn" aria-label="Toggle Theme" title="Toggle Theme">
            ${ICONS.moon}
          </button>

          <div class="user-profile-badge" title="${user?.email || 'Institutional User'}">
            <div class="user-avatar">${initial}</div>
            <span class="user-name">${user?.displayName || 'User'}</span>
          </div>

          <button id="btn-logout" class="btn btn-sm btn-secondary" title="Sign Out">
            ${ICONS.logOut} <span style="display:none;@media(min-width:600px){display:inline;}">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  `;

  // Attach event handlers
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out of BIT Helpdesk?')) {
        logoutUser();
      }
    });
  }

  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => btn.addEventListener('click', toggleTheme));

  const configBtn = document.getElementById('btn-open-config-modal');
  if (configBtn) {
    configBtn.addEventListener('click', () => openModal('firebase-setup-modal'));
  }

  initTheme();
}

/**
 * Injects Firebase Setup Instructions Modal into document body
 */
export function injectFirebaseSetupModal() {
  if (document.getElementById('firebase-setup-modal')) return;

  const modalHtml = `
    <div id="firebase-setup-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cfg-title">
      <div class="modal-box" style="max-width: 620px;">
        <div class="modal-header">
          <h2 id="cfg-title" class="modal-title">Firebase Console Setup & Credentials</h2>
          <button class="modal-close" onclick="document.getElementById('firebase-setup-modal').classList.remove('active'); document.body.style.overflow='';" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            ${ICONS.info}
            <div>
              <strong>Reported Project ID:</strong> <code>helpdesk-ticketing-syste-a1b39</code><br>
              <small>Project Name: <em>Helpdesk ticketing system</em></small>
            </div>
          </div>

          <p style="margin-bottom:1rem; font-size:0.875rem;">
            Follow these exact 7 Firebase Console configuration steps to enable live production database & authentication:
          </p>

          <ol style="padding-left:1.25rem; font-size:0.825rem; color:var(--text-muted); line-height:1.7; margin-bottom:1.25rem;">
            <li><strong>Register Web App:</strong> In <a href="https://console.firebase.google.com" target="_blank" rel="noopener">Firebase Console</a>, open project <code>helpdesk-ticketing-syste-a1b39</code>, click <strong>Project Settings > General > Your Apps > Web (&lt;/&gt;)</strong>.</li>
            <li><strong>Authentication:</strong> Go to <strong>Build > Authentication</strong>, enable <strong>Google Sign-in</strong>, set Authorized Domain to include <code>localhost</code> and your hosting domain.</li>
            <li><strong>Cloud Firestore:</strong> Go to <strong>Build > Firestore Database</strong>, click <strong>Create Database</strong> in Production or Test mode (region: <code>asia-south1</code> or <code>us-central1</code>).</li>
            <li><strong>Security Rules:</strong> Deploy the reviewed <code>firestore.rules</code> file using <code>npm run deploy:rules</code>.</li>
            <li><strong>Indexes:</strong> Deploy compound indexes with <code>firestore.indexes.json</code>.</li>
            <li><strong>Role Provisioning:</strong> Admin user accounts are provisioned via the Admin Dashboard or bootstrap script.</li>
            <li><strong>Paste Web Config:</strong> Paste the <code>firebaseConfig</code> object from Firebase Console below to connect live Firestore:</li>
          </ol>

          <div class="form-group">
            <label class="form-label" for="cfg-json">firebaseConfig JSON:</label>
            <textarea id="cfg-json" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem; min-height:130px;" placeholder='{\n  "apiKey": "AIzaSy...",\n  "authDomain": "helpdesk-ticketing-syste-a1b39.firebaseapp.com",\n  "projectId": "helpdesk-ticketing-syste-a1b39",\n  "storageBucket": "helpdesk-ticketing-syste-a1b39.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('firebase-setup-modal').classList.remove('active'); document.body.style.overflow='';">Close</button>
          <button id="btn-save-cfg" class="btn btn-primary">Save Configuration & Reload</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const saveBtn = document.getElementById('btn-save-cfg');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const val = document.getElementById('cfg-json').value.trim();
      try {
        const parsed = JSON.parse(val);
        if (!parsed.apiKey) throw new Error('Missing apiKey');
        saveFirebaseConfig(parsed);
        showToast('Firebase configuration saved successfully! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('Invalid JSON. Please paste the exact config object from Firebase Console.', 'error');
      }
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  injectFirebaseSetupModal();

  // Escape key closes open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
});
