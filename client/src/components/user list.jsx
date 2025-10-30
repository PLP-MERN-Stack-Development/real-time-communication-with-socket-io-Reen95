import React from "react";

export default function UserList({ users, onPrivate }) {
  return (
    <div>
      <h3>Online</h3>
      <div>
        {users.map(u => (
          <div key={u.id} className="user">
            <span>{u.username}</span>
            <button style={{float:"right"}} onClick={()=>onPrivate(u)}>PM</button>
          </div>
        ))}
      </div>
    </div>
  );
}
