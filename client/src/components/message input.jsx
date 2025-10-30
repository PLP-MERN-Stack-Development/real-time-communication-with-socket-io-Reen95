import React, { useState, useEffect } from "react";

export default function MessageInput({ socket, room, to }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const tOut = setTimeout(() => {
      if (typing) {
        socket.emit("typing", { room, to, typing: false });
        setTyping(false);
      }
    }, 1200);
    return () => clearTimeout(tOut);
  }, [text]); // resets timer while typing

  function send(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    socket.emit("sendMessage", { room, text: text.trim(), to }, (ack) => {
      setText("");
    });
  }

  function onChange(e) {
    setText(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { room, to, typing: true });
    }
  }

  return (
    <form onSubmit={send} className="input">
      <div style={{display:"flex"}}>
        <input value={text} onChange={onChange} placeholder={to ? `Private to ${to.username}` : `Message #${room}`} style={{flex:1,padding:8}}/>
        <button style={{padding:8, marginLeft:8}}>Send</button>
      </div>
    </form>
  );
}
