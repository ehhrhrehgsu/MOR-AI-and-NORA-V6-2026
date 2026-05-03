const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

let login;
try { login = require('stfca'); } catch(e) {
  try { login = require('fca-unofficial'); } catch(e2) { login = null; }
}

const {
  log, loadCommands, loadEvents, saveAndLoadCommand, saveAndLoadEvent,
  addSession, removeSession, updateSession, getSessions,
  generateSessionId, parseAppState
} = require('./utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let commands = loadCommands();
let events = loadEvents();
const botStartTime = Date.now();

log('info', `Loaded ${commands.size} commands, ${events.size} events`);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/api/sessions', (req, res) => res.json({ sessions: getSessions() }));

app.get('/api/commands', (req, res) => {
  const list = [];
  const seen = new Set();
  for (const [, cmd] of commands) {
    if (!seen.has(cmd.config.name)) {
      seen.add(cmd.config.name);
      list.push({ name: cmd.config.name, description: cmd.config.description, category: cmd.config.category, usage: cmd.config.usage });
    }
  }
  res.json({ commands: list });
});

app.get('/api/events', (req, res) => {
  const list = [...events.values()].map(e => ({ name: e.config.name, description: e.config.description, eventType: e.config.eventType }));
  res.json({ events: list });
});

app.post('/api/add-command', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided.' });
  try {
    const result = saveAndLoadCommand(code);
    commands = loadCommands();
    io.emit('commands-updated', { commands: getCommandList() });
    log('success', `Dynamic command added: ${result.name}`);
    res.json({ success: true, name: result.name, category: result.category });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/add-event', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided.' });
  try {
    const result = saveAndLoadEvent(code);
    events = loadEvents();
    io.emit('events-updated', { events: getEventList() });
    log('success', `Dynamic event added: ${result.name}`);
    res.json({ success: true, name: result.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

function getCommandList() {
  const list = [];
  const seen = new Set();
  for (const [, cmd] of commands) {
    if (!seen.has(cmd.config.name)) {
      seen.add(cmd.config.name);
      list.push({ name: cmd.config.name, description: cmd.config.description, category: cmd.config.category, usage: cmd.config.usage });
    }
  }
  return list;
}

function getEventList() {
  return [...events.values()].map(e => ({ name: e.config.name, description: e.config.description, eventType: e.config.eventType }));
}

app.post('/api/simple-ai', (req, res) => {
  const { message, prefix } = req.body;
  const p = prefix || '/';
  if (!message) return res.json({ reply: 'Please type a message.' });
  const body = message.trim();
  if (!body.startsWith(p)) {
    return res.json({ reply: `🤖 NORA AI: I only respond to commands starting with "${p}". Try ${p}help` });
  }
  const args = body.slice(p.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  const cmd = commands.get(cmdName);
  if (!cmd) return res.json({ reply: `❌ Command "${cmdName}" not found. Try ${p}help to see all commands.` });
  const replies = [];
  const fakeApi = {
    sendMessage: (msg, tid, cb) => {
      if (typeof msg === 'object') replies.push(msg.body || JSON.stringify(msg));
      else replies.push(String(msg));
      if (typeof cb === 'function') cb(null, { messageID: 'fake_' + Date.now() });
    },
    unsendMessage: () => {}
  };
  const fakeEvent = { threadID: 'web', messageID: 'web_msg', senderID: 'web_user', body };
  try {
    const result = cmd.run({ api: fakeApi, event: fakeEvent, args, commands, prefix: p, adminUID: 'web', botStartTime });
    if (result && typeof result.then === 'function') {
      result.then(() => res.json({ reply: replies.join('\n\n') || '✅ Done!' })).catch(e => res.json({ reply: `❌ Error: ${e.message}` }));
    } else {
      setTimeout(() => res.json({ reply: replies.join('\n\n') || '✅ Done!' }), 300);
    }
  } catch (e) {
    res.json({ reply: `❌ Error running command: ${e.message}` });
  }
});

app.post('/api/start-bot', async (req, res) => {
  if (!login) return res.status(500).json({ error: 'Facebook login library not available. Please check your installation.' });
  const { appState, prefix, adminUID, selectedCommands, selectedEvents } = req.body;
  if (!appState) return res.status(400).json({ error: 'AppState is required.' });
  if (!prefix) return res.status(400).json({ error: 'Prefix is required.' });
  if (!adminUID) return res.status(400).json({ error: 'Admin UID is required.' });
  let parsedAppState;
  try { parsedAppState = parseAppState(appState); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  const sessionId = generateSessionId();
  res.json({ success: true, sessionId, message: 'Bot is starting...' });

  setTimeout(() => {
    login({ appState: parsedAppState }, (err, api) => {
      if (err) {
        log('error', `Bot login failed [${sessionId}]: ${err.message}`);
        io.emit('bot-error', { sessionId, error: err.message });
        return;
      }
      api.setOptions({ listenEvents: true, selfListen: false, logLevel: 'silent' });
      const botUID = api.getCurrentUserID();
      addSession(sessionId, { botName: 'NORA AI V10', prefix, adminUID, uid: botUID, selectedCommands, selectedEvents });
      io.emit('bot-started', { sessionId, botName: 'NORA AI V10', prefix, adminUID, uid: botUID });
      log('success', `Bot online [${sessionId}]`);

      const enabledCmds = new Map();
      if (selectedCommands && selectedCommands.length > 0) {
        selectedCommands.forEach(n => { if (commands.has(n)) enabledCmds.set(n, commands.get(n)); });
      } else { commands.forEach((v,k) => enabledCmds.set(k,v)); }

      const enabledEvts = new Map();
      if (selectedEvents && selectedEvents.length > 0) {
        selectedEvents.forEach(n => { if (events.has(n)) enabledEvts.set(n, events.get(n)); });
      } else { events.forEach((v,k) => enabledEvts.set(k,v)); }

      api.listenMqtt((err, event) => {
        if (err) { log('error', `Listen [${sessionId}]: ${err.message}`); return; }
        updateSession(sessionId, { lastActivity: Date.now() });

        if (event.type === 'message' || event.type === 'message_reply') {
          const body = event.body || '';
          if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/\s+/);
            const cmdName = args.shift().toLowerCase();
            const cmd = enabledCmds.get(cmdName);
            if (cmd) {
              try {
                cmd.run({ api, event, args, commands: enabledCmds, prefix, adminUID, botStartTime });
                const sess = getSessions().find(s => s.id === sessionId);
                updateSession(sessionId, { messageCount: (sess?.messageCount || 0) + 1 });
                io.emit('bot-message', { sessionId, type: 'command', command: cmdName, from: event.senderID, time: Date.now() });
              } catch(e) { log('error', `Cmd error ${cmdName}: ${e.message}`); }
            }
          }
        } else {
          for (const [, evt] of enabledEvts) {
            if (evt.config.eventType && evt.config.eventType.includes(event.type)) {
              try { evt.run({ api, event, adminUID }); } catch(e) {}
            }
          }
        }
        io.emit('session-update', { sessions: getSessions() });
      });
    });
  }, 500);
});

app.post('/api/stop-bot', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });
  removeSession(sessionId);
  io.emit('bot-stopped', { sessionId });
  res.json({ success: true });
});

io.on('connection', (socket) => {
  socket.emit('session-update', { sessions: getSessions() });
  socket.emit('commands-updated', { commands: getCommandList() });
  socket.emit('events-updated', { events: getEventList() });
});

setInterval(() => { io.emit('session-update', { sessions: getSessions() }); }, 5000);

server.listen(PORT, '0.0.0.0', () => {
  log('success', `NORA AI V10 Dashboard → http://0.0.0.0:${PORT}`);
});
