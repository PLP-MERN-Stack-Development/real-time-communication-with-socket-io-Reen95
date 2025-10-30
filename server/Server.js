const express = require("express");
const http = require("http");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const socketHandlers = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send({ ok: true, msg: "SocketIO Chat server running" }));

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

socketHandlers(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server listening on", PORT));
