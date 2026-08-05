import { useDroppable } from "@dnd-kit/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "../styles.css";
import { Card } from "./Card.jsx";
import { MutationStatus } from "./MutationStatus.jsx";
import { noSelfCollision } from "../util/dnd.js";
import { useUpdateList } from "../hooks/BoardOperations.js";

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
    <div className="kanban-column">
      <MutationStatus
        mutations={[{ mutation: updateList, name: "update list" }]}
      />
      <div className="kanban-column-header">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={readOnly}
        />
        <button onClick={handleSubmit}>✏️</button>
      </div>
      <div ref={ref}>
        {list.cards.map((card, index) => (
          <Card
            card={card}
            key={card.id}
            index={index}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>
      <div className="kanban-column-footer">
        <button onClick={() => onAddCard(list.id, list.cards.length)}>
          add card
        </button>
        <button onClick={() => onDeleteList(list.id)}>delete list</button>
      </div>
    </div>
  );
}
