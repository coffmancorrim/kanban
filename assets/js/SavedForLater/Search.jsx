import { useState } from "react";

export function Search({ query, onSetQuery }) {
  return (
    <div>
      <input
        type="text"
        placeholder="search"
        value={query}
        onChange={(e) => onSetQuery(e.target.value)}
      />
    </div>
  );
}
