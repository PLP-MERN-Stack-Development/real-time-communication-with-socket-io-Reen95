import React, { useContext, useEffect, useState } from "react";
import RoomList from "./RoomList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserList from "./UserList";
import { UserContext } from "../context/UserContext";

export default function Chat({ socket }) {
  const { user } = useContext(UserContext);
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingInfo, setTypingInfo] = useState([]);
  const [privateTarget, setPrivateTarget] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinRoom", { room });

    socket.on("messageHistory", (msgs) => {
      setMessages(msgs);
    });

    socket.on("message", (m) => {
      setMessages(prev => [...prev, m]);
      // browser title notification
      if (document.hidden) document.title = `New message from ${m.from}`;
      // emit read receipt for direct/private messages to mark read
      if (m.to && m.to !== room && m.to === user.username) {
        socket.emit("messageRead", m.id);
      }
    });

    socket.on("onlineUsers", (list) => setUsers(list));
    socket.on("typing", (info) => {
      setTypingInfo(info);
    });

    return () => {
      socket.off("messageHistory");
      socket.off("message");
      socket.off("onlineUsers");
      socket.off("typing");
    };
  }, [socket, room, user]);

  useEffect(() => {
    // leave previous room when switching
    if (!socket) return;
    return () => {
      socket.emit("leaveRoom", room);
    };
  }, [room]);

  function onPrivate(targetUser) {
    setPrivateTarget(targetUser);
    setRoom(generatePrivateRoom(user.username, targetUser.username));
  }

  function generatePrivateRoom(a, b) {
    return [a,b].sort().join("__");
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="header">
          <div><strong>{user.username}</strong></div>
          <div style={{fontSize:13, color:"#666"}}>Room: {room}</div>
        </div>

        <RoomList socket={socket} currentRoom={room} setRoom={(r)=>{ setPrivateTarget(null); setRoom(r); }} />

        <div style={{marginTop:12}}>
          <UserList users={users} onPrivate={onPrivate} />
        </div>
      </div>

      <div className="main">
        <div className="header">
          <strong>{privateTarget ? `Private: ${privateTarget.username}` : `Room: ${room}`}</strong>
          {typingInfo.length>0 && <div className="typing">{typingInfo.join(", ")} typing...</div>}
        </div>

        <MessageList messages={messages} me={user} />

        <MessageInput socket={socket} room={room} to={privateTarget} />
      </div>
    </div>
  );
}
