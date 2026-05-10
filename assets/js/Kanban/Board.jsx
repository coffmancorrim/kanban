import { useState } from "react";

export default function Board() {
  return (
    <div>
      <Task
        task={{ description: "this is a test", position: 0, imageUrl: "" }}
      />
      <Task
        task={{
          description: "this is a test",
          position: 0,
          imageUrl: "https://picsum.photos/200",
        }}
      />
    </div>
  );
}

function Task({ task }) {
  const [description, setDescription] = useState(task.description);
  const [imageUrl, setImageUrl] = useState(task.imageUrl);
  const [position, setPosition] = useState(task.position);
  const [canEdit, setCanEdit] = useState(false);

  return (
    <div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        readOnly={canEdit}
      />
      {canEdit && (
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="put image link here"
        />
      )}

      {imageUrl && <img src={imageUrl} alt="" />}

      <button onClick={() => setCanEdit(!canEdit)}>✏️</button>
    </div>
  );
}
