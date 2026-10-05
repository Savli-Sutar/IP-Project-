// ============================================
// Helpdesk — My Tickets page logic
// Shows the tickets raised by the signed-in user,
// with search + status filtering.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTickets();
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

function getCurrentUser() {
  const stored = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  return stored || { name: 'Sample Employee', role: 'user' };
}

function isOverdue(ticket) {
  return ticket.status !== 'Resolved' && ticket.status !== 'Closed' &&
    new Date(ticket.resolutionDueAt) < new Date();
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

// ---- SLA indicator: On Time / Overdue / Resolved date ----
function slaCellHtml(ticket) {
  const isOpen = ticket.status !== 'Resolved' && ticket.status !== 'Closed';

  if (isOpen && isOverdue(ticket)) {
    return `<span class="badge badge--overdue">Overdue</span><div class="sla-line">Due ${formatDate(ticket.resolutionDueAt)}</div>`;
  }
  if (isOpen) {
    return `<span class="badge badge--ontime">On Time</span><div class="sla-line">Due ${formatDate(ticket.resolutionDueAt)}</div>`;
  }
  return `<span class="cell-muted">Resolved ${formatDate(ticket.resolvedAt)}</span>`;
}

// ---- Table: filter, search, and render ----
function setupTickets() {
  const currentUser = getCurrentUser();
  const tableBody = document.getElementById('tickets-body');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search');
  const statusFilter = document.getElementById('status-filter');

  const allTickets = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
  const myTickets = allTickets.filter(t => t.raisedBy === currentUser.name);

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = myTickets
      .filter(t => {
        const matchesQuery = !query ||
          t.title.toLowerCase().includes(query) ||
          t.ticketId.toLowerCase().includes(query);
        const matchesStatus = status === 'All' || t.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    filtered.forEach(ticket => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="cell-id">${ticket.ticketId}</td>
        <td>${ticket.title}</td>
        <td class="cell-muted">${ticket.category}</td>
        <td><span class="badge ${priorityBadgeClass(ticket.priority)}">${ticket.priority}</span></td>
        <td><span class="badge ${statusBadgeClass(ticket.status)}">${ticket.status}</span></td>
        <td class="cell-muted">${formatDate(ticket.createdAt)}</td>
        <td>${slaCellHtml(ticket)}</td>
      `;
      tr.addEventListener('click', () => {
        window.location.href = `ticket-detail.html?id=${encodeURIComponent(ticket.ticketId)}`;
      });
      tableBody.appendChild(tr);
    });
  }

  searchInput.addEventListener('input', render);
  statusFilter.addEventListener('change', render);
  render();
}
