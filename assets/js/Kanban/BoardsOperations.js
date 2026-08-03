import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL, getCookie } from "./config.js";

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
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
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
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
}
