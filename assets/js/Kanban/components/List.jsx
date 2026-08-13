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

export function List({
  list,
  children,
  onListNameChange,
  onAddCard,
  onDeleteCard,
  onDeleteList,
}) {
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
      <h2>
        id: {list.id} pos: {list.position}
      </h2>
      <div className="kanban-column-header">
        <GhostInput
          value={list.name}
          setValue={(newName) => onListNameChange(newName, list)}
          onSubmit={(newName) => updateList.mutate({ name: newName })}
        />
      </div>
      <div>{children}</div>
      <div className="kanban-column-footer">
        <button onClick={() => onAddCard(list.id)}>add card</button>
        <button onClick={() => onDeleteList(list.id)}>delete list</button>
      </div>
    </div>
  );
}
