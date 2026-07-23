import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL } from "./config.jsx";
import "./styles.css";
import { Board } from "./Board.jsx";
import { Link } from "@tanstack/react-router";

export default function Boards() {
  const {
    data: boards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
  });

  async function fetchBoards(query) {
    const response = await fetch(BASE_URL + `boards/`);
    if (!response.ok) throw new Error("Failed to fetch boards");
    return await response.json();
  }

  if (isLoading) {
    return <p>Loading boards...</p>;
  }

  if (error) {
    return <p>Error loading boards</p>;
  }

  return (
    <div>
      {boards.map((board) => (
        <Link
          to="/kanban/$boardId"
          params={{
            boardId: board.id,
          }}
        >
          {board.name}
        </Link>
      ))}
    </div>
  );
}
