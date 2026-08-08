import { useRef } from "react";
import { applyDrag, applyListDrag } from "../util/dnd";
import {
  useUpdateCardPosition,
  useUpdateListPosition,
} from "./BoardOperations";

export function useDrag({ board, setBoard }) {
  const snapshotRef = useRef(null);
  const lastTargetRef = useRef({ id: null, isAbove: null });
  const updateCardPosition = useUpdateCardPosition();
  const updateListPosition = useUpdateListPosition();

  function onDragStart() {
    snapshotRef.current = board;
    lastTargetRef.current = { id: null, isAbove: null };
  }

  function onDragOverHelper(event) {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id ?? null;

    if (!targetId || sourceId === targetId) {
      return;
    }

    if (typeof sourceId === "string") {
      onDragOverList(event, sourceId, targetId);
    } else {
      onDragOver(event, sourceId, targetId);
    }
  }

  function onDragOverList(event, sourceId, targetId) {
    if (typeof targetId === "number") return;

    const pointerX = event.operation.position.current.x;
    const targetCenterX = event.operation.target?.shape?.center.x;
    const isLeft = pointerX < targetCenterX;

    if (
      targetId === lastTargetRef.current.id &&
      isLeft === lastTargetRef.current.isLeft
    ) {
      return;
    }

    lastTargetRef.current = { id: targetId, isLeft };

    const { newBoard } = applyListDrag(
      snapshotRef.current,
      sourceId,
      targetId,
      isLeft,
    );
    setBoard(newBoard);
  }

  function onDragOver(event, sourceId, targetId) {
    const pointerY = event.operation.position.current.y;
    const targetCenterY = event.operation.target?.shape?.center.y;
    const isAbove = pointerY < targetCenterY;

    if (
      targetId === lastTargetRef.current.id &&
      isAbove === lastTargetRef.current.isAbove
    ) {
      return;
    }

    lastTargetRef.current = { id: targetId, isAbove };

    const { newBoard } = applyDrag(
      snapshotRef.current,
      sourceId,
      targetId,
      isAbove,
    );
    setBoard(newBoard);
  }

  function onDragEndHelper(event) {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id ?? null;

    if (event.canceled || !targetId || sourceId == targetId) {
      setBoard(snapshotRef.current);
      return;
    }

    if (typeof sourceId === "string") {
      onDragEndList(event, sourceId, targetId);
    } else {
      onDragEnd(event, sourceId, targetId);
    }
  }

  function onDragEndList(event, sourceId, targetId) {
    if (typeof targetId === "number") return;
    const pointerX = event.operation.position.current.x;
    const targetCenterX = event.operation.target?.shape?.center.x;
    const isLeft = pointerX < targetCenterX;

    const { updatedList, newBoard } = applyListDrag(
      snapshotRef.current,
      sourceId,
      targetId,
      isLeft,
    );
    setBoard(newBoard);

    updateListPosition.mutate({
      listId: updatedList.id,
      listPosition: updatedList.position,
    });

    snapshotRef.current = null;
    lastTargetRef.current = null;
  }

  function onDragEnd(event, sourceId, targetId) {
    const pointerY = event.operation.position.current.y;
    const targetCenterY = event.operation.target?.shape?.center.y;
    const isAbove = pointerY < targetCenterY;

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

    snapshotRef.current = null;
    lastTargetRef.current = null;
  }

  return { onDragStart, onDragOverHelper, onDragEndHelper };
}
