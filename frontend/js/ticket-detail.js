// ============================================
// Helpdesk — Ticket Detail page logic
// Reads a ticket by ?id= from localStorage and renders it.
// IT Support (admin) can update the ticket status.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupDetail();
});

// ---- Navbar: show who is signed in, handle sign out ----
function setupNav() {
  const userChip = document.getElementById('nav-user');
  const signOutBtn = document.getElementById('nav-signout');
  const currentUser = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');

  if (currentUser) {
    userChip.textContent = `${currentUser.name} · ${currentUser.role === 'admin' ? 'IT Support' : 'Employee'}`;
  } else {
    userChip.textContent = 'Not signed in (using sample account)';
  }

  signOutBtn.addEventListener('click', () => {
    localStorage.removeItem('helpdesk_current_user');
    window.location.href = 'index.html';
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function priorityBadgeClass(priority) {
  return {
    Critical: 'badge--critical',
    High: 'badge--high',
    Medium: 'badge--medium',
    Low: 'badge--low'
  }[priority] || 'badge--medium';
}

function statusBadgeClass(status) {
  return {
    New: 'badge--new',
    'In Progress': 'badge--progress',
    Resolved: 'badge--resolved',
    Closed: 'badge--closed'
  }[status] || 'badge--new';
}

function setupDetail() {
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get('id');
  const currentUser = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  const isAdmin = currentUser && currentUser.role === 'admin';

  document.getElementById('back-link').href = isAdmin ? 'admin-dashboard.html' : 'my-tickets.html';

  const tickets = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
  const ticket = tickets.find(t => t.ticketId === ticketId);

  const detailView = document.getElementById('detail-view');
  const notFoundView = document.getElementById('not-found');

  if (!ticket) {
    detailView.style.display = 'none';
    notFoundView.style.display = 'block';
    return;
  }

  notFoundView.style.display = 'none';
  detailView.style.display = 'block';

  const priorityBadge = document.getElementById('priority-badge');
  const statusBadge = document.getElementById('status-badge');

  document.getElementById('detail-title').textContent = ticket.title;
  document.getElementById('detail-id').textContent = ticket.ticketId;
  priorityBadge.textContent = ticket.priority;
  priorityBadge.className = `badge ${priorityBadgeClass(ticket.priority)}`;
  statusBadge.textContent = ticket.status;
  statusBadge.className = `badge ${statusBadgeClass(ticket.status)}`;

  document.getElementById('detail-raisedby').textContent = ticket.raisedBy;
  document.getElementById('detail-category').textContent = ticket.category;
  document.getElementById('detail-created').textContent = formatDate(ticket.createdAt);
  document.getElementById('detail-due').textContent = formatDate(ticket.resolutionDueAt);
  document.getElementById('detail-resolved').textContent = formatDate(ticket.resolvedAt);
  document.getElementById('detail-description').textContent = ticket.description;

  renderSlaBanner(ticket);
  setupAdminPanel(ticket, tickets, isAdmin, statusBadge);
}

function renderSlaBanner(ticket) {
  const slaBanner = document.getElementById('sla-banner');
  const isOpen = ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const overdue = isOpen && new Date(ticket.resolutionDueAt) < new Date();

  if (overdue) {
    slaBanner.className = 'sla-banner sla-banner--overdue';
    slaBanner.textContent = `This ticket is past its resolution deadline (${formatDate(ticket.resolutionDueAt)}).`;
  } else if (isOpen) {
    slaBanner.className = 'sla-banner sla-banner--ok';
    slaBanner.textContent = `Within SLA — resolution due by ${formatDate(ticket.resolutionDueAt)}.`;
  } else {
    slaBanner.className = 'sla-banner sla-banner--ok';
    slaBanner.textContent = `Ticket ${ticket.status.toLowerCase()} on ${formatDate(ticket.resolvedAt)}.`;
  }
}

// ---- Admin-only: update ticket status ----
function setupAdminPanel(ticket, tickets, isAdmin, statusBadge) {
  const adminPanel = document.getElementById('admin-panel');

  if (!isAdmin) {
    adminPanel.style.display = 'none';
    return;
  }

  adminPanel.style.display = 'block';

  const statusSelect = document.getElementById('status-update');
  const saveBtn = document.getElementById('save-status');
  const statusNote = document.getElementById('status-note');

  statusSelect.value = ticket.status;

  saveBtn.addEventListener('click', () => {
    const newStatus = statusSelect.value;
    ticket.status = newStatus;
    ticket.resolvedAt = (newStatus === 'Resolved' || newStatus === 'Closed')
      ? (ticket.resolvedAt || new Date().toISOString())
      : null;

    const updatedTickets = tickets.map(t => (t.ticketId === ticket.ticketId ? ticket : t));
    localStorage.setItem('helpdesk_tickets', JSON.stringify(updatedTickets));

    statusBadge.textContent = ticket.status;
    statusBadge.className = `badge ${statusBadgeClass(ticket.status)}`;
    document.getElementById('detail-resolved').textContent = formatDate(ticket.resolvedAt);
    renderSlaBanner(ticket);

    statusNote.style.color = 'var(--accent-dark)';
    statusNote.textContent = 'Status updated.';
  });
}

