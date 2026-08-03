import { useDroppable } from "@dnd-kit/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL } from "./config.js";
import "./styles.css";
import { Card } from "./Card.jsx";
import { noSelfCollision } from "./dnd.js";
import { useUpdateList } from "./BoardOperations.js";

export function List({ list, onAddCard, onDeleteCard, onDeleteList }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useDroppable({
    id: String(list.id),

    collisionDetector: noSelfCollision,
  });
  const updateList = useUpdateList(list.id);

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
