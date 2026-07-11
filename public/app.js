/**
 * FinanceFlow Dashboard Logic
 */

const API_BASE = '/api';
let trendsChart = null;

// UI Elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const recordForm = document.getElementById('record-form');
const recordModal = document.getElementById('record-modal');
const logoutBtn = document.getElementById('logout-btn');
const addRecordBtn = document.getElementById('add-record-btn');
const closeModalBtn = document.querySelector('.close-modal');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const authMessage = document.getElementById('auth-message');

// Init
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    showDashboard();
  } else {
    showAuth();
  }
});

// Toggle between Login and Register
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

// Show auth message helper
function showAuthMessage(msg, isError = true) {
  authMessage.textContent = msg;
  authMessage.className = `auth-msg ${isError ? 'auth-msg-error' : 'auth-msg-success'}`;
  authMessage.classList.remove('hidden');
}
function clearAuthMessage() {
  authMessage.textContent = '';
  authMessage.classList.add('hidden');
}

// Register Handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showDashboard();
    } else {
      showAuthMessage(data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    showAuthMessage('Network error. Please check your connection.');
    console.error('Register failed', err);
  }
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showDashboard();
    } else {
      showAuthMessage(data.message || 'Invalid credentials.');
    }
  } catch (err) {
    showAuthMessage('Network error. Please check your connection.');
    console.error('Login failed', err);
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  showAuth();
});

// Navigation
function showAuth() {
  authScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
  // Reset to login view
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

// Data Loading
async function loadDashboardData() {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    // 1. Load Summary
    const sumRes = await fetch(`${API_BASE}/dashboard/summary`, { headers });
    const sumData = await sumRes.json();
    if (sumData.success) {
      const s = sumData.summary;
      document.getElementById('stat-income').textContent = `$${s.totalIncome.toLocaleString()}`;
      document.getElementById('stat-expense').textContent = `$${s.totalExpenses.toLocaleString()}`;
      document.getElementById('stat-balance').textContent = `$${s.balance.toLocaleString()}`;
    }

    // 2. Load Trends for Chart
    const trendsRes = await fetch(`${API_BASE}/dashboard/monthly-trends`, { headers });
    const trendsData = await trendsRes.json();
    if (trendsData.success) {
      updateTrendsChart(trendsData.trends);
    }

    // 3. Load Recent Records
    const recordsRes = await fetch(`${API_BASE}/records`, { headers });
    const recordsData = await recordsRes.json();
    if (recordsData.success) {
      renderRecords(recordsData.records);
    }
  } catch (err) {
    console.error('Error loading dashboard data', err);
  }
}

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
      <td style="color: ${r.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
        ${r.type === 'income' ? '+' : '-'}$${r.amount.toLocaleString()}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateTrendsChart(trends) {
  const ctx = document.getElementById('trendsChart').getContext('2d');
  
  const labels = [...new Set(trends.map(t => `${t.month}/${t.year}`))].reverse();
  const incomeData = labels.map(l => {
    const entry = trends.find(t => `${t.month}/${t.year}` === l && t.type === 'income');
    return entry ? entry.total : 0;
  });
  const expenseData = labels.map(l => {
    const entry = trends.find(t => `${t.month}/${t.year}` === l && t.type === 'expense');
    return entry ? entry.total : 0;
  });

  if (trendsChart) trendsChart.destroy();

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// Modal Logic
addRecordBtn.addEventListener('click', () => recordModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => recordModal.classList.add('hidden'));

recordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const body = {
    amount: parseFloat(e.target[0].value),
    category: e.target[1].value,
    type: e.target[2].value,
    notes: e.target[3].value
  };

  try {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
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
    console.error('Record creation failed', err);
  }
});
