// ============================================
// Helpdesk — Raise Ticket page logic
// Reads the signed-in user (set on the login page),
// validates the form, and saves the new ticket into
// localStorage — this stands in for the Tickets table
// until a real backend/database is connected.
// ============================================

// SLA rules — mirrors the SLA_Rules table (hours)
const SLA_RULES = {
  Critical: { response: 1, resolution: 4 },
  High: { response: 2, resolution: 8 },
  Medium: { response: 4, resolution: 24 },
  Low: { response: 8, resolution: 48 }
};

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupSlaPreview();
  setupForm();
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

// ---- Live SLA preview based on selected priority ----
function setupSlaPreview() {
  const prioritySelect = document.getElementById('priority');
  const preview = document.getElementById('sla-preview');

  function render() {
    const rule = SLA_RULES[prioritySelect.value];
    preview.innerHTML = `Response due in <strong>${rule.response}h</strong> · Resolution due in <strong>${rule.resolution}h</strong>`;
  }

  prioritySelect.addEventListener('change', render);
  render();
}

// ---- Form validation + saving the ticket ----
function setupForm() {
  const form = document.getElementById('ticket-form');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const titleError = document.getElementById('title-error');
  const descriptionError = document.getElementById('description-error');
  const formNote = document.getElementById('form-note');
  const successBanner = document.getElementById('success-banner');

  function setError(input, errorEl, message) {
    input.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message || '';
  }

  function nextTicketId() {
    const count = parseInt(localStorage.getItem('helpdesk_ticket_count') || '0', 10) + 1;
    localStorage.setItem('helpdesk_ticket_count', String(count));
    return `TKT-${String(count).padStart(3, '0')}`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successBanner.classList.remove('is-visible');
    formNote.textContent = '';

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    let hasError = false;

    if (!title) {
      setError(titleInput, titleError, 'Give the ticket a short title.');
      hasError = true;
    } else {
      setError(titleInput, titleError, '');
    }

    if (!description) {
      setError(descriptionInput, descriptionError, 'Add a short description of the issue.');
      hasError = true;
    } else {
      setError(descriptionInput, descriptionError, '');
    }

    if (hasError) return;

    const category = document.getElementById('category').value;
    const priority = document.getElementById('priority').value;
    const currentUser = JSON.parse(localStorage.getItem('helpdesk_current_user') || 'null');
    const createdAt = new Date();
    const rule = SLA_RULES[priority];

    const ticket = {
      ticketId: nextTicketId(),
      title,
      description,
      category,
      priority,
      status: 'New',
      raisedBy: currentUser ? currentUser.name : 'Sample Employee',
      createdAt: createdAt.toISOString(),
      resolutionDueAt: new Date(createdAt.getTime() + rule.resolution * 3600000).toISOString(),
      resolvedAt: null
    };

    const tickets = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets));

    successBanner.textContent = `Ticket submitted — reference ${ticket.ticketId}. `;
    const idNote = document.createElement('code');
    idNote.textContent = ticket.ticketId;
    successBanner.textContent = 'Ticket submitted successfully. Reference: ';
    successBanner.appendChild(idNote);
    successBanner.classList.add('is-visible');

    form.reset();
    document.getElementById('priority').dispatchEvent(new Event('change'));
  });
}

