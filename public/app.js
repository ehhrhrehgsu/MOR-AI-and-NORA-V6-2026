const socket = io();
let allCommands = [], allEvents = [];
const AI_PREFIX = '/';

/* ========== LOAD COMMANDS / EVENTS ========== */
async function loadCommands() {
  try {
    const res = await fetch('/api/commands');
    const data = await res.json();
    allCommands = data.commands || [];
    renderCheckList('commands-list', allCommands, 'cmd');
  } catch (e) {
    document.getElementById('commands-list').innerHTML = '<div class="loading-items">Failed to load</div>';
  }
}
async function loadEvents() {
  try {
    const res = await fetch('/api/events');
    const data = await res.json();
    allEvents = data.events || [];
    renderCheckList('events-list', allEvents, 'evt');
  } catch (e) {
    document.getElementById('events-list').innerHTML = '<div class="loading-items">Failed to load</div>';
  }
}
function renderCheckList(containerId, items, prefix) {
  const container = document.getElementById(containerId);
  if (!items.length) { container.innerHTML = '<div class="loading-items">No items found</div>'; return; }
  container.innerHTML = items.map(item => `
    <label class="check-item">
      <input type="checkbox" class="${prefix}-check" value="${item.name}" checked/>
      <div class="check-item-label">
        <div class="check-item-name">${item.name}</div>
        <div class="check-item-desc">${item.description || ''}</div>
      </div>
    </label>`).join('');
}
function selectAll(type) {
  document.querySelectorAll(`.${type==='commands'?'cmd':'evt'}-check`).forEach(cb=>cb.checked=true);
}
function deselectAll(type) {
  document.querySelectorAll(`.${type==='commands'?'cmd':'evt'}-check`).forEach(cb=>cb.checked=false);
}
function getSelectedCommands() { return [...document.querySelectorAll('.cmd-check:checked')].map(cb=>cb.value); }
function getSelectedEvents() { return [...document.querySelectorAll('.evt-check:checked')].map(cb=>cb.value); }

/* ========== VERIFY / LAUNCH ========== */
function openVerify() {
  if (!document.getElementById('appstate-input').value.trim()) return showToast('Please enter your AppState/FBSTATE!','error');
  if (!document.getElementById('prefix-input').value.trim()) return showToast('Please enter a prefix!','error');
  if (!document.getElementById('admin-uid-input').value.trim()) return showToast('Please enter Admin UID!','error');
  document.getElementById('verify-modal').classList.remove('hidden');
}
function closeVerify() { document.getElementById('verify-modal').classList.add('hidden'); }
function verify(type) {
  closeVerify();
  showToast(`Verified as ${type==='human'?'🧠 Human':'🤖 AI'} — Launching...`, 'info');
  setTimeout(startBot, 700);
}
async function startBot() {
  const appState = document.getElementById('appstate-input').value.trim();
  const prefix = document.getElementById('prefix-input').value.trim();
  const adminUID = document.getElementById('admin-uid-input').value.trim();
  const selectedCommands = getSelectedCommands();
  const selectedEvents = getSelectedEvents();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.innerHTML = '<span>⏳ STARTING...</span>';
  try {
    const res = await fetch('/api/start-bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appState,prefix,adminUID,selectedCommands,selectedEvents})});
    const data = await res.json();
    if (data.error) showToast('❌ '+data.error,'error');
    else { showToast('✅ Bot launched! Connecting to Facebook...','success'); document.getElementById('appstate-input').value=''; }
  } catch(e) { showToast('❌ Failed: '+e.message,'error'); }
  btn.disabled=false; btn.innerHTML='<span>🚀 LAUNCH BOT</span>';
}
async function stopBot(sessionId) {
  try {
    await fetch('/api/stop-bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId})});
    showToast('🛑 Bot stopped.','info');
  } catch(e) { showToast('❌ Failed to stop bot.','error'); }
}

/* ========== SESSIONS ========== */
function renderSessions(sessions) {
  const container = document.getElementById('sessions-container');
  document.getElementById('header-session-count').textContent = sessions.length;
  if (!sessions.length) { container.innerHTML = '<div class="no-sessions">No active bots yet. Start one below!</div>'; return; }
  container.innerHTML = sessions.map(s=>`
    <div class="session-card" id="session-${s.id}">
      <div class="session-header">
        <div class="session-name">🤖 ${s.botName||'NORA AI'}</div>
        <div class="session-badge">● ACTIVE</div>
      </div>
      <div class="session-info">
        Prefix: <span>${s.prefix}</span><br/>
        Admin UID: <span>${s.adminUID}</span><br/>
        Messages: <span>${s.messageCount||0}</span><br/>
        Uptime: <span>${s.uptime||'0h 0m 0s'}</span>
      </div>
      <button class="session-stop" onclick="stopBot('${s.id}')">🛑 Stop Bot</button>
    </div>`).join('');
}
socket.on('session-update', d => renderSessions(d.sessions||[]));
socket.on('bot-started', d => showToast(`✅ Bot connected! (${d.botName})`,'success'));
socket.on('bot-error', d => showToast(`❌ Bot error: ${d.error}`,'error'));
socket.on('bot-stopped', () => showToast('🛑 Bot session ended.','info'));
socket.on('commands-updated', d => { allCommands = d.commands||[]; renderCheckList('commands-list',allCommands,'cmd'); });
socket.on('events-updated', d => { allEvents = d.events||[]; renderCheckList('events-list',allEvents,'evt'); });

/* ========== SIMPLE AI PANEL ========== */
let emojiBarVisible = false;
function openSimpleAI() { document.getElementById('simple-ai-panel').classList.remove('hidden'); document.getElementById('ai-input').focus(); }
function closeSimpleAI() { document.getElementById('simple-ai-panel').classList.add('hidden'); }
function toggleAiInfo() { document.getElementById('ai-info-bar').classList.toggle('hidden'); }
function toggleEmojiBar() {
  emojiBarVisible = !emojiBarVisible;
  document.getElementById('ai-emoji-bar').classList.toggle('hidden',!emojiBarVisible);
}
function insertEmoji(e) {
  const inp = document.getElementById('ai-input');
  inp.value += e; inp.focus();
}
function clearAiChat() {
  document.getElementById('ai-messages').innerHTML = `
    <div class="ai-msg bot-msg">
      <span class="ai-avatar">🤖</span>
      <div class="ai-bubble">Chat cleared! Type <b>/help</b> to see commands.</div>
    </div>`;
}
function aiHelp() {
  addAiMessage('user', '/help');
  fetch('/api/simple-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'/help',prefix:AI_PREFIX})})
    .then(r=>r.json()).then(d=>addAiMessage('bot',d.reply||'...')).catch(()=>addAiMessage('bot','❌ Error'));
}
async function sendAiMessage() {
  const inp = document.getElementById('ai-input');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  addAiMessage('user', msg);
  const typingId = addAiMessage('bot', '...', true);
  try {
    const res = await fetch('/api/simple-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,prefix:AI_PREFIX})});
    const data = await res.json();
    updateAiMessage(typingId, data.reply||'...');
  } catch(e) { updateAiMessage(typingId,'❌ Connection error.'); }
}
let aiMsgId = 0;
function addAiMessage(type, text, isTyping=false) {
  const id = 'ai-msg-'+(++aiMsgId);
  const msgs = document.getElementById('ai-messages');
  const isUser = type==='user';
  const bubble = isTyping ? '<div class="typing-dots">●●●</div>' : text.replace(/\n/g,'<br/>');
  msgs.innerHTML += `
    <div class="ai-msg ${isUser?'user-msg':'bot-msg'}" id="${id}">
      ${isUser?'':`<span class="ai-avatar">🤖</span>`}
      <div class="ai-bubble">${bubble}</div>
      ${isUser?`<span class="ai-avatar">👤</span>`:''}
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function updateAiMessage(id, text) {
  const el = document.getElementById(id);
  if (el) el.querySelector('.ai-bubble').innerHTML = text.replace(/\n/g,'<br/>');
  document.getElementById('ai-messages').scrollTop = 999999;
}

/* ========== 3 DOTS / PIN / FEATURES ========== */
const ADMIN_PIN = '1989';
function openDotsMenu() {
  document.getElementById('pin-screen').classList.remove('hidden');
  document.getElementById('features-screen').classList.add('hidden');
  document.getElementById('pin-input').value='';
  document.getElementById('pin-error').classList.add('hidden');
  document.getElementById('dots-overlay').classList.remove('hidden');
  setTimeout(()=>document.getElementById('pin-input').focus(),100);
}
function closeDotsMenu() { document.getElementById('dots-overlay').classList.add('hidden'); }
function checkPin() {
  const val = document.getElementById('pin-input').value;
  if (val === ADMIN_PIN) {
    document.getElementById('pin-screen').classList.add('hidden');
    document.getElementById('features-screen').classList.remove('hidden');
  } else {
    document.getElementById('pin-error').classList.remove('hidden');
    document.getElementById('pin-input').value='';
    document.getElementById('pin-input').focus();
  }
}
function switchFTab(tabId, btn) {
  document.querySelectorAll('.ftab-content').forEach(t=>t.classList.add('hidden'));
  document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  btn.classList.add('active');
}
async function submitCommand() {
  const code = document.getElementById('cmd-code-input').value.trim();
  if (!code) return showFeatureResult('cmd-result','Please paste command code first.','error');
  showFeatureResult('cmd-result','⏳ Adding command...','');
  try {
    const res = await fetch('/api/add-command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const data = await res.json();
    if (data.error) showFeatureResult('cmd-result','❌ '+data.error,'error');
    else {
      showFeatureResult('cmd-result',`✅ Command "${data.name}" added successfully! Category: ${data.category}`,'success');
      document.getElementById('cmd-code-input').value='';
      showToast(`✅ Command "${data.name}" loaded!`,'success');
    }
  } catch(e) { showFeatureResult('cmd-result','❌ '+e.message,'error'); }
}
async function submitEvent() {
  const code = document.getElementById('evt-code-input').value.trim();
  if (!code) return showFeatureResult('evt-result','Please paste event code first.','error');
  showFeatureResult('evt-result','⏳ Adding event...','');
  try {
    const res = await fetch('/api/add-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const data = await res.json();
    if (data.error) showFeatureResult('evt-result','❌ '+data.error,'error');
    else {
      showFeatureResult('evt-result',`✅ Event "${data.name}" added!`,'success');
      document.getElementById('evt-code-input').value='';
      showToast(`✅ Event "${data.name}" loaded!`,'success');
    }
  } catch(e) { showFeatureResult('evt-result','❌ '+e.message,'error'); }
}
function showFeatureResult(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `feature-result${type==='success'?' success-r':type==='error'?' error-r':''}`;
  el.classList.remove('hidden');
}

/* ========== TOAST ========== */
function showToast(message, type='info') {
  const toast = document.getElementById('status-toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toast.classList.add('hidden'),4000);
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', ()=>{
  loadCommands(); loadEvents();
  fetch('/api/sessions').then(r=>r.json()).then(d=>renderSessions(d.sessions||[]));
  document.getElementById('verify-modal').addEventListener('click',function(e){if(e.target===this)closeVerify();});
  document.getElementById('dots-overlay').addEventListener('click',function(e){if(e.target===this)closeDotsMenu();});
  document.getElementById('pin-input').addEventListener('keydown',e=>{if(e.key==='Enter')checkPin();});
  document.getElementById('ai-input').addEventListener('keydown',e=>{if(e.key==='Enter')sendAiMessage();});
});
