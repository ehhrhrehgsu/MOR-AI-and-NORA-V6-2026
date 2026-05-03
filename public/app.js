const socket = io();
let allCommands = [], allEvents = [];
const AI_PREFIX = '/';
let sessionCount = 0;

/* ===== PH CLOCK ===== */
function updatePHClock() {
  const now = new Date();
  const ph = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const h = ph.getHours(), m = ph.getMinutes(), s = ph.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = String(h % 12 || 12).padStart(2,'0');
  const mm = String(m).padStart(2,'0');
  const ss = String(s).padStart(2,'0');
  const timeStr = `${hh}:${mm}:${ss} ${ampm}`;
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${days[ph.getDay()]}, ${months[ph.getMonth()]} ${ph.getDate()}, ${ph.getFullYear()}`;
  const el1 = document.getElementById('ph-time');
  const el2 = document.getElementById('ph-clock-big');
  const el3 = document.getElementById('ph-date');
  if (el1) el1.textContent = `${hh}:${mm}:${ss}`;
  if (el2) el2.textContent = timeStr;
  if (el3) el3.textContent = dateStr;
}
setInterval(updatePHClock, 1000);
updatePHClock();

/* ===== COMMANDS / EVENTS ===== */
async function loadCommands() {
  try {
    const res = await fetch('/api/commands');
    allCommands = (await res.json()).commands || [];
    renderCheckList('commands-list', allCommands, 'cmd');
    const el = document.getElementById('stat-cmds');
    if (el) el.textContent = allCommands.length;
  } catch(e) { document.getElementById('commands-list').innerHTML='<div class="loading-items">Failed</div>'; }
}
async function loadEvents() {
  try {
    const res = await fetch('/api/events');
    allEvents = (await res.json()).events || [];
    renderCheckList('events-list', allEvents, 'evt');
  } catch(e) { document.getElementById('events-list').innerHTML='<div class="loading-items">Failed</div>'; }
}
function renderCheckList(id, items, prefix) {
  const el = document.getElementById(id);
  if (!items.length) { el.innerHTML='<div class="loading-items">No items</div>'; return; }
  el.innerHTML = items.map(item=>`
    <label class="check-item">
      <input type="checkbox" class="${prefix}-check" value="${item.name}" checked/>
      <div class="check-item-label">
        <div class="check-item-name">${item.name}</div>
        <div class="check-item-desc">${item.description||''}</div>
      </div>
    </label>`).join('');
}
function selectAll(t) { document.querySelectorAll(`.${t==='commands'?'cmd':'evt'}-check`).forEach(c=>c.checked=true); }
function deselectAll(t) { document.querySelectorAll(`.${t==='commands'?'cmd':'evt'}-check`).forEach(c=>c.checked=false); }
function getSelectedCommands() { return [...document.querySelectorAll('.cmd-check:checked')].map(c=>c.value); }
function getSelectedEvents() { return [...document.querySelectorAll('.evt-check:checked')].map(c=>c.value); }

/* ===== AI USAGE ===== */
async function refreshAiUsage() {
  try {
    const res = await fetch('/api/ai-usage?uid=web_user');
    const d = await res.json();
    const pct = Math.round((d.used / d.limit) * 100);
    const fill = document.getElementById('aub-fill');
    const text = document.getElementById('aub-text');
    const sb = document.getElementById('stat-ai-bar');
    const sv = document.getElementById('stat-ai-used');
    const sr = document.getElementById('stat-ai-rem');
    if (fill) { fill.style.width = pct+'%'; fill.style.background = pct>=80?'var(--danger)':pct>=50?'var(--warn)':'var(--primary)'; }
    if (text) text.textContent = `${d.used}/${d.limit}`;
    if (sb) sb.style.width = pct+'%';
    if (sv) sv.textContent = d.used;
    if (sr) sr.textContent = d.remaining;
  } catch(e) {}
}
setInterval(refreshAiUsage, 30000);

/* ===== VERIFY / LAUNCH ===== */
function openVerify() {
  if (!document.getElementById('appstate-input').value.trim()) return showToast('Please enter AppState/FBSTATE!','error');
  if (!document.getElementById('prefix-input').value.trim()) return showToast('Please enter a prefix!','error');
  if (!document.getElementById('admin-uid-input').value.trim()) return showToast('Please enter Admin UID!','error');
  if (sessionCount >= 10) return showToast('❌ Max 10 active bot accounts!','error');
  document.getElementById('verify-modal').classList.remove('hidden');
}
function closeVerify() { document.getElementById('verify-modal').classList.add('hidden'); }
function verify(type) {
  closeVerify();
  showToast(`Verified as ${type==='human'?'🧠 Human':'🤖 AI'} — Launching...`,'info');
  setTimeout(startBot, 700);
}
async function startBot() {
  const appState = document.getElementById('appstate-input').value.trim();
  const prefix = document.getElementById('prefix-input').value.trim();
  const adminUID = document.getElementById('admin-uid-input').value.trim();
  const btn = document.getElementById('submit-btn');
  btn.disabled=true; btn.innerHTML='<span>⏳ STARTING...</span>';
  try {
    const res = await fetch('/api/start-bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appState,prefix,adminUID,selectedCommands:getSelectedCommands(),selectedEvents:getSelectedEvents()})});
    const data = await res.json();
    if (data.error) showToast('❌ '+data.error,'error');
    else { showToast('✅ Bot launched! Connecting to Facebook...','success'); document.getElementById('appstate-input').value=''; }
  } catch(e) { showToast('❌ Failed: '+e.message,'error'); }
  btn.disabled=false; btn.innerHTML='<span>🚀 LAUNCH BOT</span>';
}

/* ===== BOT CONTROLS ===== */
async function stopBot(id) {
  try {
    await fetch('/api/stop-bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id})});
    showToast('🛑 Bot stopped.','info');
  } catch(e) { showToast('❌ Error stopping bot.','error'); }
}
async function restartBot(id) {
  const card = document.getElementById('session-'+id);
  if (card) { const b=card.querySelector('.session-badge'); if(b){b.textContent='⟳ RESTARTING';b.className='session-badge restarting';} }
  try {
    const res = await fetch('/api/restart-bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id})});
    const data = await res.json();
    if (data.error) showToast('❌ '+data.error,'error');
    else showToast('🔄 Restarting bot...','info');
  } catch(e) { showToast('❌ Restart failed.','error'); }
}

/* ===== SESSIONS ===== */
function renderSessions(sessions) {
  sessionCount = sessions.length;
  const c = document.getElementById('sessions-container');
  document.getElementById('header-session-count').textContent = sessions.length;
  const sa = document.getElementById('stat-accounts');
  const saBar = document.getElementById('stat-acc-bar');
  if (sa) sa.textContent = `${sessions.length}/10`;
  if (saBar) saBar.style.width = (sessions.length/10*100)+'%';
  if (!sessions.length) { c.innerHTML='<div class="no-sessions">No active bots yet. Start one below!</div>'; return; }
  c.innerHTML = sessions.map(s=>`
    <div class="session-card" id="session-${s.id}">
      <div class="session-header">
        <div class="session-name">🤖 ${s.botName||'NORA AI V12'}</div>
        <div class="session-badge ${s.status==='restarting'?'restarting':''}">${s.status==='restarting'?'⟳ RESTARTING':'● ACTIVE'}</div>
      </div>
      <div class="session-info">
        Prefix: <span>${s.prefix}</span><br/>
        Admin UID: <span>${s.adminUID}</span><br/>
        Messages: <span>${s.messageCount||0}</span><br/>
        Uptime: <span>${s.uptime||'0h 0m 0s'}</span>
      </div>
      <div class="session-btns">
        <button class="session-restart" onclick="restartBot('${s.id}')">🔄 Restart</button>
        <button class="session-stop" onclick="stopBot('${s.id}')">🛑 Stop</button>
      </div>
    </div>`).join('');
}
socket.on('session-update', d=>renderSessions(d.sessions||[]));
socket.on('bot-started', d=>showToast(`✅ Bot ${d.isRestart?'restarted':'connected'}! (${d.botName})`,'success'));
socket.on('bot-restarting', ()=>showToast('🔄 Bot is restarting...','info'));
socket.on('bot-error', d=>showToast(`❌ Bot error: ${d.error}`,'error'));
socket.on('bot-stopped', ()=>showToast('🛑 Bot session ended.','info'));
socket.on('commands-updated', d=>{ allCommands=d.commands||[]; renderCheckList('commands-list',allCommands,'cmd'); const el=document.getElementById('stat-cmds'); if(el)el.textContent=allCommands.length; });
socket.on('events-updated', d=>{ allEvents=d.events||[]; renderCheckList('events-list',allEvents,'evt'); });

/* ===== SIMPLE AI ===== */
let emojiBarVisible=false, aiMsgId=0;
function openSimpleAI(){document.getElementById('simple-ai-panel').classList.remove('hidden');document.getElementById('ai-input').focus();refreshAiUsage();}
function closeSimpleAI(){document.getElementById('simple-ai-panel').classList.add('hidden');}
function toggleAiInfo(){document.getElementById('ai-info-bar').classList.toggle('hidden');}
function toggleEmojiBar(){emojiBarVisible=!emojiBarVisible;document.getElementById('ai-emoji-bar').classList.toggle('hidden',!emojiBarVisible);}
function insertEmoji(e){const i=document.getElementById('ai-input');i.value+=e;i.focus();}
function clearAiChat(){document.getElementById('ai-messages').innerHTML='<div class="ai-msg bot-msg"><span class="ai-avatar">🤖</span><div class="ai-bubble">Chat cleared! Type <b>/help</b> for commands.</div></div>';}
function aiHelp(){addAiMessage('user','/help');fetchAi('/help');}

async function sendAiMessage(){
  const inp=document.getElementById('ai-input');
  const msg=inp.value.trim();
  if(!msg)return;
  inp.value='';
  addAiMessage('user',msg);
  await fetchAi(msg);
}
async function fetchAi(msg){
  const tid=addAiMessage('bot','●●●',true);
  try{
    const res=await fetch('/api/simple-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,prefix:AI_PREFIX,uid:'web_user'})});
    const data=await res.json();
    updateAiMessage(tid, data.reply||'...');
    if(data.aiUsage) updateAiUsageUI(data.aiUsage);
    refreshAiUsage();
  }catch(e){updateAiMessage(tid,'❌ Connection error.');}
}
function updateAiUsageUI(usage){
  const pct=Math.round((usage.used/usage.limit)*100);
  const fill=document.getElementById('aub-fill');
  const text=document.getElementById('aub-text');
  if(fill){fill.style.width=pct+'%';fill.style.background=pct>=80?'var(--danger)':pct>=50?'var(--warn)':'var(--primary)';}
  if(text)text.textContent=`${usage.used}/${usage.limit}`;
}
function addAiMessage(type,text,isTyping=false){
  const id='ai-msg-'+(++aiMsgId);
  const msgs=document.getElementById('ai-messages');
  const isUser=type==='user';
  const bubble=isTyping?'<span style="letter-spacing:3px;color:var(--text-dim)">●●●</span>':escHtml(text).replace(/\n/g,'<br/>');
  msgs.innerHTML+=`<div class="ai-msg ${isUser?'user-msg':'bot-msg'}" id="${id}">
    ${isUser?'':`<span class="ai-avatar">🤖</span>`}
    <div class="ai-bubble">${bubble}</div>
    ${isUser?`<span class="ai-avatar">👤</span>`:''}
  </div>`;
  msgs.scrollTop=msgs.scrollHeight;
  return id;
}
function updateAiMessage(id,text){
  const el=document.getElementById(id);
  if(el)el.querySelector('.ai-bubble').innerHTML=escHtml(text).replace(/\n/g,'<br/>');
  document.getElementById('ai-messages').scrollTop=999999;
}
function escHtml(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ===== 3 DOTS / PIN ===== */
const ADMIN_PIN='1989';
function openDotsMenu(){document.getElementById('pin-screen').classList.remove('hidden');document.getElementById('features-screen').classList.add('hidden');document.getElementById('pin-input').value='';document.getElementById('pin-error').classList.add('hidden');document.getElementById('dots-overlay').classList.remove('hidden');setTimeout(()=>document.getElementById('pin-input').focus(),100);}
function closeDotsMenu(){document.getElementById('dots-overlay').classList.add('hidden');}
function checkPin(){if(document.getElementById('pin-input').value===ADMIN_PIN){document.getElementById('pin-screen').classList.add('hidden');document.getElementById('features-screen').classList.remove('hidden');}else{document.getElementById('pin-error').classList.remove('hidden');document.getElementById('pin-input').value='';document.getElementById('pin-input').focus();}}
function switchFTab(tabId,btn){document.querySelectorAll('.ftab-content').forEach(t=>t.classList.add('hidden'));document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));document.getElementById(tabId).classList.remove('hidden');btn.classList.add('active');}
async function submitCommand(){
  const code=document.getElementById('cmd-code-input').value.trim();
  if(!code)return showFeatureResult('cmd-result','Please paste command code.','error');
  showFeatureResult('cmd-result','⏳ Adding...','');
  try{const res=await fetch('/api/add-command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});const data=await res.json();if(data.error)showFeatureResult('cmd-result','❌ '+data.error,'error');else{showFeatureResult('cmd-result',`✅ "${data.name}" added & auto-synced!`,'success');document.getElementById('cmd-code-input').value='';showToast(`✅ Command "${data.name}" loaded!`,'success');}}catch(e){showFeatureResult('cmd-result','❌ '+e.message,'error');}
}
async function submitEvent(){
  const code=document.getElementById('evt-code-input').value.trim();
  if(!code)return showFeatureResult('evt-result','Please paste event code.','error');
  showFeatureResult('evt-result','⏳ Adding...','');
  try{const res=await fetch('/api/add-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});const data=await res.json();if(data.error)showFeatureResult('evt-result','❌ '+data.error,'error');else{showFeatureResult('evt-result',`✅ "${data.name}" added & auto-synced!`,'success');document.getElementById('evt-code-input').value='';showToast(`✅ Event "${data.name}" loaded!`,'success');}}catch(e){showFeatureResult('evt-result','❌ '+e.message,'error');}
}
function showFeatureResult(id,msg,type){const el=document.getElementById(id);el.textContent=msg;el.className=`feature-result${type==='success'?' success-r':type==='error'?' error-r':''}`;el.classList.remove('hidden');}

/* ===== TOAST ===== */
function showToast(message,type='info'){const t=document.getElementById('status-toast');t.textContent=message;t.className=`toast ${type}`;t.classList.remove('hidden');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),4000);}

/* ===== BACKGROUND MUSIC ===== */
let musicPlaying=false;
const music=document.getElementById('bg-music');
if(music)music.volume=1.0;
function toggleMusic(){
  if(!music)return;
  if(musicPlaying){music.pause();musicPlaying=false;document.getElementById('music-icon').textContent='🎵';document.getElementById('music-fab-btn').classList.remove('playing');showToast('🎵 Music paused','info');}
  else{music.volume=1.0;music.play().then(()=>{musicPlaying=true;document.getElementById('music-icon').textContent='🔊';document.getElementById('music-fab-btn').classList.add('playing');showToast('🎵 Relaxing music playing...','success');}).catch(()=>showToast('🎵 Click again to start music','info'));}
}
function autoPlayMusic(){
  if(!music||musicPlaying)return;
  music.volume=1.0;
  music.play().then(()=>{musicPlaying=true;document.getElementById('music-icon').textContent='🔊';document.getElementById('music-fab-btn').classList.add('playing');}).catch(()=>{document.addEventListener('click',function once(){if(!musicPlaying)toggleMusic();document.removeEventListener('click',once);},{once:true});});
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',()=>{
  loadCommands();loadEvents();
  fetch('/api/sessions').then(r=>r.json()).then(d=>renderSessions(d.sessions||[]));
  refreshAiUsage();
  document.getElementById('verify-modal').addEventListener('click',function(e){if(e.target===this)closeVerify();});
  document.getElementById('dots-overlay').addEventListener('click',function(e){if(e.target===this)closeDotsMenu();});
  document.getElementById('pin-input').addEventListener('keydown',e=>{if(e.key==='Enter')checkPin();});
  document.getElementById('ai-input').addEventListener('keydown',e=>{if(e.key==='Enter')sendAiMessage();});
  setTimeout(autoPlayMusic,800);
});
