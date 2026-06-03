import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_BOARD_API_URL;

export default function Board() {
  async function fetchBoard(query) {
    const response = await fetch(BASE_URL + "board/1");
    if (!response.ok) throw new Error("Failed to fetch board");
    return await response.json();
  }

  const {
    data: board = { lists: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoard,
  });

  const [name, setName] = useState(board.name);

  const [readOnly, setReadOnly] = useState(true);

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>loading...</p>;

  return <BoardContent board={board} />;
}

function BoardContent({ board }) {
  const [name, setName] = useState(board.name);
  const [readOnly, setReadOnly] = useState(true);
  const [allCards, setAllCards] = useState(
    board.lists.flatMap((list) => list.cards),
  );

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

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source, target } = event.operation;
        if (!target) return;

        setAllCards((cards) => {
          // move handles both reordering within a list and moving between lists
          const updated = move(cards, event);

          // if dropped on a list droppable (not a card), update the list field
          if (target.type === "list") {
            return updated.map((card) => {
              if (card.id !== source.id) return card;
              const updatedCard = { ...card, list: target.id };
              return updatedCard;
            });
          }

          // if dropped on a card, inherit that card's list
          if (target.type === "card") {
            return updated.map((card) =>
              card.id === source.id ? { ...card, list: target.list } : card,
            );
          }

          return updated;
        });
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
        <List
          list={list}
          key={list.id}
          cards={allCards.filter((card) => card.list === list.id)}
        />
      ))}
    </DragDropProvider>
  );
}

function List({ list, cards }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useDroppable({
    id: list.id,
    type: "list",
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
    <div ref={ref}>
      list:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={handleSubmit}>✏️</button>
      {cards.map((card) => (
        <Card card={card} key={card.id} />
      ))}
    </div>
  );
}

function Card({ card }) {
  const [description, setDescription] = useState(card.description);
  const [imageUrl, setImageUrl] = useState(card.imageUrl);
  const [position, setPosition] = useState(card.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useSortable({
    id: card.id,
    index: card.position,
    type: "card",
    group: "cards",
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
    <div ref={ref}>
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
    </div>
  );
}
