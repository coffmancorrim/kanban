import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { isSortable } from "@dnd-kit/react/sortable";
import "./styles.css";
import { closestCorners } from "@dnd-kit/collision";
import { CollisionType, CollisionPriority } from "@dnd-kit/abstract";
import { BASE_URL } from "./config.jsx";
import { Link } from "@tanstack/react-router";

const noSelfCollision = ({ dragOperation, droppable }) => {
  // ignore the item currently being dragged
  if (dragOperation.source?.id === droppable.id) {
    return null;
  }

  if (!droppable.shape) {
    return null;
  }

  return closestCorners({
    dragOperation,
    droppable,
  });
};

function findListAndCardIndex(board, cardId) {
  console.log("---FIND_LIST_CARD_INDEX");
  console.log("Card ID:", cardId);

  if (!board) return;

  for (let listIndex = 0; listIndex < board.lists.length; listIndex++) {
    const cardIndex = board.lists[listIndex].cards.findIndex(
      (card) => card.id === cardId,
    );

    if (cardIndex !== -1) {
      console.log("List Index:", listIndex);
      console.log("Card Index:", cardIndex);
      return [listIndex, cardIndex];
    }
  }

  console.log("ERROR");
  return null;
}

function applyDrag(board, sourceId, targetId, isAbove) {
  console.log("APPLY_DRAG FUNCTION");
  console.log("INITAL BOARD LISTS:", board.lists);
  console.log("Source ID:", sourceId);
  console.log("Target ID:", targetId);

  //clone the board
  const newBoard = {
    ...board,
    lists: board.lists.map((list) => ({ ...list, cards: [...list.cards] })),
  };

  //get the card location that started the drag (source) and the card itself
  const [sourceListIndex, sourceCardIndex] = findListAndCardIndex(
    newBoard,
    sourceId,
  );
  const sourceCard = newBoard.lists[sourceListIndex].cards[sourceCardIndex];
  console.log("source card:", sourceCard);

  //remove the source card from the cloned board
  newBoard.lists[sourceListIndex].cards.splice(sourceCardIndex, 1);

  //get the location of the drag location (target) and the card itself
  //see if drag location general list or near a card

  let updatedCard = null;

  //is list
  if (typeof targetId === "string") {
    const targetListIndex = newBoard.lists.findIndex(
      (list) => String(list.id) === String(targetId),
    );

    //add card to new position
    if (newBoard.lists[targetListIndex].cards.length === 0) {
      updatedCard = {
        ...sourceCard,
        position: 0,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    } else if (isAbove) {
      updatedCard = {
        ...sourceCard,
        position: newBoard.lists[targetListIndex].cards[0].position - 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(0, 0, updatedCard);
    } else {
      const lastCard =
        newBoard.lists[targetListIndex].cards[
          newBoard.lists[targetListIndex].cards.length - 1
        ];
      updatedCard = {
        ...sourceCard,
        position: lastCard.position + 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    }

    return { updatedCard, newBoard };
  }

  // is card?
  const [targetListIndex, targetCardIndex] = findListAndCardIndex(
    newBoard,
    targetId,
  );

  // add card to new position
  const targetCardPosition =
    newBoard.lists[targetListIndex].cards[targetCardIndex].position;
  if (isAbove) {
    if (targetCardIndex === 0) {
      updatedCard = {
        ...sourceCard,
        position: targetCardPosition - 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex,
        0,
        updatedCard,
      );
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex - 1].position;

      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: newBoard.lists[targetListIndex].id,
      };

      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex,
        0,
        updatedCard,
      );
    }
  } else {
    if (targetCardIndex === newBoard.lists[targetListIndex].cards.length - 1) {
      updatedCard = {
        ...sourceCard,
        position: targetCardPosition + 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex + 1].position;
      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex + 1,
        0,
        updatedCard,
      );
    }
  }

  return { updatedCard, newBoard };
}

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete card: ${response.status}`);
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
        headers: { "Content-Type": "application/json" },
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

function List({ list, onAddCard, onDeleteCard, onDeleteList }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useDroppable({
    id: String(list.id),

    collisionDetector: noSelfCollision,
  });

  const updateList = useMutation({
    mutationFn: (updatedList) => {
      return fetch(BASE_URL + `list/${list.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });
    },
  });

  function handleSubmit() {
    if (readOnly === false) {
      const editedList = {
        name: name,
      };
      if (name !== list.name) {
        updateList.mutate(editedList);
      }
    }

    setReadOnly(!readOnly);
  }

  return (
    <div style={{ backgroundColor: "yellow", margin: 10 }}>
      list:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={handleSubmit}>✏️</button>
      <div
        ref={ref}
        style={{
          backgroundColor: "tan",
          margin: 10,
          padding: 10,
          minHeight: 300,
        }}
      >
        {list.cards.map((card, index) => (
          <Card
            card={card}
            key={card.id}
            index={index}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>
      <button onClick={() => onAddCard(list.id, list.cards.length)}>
        add card
      </button>
      <button onClick={() => onDeleteList(list.id)}>delete list</button>
    </div>
  );
}

function Card({ card, index, onDeleteCard }) {
  const [description, setDescription] = useState(card.description);
  const [imageUrl, setImageUrl] = useState(card.imageUrl);
  const [readOnly, setReadOnly] = useState(true);

  const { ref, isDragSource } = useSortable({
    id: card.id,
    index: index,

    collisionDetector: noSelfCollision,
  });

  const updateCard = useMutation({
    mutationFn: (updatedCard) => {
      return fetch(BASE_URL + `card/${card.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCard),
      });
    },
  });

  function handleSubmit() {
    if (readOnly === false) {
      const editedCard = {
        description: description,
        imageUrl: imageUrl,
      };
      if (description !== card.description || imageUrl !== card.imageUrl) {
        updateCard.mutate(editedCard);
      }
    }

    setReadOnly(!readOnly);
  }

  return (
    <div
      ref={ref}
      style={{ backgroundColor: "green", padding: 5, marginTop: 0 }}
    >
      card:
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        readOnly={readOnly}
      />
      {!readOnly && (
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="put image link here"
        />
      )}
      {imageUrl && <img src={imageUrl} alt="" />}
      <button onClick={handleSubmit}>✏️</button>
      <button onClick={(e) => onDeleteCard(card)}>❌</button>
      position: {card.position}
    </div>
  );
}
