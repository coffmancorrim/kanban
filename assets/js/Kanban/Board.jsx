import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Board() {
  async function fetchBoard(query) {
    const response = await fetch(import.meta.env.VITE_BOARD_API_URL);
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
      <button onClick={() => setReadOnly(!readOnly)}>✏️</button>
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
  const { ref } = useDroppable({
    id: list.id,
    type: "list",
  });

  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  return (
    <div ref={ref}>
      list:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={() => setReadOnly(!readOnly)}>✏️</button>
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

  const updateCard = useMutation({
    mutationFn: (updatedCard) => {
      return fetch(`https://example.org/post/${card.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedCard),
      });
    },
  });

  const { ref } = useSortable({
    id: card.id,
    index: card.position,
    type: "card",
    group: "cards",
  });

  function handleSubmit() {
    if (readOnly === false)
      updateCard.mutate({
        ...card,
        description: description,
        imageUrl: imageUrl,
      });

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
