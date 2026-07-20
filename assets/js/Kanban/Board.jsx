import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";

const BASE_URL = import.meta.env.VITE_BOARD_API_URL;

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

  //is list
  if (typeof targetId === "string") {
    const targetListIndex = board.lists.findIndex(
      (list) => String(list.id) === String(targetId),
    );

    //add card to new position
    if (newBoard.lists[targetListIndex].cards.length === 0) {
      newBoard.lists[targetListIndex].cards.push({
        ...sourceCard,
        position: 0,
      });
    } else if (isAbove) {
      newBoard.lists[targetListIndex].cards.splice(0, 0, {
        ...sourceCard,
        position: newBoard.lists[targetListIndex].cards[0].position - 1,
      });
    } else {
      const lastCard =
        newBoard.lists[targetListIndex].cards[
          newBoard.lists[targetListIndex].cards.length - 1
        ];
      newBoard.lists[targetListIndex].cards.push({
        ...sourceCard,
        position: lastCard.position + 1,
      });
    }

    return newBoard;
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
      newBoard.lists[targetListIndex].cards.splice(targetCardIndex, 0, {
        ...sourceCard,
        position: targetCardPosition - 1,
      });
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex - 1].position;

      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      newBoard.lists[targetListIndex].cards.splice(targetCardIndex, 0, {
        ...sourceCard,
        position: newPosition,
      });
    }
  } else {
    if (targetCardIndex === newBoard.lists[targetListIndex].cards.length - 1) {
      newBoard.lists[targetListIndex].cards.push({
        ...sourceCard,
        position: targetCardPosition + 1,
      });
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex + 1].position;
      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      newBoard.lists[targetListIndex].cards.splice(targetCardIndex + 1, 0, {
        ...sourceCard,
        position: newPosition,
      });
    }
  }

  return newBoard;
}

export default function Board() {
  async function fetchBoard(query) {
    const response = await fetch(BASE_URL + "board/1");
    if (!response.ok) throw new Error("Failed to fetch board");
    return await response.json();
  }

  const {
    data: boardData = { lists: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoard,
  });

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>loading...</p>;

  return <BoardContent boardData={boardData} />;
}

function BoardContent({ boardData }) {
  const [board, setBoard] = useState(boardData);
  const [name, setName] = useState(board.name);
  const [readOnly, setReadOnly] = useState(true);

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
      };
      if (name !== board.name) {
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

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const sourceId = event.operation.source?.id;
        const targetId = event.operation.target?.id ?? null;

        console.log("___onDragEnd:");
        console.log("TARGET:", event.operation.target);

        if (event.canceled || targetId == null || sourceId == targetId) {
          return;
        }

        const pointerY = event.operation.position.current.y;
        const targetCenterY = event.operation.target?.shape?.center.y;
        const isAbove = pointerY < targetCenterY;

        console.log("Source:", sourceId);
        console.log("Target:", targetId);
        console.log("Pointer Y:", pointerY);
        console.log("Target Center Y:", targetCenterY);
        console.log("Difference:", pointerY - targetCenterY);
        console.log("___Insert Above?", isAbove);

        setBoard((prev) => applyDrag(prev, sourceId, targetId, isAbove));
      }}
    >
      board:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={handleSubmit}>✏️</button>
      {board.lists.map((list) => (
        <List list={list} key={list.id} onAddCard={handleAddCard} />
      ))}
      <button onClick={handleAddList}>add list</button>
    </DragDropProvider>
  );
}

function List({ list, onAddCard }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useDroppable({
    id: String(list.id),
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
          <Card card={card} key={card.id} index={index} />
        ))}
      </div>
      <button onClick={() => onAddCard(list.id, list.cards.length)}>
        add card
      </button>
    </div>
  );
}

function Card({ card, index }) {
  const [description, setDescription] = useState(card.description);
  const [imageUrl, setImageUrl] = useState(card.imageUrl);
  const [readOnly, setReadOnly] = useState(true);

  const { ref, isDragSource } = useSortable({
    id: card.id,
    index: index,
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
    <div ref={ref} style={{ backgroundColor: "green", padding: 5, margin: 5 }}>
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
      position: {card.position}
    </div>
  );
}
