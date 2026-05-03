const socket = io();
let allCommands = [];
let allEvents = [];

async function loadCommands() {
  try {
    const res = await fetch('/api/commands');
    const data = await res.json();
    allCommands = data.commands || [];
    renderCheckList('commands-list', allCommands, 'cmd');
  } catch (e) {
    document.getElementById('commands-list').innerHTML = '<div class="loading-items">Failed to load commands</div>';
  }
}

async function loadEvents() {
  try {
    const res = await fetch('/api/events');
    const data = await res.json();
    allEvents = data.events || [];
    renderCheckList('events-list', allEvents, 'evt');
  } catch (e) {
    document.getElementById('events-list').innerHTML = '<div class="loading-items">Failed to load events</div>';
  }
}

function renderCheckList(containerId, items, prefix) {
  const container = document.getElementById(containerId);
  if (!items.length) {
    container.innerHTML = '<div class="loading-items">No items found</div>';
    return;
  }
  container.innerHTML = items.map(item => `
    <label class="check-item">
      <input type="checkbox" class="${prefix}-check" value="${item.name}" checked />
      <div class="check-item-label">
        <div class="check-item-name">${item.name}</div>
        <div class="check-item-desc">${item.description || ''}</div>
      </div>
    </label>
  `).join('');
}

function selectAll(type) {
  const prefix = type === 'commands' ? 'cmd' : 'evt';
  document.querySelectorAll(`.${prefix}-check`).forEach(cb => cb.checked = true);
}

function deselectAll(type) {
  const prefix = type === 'commands' ? 'cmd' : 'evt';
  document.querySelectorAll(`.${prefix}-check`).forEach(cb => cb.checked = false);
}

function getSelectedCommands() {
  return [...document.querySelectorAll('.cmd-check:checked')].map(cb => cb.value);
}

function getSelectedEvents() {
  return [...document.querySelectorAll('.evt-check:checked')].map(cb => cb.value);
}

function openVerify() {
  const appstate = document.getElementById('appstate-input').value.trim();
  const prefix = document.getElementById('prefix-input').value.trim();
  const adminUID = document.getElementById('admin-uid-input').value.trim();
  if (!appstate) return showToast('Please enter your AppState/FBSTATE!', 'error');
  if (!prefix) return showToast('Please enter a prefix!', 'error');
  if (!adminUID) return showToast('Please enter Admin UID!', 'error');
  document.getElementById('verify-modal').classList.remove('hidden');
}

function closeVerify() {
  document.getElementById('verify-modal').classList.add('hidden');
}

function verify(type) {
  closeVerify();
  showToast(`Verified as ${type === 'human' ? '🧠 Human' : '🤖 AI'} — Launching bot...`, 'info');
  setTimeout(startBot, 800);
}

async function startBot() {
  const appState = document.getElementById('appstate-input').value.trim();
  const prefix = document.getElementById('prefix-input').value.trim();
  const adminUID = document.getElementById('admin-uid-input').value.trim();
  const selectedCommands = getSelectedCommands();
  const selectedEvents = getSelectedEvents();

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳ STARTING BOT...</span>';

  try {
    const res = await fetch('/api/start-bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appState, prefix, adminUID, selectedCommands, selectedEvents })
    });
    const data = await res.json();
    if (data.error) {
      showToast('❌ ' + data.error, 'error');
    } else {
      showToast('✅ Bot launched! Connecting to Facebook...', 'success');
      document.getElementById('appstate-input').value = '';
    }
  } catch (e) {
    showToast('❌ Failed to start bot: ' + e.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<span>🚀 LAUNCH BOT</span>';
}

async function stopBot(sessionId) {
  try {
    await fetch('/api/stop-bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    showToast('🛑 Bot stopped.', 'info');
  } catch (e) {
    showToast('❌ Failed to stop bot.', 'error');
  }
}

function renderSessions(sessions) {
  const container = document.getElementById('sessions-container');
  const countEl = document.getElementById('header-session-count');
  countEl.textContent = sessions.length;

  if (!sessions.length) {
    container.innerHTML = '<div class="no-sessions">No active bots yet. Start one below!</div>';
    return;
  }

  container.innerHTML = sessions.map(s => `
    <div class="session-card" id="session-${s.id}">
      <div class="session-header">
        <div class="session-name">🤖 ${s.botName || 'NORA AI'}</div>
        <div class="session-badge">● ACTIVE</div>
      </div>
      <div class="session-info">
        Prefix: <span>${s.prefix}</span><br/>
        Admin UID: <span>${s.adminUID}</span><br/>
        Messages: <span>${s.messageCount || 0}</span><br/>
        Uptime: <span>${s.uptime || '0h 0m 0s'}</span>
      </div>
      <button class="session-stop" onclick="stopBot('${s.id}')">🛑 Stop Bot</button>
    </div>
  `).join('');
}

socket.on('session-update', (data) => {
  renderSessions(data.sessions || []);
});

socket.on('bot-started', (data) => {
  showToast(`✅ Bot connected! (${data.botName})`, 'success');
});

socket.on('bot-error', (data) => {
  showToast(`❌ Bot error: ${data.error}`, 'error');
});

socket.on('bot-stopped', (data) => {
  showToast('🛑 Bot session ended.', 'info');
});

function showToast(message, type = 'info') {
  const toast = document.getElementById('status-toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadCommands();
  loadEvents();
  fetch('/api/sessions').then(r => r.json()).then(d => renderSessions(d.sessions || []));
  document.getElementById('verify-modal').addEventListener('click', function(e) {
    if (e.target === this) closeVerify();
  });
});
