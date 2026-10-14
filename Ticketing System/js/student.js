/**
 * student.js - Student Dashboard Controller
 * Bannari Amman Institute of Technology Helpdesk
 *
 * Implements real-time category recommendation, ticket submission,
 * personal ticket queue, timeline tracking, and comment threads.
 */

import { protectPage, getCurrentUserProfile } from './auth.js';
import { setupDashboardHeader, showToast, openModal, closeModal, ICONS } from './app.js';
import { classifyComplaint } from './classification.js';
import { DEPARTMENTS, getDepartmentById } from './data.js';
import {
  createTicket,
  getTicketById,
  addComment,
  subscribeStudentTickets,
  subscribeTicketComments,
  subscribeTicketTimeline
} from './ticket-service.js';

let currentUser = null;
let allStudentTickets = [];
let activeFilter = 'ALL';
let activeCategoryFilter = 'ALL';
let currentClassification = null;
let activeTicketId = null;

let ticketsUnsubscribe = null;
let timelineUnsubscribe = null;
let commentsUnsubscribe = null;

// Initialize Student Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  currentUser = protectPage('student');
  if (!currentUser) return; // redirected

  setupDashboardHeader('student');
  initLiveClassification();
  initTicketSubmission();
  initSearchAndFilters();
  initModalCloseHandlers();
  initRealtimeTickets();

  window.addEventListener('beforeunload', cleanupSubscriptions);
});

function cleanupSubscriptions() {
  if (ticketsUnsubscribe) {
    ticketsUnsubscribe();
    ticketsUnsubscribe = null;
  }
  closeTicketSubcollections();
}

function closeTicketSubcollections() {
  if (timelineUnsubscribe) {
    timelineUnsubscribe();
    timelineUnsubscribe = null;
  }
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
    commentsUnsubscribe = null;
  }
  activeTicketId = null;
}

/**
 * Initializes real-time listener for the student's ticket queue
 */
function initRealtimeTickets() {
  const tbody = document.getElementById('student-tickets-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;"><span class="spinner spinner-primary"></span> Loading tickets...</td></tr>`;
  }

  ticketsUnsubscribe = subscribeStudentTickets(
    currentUser.uid,
    (tickets) => {
      allStudentTickets = tickets || [];
      updateQuickMetrics();
      updateCategoryFilterDropdown();
      renderFilteredTickets();
    },
    (err) => {
      console.error('Real-time listener error for student tickets:', err);
      showToast('Could not sync live updates. Check network connection.', 'error');
    }
  );
}

/**
 * Sets up live classification as the student types title or description
 */
function initLiveClassification() {
  const titleInput = document.getElementById('ticket-title');
  const descInput = document.getElementById('ticket-description');
  const panel = document.getElementById('classification-panel');
  const deptBadge = document.getElementById('rec-dept-badge');
  const categorySelect = document.getElementById('rec-category-select');
  const keywordsContainer = document.getElementById('rec-keywords-container');
  const noteEl = document.getElementById('rec-note');

  let debounceTimer = null;

  function runClassification() {
    const title = titleInput?.value || '';
    const desc = descInput?.value || '';

    if (!title.trim() && !desc.trim()) {
      panel.style.display = 'none';
      currentClassification = null;
      return;
    }

    panel.style.display = 'block';
    const result = classifyComplaint(title, desc);
    currentClassification = result;

    const dept = getDepartmentById(result.suggestedDepartmentId);

    // Update department badge
    deptBadge.className = `badge ${dept.badgeClass}`;
    deptBadge.textContent = dept.name;

    // Populate category dropdown with options from the suggested department
    categorySelect.innerHTML = '';
    const categories = dept.categories || ['General Issue'];
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === result.suggestedCategory) {
        opt.selected = true;
      }
      categorySelect.appendChild(opt);
    });

    // If manual review or user wants to pick another department category
    if (result.requiresManualReview) {
      const opt = document.createElement('option');
      opt.value = 'General / Ambiguous Complaint';
      opt.textContent = 'General / Ambiguous Complaint';
      categorySelect.appendChild(opt);
    }

    // Render keyword chips
    keywordsContainer.innerHTML = '';
    if (result.matchedKeywords && result.matchedKeywords.length > 0) {
      result.matchedKeywords.forEach(kw => {
        const chip = document.createElement('span');
        chip.className = 'keyword-tag';
        chip.textContent = `#${kw}`;
        keywordsContainer.appendChild(chip);
      });
    } else {
      keywordsContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">No recognized keywords. Routed to Manual Review.</span>`;
    }

    // Display transparent note
    noteEl.textContent = result.confidenceNote;
  }

  const trigger = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runClassification, 180);
  };

  titleInput?.addEventListener('input', trigger);
  descInput?.addEventListener('input', trigger);
}

/**
 * Handles ticket submission with validation and double-click prevention
 */
function initTicketSubmission() {
  const form = document.getElementById('submit-ticket-form');
  const submitBtn = document.getElementById('btn-submit-ticket');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('ticket-title');
    const descInput = document.getElementById('ticket-description');
    const categorySelect = document.getElementById('rec-category-select');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (!title || title.length < 5) {
      showToast('Please provide a descriptive complaint title (min 5 characters).', 'warning');
      titleInput.focus();
      return;
    }
    if (title.length > 150) {
      showToast('Complaint title cannot exceed 150 characters.', 'warning');
      titleInput.focus();
      return;
    }

    if (!desc || desc.length < 10) {
      showToast('Please explain the complaint details (min 10 characters).', 'warning');
      descInput.focus();
      return;
    }
    if (desc.length > 3000) {
      showToast('Complaint description cannot exceed 3000 characters.', 'warning');
      descInput.focus();
      return;
    }

    // Classify if not done
    if (!currentClassification) {
      currentClassification = classifyComplaint(title, desc);
    }

    const selectedCategory = categorySelect?.value || currentClassification.suggestedCategory;

    // Prevent double submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Filing Ticket...`;

    try {
      const newTicket = await createTicket({
        title,
        description: desc,
        category: selectedCategory,
        departmentId: currentClassification.suggestedDepartmentId,
        classificationMethod: currentClassification.classificationMethod,
        matchedKeywords: currentClassification.matchedKeywords,
        requiresManualReview: currentClassification.requiresManualReview
      }, currentUser);

      showToast(`Complaint filed successfully! Ticket #${newTicket.ticketNumber}`, 'success');

      // Reset form
      form.reset();
      document.getElementById('classification-panel').style.display = 'none';
      currentClassification = null;

      // Automatically open detail modal for the newly created ticket
      openTicketDetails(newTicket.id);
    } catch (err) {
      console.error('Submission error:', err);
      if (err.message && err.message.includes('DUPLICATE_TICKET')) {
        showToast('Duplicate submission prevented: You already have an open ticket with this subject.', 'warning');
      } else if (err.message && err.message.includes('VALIDATION_ERROR')) {
        showToast(err.message.replace('VALIDATION_ERROR: ', ''), 'warning');
      } else {
        showToast(err.message || 'Failed to submit ticket. Please check connection and try again.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${ICONS.plus} Submit Complaint`;
    }
  });
}

/**
 * Updates quick metrics from ticket list
 */
function updateQuickMetrics() {
  const total = allStudentTickets.length;
  const open = allStudentTickets.filter(t => t.status === 'OPEN').length;
  const progress = allStudentTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ESCALATED').length;
  const resolved = allStudentTickets.filter(t => t.status === 'RESOLVED').length;

  const totalCountEl = document.getElementById('stat-total');
  const openCountEl = document.getElementById('stat-open');
  const progressCountEl = document.getElementById('stat-progress');
  const resolvedCountEl = document.getElementById('stat-resolved');

  if (totalCountEl) totalCountEl.textContent = total;
  if (openCountEl) openCountEl.textContent = open;
  if (progressCountEl) progressCountEl.textContent = progress;
  if (resolvedCountEl) resolvedCountEl.textContent = resolved;
}

/**
 * Populates category filter dropdown dynamically from available student tickets
 */
function updateCategoryFilterDropdown() {
  const select = document.getElementById('ticket-category-filter');
  if (!select) return;

  const currentSelection = select.value || 'ALL';
  const categories = new Set();
  allStudentTickets.forEach(t => {
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
 * Filters tickets by status, category, and search query
 */
function renderFilteredTickets() {
  const container = document.getElementById('student-tickets-tbody');
  const emptyState = document.getElementById('student-empty-state');
  const searchInput = document.getElementById('ticket-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  let filtered = allStudentTickets;

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
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.departmentId && t.departmentId.toLowerCase().includes(query))
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
      const dept = getDepartmentById(t.departmentId);
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
            <span class="badge ${dept.badgeClass}">${dept.code}</span>
          </td>
          <td>
            <span class="badge ${statusBadge}">${statusKey.replace('_', ' ')}</span>
          </td>
          <td style="color:var(--text-muted); font-size:0.8rem;">
            ${dateFormatted}
          </td>
          <td>
            <button class="btn btn-sm btn-outline btn-view-ticket" data-id="${t.id}">
              View Details
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach click handlers
    container.querySelectorAll('.ticket-title-link, .btn-view-ticket').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        openTicketDetails(id);
      });
    });
  }
}

/**
 * Sets up Search input, Category filter, and Status tabs
 */
function initSearchAndFilters() {
  const searchInput = document.getElementById('ticket-search');
  searchInput?.addEventListener('input', () => {
    renderFilteredTickets();
  });

  const categorySelect = document.getElementById('ticket-category-filter');
  categorySelect?.addEventListener('change', (e) => {
    activeCategoryFilter = e.target.value || 'ALL';
    renderFilteredTickets();
  });

  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'ALL';
      renderFilteredTickets();
    });
  });
}

function initModalCloseHandlers() {
  document.querySelectorAll('.btn-close-ticket-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeTicketModal();
    });
  });

  const modal = document.getElementById('ticket-details-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeTicketModal();
    }
  });
}

function closeTicketModal() {
  closeTicketSubcollections();
  closeModal('ticket-details-modal');
}

/**
 * Opens Ticket Detail Modal with lazy-loaded real-time subcollections (Timeline & Comments)
 */
export async function openTicketDetails(ticketId) {
  // Clear any existing active listeners before opening
  closeTicketSubcollections();
  activeTicketId = ticketId;

  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    showToast('Ticket could not be loaded.', 'error');
    return;
  }

  const dept = getDepartmentById(ticket.departmentId);
  const statusKey = ticket.status || 'OPEN';

  document.getElementById('modal-ticket-number').textContent = ticket.ticketNumber;
  document.getElementById('modal-ticket-title').textContent = ticket.title;
  document.getElementById('modal-ticket-desc').textContent = ticket.description;
  document.getElementById('modal-ticket-dept').className = `badge ${dept.badgeClass}`;
  document.getElementById('modal-ticket-dept').textContent = dept.name;
  document.getElementById('modal-ticket-category').textContent = ticket.category || 'General';
  document.getElementById('modal-ticket-status').className = `badge status-${statusKey.toLowerCase()}`;
  document.getElementById('modal-ticket-status').textContent = statusKey.replace('_', ' ');

  const resNotesBox = document.getElementById('modal-resolution-box');
  if (ticket.resolutionNotes && ticket.status === 'RESOLVED') {
    resNotesBox.style.display = 'block';
    document.getElementById('modal-resolution-notes').textContent = ticket.resolutionNotes;
  } else {
    resNotesBox.style.display = 'none';
  }

  // Lazy-load Audit Timeline with real-time sync
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

  // Lazy-load Comments subcollection with real-time sync
  const cmContainer = document.getElementById('modal-comments-container');
  if (cmContainer) {
    cmContainer.innerHTML = `<div style="text-align:center; padding:1rem;"><span class="spinner spinner-primary"></span> Loading remarks...</div>`;
  }
  commentsUnsubscribe = subscribeTicketComments(
    ticketId,
    (comments) => renderComments(comments),
    (err) => {
      console.error('Error in comments subscription:', err);
      if (cmContainer) cmContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">Failed to load comments.</div>`;
    }
  );

  // Setup comment submission
  const commentForm = document.getElementById('modal-comment-form');
  if (commentForm) {
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('modal-comment-input');
      const text = input.value.trim();
      if (!text) return;

      if (text.length > 1000) {
        showToast('Comment cannot exceed 1000 characters.', 'warning');
        return;
      }

      try {
        await addComment(ticketId, text, currentUser);
        input.value = '';
        showToast('Comment posted.', 'success');
      } catch (err) {
        showToast('Failed to post comment.', 'error');
      }
    };
  }

  openModal('ticket-details-modal');
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
        <div style="font-size:0.775rem; color:var(--text-subtle);">By: ${escapeHtml(item.actorDisplayName || 'System')}</div>
        <div class="timeline-details">${escapeHtml(item.details || '')}</div>
      </div>
    `;
  }).join('');
}

function renderComments(comments) {
  const container = document.getElementById('modal-comments-container');
  if (!container) return;

  if (!comments || comments.length === 0) {
    container.innerHTML = `<div style="font-size:0.825rem; color:var(--text-muted); text-align:center; padding:1.5rem 0;">No comments yet. Have a question or additional details? Post below.</div>`;
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
            <span class="badge ${roleBadge}" style="font-size:0.65rem; padding:0.15rem 0.4rem; margin-left:4px;">${c.senderRole || 'user'}</span>
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
