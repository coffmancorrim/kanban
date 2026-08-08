import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL, getCookie } from "../config.js";
import { useEffect } from "react";

export function useUpdateBoardOnCount(boardId, updatedCount) {
  const queryClient = useQueryClient();
  const updateBoardOnCount = useMutation({
    mutationFn: async () => {
      const response = await fetch(BASE_URL + `board/${boardId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });
      if (!response.ok) throw new Error("board update failed");
      return response.json();
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(["board", boardId], updatedBoard);
    },
  });

  useEffect(() => {
    if (updatedCount >= 100 && !updateBoardOnCount.isPending) {
      updateBoardOnCount.mutate();
    }
  }, [updatedCount]);
}

export function useAddList({ setBoard }) {
  return useMutation({
    mutationFn: async (newList) => {
      const response = await fetch(BASE_URL + "list/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(newList),
      });

      if (!response.ok) {
        throw new Error("Failed to create list");
      }

      return response.json();
    },

    onSuccess: (newList) => {
      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: [...previousBoard.lists, newList],
      }));
    },
  });
}

export function useAddCard({ setBoard }) {
  return useMutation({
    mutationFn: async (newCard) => {
      const response = await fetch(BASE_URL + `card/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        throw new Error("Failed to create list");
      }

      return response.json();
    },

    onSuccess: (newCard) => {
      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: previousBoard.lists.map((list) =>
          list.id == newCard.list
            ? { ...list, cards: [...list.cards, newCard] }
            : list,
        ),
      }));
    },
  });
}

export function useDeleteCard({ setBoard }) {
  return useMutation({
    mutationFn: async (card) => {
      const response = await fetch(BASE_URL + `card/${card.id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete card: ${response.status}`);
      }

      return card;
    },

    onSuccess: (cardToDelete) => {
      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: previousBoard.lists.map((list) =>
          list.id == cardToDelete.list
            ? {
                ...list,
                cards: list.cards.filter((card) => card.id !== cardToDelete.id),
              }
            : list,
        ),
      }));
    },
  });
}

export function useDeleteList({ setBoard }) {
  return useMutation({
    mutationFn: async (listId) => {
      const response = await fetch(BASE_URL + `list/${listId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete list: ${response.status}`);
      }

      return listId;
    },

    onSuccess: (listId) => {
      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: previousBoard.lists.filter((list) => list.id != listId),
      }));
    },
  });
}

export function useUpdateBoard(boardId) {
  return useMutation({
    mutationFn: async (updatedBoard) => {
      const response = await fetch(BASE_URL + `board/${boardId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(updatedBoard),
      });

      if (!response.ok) throw new Error("Failed to update board");
      return response.json();
    },
  });
}

export function useUpdateList(listId) {
  return useMutation({
    mutationFn: async (updatedList) => {
      const response = await fetch(BASE_URL + `list/${listId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },

        body: JSON.stringify(updatedList),
      });

      if (!response.ok) throw new Error("Failed to update List");
      return response.json();
    },
  });
}

export function useUpdateListPosition() {
  return useMutation({
    mutationFn: async ({ listId, listPosition }) => {
      console.log("Updating:", listId, listPosition);

      const response = await fetch(BASE_URL + `list/${listId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          position: listPosition,
        }),
      });

      if (!response.ok) {
        console.error("Update failed:", response.status);
        throw new Error("Failed to update list position");
      }

      console.log("Update successful");
      return response.json();
    },
  });
}

export function useUpdateCard(cardId) {
  return useMutation({
    mutationFn: async (updatedCard) => {
      const response = await fetch(BASE_URL + `card/${cardId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) throw new Error("unable to update Card");
      return response.json();
    },
  });
}

export function useUpdateCardPosition() {
  return useMutation({
    mutationFn: async ({ cardId, cardPosition, cardList }) => {
      console.log("Updating:", cardId, cardPosition);

      const response = await fetch(BASE_URL + `card/${cardId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          position: cardPosition,
          list: cardList,
        }),
      });

      if (!response.ok) {
        console.error("Update failed:", response.status);
        throw new Error("Failed to update card position");
      }

      console.log("Update successful");
      return response.json();
    },
  });
}
