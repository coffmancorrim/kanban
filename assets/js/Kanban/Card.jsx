import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL } from "./config.js";
import "./styles.css";
import { noSelfCollision } from "./dnd.js";
import { useUpdateCard } from "./BoardOperations.js";
import { MutationStatus } from "./MutationStatus.jsx";

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
    <div
      ref={ref}
      style={{ backgroundColor: "green", padding: 5, marginTop: 0 }}
    >
      <MutationStatus
        mutations={[{ mutation: updateCard, name: "update card" }]}
      />
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
      <button onClick={(e) => onDeleteCard(card)}>❌</button>
      position: {card.position}
    </div>
  );
}
