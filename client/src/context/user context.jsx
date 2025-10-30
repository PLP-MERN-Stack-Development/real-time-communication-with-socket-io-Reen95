import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

export default function Login({ onLogin }) {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!username.trim()) return;
    const u = { username: username.trim() };
    setUser(u);
    onLogin(u);
  }

  return (
    <div style={{padding:20}}>
      <h2>Join SocketIO Chat</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Enter a display name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{padding:8, width:"100%", marginBottom:8}}
        />
        <button style={{padding:8, width:"100%"}} type="submit">Join</button>
      </form>
      <p style={{marginTop:12,fontSize:13,color:"#666"}}>This demo uses client-side username only (no password) — fine for assignments.</p>
    </div>
  );
}
