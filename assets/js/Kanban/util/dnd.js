import { closestCorners } from "@dnd-kit/collision";

export const noSelfCollision = ({ dragOperation, droppable }) => {
  if (dragOperation.source?.id === droppable.id) {
    return null;
  }

  if (!droppable.shape) {
    return null;
  }

  return closestCorners({
    dragOperation,
    droppable,
  });
};

export function findListAndCardIndex(board, cardId) {
  console.log("---FIND_LIST_CARD_INDEX");
  console.log("Card ID:", cardId);

  if (!board) return;

  for (let listIndex = 0; listIndex < board.lists.length; listIndex++) {
    const cardIndex = board.lists[listIndex].cards.findIndex(
      (card) => card.id === cardId,
    );

    if (cardIndex !== -1) {
      console.log("List Index:", listIndex);
      console.log("Card Index:", cardIndex);
      return [listIndex, cardIndex];
    }
  }

  console.log("ERROR");
  return null;
}

export function applyDrag(board, sourceId, targetId, isAbove) {
  console.log("APPLY_DRAG FUNCTION");
  console.log("INITAL BOARD LISTS:", board.lists);
  console.log("Source ID:", sourceId);
  console.log("Target ID:", targetId);

  //clone the board
  const newBoard = {
    ...board,
    lists: board.lists.map((list) => ({ ...list, cards: [...list.cards] })),
  };

  // Get the card that initiated the drag and its original location
  const [sourceListIndex, sourceCardIndex] = findListAndCardIndex(
    newBoard,
    sourceId,
  );
  const sourceCard = newBoard.lists[sourceListIndex].cards[sourceCardIndex];
  console.log("source card:", sourceCard);

  //remove the card that intiated the drag from the cloned board
  newBoard.lists[sourceListIndex].cards.splice(sourceCardIndex, 1);

  // Get the drag target and its location.
  // Determine whether the drag target is a list or a card.
  let updatedCard = null;
  if (typeof targetId === "string") {
    //If the dragged location is a list
    const targetListIndex = newBoard.lists.findIndex(
      (list) => String(list.id) === String(targetId),
    );

    //Add card to new position
    if (newBoard.lists[targetListIndex].cards.length === 0) {
      updatedCard = {
        ...sourceCard,
        position: 0,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    } else if (isAbove) {
      updatedCard = {
        ...sourceCard,
        position: newBoard.lists[targetListIndex].cards[0].position - 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(0, 0, updatedCard);
    } else {
      const lastCard =
        newBoard.lists[targetListIndex].cards[
          newBoard.lists[targetListIndex].cards.length - 1
        ];
      updatedCard = {
        ...sourceCard,
        position: lastCard.position + 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    }

    return { updatedCard, newBoard };
  }

  //if the dragged location is another card
  const [targetListIndex, targetCardIndex] = findListAndCardIndex(
    newBoard,
    targetId,
  );

  // add card to new position
  const targetCardPosition =
    newBoard.lists[targetListIndex].cards[targetCardIndex].position;
  if (isAbove) {
    if (targetCardIndex === 0) {
      updatedCard = {
        ...sourceCard,
        position: targetCardPosition - 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex,
        0,
        updatedCard,
      );
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex - 1].position;

      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: newBoard.lists[targetListIndex].id,
      };

      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex,
        0,
        updatedCard,
      );
    }
  } else {
    if (targetCardIndex === newBoard.lists[targetListIndex].cards.length - 1) {
      updatedCard = {
        ...sourceCard,
        position: targetCardPosition + 1,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.push(updatedCard);
    } else {
      const targetCardPosition2 =
        newBoard.lists[targetListIndex].cards[targetCardIndex + 1].position;
      const newPosition = (targetCardPosition + targetCardPosition2) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: newBoard.lists[targetListIndex].id,
      };
      newBoard.lists[targetListIndex].cards.splice(
        targetCardIndex + 1,
        0,
        updatedCard,
      );
    }
  }

  return { updatedCard, newBoard };
}
