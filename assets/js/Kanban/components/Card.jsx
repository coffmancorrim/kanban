import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "../styles.css";
import { MutationStatus } from "./MutationStatus.jsx";
import { noSelfCollision } from "../util/dnd.js";
import { useUpdateCard } from "../hooks/BoardOperations.js";
import { GhostInput } from "./GhostInput.jsx";

export function Card({ card, onUpdateCard, onDeleteCard }) {
  const { ref, isDragSource } = useSortable({
    id: card.id,
    collisionDetector: noSelfCollision,
  });

  return (
    <div
      ref={ref}
      className="kanban-card"
      style={card.imageUrl != "" ? { padding: 0 } : {}}
    >
      {!card.imageUrl ? (
        <>
          <GhostInput
            value={card.description}
            placeholderText="enter description"
            onHandleSubmit={(newDescription) =>
              onUpdateCard.mutate({ ...card, description: newDescription })
            }
          />
          <GhostInput
            value={card.imageUrl}
            placeholderText="place image url here"
            onHandleSubmit={(newImageUrl) =>
              onUpdateCard.mutate({ ...card, imageUrl: newImageUrl })
            }
          />
        </>
      ) : (
        <img className="kanban-card-image" src={card.imageUrl} />
      )}

      <div className="kanban-card-footer">
        {card.imageUrl && (
          <button
            onClick={() => onUpdateCard.mutate({ ...card, imageUrl: "" })}
          >
            🅧
          </button>
        )}
        <button onClick={(e) => onDeleteCard.mutate(card)}>❌</button>
      </div>
    </div>
  );
}
