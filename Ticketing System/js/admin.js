/**
 * admin.js - Institutional IT Central Administration Controller
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Real-time campus-wide analytics via Chart.js, manual review triage,
 * global ticket management, and trusted user role provisioning.
 */

import { protectPage, getCurrentUserProfile } from './auth.js';
import { setupDashboardHeader, showToast, openModal, closeModal, ICONS } from './app.js';
import { DEPARTMENTS, getDepartmentById } from './data.js';
import { renderDepartmentChart, renderStatusChart, renderMonthlyTrendChart } from './charts.js';
import {
  getAllTicketsAdmin,
  getTicketById,
  reassignTicketDepartment,
  updateTicketStatus,
  getAllUsersList,
  updateUserRoleAssignment,
  getTicketTimeline,
  getTicketComments,
  subscribeAdminTickets
} from './ticket-service.js';

let currentUser = null;
let allTickets = [];
let allUsers = [];
let activeAdminTab = 'analytics'; // 'analytics' | 'manual-review' | 'all-tickets' | 'users'
let activeTriageTicketId = null;
let adminTicketsUnsubscribe = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = protectPage('admin');
  if (!currentUser) return;

  setupDashboardHeader('admin');
  initAdminNavigation();
  initTriageActions();
  initUserProvisioning();
  initRealtimeAdminTickets();
  await loadUsersData();

  window.addEventListener('beforeunload', () => {
    if (adminTicketsUnsubscribe) {
      adminTicketsUnsubscribe();
      adminTicketsUnsubscribe = null;
    }
  });
});

/**
 * Initializes Admin Tab navigation (Analytics, Manual Review Queue, All Tickets, Role Provisioning)
 */
function initAdminNavigation() {
  const tabs = document.querySelectorAll('.admin-nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeAdminTab = tab.getAttribute('data-tab');

      document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.style.display = 'none';
      });

      const activePane = document.getElementById(`pane-${activeAdminTab}`);
      if (activePane) activePane.style.display = 'block';

      if (activeAdminTab === 'analytics') {
        renderCharts();
      } else if (activeAdminTab === 'manual-review') {
        renderManualReviewQueue();
      } else if (activeAdminTab === 'all-tickets') {
        renderAllTicketsTable();
      } else if (activeAdminTab === 'users') {
        renderUsersTable();
      }
    });
  });
}

/**
 * Initializes real-time listener for campus-wide tickets
 */
function initRealtimeAdminTickets() {
  adminTicketsUnsubscribe = subscribeAdminTickets(
    (tickets) => {
      allTickets = tickets || [];
      updateMetricCards();
      if (activeAdminTab === 'analytics') {
        renderCharts();
      } else if (activeAdminTab === 'manual-review') {
        renderManualReviewQueue();
      } else if (activeAdminTab === 'all-tickets') {
        renderAllTicketsTable();
      }
    },
    (err) => {
      console.error('Real-time listener error for admin tickets:', err);
      showToast('Could not sync administrative updates.', 'error');
    }
  );
}

/**
 * Loads institutional users list for role provisioning
 */
async function loadUsersData() {
  try {
    allUsers = await getAllUsersList();
    renderUsersTable();
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

/**
 * Computes live metrics from database records
 */
function updateMetricCards() {
  const total = allTickets.length;
  const open = allTickets.filter(t => t.status === 'OPEN').length;
  const inProgress = allTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ESCALATED').length;
  const resolved = allTickets.filter(t => t.status === 'RESOLVED').length;
  const manualReview = allTickets.filter(t => t.departmentId === 'manual-review' || t.requiresManualReview).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-open').textContent = open;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-resolved').textContent = resolved;
  document.getElementById('stat-review').textContent = manualReview;

  const badgeEl = document.getElementById('tab-badge-review');
  if (badgeEl) {
    badgeEl.textContent = manualReview;
    badgeEl.style.display = manualReview > 0 ? 'inline-flex' : 'none';
  }
}

/**
 * Renders Chart.js charts
 */
function renderCharts() {
  renderDepartmentChart('chart-dept-dist', allTickets);
  renderStatusChart('chart-status-dist', allTickets);
  renderMonthlyTrendChart('chart-monthly-trends', allTickets);
}

/**
 * Renders Manual Review Triage queue (unresolved/conflicting complaints)
 */
function renderManualReviewQueue() {
  const container = document.getElementById('manual-review-tbody');
  const emptyState = document.getElementById('manual-review-empty');

  const reviewTickets = allTickets.filter(t =>
    (t.departmentId === 'manual-review' || t.requiresManualReview) &&
    t.status !== 'RESOLVED'
  );

  if (reviewTickets.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (container) {
    container.innerHTML = reviewTickets.map(t => {
      const dateFormatted = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      }) : 'Recent';

      const reason = t.classificationMethod === 'rule-based-keyword-v1' && t.matchedKeywords?.length === 0
        ? 'No matching department keywords'
        : (t.matchedKeywords?.length > 1 ? `Conflicting tokens: ${t.matchedKeywords.join(', ')}` : 'Flagged for review');

      return `
        <tr>
          <td><span class="ticket-number-mono">${t.ticketNumber}</span></td>
          <td>
            <strong>${escapeHtml(t.title)}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              ${escapeHtml(t.description.substring(0, 100))}${t.description.length > 100 ? '...' : ''}
            </div>
          </td>
          <td>
            <div style="font-weight:600;">${escapeHtml(t.userDisplayName || 'Student')}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(t.userEmail)}</div>
          </td>
          <td>
            <span style="font-size:0.8rem; color:var(--color-review); font-weight:600;">
              ${reason}
            </span>
          </td>
          <td>
            <span class="badge status-${t.status.toLowerCase()}">${t.status}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary btn-triage-ticket" data-id="${t.id}">
              Triage & Route
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.btn-triage-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openTriageModal(id);
      });
    });
  }
}

/**
 * Opens Triage modal for routing manual review ticket to official department
 */
async function openTriageModal(ticketId) {
  activeTriageTicketId = ticketId;
  const ticket = await getTicketById(ticketId);
  if (!ticket) return;

  document.getElementById('triage-ticket-num').textContent = ticket.ticketNumber;
  document.getElementById('triage-ticket-title').textContent = ticket.title;
  document.getElementById('triage-ticket-desc').textContent = ticket.description;

  const select = document.getElementById('triage-target-dept');
  select.innerHTML = `
    <option value="NMC">Network Maintenance Cell (NMC)</option>
    <option value="PS">Placement & Student Affairs (PS)</option>
    <option value="COE">Controller of Examinations (COE)</option>
    <option value="Office Academics">Office of Academic Affairs</option>
  `;

  openModal('triage-modal');
}

function initTriageActions() {
  const confirmBtn = document.getElementById('btn-confirm-triage');
  confirmBtn?.addEventListener('click', async () => {
    if (!activeTriageTicketId) return;

    const targetDept = document.getElementById('triage-target-dept').value;
    const notes = document.getElementById('triage-notes').value.trim();

    try {
      await reassignTicketDepartment(
        activeTriageTicketId,
        targetDept,
        currentUser,
        notes || 'Administrator manual classification'
      );
      showToast(`Ticket successfully triaged to ${targetDept}!`, 'success');
      closeModal('triage-modal');
      await loadAdminData();
    } catch (err) {
      showToast('Failed to triage ticket.', 'error');
    }
  });
}

/**
 * Renders Campus-Wide All Tickets Queue
 */
function renderAllTicketsTable() {
  const container = document.getElementById('all-tickets-tbody');
  const searchInput = document.getElementById('all-tickets-search');
  const deptFilter = document.getElementById('all-tickets-dept-filter');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const selectedDept = deptFilter?.value || 'ALL';

  let filtered = allTickets;

  if (selectedDept !== 'ALL') {
    filtered = filtered.filter(t => t.departmentId === selectedDept);
  }

  if (query) {
    filtered = filtered.filter(t =>
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(query)) ||
      (t.title && t.title.toLowerCase().includes(query)) ||
      (t.userDisplayName && t.userDisplayName.toLowerCase().includes(query)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(query))
    );
  }

  if (container) {
    container.innerHTML = filtered.map(t => {
      const dept = getDepartmentById(t.departmentId);
      const statusKey = t.status || 'OPEN';

      return `
        <tr>
          <td><span class="ticket-number-mono">${t.ticketNumber}</span></td>
          <td>
            <strong>${escapeHtml(t.title)}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(t.category || 'General')}</div>
          </td>
          <td><span class="badge ${dept.badgeClass}">${dept.code}</span></td>
          <td>${escapeHtml(t.userEmail)}</td>
          <td><span class="badge status-${statusKey.toLowerCase()}">${statusKey}</span></td>
          <td style="font-size:0.8rem; color:var(--text-muted);">
            ${t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'Recent'}
          </td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * User Role Provisioning (Phase 5 of Build Workflow)
 */
function renderUsersTable() {
  const container = document.getElementById('users-tbody');
  if (!container) return;

  container.innerHTML = allUsers.map(u => {
    const roleBadge = u.role === 'admin' ? 'role-pill-admin' : (u.role === 'department' ? 'role-pill-department' : 'role-pill-student');
    const dept = u.departmentId ? getDepartmentById(u.departmentId).code : '—';
    const statusLabel = u.active ? '<span style="color:#16a34a; font-weight:600;">Active</span>' : '<span style="color:#dc2626; font-weight:600;">Disabled</span>';

    return `
      <tr>
        <td>
          <div style="font-weight:700;">${escapeHtml(u.displayName || 'BIT Member')}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(u.email)}</div>
        </td>
        <td><span class="role-pill ${roleBadge}">${u.role}</span></td>
        <td><strong>${dept}</strong></td>
        <td>${statusLabel}</td>
        <td>
          <button class="btn btn-sm btn-secondary btn-edit-user-role" data-uid="${u.uid}">
            Provision Role
          </button>
        </td>
      </tr>
    `;
  }).join('');

  container.querySelectorAll('.btn-edit-user-role').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.getAttribute('data-uid');
      openRoleModal(uid);
    });
  });
}

let activeEditUid = null;

function openRoleModal(uid) {
  activeEditUid = uid;
  const targetUser = allUsers.find(u => u.uid === uid);
  if (!targetUser) return;

  document.getElementById('role-modal-user-email').textContent = `${targetUser.displayName} (${targetUser.email})`;
  document.getElementById('role-select').value = targetUser.role;
  document.getElementById('role-dept-select').value = targetUser.departmentId || 'NMC';
  document.getElementById('role-active-toggle').checked = targetUser.active !== false;

  toggleDeptSelectVisibility(targetUser.role);
  openModal('user-role-modal');
}

function toggleDeptSelectVisibility(role) {
  const group = document.getElementById('role-dept-group');
  if (group) {
    group.style.display = role === 'department' ? 'block' : 'none';
  }
}

function initUserProvisioning() {
  const roleSelect = document.getElementById('role-select');
  roleSelect?.addEventListener('change', (e) => {
    toggleDeptSelectVisibility(e.target.value);
  });

  const saveBtn = document.getElementById('btn-save-role-assignment');
  saveBtn?.addEventListener('click', async () => {
    if (!activeEditUid) return;

    const role = document.getElementById('role-select').value;
    const dept = document.getElementById('role-dept-select').value;
    const active = document.getElementById('role-active-toggle').checked;

    try {
      await updateUserRoleAssignment(activeEditUid, role, dept, active);
      showToast('User role assignment saved successfully.', 'success');
      closeModal('user-role-modal');
      allUsers = await getAllUsersList();
      renderUsersTable();
    } catch (err) {
      showToast('Failed to update role assignment.', 'error');
    }
  });

  // Filters for all tickets table
  const searchInput = document.getElementById('all-tickets-search');
  searchInput?.addEventListener('input', renderAllTicketsTable);

  const deptFilter = document.getElementById('all-tickets-dept-filter');
  deptFilter?.addEventListener('change', renderAllTicketsTable);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
