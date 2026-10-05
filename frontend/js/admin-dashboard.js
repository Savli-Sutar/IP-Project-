// ============================================
// Helpdesk — Admin Dashboard page logic
// IT Support only: shows stats + all tickets across
// every user, with search, status, priority, and
// category filtering, plus SLA on-time/overdue status.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupDashboard();
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

// ---- Stat cards ----
function renderStats(tickets) {
  document.getElementById('stat-total').textContent = tickets.length;
  document.getElementById('stat-new').textContent = tickets.filter(t => t.status === 'New').length;
  document.getElementById('stat-progress').textContent = tickets.filter(t => t.status === 'In Progress').length;
  document.getElementById('stat-overdue').textContent = tickets.filter(isOverdue).length;
  document.getElementById('stat-resolved').textContent =
    tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
}

// ---- Access gate + table: filter, search, and render ----
function setupDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
  const accessDenied = document.getElementById('access-denied');
  const dashboardContent = document.getElementById('dashboard-content');

  if (!currentUser || currentUser.role !== 'admin') {
    accessDenied.style.display = 'block';
    dashboardContent.style.display = 'none';
    return;
  }

  accessDenied.style.display = 'none';
  dashboardContent.style.display = 'block';

  const tableBody = document.getElementById('tickets-body');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search');
  const statusFilter = document.getElementById('status-filter');
  const priorityFilter = document.getElementById('priority-filter');
  const categoryFilter = document.getElementById('category-filter');

  const tickets = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
  renderStats(tickets);

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const priority = priorityFilter.value;
    const category = categoryFilter.value;

    const filtered = tickets
      .filter(t => {
        const matchesQuery = !query ||
          t.title.toLowerCase().includes(query) ||
          t.ticketId.toLowerCase().includes(query) ||
          t.raisedBy.toLowerCase().includes(query);
        const matchesStatus = status === 'All' || t.status === status;
        const matchesPriority = priority === 'All' || t.priority === priority;
        const matchesCategory = category === 'All' || t.category === category;
        return matchesQuery && matchesStatus && matchesPriority && matchesCategory;
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
        <td class="cell-muted">${ticket.raisedBy}</td>
        <td class="cell-muted">${ticket.category}</td>
        <td><span class="badge ${priorityBadgeClass(ticket.priority)}">${ticket.priority}</span></td>
        <td><span class="badge ${statusBadgeClass(ticket.status)}">${ticket.status}</span></td>
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
  priorityFilter.addEventListener('change', render);
  categoryFilter.addEventListener('change', render);
  render();
}

