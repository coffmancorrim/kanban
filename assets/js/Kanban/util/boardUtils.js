export function getBoardIds(lists, cards) {
  let firstListId = null,
    lastListId = null,
    firstCardIds = null,
    lastCardIds = null;

  if (lists == null || cards == null) {
    return { firstListId, lastListId, firstCardIds, lastCardIds };
  }

  const sortedLists = Object.values(lists).sort(
    (a, b) => a.position - b.position,
  );

  if (sortedLists.length === 0) {
    return { firstListId, lastListId, firstCardIds, lastCardIds };
  }
  firstListId = sortedLists[0].id;
  lastListId = sortedLists[sortedLists.length - 1].id;

  sortedLists.forEach((list) => {
    const sortedCards = Object.values(cards)
      .filter((card) => card.list === list.id)
      .sort((a, b) => a.position - b.position);

    if (sortedCards.length === 0) {
      return;
    }

    if (firstCardIds === null || lastCardIds === null) {
      firstCardIds = {};
      lastCardIds = {};
    }
    firstCardIds[list.id] = sortedCards[0].id;
    lastCardIds[list.id] = sortedCards[sortedCards.length - 1].id;
  });

  return { firstListId, lastListId, firstCardIds, lastCardIds };
}
