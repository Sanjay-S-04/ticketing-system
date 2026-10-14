/**
 * department.js - Department Dashboard Controller
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Department staff queue management, permitted status transitions,
 * resolution notes logging, escalation workflows, and audit trail.
 */

import { protectPage, getCurrentUserProfile } from './auth.js';
import { setupDashboardHeader, showToast, openModal, closeModal, ICONS } from './app.js';
import { DEPARTMENTS, getDepartmentById, getAllowedTransitions } from './data.js';
import {
  getTicketById,
  updateTicketStatus,
  reassignTicketDepartment,
  addComment,
  subscribeDepartmentTickets,
  subscribeTicketComments,
  subscribeTicketTimeline
} from './ticket-service.js';

let currentUser = null;
let departmentTickets = [];
let activeFilter = 'ALL';
let activeCategoryFilter = 'ALL';
let activeTicket = null;

let deptTicketsUnsubscribe = null;
let timelineUnsubscribe = null;
let commentsUnsubscribe = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = protectPage('department');
  if (!currentUser) return;

  setupDashboardHeader('department');
  renderDepartmentBanner();
  initSearchAndFilters();
  initActionHandlers();
  initModalCloseHandlers();
  initRealtimeQueue();

  window.addEventListener('beforeunload', cleanupSubscriptions);
});

function cleanupSubscriptions() {
  if (deptTicketsUnsubscribe) {
    deptTicketsUnsubscribe();
    deptTicketsUnsubscribe = null;
  }
  closeManageSubcollections();
}

function closeManageSubcollections() {
  if (timelineUnsubscribe) {
    timelineUnsubscribe();
    timelineUnsubscribe = null;
  }
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
    commentsUnsubscribe = null;
  }
}

/**
 * Renders verified department information locked from the staff profile
 */
function renderDepartmentBanner() {
  const dept = getDepartmentById(currentUser.departmentId);
  const bannerTitle = document.getElementById('dept-banner-name');
  const bannerDesc = document.getElementById('dept-banner-desc');
  const bannerBadge = document.getElementById('dept-banner-badge');

  if (bannerTitle) bannerTitle.textContent = dept.name;
  if (bannerDesc) bannerDesc.textContent = dept.description;
  if (bannerBadge) {
    bannerBadge.className = `badge ${dept.badgeClass}`;
    bannerBadge.textContent = `${dept.code} Authorized Queue`;
  }
}

/**
 * Initializes real-time listener for the department's ticket queue
 */
function initRealtimeQueue() {
  const tbody = document.getElementById('dept-tickets-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;"><span class="spinner spinner-primary"></span> Loading department queue...</td></tr>`;
  }

  deptTicketsUnsubscribe = subscribeDepartmentTickets(
    currentUser.departmentId,
    (tickets) => {
      departmentTickets = tickets || [];
      updateDepartmentMetrics();
      updateCategoryFilterDropdown();
      renderQueueTable();
    },
    (err) => {
      console.error('Real-time listener error for department queue:', err);
      showToast('Could not sync department queue updates. Check connection.', 'error');
    }
  );
}

/**
 * Computes metrics from current department queue
 */
function updateDepartmentMetrics() {
  const total = departmentTickets.length;
  const open = departmentTickets.filter(t => t.status === 'OPEN').length;
  const progress = departmentTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = departmentTickets.filter(t => t.status === 'RESOLVED').length;

  const totalEl = document.getElementById('stat-total');
  const openEl = document.getElementById('stat-open');
  const progressEl = document.getElementById('stat-progress');
  const resolvedEl = document.getElementById('stat-resolved');

  if (totalEl) totalEl.textContent = total;
  if (openEl) openEl.textContent = open;
  if (progressEl) progressEl.textContent = progress;
  if (resolvedEl) resolvedEl.textContent = resolved;
}

/**
 * Populates category filter options dynamically from department tickets
 */
function updateCategoryFilterDropdown() {
  const select = document.getElementById('dept-category-filter');
  if (!select) return;

  const currentSelection = select.value || 'ALL';
  const categories = new Set();
  departmentTickets.forEach(t => {
    if (t.category) categories.add(t.category);
  });

  select.innerHTML = `<option value="ALL">All Categories</option>`;
  Array.from(categories).sort().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

/**
 * Renders the queue table with search and status filtering
 */
function renderQueueTable() {
  const container = document.getElementById('dept-tickets-tbody');
  const emptyState = document.getElementById('dept-empty-state');
  const searchInput = document.getElementById('dept-ticket-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  let filtered = departmentTickets;

  if (activeFilter !== 'ALL') {
    filtered = filtered.filter(t => t.status === activeFilter);
  }

  if (activeCategoryFilter !== 'ALL') {
    filtered = filtered.filter(t => t.category === activeCategoryFilter);
  }

  if (query) {
    filtered = filtered.filter(t =>
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(query)) ||
      (t.title && t.title.toLowerCase().includes(query)) ||
      (t.userDisplayName && t.userDisplayName.toLowerCase().includes(query)) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (container) {
    container.innerHTML = filtered.map(t => {
      const statusKey = t.status || 'OPEN';
      const statusBadge = `status-${statusKey.toLowerCase()}`;
      const dateFormatted = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'Recent';

      return `
        <tr>
          <td>
            <span class="ticket-number-mono">${t.ticketNumber}</span>
          </td>
          <td>
            <a class="ticket-title-link" data-id="${t.id}">${escapeHtml(t.title)}</a>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              ${escapeHtml(t.category || 'General')}
            </div>
          </td>
          <td>
            <div style="font-weight:600;">${escapeHtml(t.userDisplayName || 'Student')}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(t.userEmail)}</div>
          </td>
          <td>
            <span class="badge ${statusBadge}">${statusKey.replace('_', ' ')}</span>
          </td>
          <td style="color:var(--text-muted); font-size:0.8rem;">
            ${dateFormatted}
          </td>
          <td>
            <button class="btn btn-sm btn-primary btn-manage-ticket" data-id="${t.id}">
              Manage Ticket
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.ticket-title-link, .btn-manage-ticket').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        openManageModal(id);
      });
    });
  }
}

/**
 * Initializes toolbar search, category filter, and status tabs
 */
function initSearchAndFilters() {
  const searchInput = document.getElementById('dept-ticket-search');
  searchInput?.addEventListener('input', renderQueueTable);

  const categorySelect = document.getElementById('dept-category-filter');
  categorySelect?.addEventListener('change', (e) => {
    activeCategoryFilter = e.target.value || 'ALL';
    renderQueueTable();
  });

  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'ALL';
      renderQueueTable();
    });
  });
}

function initModalCloseHandlers() {
  document.querySelectorAll('.btn-close-manage-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeManageModal();
    });
  });

  const modal = document.getElementById('manage-ticket-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeManageModal();
    }
  });
}

function closeManageModal() {
  closeManageSubcollections();
  activeTicket = null;
  closeModal('manage-ticket-modal');
}

/**
 * Opens Ticket Management Modal with actions, transitions, and real-time subcollections
 */
async function openManageModal(ticketId) {
  closeManageSubcollections();

  activeTicket = await getTicketById(ticketId);
  if (!activeTicket) {
    showToast('Could not load ticket details.', 'error');
    return;
  }

  const dept = getDepartmentById(activeTicket.departmentId);
  const statusKey = activeTicket.status || 'OPEN';

  document.getElementById('modal-ticket-number').textContent = activeTicket.ticketNumber;
  document.getElementById('modal-ticket-title').textContent = activeTicket.title;
  document.getElementById('modal-ticket-desc').textContent = activeTicket.description;
  document.getElementById('modal-ticket-student').textContent = `${activeTicket.userDisplayName || 'Student'} (${activeTicket.userEmail})`;
  document.getElementById('modal-ticket-category').textContent = activeTicket.category;
  document.getElementById('modal-ticket-status').className = `badge status-${statusKey.toLowerCase()}`;
  document.getElementById('modal-ticket-status').textContent = statusKey.replace('_', ' ');

  // Matched keywords
  const kwContainer = document.getElementById('modal-keywords-container');
  kwContainer.innerHTML = '';
  if (activeTicket.matchedKeywords && activeTicket.matchedKeywords.length > 0) {
    activeTicket.matchedKeywords.forEach(kw => {
      const chip = document.createElement('span');
      chip.className = 'keyword-tag';
      chip.textContent = `#${kw}`;
      kwContainer.appendChild(chip);
    });
  } else {
    kwContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">None</span>`;
  }

  // Populate allowed transition buttons
  const actionsContainer = document.getElementById('modal-status-actions');
  actionsContainer.innerHTML = '';
  const allowed = getAllowedTransitions(activeTicket.status, currentUser.role);

  if (allowed.includes('IN_PROGRESS') && activeTicket.status !== 'IN_PROGRESS') {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline';
    btn.innerHTML = `Start Investigation`;
    btn.onclick = () => handleStatusChange('IN_PROGRESS');
    actionsContainer.appendChild(btn);
  }

  if (allowed.includes('RESOLVED') && activeTicket.status !== 'RESOLVED') {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-success';
    btn.innerHTML = `Resolve Ticket`;
    btn.onclick = () => promptResolveTicket();
    actionsContainer.appendChild(btn);
  }

  if (allowed.includes('ESCALATED') && activeTicket.status !== 'ESCALATED') {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-danger';
    btn.innerHTML = `Escalate Ticket`;
    btn.onclick = () => openEscalateModal();
    actionsContainer.appendChild(btn);
  }

  // Lazy-load Audit Timeline
  const tlContainer = document.getElementById('modal-timeline-container');
  if (tlContainer) {
    tlContainer.innerHTML = `<div style="text-align:center; padding:1rem;"><span class="spinner spinner-primary"></span> Loading audit trail...</div>`;
  }
  timelineUnsubscribe = subscribeTicketTimeline(
    ticketId,
    (timeline) => renderTimeline(timeline),
    (err) => {
      console.error('Error in timeline subscription:', err);
      if (tlContainer) tlContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">Failed to load timeline.</div>`;
    }
  );

  // Lazy-load Comments subcollection
  const cmContainer = document.getElementById('modal-comments-container');
  if (cmContainer) {
    cmContainer.innerHTML = `<div style="text-align:center; padding:1rem;"><span class="spinner spinner-primary"></span> Loading remarks...</div>`;
  }
  commentsUnsubscribe = subscribeTicketComments(
    ticketId,
    (comments) => renderComments(comments),
    (err) => {
      console.error('Error in comments subscription:', err);
      if (cmContainer) cmContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">Failed to load remarks.</div>`;
    }
  );

  // Comment submit
  const commentForm = document.getElementById('modal-comment-form');
  if (commentForm) {
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('modal-comment-input');
      const text = input.value.trim();
      if (!text) return;

      if (text.length > 1000) {
        showToast('Remark cannot exceed 1000 characters.', 'warning');
        return;
      }

      try {
        await addComment(ticketId, text, currentUser);
        input.value = '';
        showToast('Staff remark posted.', 'success');
      } catch (err) {
        showToast('Failed to post remark.', 'error');
      }
    };
  }

  openModal('manage-ticket-modal');
}

/**
 * Handles permitted status transitions
 */
async function handleStatusChange(newStatus, resolutionNotes = '') {
  if (!activeTicket) return;

  try {
    await updateTicketStatus(activeTicket.id, newStatus, currentUser, resolutionNotes);
    showToast(`Status updated to ${newStatus}.`, 'success');
    activeTicket.status = newStatus;
    await openManageModal(activeTicket.id);
  } catch (err) {
    console.error('Error updating status:', err);
    if (err.message && err.message.includes('PERMISSION_DENIED')) {
      showToast('Permission Denied: Unauthorized status transition.', 'error');
    } else if (err.message && err.message.includes('VALIDATION_ERROR')) {
      showToast(err.message.replace('VALIDATION_ERROR: ', ''), 'warning');
    } else {
      showToast('Failed to update status.', 'error');
    }
  }
}

/**
 * Prompts staff for mandatory resolution notes
 */
function promptResolveTicket() {
  const notes = prompt('Enter resolution notes explaining how this issue was resolved (min 5 characters):');
  if (notes === null) return; // cancelled
  if (!notes.trim() || notes.trim().length < 5) {
    showToast('Resolution notes explaining the resolution are required (min 5 characters).', 'warning');
    return;
  }
  handleStatusChange('RESOLVED', notes.trim());
}

/**
 * Opens Escalation modal to transfer ticket to another department or manual review
 */
function openEscalateModal() {
  const select = document.getElementById('escalate-dept-select');
  select.innerHTML = '';

  for (const [key, dept] of Object.entries(DEPARTMENTS)) {
    if (dept.id === currentUser.departmentId) continue; // cannot reassign to self
    const opt = document.createElement('option');
    opt.value = dept.id;
    opt.textContent = `${dept.name} (${dept.code})`;
    select.appendChild(opt);
  }

  openModal('escalate-modal');
}

function initActionHandlers() {
  const confirmEscalateBtn = document.getElementById('btn-confirm-escalate');
  confirmEscalateBtn?.addEventListener('click', async () => {
    if (!activeTicket) return;
    const targetDept = document.getElementById('escalate-dept-select').value;
    const reason = document.getElementById('escalate-reason').value.trim();

    if (!reason || reason.length < 5) {
      showToast('Please provide an escalation rationale (min 5 characters).', 'warning');
      return;
    }

    try {
      await reassignTicketDepartment(activeTicket.id, targetDept, currentUser, reason);
      await updateTicketStatus(activeTicket.id, 'ESCALATED', currentUser, `Escalated: ${reason}`);
      showToast('Ticket escalated and reassigned successfully.', 'success');
      closeModal('escalate-modal');
      closeManageModal();
    } catch (err) {
      console.error('Escalation error:', err);
      showToast('Failed to escalate ticket.', 'error');
    }
  });
}

function renderTimeline(timeline) {
  const container = document.getElementById('modal-timeline-container');
  if (!container) return;

  if (!timeline || timeline.length === 0) {
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No timeline events recorded yet.</div>`;
    return;
  }

  container.innerHTML = timeline.map(item => {
    const timeFormatted = item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Recorded';

    return `
      <div class="timeline-item">
        <div class="timeline-node"></div>
        <div class="timeline-header">
          <span class="timeline-action">${item.action.replace('_', ' ')}</span>
          <span class="timeline-time">${timeFormatted}</span>
        </div>
        <div style="font-size:0.775rem; color:var(--text-subtle);">Actor: ${escapeHtml(item.actorDisplayName || 'Staff')}</div>
        <div class="timeline-details">${escapeHtml(item.details || '')}</div>
      </div>
    `;
  }).join('');
}

function renderComments(comments) {
  const container = document.getElementById('modal-comments-container');
  if (!container) return;

  if (!comments || comments.length === 0) {
    container.innerHTML = `<div style="font-size:0.825rem; color:var(--text-muted); text-align:center; padding:1.5rem 0;">No comments logged.</div>`;
    return;
  }

  container.innerHTML = comments.map(c => {
    const timeFormatted = c.timestamp ? new Date(c.timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    const roleBadge = c.senderRole === 'department' ? 'badge-ps' : (c.senderRole === 'admin' ? 'badge-nmc' : 'badge-coe');

    return `
      <div class="comment-bubble">
        <div class="comment-meta">
          <span class="comment-author">
            ${escapeHtml(c.senderDisplayName || 'User')}
            <span class="badge ${roleBadge}" style="font-size:0.65rem; padding:0.15rem 0.4rem; margin-left:4px;">${c.senderRole || 'staff'}</span>
          </span>
          <span style="color:var(--text-subtle);">${timeFormatted}</span>
        </div>
        <div class="comment-body">${escapeHtml(c.body)}</div>
      </div>
    `;
  }).join('');
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
