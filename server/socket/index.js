const { v4: uuidv4 } = require("uuid");

/**
 * Basic in-memory store:
 * rooms: { roomName: { messages: [], members: Set(socketId) } }
 * users: { socketId: { id, username, socketId } }
 */
const rooms = { general: { messages: [], members: new Set() } };
const users = {}; // socketId -> { id, username, socketId }

module.exports = function(io) {
  io.on("connection", (socket) => {
    const username = socket.handshake.auth?.username || "Anonymous";
    users[socket.id] = { id: socket.id, username, socketId: socket.id };

    // join default room
    socket.join("general");
    rooms.general.members.add(socket.id);

    // broadcast online users
    emitOnline();

    // send room list
    sendRooms();

    // handle getRooms
    socket.on("getRooms", () => {
      sendRooms(socket);
    });

    socket.on("createRoom", (name, cb) => {
      if (!name) return cb({ ok: false, error: "Missing name" });
      if (!rooms[name]) rooms[name] = { messages: [], members: new Set() };
      cb({ ok: true, room: name });
      sendRooms();
    });

    socket.on("joinRoom", ({ room }) => {
      if (!room) return;
      socket.join(room);
      if (!rooms[room]) rooms[room] = { messages: [], members: new Set() };
      rooms[room].members.add(socket.id);
      // send message history for that room
      socket.emit("messageHistory", rooms[room].messages || []);
    });

    socket.on("leaveRoom", (room) => {
      if (!room) return;
      socket.leave(room);
      if (rooms[room]) rooms[room].members.delete(socket.id);
    });

    socket.on("sendMessage", (payload, ack) => {
      const { room, text, to } = payload;
      const id = uuidv4();
      const msg = { id, from: username, text, ts: Date.now(), room: room || "general", to: to?.username || null, read: false };

      // Push message into room store (if room exists)
      if (msg.to) {
        // private message: deliver to both participants' private room (we will use canonical room name)
        const privateRoom = [msg.from, msg.to].sort().join("__");
        if (!rooms[privateRoom]) rooms[privateRoom] = { messages: [], members: new Set() };
        rooms[privateRoom].messages.push(msg);
        // emit to that private room
        io.to(privateRoom).emit("message", msg);
      } else {
        const r = msg.room;
        if (!rooms[r]) rooms[r] = { messages: [], members: new Set() };
        rooms[r].messages.push(msg);
        io.to(r).emit("message", msg);
      }

      if (ack) ack({ ok: true, id });
    });

    socket.on("typing", ({ room, to, typing }) => {
      if (to) {
        const privateRoom = [username, to.username].sort().join("__");
        // notify other in private room
        socket.to(privateRoom).emit("typing", typing ? [username] : []);
      } else {
        // broadcast typing state to room
        socket.to(room).emit("typing", typing ? [username] : []);
      }
    });

    socket.on("messageRead", (messageId) => {
      // mark message as read in all rooms that contain it
      for (const rName of Object.keys(rooms)) {
        const msgs = rooms[rName].messages;
        for (const m of msgs) {
          if (m.id === messageId) m.read = true;
        }
      }
      // notify all clients (small)
      io.emit("messageRead", messageId);
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
      for (const r of Object.values(rooms)) r.members.delete(socket.id);
      emitOnline();
      sendRooms();
    });

    function emitOnline() {
      const list = Object.values(users).map(u => ({ id: u.id, username: u.username }));
      io.emit("onlineUsers", list);
    }

    function sendRooms(targetSocket) {
      const list = Object.keys(rooms);
      if (targetSocket) targetSocket.emit("rooms", list);
      else io.emit("rooms", list);
    }
  });
};
