/**
 * FinanceFlow Dashboard Logic
 */

const API_BASE = '/api';
let trendsChart = null;

// Fetch with 8-second timeout so buttons never get permanently stuck
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. The server may be unreachable.');
    throw err;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ── UI Element References ──────────────────────────────────────────────────
  const authScreen      = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm       = document.getElementById('login-form');
  const registerForm    = document.getElementById('register-form');
  const recordForm      = document.getElementById('record-form');
  const recordModal     = document.getElementById('record-modal');
  const logoutBtn       = document.getElementById('logout-btn');
  const addRecordBtn    = document.getElementById('add-record-btn');
  const closeModalBtn   = document.querySelector('.close-modal');
  const loginView       = document.getElementById('login-view');
  const registerView    = document.getElementById('register-view');
  const authMessage     = document.getElementById('auth-message');

  // ── Auth Message Helpers ───────────────────────────────────────────────────
  function showAuthMessage(msg, isError = true) {
    authMessage.textContent = msg;
    authMessage.className = `auth-msg ${isError ? 'auth-msg-error' : 'auth-msg-success'}`;
    authMessage.classList.remove('hidden');
  }

  function clearAuthMessage() {
    authMessage.textContent = '';
    authMessage.classList.add('hidden');
  }

  // ── Button Loading State ───────────────────────────────────────────────────
  function setButtonLoading(btn, loading, originalText) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait...' : originalText;
  }

  // ── Toggle Login / Register ────────────────────────────────────────────────
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    clearAuthMessage();
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    clearAuthMessage();
  });

  // ── Register ──────────────────────────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type="submit"]');
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    setButtonLoading(btn, true, 'Create Account');
    clearAuthMessage();

    try {
      const res  = await fetchWithTimeout(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showDashboard();
      } else {
        // Show first validation error if available
        const msg = data.errors?.[0]?.message || data.message || 'Registration failed.';
        showAuthMessage(msg);
      }
    } catch (err) {
      showAuthMessage('Network error. Please check your connection.');
      console.error('Register failed', err);
    } finally {
      setButtonLoading(btn, false, 'Create Account');
    }
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    setButtonLoading(btn, true, 'Sign In');
    clearAuthMessage();

    try {
      const res  = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showDashboard();
      } else {
        const msg = data.errors?.[0]?.message || data.message || 'Invalid credentials.';
        showAuthMessage(msg);
      }
    } catch (err) {
      showAuthMessage('Network error. Please check your connection.');
      console.error('Login failed', err);
    } finally {
      setButtonLoading(btn, false, 'Sign In');
    }
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    showAuth();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  function showAuth() {
    authScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
    loginView.classList.remove('hidden');
    registerView.classList.add('hidden');
    clearAuthMessage();
  }

  function showDashboard() {
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) document.getElementById('user-name').textContent = user.name;
    loadDashboardData();
  }

  // ── Dashboard Data ─────────────────────────────────────────────────────────
  async function loadDashboardData() {
    const token = localStorage.getItem('token');
    if (!token) return showAuth();
    const headers = { Authorization: `Bearer ${token}` };

    // Load all in parallel; handle each independently
    const [sumRes, trendsRes, recordsRes] = await Promise.allSettled([
      fetchWithTimeout(`${API_BASE}/dashboard/summary`,        { headers }),
      fetchWithTimeout(`${API_BASE}/dashboard/monthly-trends`, { headers }),
      fetchWithTimeout(`${API_BASE}/records`,                  { headers }),
    ]);

    // Check for 403 (viewer role) on dashboard
    if (sumRes.status === 'fulfilled' && sumRes.value.status === 403) {
      document.getElementById('stat-income').textContent  = 'N/A';
      document.getElementById('stat-expense').textContent = 'N/A';
      document.getElementById('stat-balance').textContent = 'N/A';
      document.getElementById('records-list').innerHTML =
        '<tr><td colspan="4" style="text-align:center;opacity:0.6;padding:2rem">Your account has limited access.<br>Please log out and register a new account.</td></tr>';
      return;
    }

    // Summary
    if (sumRes.status === 'fulfilled') {
      try {
        const data = await sumRes.value.json();
        if (data.success) {
          const s = data.summary;
          document.getElementById('stat-income').textContent  = `$${(s.totalIncome  || 0).toLocaleString()}`;
          document.getElementById('stat-expense').textContent = `$${(s.totalExpenses|| 0).toLocaleString()}`;
          document.getElementById('stat-balance').textContent = `$${(s.balance      || 0).toLocaleString()}`;
        }
      } catch (_) {}
    }

    // Trends chart
    if (trendsRes.status === 'fulfilled') {
      try {
        const data = await trendsRes.value.json();
        if (data.success && data.trends?.length) updateTrendsChart(data.trends);
      } catch (_) {}
    }

    // Records table
    if (recordsRes.status === 'fulfilled') {
      try {
        const data = await recordsRes.value.json();
        if (data.success) renderRecords(data.records || []);
      } catch (_) {}
    }
  }

  // ── Records Table ──────────────────────────────────────────────────────────
  function renderRecords(records) {
    const tbody = document.getElementById('records-list');
    tbody.innerHTML = '';
    if (!records.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;opacity:0.5;padding:2rem">No transactions yet</td></tr>';
      return;
    }
    records.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(r.date).toLocaleDateString()}</td>
        <td>${r.category}</td>
        <td><span class="badge badge-${r.type}">${r.type.toUpperCase()}</span></td>
        <td style="color:${r.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
          ${r.type === 'income' ? '+' : '-'}$${Number(r.amount).toLocaleString()}
        </td>`;
      tbody.appendChild(row);
    });
  }

  // ── Chart ──────────────────────────────────────────────────────────────────
  function updateTrendsChart(trends) {
    const ctx    = document.getElementById('trendsChart').getContext('2d');
    const labels = [...new Set(trends.map(t => `${t.month}/${t.year}`))].reverse();

    const incomeData  = labels.map(l => { const e = trends.find(t => `${t.month}/${t.year}` === l && t.type === 'income');  return e ? e.total : 0; });
    const expenseData = labels.map(l => { const e = trends.find(t => `${t.month}/${t.year}` === l && t.type === 'expense'); return e ? e.total : 0; });

    if (trendsChart) trendsChart.destroy();
    trendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Income',   data: incomeData,  borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
          { label: 'Expenses', data: expenseData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',  fill: true, tension: 0.4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false },                  ticks: { color: '#94a3b8' } },
        },
      },
    });
  }

  // ── Add Record Modal ───────────────────────────────────────────────────────
  addRecordBtn.addEventListener('click',  () => recordModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => recordModal.classList.add('hidden'));
  recordModal.addEventListener('click', (e) => { if (e.target === recordModal) recordModal.classList.add('hidden'); });

  recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = recordForm.querySelector('button[type="submit"]');
    const token = localStorage.getItem('token');
    const body  = {
      amount:   parseFloat(document.querySelector('#record-form input[type="number"]').value),
      category: document.querySelector('#record-form input[type="text"]').value,
      type:     document.querySelector('#record-form select').value,
      notes:    document.querySelector('#record-form textarea').value,
    };

    setButtonLoading(btn, true, 'Save Transaction');

    try {
      const res  = await fetchWithTimeout(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        recordModal.classList.add('hidden');
        recordForm.reset();
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to save record.');
      }
    } catch (err) {
      alert('Network error saving record.');
      console.error('Record creation failed', err);
    } finally {
      setButtonLoading(btn, false, 'Save Transaction');
    }
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  const token = localStorage.getItem('token');
  if (token) {
    showDashboard();
  } else {
    showAuth();
  }
});
