import { DragDropProvider } from "@dnd-kit/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { BASE_URL, getCookie } from "./config.jsx";
import { Link } from "@tanstack/react-router";
import { List } from "./List.jsx";
import { applyDrag } from "./dnd.js";

export function Board({ boardId }) {
  async function fetchBoard(query) {
    const response = await fetch(BASE_URL + `board/${boardId}`);
    if (!response.ok) throw new Error("Failed to fetch board");
    return await response.json();
  }

  const queryClient = useQueryClient();

  const {
    data: boardData = { lists: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board"],
    queryFn: fetchBoard,
  });

  const updateBoardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(BASE_URL + `board/${boardId}`, {
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
      queryClient.setQueryData(["board"], updatedBoard);
    },
  });

  useEffect(() => {
    if (boardData.updatedCount >= 100 && !updateBoardMutation.isPending) {
      updateBoardMutation.mutate();
    }
  }, [boardData.updatedCount]);

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>loading...</p>;

  return <BoardContent boardData={boardData} />;
}

function BoardContent({ boardData }) {
  const [board, setBoard] = useState(boardData);
  const [name, setName] = useState(board.name);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    board.backgroundImageUrl,
  );
  const [backgroundColor, setBackgroundColor] = useState(board.backgroundColor);
  const [readOnly, setReadOnly] = useState(true);

  const snapshotRef = useRef(null);
  const lastTargetRef = useRef({ id: null, isAbove: null });

  useEffect(() => {
    setBoard(boardData);
  }, [boardData]);

  const updateBoard = useMutation({
    mutationFn: (updateBoard) => {
      return fetch(BASE_URL + `board/${board.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(updateBoard),
      });
    },
  });

  function handleSubmit() {
    if (readOnly === false) {
      const editedBoard = {
        name: name,
        backgroundColor: backgroundColor,
        backgroundImageUrl: backgroundImageUrl,
      };
      if (
        name !== board.name ||
        backgroundColor !== board.backgroundColor ||
        backgroundImageUrl !== board.backgroundImageUrl
      ) {
        updateBoard.mutate(editedBoard);
      }
    }

    setReadOnly(!readOnly);
  }

  const addList = useMutation({
    mutationFn: (newList) => {
      return fetch(BASE_URL + `list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(newList),
      });
    },
    onSuccess: async (response) => {
      const newList = await response.json();

      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: [...previousBoard.lists, newList],
      }));
    },
  });

  async function handleAddList() {
    const newList = {
      name: "enter name here",
      position: board.lists.length,
      board: board.id,
    };
    await addList.mutate(newList);
  }

  const addCard = useMutation({
    mutationFn: (newCard) => {
      return fetch(BASE_URL + `card/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(newCard),
      });
    },
    onSuccess: async (response) => {
      const newCard = await response.json();

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

  async function handleAddCard(listId, listPosition) {
    const newCard = {
      description: "enter name here",
      position: listPosition,
      list: listId,
    };
    await addCard.mutate(newCard);
  }

  const deleteCard = useMutation({
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

  async function handleDeleteCard(card) {
    await deleteCard.mutate(card);
  }

  const deleteList = useMutation({
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

  async function handleDeleteList(listId) {
    await deleteList.mutate(listId);
  }

  const updateCardPosition = useMutation({
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

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: `url(${backgroundImageUrl})`,
      }}
    >
      <DragDropProvider
        onDragStart={() => {
          console.log("[DragStart]", {
            board,
          });

          snapshotRef.current = board;
          lastTargetRef.current = { id: null, isAbove: null };
        }}
        onDragOver={(event) => {
          const sourceId = event.operation.source?.id;
          const targetId = event.operation.target?.id ?? null;

          if (!targetId || sourceId === targetId) {
            console.log(
              "[DragOver] Early return: invalid target or same source",
              {
                sourceId,
                targetId,
              },
            );
            return;
          }

          const pointerY = event.operation.position.current.y;
          const targetCenterY = event.operation.target?.shape?.center.y;
          const isAbove = pointerY < targetCenterY;

          // skip only if BOTH target and side are the same
          if (
            targetId === lastTargetRef.current.id &&
            isAbove === lastTargetRef.current.isAbove
          ) {
            console.log("[DragOver] Early return: same target and side", {
              targetId,
              isAbove,
              lastTarget: lastTargetRef.current,
            });
            return;
          }

          console.log("[DragOver] Applying drag", {
            sourceId,
            targetId,
            pointerY,
            targetCenterY,
            isAbove,
          });

          lastTargetRef.current = { id: targetId, isAbove };

          const { newBoard } = applyDrag(
            snapshotRef.current,
            sourceId,
            targetId,
            isAbove,
          );
          setBoard(newBoard);
        }}
        onDragEnd={(event) => {
          const sourceId = event.operation.source?.id;
          const targetId = event.operation.target?.id ?? null;

          if (event.canceled || !targetId || sourceId == targetId) {
            console.log("[DragEnd] Restoring snapshot", {
              canceled: event.canceled,
              sourceId,
              targetId,
            });

            setBoard(snapshotRef.current); // restore on cancel
            return;
          }

          const pointerY = event.operation.position.current.y;
          const targetCenterY = event.operation.target?.shape?.center.y;
          const isAbove = pointerY < targetCenterY;

          console.log("[DragEnd] Final applyDrag", {
            sourceId,
            targetId,
            pointerY,
            targetCenterY,
            isAbove,
          });

          const { updatedCard, newBoard } = applyDrag(
            snapshotRef.current,
            sourceId,
            targetId,
            isAbove,
          );
          setBoard(newBoard);

          updateCardPosition.mutate({
            cardId: updatedCard.id,
            cardPosition: updatedCard.position,
            cardList: updatedCard.list,
          });

          console.log("[DragEnd] Clearing refs");

          snapshotRef.current = null;
          lastTargetRef.current = null;
        }}
      >
        <Link to="/">🔙</Link>
        board:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={readOnly}
        />
        {!readOnly && (
          <div>
            <label htmlFor="background-color">Background Color: </label>
            <input
              type="color"
              id="background-color"
              name="background-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />

            <br></br>
            <label htmlFor="background-image-url">Background Image: </label>
            <input
              id="background-image-url"
              name="background-image-url"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="put image link here"
            />
          </div>
        )}
        <button onClick={handleSubmit}>✏️</button>
        {board.lists.map((list) => (
          <List
            list={list}
            key={list.id}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onDeleteList={handleDeleteList}
          />
        ))}
        <button onClick={handleAddList}>add list</button>
      </DragDropProvider>
    </div>
  );
}
