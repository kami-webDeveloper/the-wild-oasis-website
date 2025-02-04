"use client";

import { useState } from "react";

function Counter({ users }) {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <p>There are {users.length} users available</p>
        <button onClick={() => setCount((c) => c - 1)}>-</button>
        <span>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
    </>
  );
}

export default Counter;
