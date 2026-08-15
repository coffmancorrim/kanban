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
  onUpdateList,
  onDeleteList,
  onAddCard,
}) {
  const { ref } = useSortable({
    id: String(list.id),
    accept: (source) => typeof source.id === "string",
    collisionDetector: noSelfCollision,
  });

  return (
    <div className="kanban-list" ref={ref}>
      <div className="kanban-list-header">
        <GhostInput
          value={list.name}
          placeholderText="enter name here"
          onHandleSubmit={(newName) =>
            onUpdateList.mutate({ ...list, name: newName })
          }
        />
      </div>
      <div>{children}</div>
      <div className="kanban-list-footer">
        <button onClick={() => onAddCard(list.id)}>add card</button>
        <button onClick={() => onDeleteList.mutate(list.id)}>
          delete list
        </button>
      </div>
    </div>
  );
}
