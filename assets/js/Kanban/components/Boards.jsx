import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import "../styles.css";
import { Board } from "./Board.jsx";
import { Link } from "@tanstack/react-router";
import { BASE_URL } from "../config.js";
import { MutationStatus } from "./MutationStatus.jsx";
import { LoadingGrid } from "./LoadingGrid.jsx";
import { useCreateBoard, useDeleteBoard } from "../hooks/BoardsOperations.js";

async function fetchBoards(query) {
  const response = await fetch(BASE_URL + `boards/`);
  if (!response.ok) throw new Error("Failed to fetch boards");
  return await response.json();
}

export default function Boards() {
  const {
    data: boards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
  });

  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (error) {
    return <p>Error loading boards</p>;
  }

  return (
    <div className="boards-body">
      <MutationStatus
        mutations={[{ mutation: createBoard, name: "create board" }]}
      />
      <MutationStatus
        mutations={[{ mutation: deleteBoard, name: "delete board" }]}
      />
      <div className="boards-header">
        <h1>boards</h1>
        <button
          onClick={(e) =>
            createBoard.mutate({
              name: "New Board",
            })
          }
        >
          ⊕
        </button>
      </div>
      <div className="boards-list">
        {boards.map((board) => (
          <div className="boards-item">
            <Link
              to="/kanban/$boardId"
              params={{
                boardId: board.id,
              }}

              className="boards-item-link"
              key={board.id}
            >
              {board.name}
            </Link>
            <button
              className="boards-item-button"
              onClick={(e) => deleteBoard.mutate(board.id)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
