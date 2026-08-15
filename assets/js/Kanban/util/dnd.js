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

export function applyListDrag(lists, sourceId, targetId, isLeft) {
  // Get the list that initiated the drag and its original location
  const sourceList = lists[sourceId];
  const targetList = lists[targetId];

  let lowestPositionList = { position: 99999999 };
  let highestPositionList = { position: -99999999 };
  let maxPositionListLeftOfTarget = { position: -99999999 };
  let minPositionListRightOfTarget = { position: 99999999 };

  for (const list of Object.values(lists)) {
    if (lowestPositionList.position > list.position) {
      lowestPositionList = list;
    } else if (highestPositionList.position < list.position) {
      highestPositionList = list;
    }

    if (
      list.position < targetList.position &&
      list.position > maxPositionListLeftOfTarget.position
    ) {
      maxPositionListLeftOfTarget = list;
    }
    if (
      list.position > targetList.position &&
      list.position < minPositionListRightOfTarget.position
    ) {
      minPositionListRightOfTarget = list;
    }
  }

  let updatedList = null;
  if (isLeft) {
    if (lowestPositionList === targetList) {
      updatedList = {
        ...sourceList,
        position: lowestPositionList.position - 1,
      };
    } else {
      const newPosition =
        (targetList.position + maxPositionListLeftOfTarget.position) / 2;
      updatedList = { ...sourceList, position: newPosition };
    }
  } else {
    if (highestPositionList === targetList) {
      updatedList = { ...sourceList, position: targetList.position + 1 };
    } else {
      const newPosition =
        (targetList.position + minPositionListRightOfTarget.position) / 2;
      updatedList = { ...sourceList, position: newPosition };
    }
  }

  const newLists = { ...lists, [sourceList.id]: updatedList };

  return { updatedList, newLists };
}

export function applyDrag(cards, sourceId, targetId, isAbove) {
  // Get the card that initiated the drag and its original location

  const sourceCard = cards[sourceId];

  // Get the drag target and its location.
  // Determine whether the drag target is a list or a card.
  let updatedCard = null;
  if (typeof targetId === "string") {
    //If the dragged location is a list

    let isListEmpty = true;
    let lowestPositionCard = { position: 99999999 };
    let highestPositionCard = { position: -99999999 };

    for (const card of Object.values(cards)) {
      if (Number(targetId) === card.list) {
        isListEmpty = false;

        if (lowestPositionCard.position > card.position) {
          lowestPositionCard = card;
        } else if (highestPositionCard.position < card.position) {
          highestPositionCard = card;
        }
      }
    }

    //Add card to new position
    if (isListEmpty) {
      updatedCard = {
        ...sourceCard,
        position: 0,
        list: Number(targetId),
      };
    } else if (isAbove) {
      updatedCard = {
        ...sourceCard,
        position: lowestPositionCard.position - 1,
        list: Number(targetId),
      };
    } else {
      updatedCard = {
        ...sourceCard,
        position: highestPositionCard.position + 1,
        list: Number(targetId),
      };
    }

    const newCards = { ...cards, [sourceCard.id]: updatedCard };

    return { updatedCard, newCards };
  }

  //if the dragged location is another card
  const targetCard = cards[targetId];

  let lowestPositionCard = { position: 99999999 };
  let highestPositionCard = { position: -99999999 };
  let maxPositionCardAboveOfTarget = { position: -99999999 };
  let minPositionCardBelowOfTarget = { position: 99999999 };

  for (const card of Object.values(cards).filter(
    (card) => card.list === targetCard.list,
  )) {
    if (lowestPositionCard.position > card.position) {
      lowestPositionCard = card;
    } else if (highestPositionCard.position < card.position) {
      highestPositionCard = card;
    }

    if (
      card.position < targetCard.position &&
      card.position > maxPositionCardAboveOfTarget.position
    ) {
      maxPositionCardAboveOfTarget = card;
    }
    if (
      card.position > targetCard.position &&
      card.position < minPositionCardBelowOfTarget.position
    ) {
      minPositionCardBelowOfTarget = card;
    }
  }

  // add card to new position
  if (isAbove) {
    if (lowestPositionCard === targetCard) {
      updatedCard = {
        ...sourceCard,
        position: targetCard.position - 1,
        list: targetCard.list,
      };
    } else {
      const newPosition =
        (targetCard.position + maxPositionCardAboveOfTarget.position) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: targetCard.list,
      };
    }
  } else {
    if (highestPositionCard === targetCard) {
      updatedCard = {
        ...sourceCard,
        position: targetCard.position + 1,
        list: targetCard.list,
      };
    } else {
      const newPosition =
        (targetCard.position + minPositionCardBelowOfTarget.position) / 2;

      updatedCard = {
        ...sourceCard,
        position: newPosition,
        list: targetCard.list,
      };
    }
  }

  const newCards = { ...cards, [sourceCard.id]: updatedCard };

  return { updatedCard, newCards };
}
