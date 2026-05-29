import { useQuery } from "@tanstack/react-query";
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

  return (
    <div>
      board:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={() => setReadOnly(!readOnly)}>✏️</button>
      {board.lists.map((list) => (
        <List list={list} key={list.id} />
      ))}
    </div>
  );
}

function List({ list }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  return (
    <div>
      list:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        readOnly={readOnly}
      />
      <button onClick={() => setReadOnly(!readOnly)}>✏️</button>
      {list.cards.map((card) => (
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

  return (
    <div>
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
      <button onClick={() => setReadOnly(!readOnly)}>✏️</button>
    </div>
  );
}
