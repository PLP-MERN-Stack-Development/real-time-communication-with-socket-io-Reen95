# SocketIO Chat — Assignment Ready

## Overview
This is a real-time chat application using Socket.io, React (Vite) frontend and an Express + Socket.io backend.

Features:
- Real-time messaging
- Multiple chat rooms
- Private messaging (direct messages)
- Typing indicators
- Read receipts (basic)
- Presence: online users list

## Quick start (local)

### Prerequisites
- Node.js 18+ and npm

### 1. Clone repo (or create new)
```bash
git clone <your-repo-url>
cd socketio-chat
cd server
npm install
npm start
# server runs on port 4000 by default
cd client
npm install
npm run dev
# Vite dev server typically on http://localhost:5173
