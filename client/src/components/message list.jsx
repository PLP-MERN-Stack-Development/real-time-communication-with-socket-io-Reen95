import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, me }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  return (
    <div className="messages" ref={ref}>
      {messages.map(m => (
        <div key={m.id} className={"message " + (m.from === me.username ? "you" : "")}>
          <div className="meta">
            <strong>{m.from}</strong> <span style={{marginLeft:8}}>{new Date(m.ts).toLocaleTimeString()}</span>
            {m.read && <span className="meta" style={{marginLeft:8}}>✓</span>}
            {m.to && m.to !== m.room && <span className="meta" style={{marginLeft:8}}> (private)</span>}
          </div>
          <div>{m.text}</div>
        </div>
      ))}
    </div>
  );
}
