// ============================================
// Helpdesk — Login page logic
// No backend yet: this validates the form and
// simulates a sign-in using hardcoded sample data.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formNote = document.getElementById('form-note');

  // Sample "registered" users for now — stands in for the Users table
  // until the real database/backend is connected.
  const sampleUsers = [
    { email: 'employee@company.com', password: 'password123', role: 'user', name: 'Employee' },
    { email: 'support@company.com', password: 'password123', role: 'admin', name: 'IT Support' }
  ];

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(input, errorEl, message) {
    input.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message || '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = form.querySelector('input[name="role"]:checked').value;

    let hasError = false;

    if (!email) {
      setError(emailInput, emailError, 'Enter your work email.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setError(emailInput, emailError, 'Enter a valid email address.');
      hasError = true;
    } else {
      setError(emailInput, emailError, '');
    }

    if (!password) {
      setError(passwordInput, passwordError, 'Enter your password.');
      hasError = true;
    } else {
      setError(passwordInput, passwordError, '');
    }

    if (hasError) return;

    // Simulated authentication against sample data
    const match = sampleUsers.find(u => u.email === email && u.password === password);

    if (!match) {
      formNote.textContent = 'Email or password is incorrect.';
      return;
    }

    if (match.role !== role) {
      formNote.textContent = `That account is registered as ${match.role === 'admin' ? 'IT Support' : 'Employee'}, not the selected role.`;
      return;
    }

    // Store the signed-in user so other pages (My Tickets, Admin Dashboard)
    // can read it later. Stands in for a real session until there's a backend.
    localStorage.setItem('helpdesk_current_user', JSON.stringify(match));

    formNote.style.color = 'var(--accent-dark)';
    formNote.textContent = `Signed in as ${match.name}. Redirecting…`;

    // My Tickets and Admin Dashboard now exist, so redirect based on role.
    window.location.href = match.role === 'admin' ? 'admin-dashboard.html' : 'my-tickets.html';
  });
});
