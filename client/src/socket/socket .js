import { io } from "socket.io-client";

let socket = null;

export function connect({ username, serverUrl }) {
  if (socket) return socket;
  socket = io(serverUrl, {
    auth: { username }
  });
  return socket;
}

export function disconnect() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
