import { useDroppable } from "@dnd-kit/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "../styles.css";
import { Card } from "./Card.jsx";
import { MutationStatus } from "./MutationStatus.jsx";
import { noSelfCollision } from "../util/dnd.js";
import { useUpdateList } from "../hooks/BoardOperations.js";
import { useSortable } from "@dnd-kit/react/sortable";
import { GhostInput } from "./GhostInput.jsx";

export function List({ list, onAddCard, onDeleteCard, onDeleteList }) {
  const [name, setName] = useState(list.name);
  const [position, setPosition] = useState(list.position);
  const [readOnly, setReadOnly] = useState(true);

  const { ref } = useSortable({
    id: String(list.id),
    accept: (source) => typeof source.id === "string",
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
    <div className="kanban-list" ref={ref}>
      <MutationStatus
        mutations={[{ mutation: updateList, name: "update list" }]}
      />
      <div className="kanban-column-header">
        <GhostInput
          value={name}
          setValue={setName}
          onSubmit={(newName) => updateList.mutate({ name: newName })}
        />
      </div>
      <div>
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
