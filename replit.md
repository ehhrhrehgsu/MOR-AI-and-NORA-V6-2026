# NORA AI V10 FBBOT

## Overview
A Facebook Messenger bot dashboard called NORA AI V10. Users can paste their Facebook AppState/FBSTATE, configure a prefix, set an admin UID, select commands and events, verify (human/AI), then launch bots. Active bot sessions are shown in real-time on the dashboard.

## Architecture
- **Backend**: Node.js + Express + Socket.io (`main.js`)
- **Frontend**: Vanilla HTML/CSS/JS in `public/`
- **Utilities**: `utils.js` - session management, command/event loading, parsing
- **Commands**: `commands/` - individual .js files per command (help, ai, uptime, uid, ping)
- **Events**: `events/` - individual .js files per event (welcome, goodbye)
- **Facebook API**: `fca-unofficial` library for FB Messenger connectivity

## Key Files
- `main.js` - Express server, bot login logic, Socket.io events, API endpoints
- `utils.js` - Session management, command/event loaders, AppState parser
- `public/index.html` - Dashboard UI
- `public/style.css` - Cyberpunk-themed dark UI styles
- `public/app.js` - Frontend logic, socket connection, form handling
- `commands/*.js` - Bot commands (help, ai, ping, uid, uptime)
- `events/*.js` - Bot events (welcome, goodbye)

## Running
- Port: **5000**
- Host: `0.0.0.0`
- Start: `npm start` or `node main.js`

## Adding Commands
Create a new file in `commands/` following this pattern:
```js
module.exports = {
  config: { name: 'cmdname', description: '...', usage: '...', category: '...' },
  async run({ api, event, args, prefix, adminUID }) { ... }
};
```

## Adding Events
Create a new file in `events/` following this pattern:
```js
module.exports = {
  config: { name: 'evtname', description: '...', eventType: ['log:subscribe'] },
  async run({ api, event, adminUID }) { ... }
};
```
