import { Link } from "@tanstack/react-router";
import { GhostInput } from "./GhostInput";
import { useState } from "react";

export function BoardHeader({
  name,
  backgroundColor,
  backgroundImageUrl,
  onChangeBackgroundColor,
  onChangeBackgroundImageUrl,
  onTitleSubmit,
  onBackgroundSubmit,
}) {
  const [isEditable, setIsEditable] = useState(false);

  function handleSubmit() {
    setIsEditable(!isEditable);

    if (!isEditable === false) {
      onBackgroundSubmit(backgroundColor, backgroundImageUrl);
    }
  }

  return (
    <div className="kanban-board-header">
      <div className="kanban-board-header-main">
        <Link className="back-link" to="/">
          🔙
        </Link>
        <GhostInput
          className={"kanban-title"}
          value={name}
          onSubmit={onTitleSubmit}
        />
      </div>
      {isEditable && (
        <div className="kanban-board-header-options">
          <div className="kanban-board-header-option">
            <label htmlFor="background-color">Background Color</label>
            <input
              type="color"
              id="background-color"
              name="background-color"
              value={backgroundColor || ""}
              onChange={(e) => onChangeBackgroundColor(e.target.value)}
            />
          </div>
          <div className="kanban-board-header-option">
            <label htmlFor="background-image-url">Background Image</label>
            <input
              id="background-image-url"
              name="background-image-url"
              value={backgroundImageUrl || ""}
              onChange={(e) => onChangeBackgroundImageUrl(e.target.value)}
              placeholder="put image link here"
            />
          </div>
        </div>
      )}
      <button onClick={handleSubmit}>edit</button>
    </div>
  );
}
