import React, { useContext, useEffect, useState } from "react";
import UserProvider, { UserContext } from "./context/UserContext";
import Login from "./components/Login";
import Chat from "./components/Chat";
import { connect, disconnect, getSocket } from "./socket/socket";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

function AppInner() {
  const { user } = useContext(UserContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    function handleVisibility() {
      if (!socket) return;
      if (!document.hidden) document.title = "SocketIO Chat";
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [socket]);

  function handleLogin(u) {
    const s = connect({ username: u.username, serverUrl: SERVER_URL });
    setSocket(s);
    // basic reconnect handlers
    s.on("connect", () => console.log("connected", s.id));
    s.on("disconnect", () => console.log("disconnected"));
  }

  useEffect(() => {
    return () => disconnect();
  }, []);

  return user ? <Chat socket={getSocket()} /> : <Login onLogin={handleLogin} />;
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  );
}

