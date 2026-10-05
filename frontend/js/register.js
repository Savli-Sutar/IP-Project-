// ============================================
// Helpdesk — Register page logic
// Saves new users into localStorage
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError = document.getElementById('confirm-error');
  const formNote = document.getElementById('form-note');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(input, errorEl, message) {
    input.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message || '';
  }

  // Load existing users (or start with the two sample accounts)
  function getUsers() {
    const stored = localStorage.getItem('helpdesk_users');
    if (stored) return JSON.parse(stored);

    // Default sample users (same as login page)
    const defaults = [
      { email: 'employee@company.com', password: 'password123', role: 'user', name: 'Employee' },
      { email: 'support@company.com', password: 'password123', role: 'admin', name: 'IT Support' }
    ];
    localStorage.setItem('helpdesk_users', JSON.stringify(defaults));
    return defaults;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = '';
    formNote.style.color = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    const role = form.querySelector('input[name="role"]:checked').value;

    let hasError = false;

    // Name validation
    if (!name) {
      setError(nameInput, nameError, 'Enter your full name.');
      hasError = true;
    } else {
      setError(nameInput, nameError, '');
    }

    // Email validation
    if (!email) {
      setError(emailInput, emailError, 'Enter your work email.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setError(emailInput, emailError, 'Enter a valid email address.');
      hasError = true;
    } else {
      setError(emailInput, emailError, '');
    }

    // Password validation
    if (!password) {
      setError(passwordInput, passwordError, 'Create a password.');
      hasError = true;
    } else if (password.length < 6) {
      setError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      hasError = true;
    } else {
      setError(passwordInput, passwordError, '');
    }

    // Confirm password
    if (!confirm) {
      setError(confirmInput, confirmError, 'Confirm your password.');
      hasError = true;
    } else if (password !== confirm) {
      setError(confirmInput, confirmError, 'Passwords do not match.');
      hasError = true;
    } else {
      setError(confirmInput, confirmError, '');
    }

    if (hasError) return;

    // Check if email already exists
    const users = getUsers();
    const exists = users.some(u => u.email === email);

    if (exists) {
      formNote.textContent = 'An account with this email already exists.';
      return;
    }

    // Save new user
    const newUser = { email, password, role, name };
    users.push(newUser);
    localStorage.setItem('helpdesk_users', JSON.stringify(users));

    // Success message
    formNote.style.color = 'var(--accent-dark)';
    formNote.textContent = 'Account created successfully! You can now sign in.';

    // Optional: clear the form
    form.reset();
  });
});
