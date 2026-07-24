import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL, getCookie } from "./config.jsx";
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

  const queryClient = useQueryClient();

  const createBoard = useMutation({
    mutationFn: async (board) => {
      const response = await fetch(`${BASE_URL}board/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(board),
      });

      if (!response.ok) {
        throw new Error(`Failed to create board: ${response.status}`);
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },

    onError: (error) => {
      console.error(error);
    },
  });

  function handleCreateBoard() {
    createBoard.mutate({
      name: "New Board",
    });
  }

  const deleteBoard = useMutation({
    mutationFn: async (boardId) => {
      const response = await fetch(BASE_URL + `board/${boardId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete board: ${response.status}`);
      }

      return boardId;
    },

    onSuccess: (boardId) => {
      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },
  });

  async function handleDeleteBoard(boardId) {
    deleteBoard.mutate(boardId);
  }

  if (isLoading) {
    return <p>Loading boards...</p>;
  }

  if (error) {
    return <p>Error loading boards</p>;
  }

  return (
    <div>
      <h1>boards</h1>
      <button onClick={(e) => handleCreateBoard()}>⊕</button>
      {boards.map((board) => (
        <div key={board.id}>
          <Link
            to="/kanban/$boardId"
            params={{
              boardId: board.id,
            }}
          >
            {board.name}
          </Link>
          <button onClick={(e) => handleDeleteBoard(board.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
