import { useState } from "react";
import board from "./sample.json";

export default function Board() {
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
        <List list={list} />
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
        <div>
          <Card card={card} />
        </div>
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
