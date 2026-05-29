import { useState } from "react";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import "./styles.css";

export default function Board() {
  const targets = ["A", "B", "C"];
  const [target, setTarget] = useState();
  const draggable = <Draggable id="draggable">Drag me</Draggable>;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        setTarget(event.operation.target?.id);
      }}
    >
      <div className="drop-layout">
        <div>{!target ? draggable : null}</div>

        {targets.map((id) => (
          <Droppable key={id} id={id}>
            {target === id ? draggable : `Droppable ${id}`}
          </Droppable>
        ))}
      </div>
    </DragDropProvider>
  );
}

function Droppable({ id, children }) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div ref={ref} className={`droppable${isDropTarget ? " active" : ""}`}>
      {children}
    </div>
  );
}

function Draggable({ id = "draggable" }) {
  const { ref } = useDraggable({ id });

  return (
    <button className="btn" ref={ref}>
      Draggable
    </button>
  );
}
