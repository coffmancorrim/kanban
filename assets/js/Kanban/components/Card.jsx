import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "../styles.css";
import { MutationStatus } from "./MutationStatus.jsx";
import { noSelfCollision } from "../util/dnd.js";
import { useUpdateCard } from "../hooks/BoardOperations.js";

export function Card({ card, index, onDeleteCard }) {
  const [description, setDescription] = useState(card.description);
  const [imageUrl, setImageUrl] = useState(card.imageUrl);
  const [readOnly, setReadOnly] = useState(true);

  const { ref, isDragSource } = useSortable({
    id: card.id,
    index: index,

    collisionDetector: noSelfCollision,
  });
  const updateCard = useUpdateCard(card.id);

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
    <div ref={ref} className="kanban-card">
      <MutationStatus
        mutations={[{ mutation: updateCard, name: "update card" }]}
      />
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
      <div className="kanban-card-buttons">
        <button onClick={handleSubmit}>edit</button>
        <button onClick={(e) => onDeleteCard(card)}>❌</button>
      </div>
    </div>
  );
}
