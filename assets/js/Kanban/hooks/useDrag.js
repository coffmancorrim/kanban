import { useRef } from "react";
import { applyDrag } from "../util/dnd";
import { useUpdateCardPosition } from "./BoardOperations";

export function useDrag({ board, setBoard }) {
  const snapshotRef = useRef(null);
  const lastTargetRef = useRef({ id: null, isAbove: null });
  const updateCardPosition = useUpdateCardPosition();

  function onDragStart() {
    console.log("[DragStart]", {
      board,
    });

    snapshotRef.current = board;
    lastTargetRef.current = { id: null, isAbove: null };
  }

  function onDragOver(event) {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id ?? null;

    if (!targetId || sourceId === targetId) {
      console.log("[DragOver] Early return: invalid target or same source", {
        sourceId,
        targetId,
      });
      return;
    }

    const pointerY = event.operation.position.current.y;
    const targetCenterY = event.operation.target?.shape?.center.y;
    const isAbove = pointerY < targetCenterY;

    if (
      targetId === lastTargetRef.current.id &&
      isAbove === lastTargetRef.current.isAbove
    ) {
      console.log("[DragOver] Early return: same target and side", {
        targetId,
        isAbove,
        lastTarget: lastTargetRef.current,
      });
      return;
    }

    console.log("[DragOver] Applying drag", {
      sourceId,
      targetId,
      pointerY,
      targetCenterY,
      isAbove,
    });

    lastTargetRef.current = { id: targetId, isAbove };

    const { newBoard } = applyDrag(
      snapshotRef.current,
      sourceId,
      targetId,
      isAbove,
    );
    setBoard(newBoard);
  }

  function onDragEnd(event) {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id ?? null;

    if (event.canceled || !targetId || sourceId == targetId) {
      console.log("[DragEnd] Restoring snapshot", {
        canceled: event.canceled,
        sourceId,
        targetId,
      });

      setBoard(snapshotRef.current);
      return;
    }

    const pointerY = event.operation.position.current.y;
    const targetCenterY = event.operation.target?.shape?.center.y;
    const isAbove = pointerY < targetCenterY;

    console.log("[DragEnd] Final applyDrag", {
      sourceId,
      targetId,
      pointerY,
      targetCenterY,
      isAbove,
    });

    const { updatedCard, newBoard } = applyDrag(
      snapshotRef.current,
      sourceId,
      targetId,
      isAbove,
    );
    setBoard(newBoard);

    updateCardPosition.mutate({
      cardId: updatedCard.id,
      cardPosition: updatedCard.position,
      cardList: updatedCard.list,
    });

    console.log("[DragEnd] Clearing refs");

    snapshotRef.current = null;
    lastTargetRef.current = null;
  }

  return { onDragStart, onDragOver, onDragEnd };
}
