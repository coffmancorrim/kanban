import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL, getCookie } from "../config.js";
import { useEffect } from "react";

async function fetchData(
  endpoint,
  action,
  errorMessage,
  body = {},
  returnBody = false,
) {
  const options = {
    method: action,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(BASE_URL + endpoint, options);

  if (!response.ok) throw new Error(errorMessage);

  if (returnBody) {
    console.log("RETURN BODY", JSON.stringify(body, null, 2));

    return body;
  }

  const data = await response.json();

  console.log("RETURN RESPONSE:\n", JSON.stringify(data, null, 2));

  return dataco;
}

export function useUpdateBoardOnCount(boardId, updatedCount) {
  const queryClient = useQueryClient();
  const updateBoardOnCount = useMutation({
    mutationFn: () =>
      fetchData(`board/${boardId}/`, "POST", "board update failed"),

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

export function useUpdateBoard({ boardId, setBoard }) {
  return useMutation({
    mutationFn: (updatedBoard) =>
      fetchData(
        `board/${boardId}/`,
        "PATCH",
        "Failed to update board",
        updatedBoard,
        true,
      ),

    onSuccess: (updatedBoard) =>
      setBoard((previousBoard) => ({
        ...previousBoard,
        ...updatedBoard,
      })),
  });
}

export function useAddList({ setLists }) {
  return useMutation({
    mutationFn: (newList) =>
      fetchData("list/", "POST", "Failed to add list", newList),

    onSuccess: (newList) => {
      setLists((previousLists) => ({
        ...previousLists,
        [newList.id]: newList,
      }));
    },
  });
}

export function useUpdateList({ setLists }) {
  return useMutation({
    mutationFn: (updatedList) =>
      fetchData(
        `list/${updatedList.id}/`,
        "PATCH",
        "Failed to update List",
        updatedList,
        true,
      ),

    onSuccess: (updatedList) =>
      setLists((previousLists) => ({
        ...previousLists,
        [updatedList.id]: updatedList,
      })),
  });
}

export function useDeleteList({ setLists }) {
  return useMutation({
    mutationFn: (listId) =>
      fetchData(
        `list/${listId}/`,
        "DELETE",
        "Failed to delete list",
        listId,
        true,
      ),

    onSuccess: (listId) => {
      setLists((previousLists) => {
        const { [listId]: _, ...rest } = previousLists;
        return rest;
      });
    },
  });
}

export function useUpdateListPosition() {
  return useMutation({
    mutationFn: ({ listId, listPosition }) =>
      fetchData(`list/${listId}/`, "PATCH", "Failed to update list position", {
        listId,
        position: listPosition,
      }),
  });
}

export function useAddCard({ setCards }) {
  return useMutation({
    mutationFn: (newCard) =>
      fetchData(`card/`, "POST", "Failed to create card", newCard),

    onSuccess: (newCard) => {
      setCards((previousCards) => ({
        ...previousCards,
        [newCard.id]: newCard,
      }));
    },
  });
}

export function useUpdateCard({ setCards }) {
  return useMutation({
    mutationFn: (updatedCard) =>
      fetchData(
        `card/${updatedCard.id}/`,
        "PATCH",
        "unable to update card",
        updatedCard,
      ),

    onSuccess: (updatedCard) => {
      setCards((previousCards) => ({
        ...previousCards,
        [updatedCard.id]: updatedCard,
      }));
    },
  });
}

export function useDeleteCard({ setCards }) {
  return useMutation({
    mutationFn: (card) =>
      fetchData(
        `card/${card.id}/`,
        "DELETE",
        "Failed to delete card",
        card,
        true,
      ),

    onSuccess: (cardToDelete) => {
      setCards((previousCards) => {
        const { [cardToDelete.id]: _, ...rest } = previousCards;
        return rest;
      });
    },
  });
}

export function useUpdateCardPosition() {
  return useMutation({
    mutationFn: ({ cardId, cardPosition, cardList }) =>
      fetchData(`card/${cardId}/`, "PATCH", "Failed to update card position", {
        position: cardPosition,
        list: cardList,
      }),
  });
}
