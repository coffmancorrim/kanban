import { DragDropProvider } from "@dnd-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import "../styles.css";
import { BASE_URL } from "../config.js";
import { Link } from "@tanstack/react-router";
import { List } from "./List.jsx";
import {
  useAddCard,
  useAddList,
  useDeleteCard,
  useDeleteList,
  useUpdateBoard,
  useUpdateBoardOnCount,
  useUpdateCard,
  useUpdateList,
} from "../hooks/BoardOperations.js";
import { useDrag } from "../hooks/useDrag.js";
import { MutationStatus } from "./MutationStatus.jsx";
import { LoadingGrid } from "./LoadingGrid.jsx";
import { GhostInput } from "./GhostInput.jsx";
import { Card } from "./Card.jsx";
import { getBoardIds } from "../util/boardUtils.js";
import { BoardHeader } from "./BoardHeader.jsx";
import { useFetchBoardData } from "../hooks/useFetchBoardData.js";

export function Board({ boardId }) {
  const [board, lists, cards, setBoard, setLists, setCards, isLoading, error] =
    useFetchBoardData(boardId);

  const { firstListId, lastListId, firstCardIds, lastCardIds } = useMemo(
    () => getBoardIds(lists, cards),
    [lists, cards],
  );

  const { onDragStart, onDragOverHelper, onDragEndHelper } = useDrag({
    cards,
    setCards,
    lists,
    setLists,
  });

  const updateBoardOnCount = useUpdateBoardOnCount(boardId, board.updatedCount);
  const updateBoard = useUpdateBoard({ boardId, setBoard });
  const addList = useAddList({ setLists });
  const addCard = useAddCard({ setCards });
  const updateCard = useUpdateCard({ setCards });
  const updateList = useUpdateList({ setLists });
  const deleteCard = useDeleteCard({ setCards });
  const deleteList = useDeleteList({ setLists });

  function handleBackgroundSubmit(
    updatedBackgroundColor,
    updatedBackgroundImageUrl,
  ) {
    updateBoard.mutate({
      backgroundColor: updatedBackgroundColor,
      backgroundImageUrl: updatedBackgroundImageUrl,
    });
  }

  function handleChangeBackgroundColor(value) {
    setBoard({ ...board, backgroundColor: value });
  }

  function handleChangeBackgroundImageUrl(value) {
    setBoard({ ...board, backgroundImageUrl: value });
  }

  function handleAddList() {
    if (firstListId == null) {
      addList.mutate({
        name: "enter name here",
        position: 1,
        board: board.id,
      });
    } else {
      addList.mutate({
        name: "enter name here",
        position: lists[lastListId].position + 1,
        board: board.id,
      });
    }
  }

  function handleAddCard(listId) {
    if (firstCardIds == null || firstCardIds[listId] == null) {
      addCard.mutate({
        description: "enter name here",
        position: 1,
        list: listId,
      });
    } else {
      addCard.mutate({
        description: "enter name here",
        position: cards[lastCardIds[listId]].position + 1,
        list: listId,
      });
    }
  }

  if (error) return <p>Unable to load board: {error.message}</p>;
  if (isLoading)
    return (
      <div>
        <LoadingGrid />
      </div>
    );

  return (
    <div
      className="kanban-body"
      style={{
        backgroundColor: board.backgroundColor,
        backgroundImage: board.backgroundImageUrl
          ? `url(${board.backgroundImageUrl})`
          : undefined,
      }}
    >
      <MutationStatus
        mutations={[
          { mutation: addList, name: "add list" },
          { mutation: addCard, name: "add card" },
          { mutation: updateCard, name: "update card" },
          { mutation: updateList, name: "update list" },
          { mutation: deleteList, name: "delete list" },
          { mutation: deleteCard, name: "delete card" },
          { mutation: updateBoard, name: "update board" },
        ]}
      />

      <DragDropProvider
        onDragStart={onDragStart}
        onDragOver={onDragOverHelper}
        onDragEnd={onDragEndHelper}
      >
        <BoardHeader
          name={board.name}
          backgroundColor={board.backgroundColor}
          backgroundImageUrl={board.backgroundImageUrl}
          onChangeBackgroundColor={handleChangeBackgroundColor}
          onChangeBackgroundImageUrl={handleChangeBackgroundImageUrl}
          onTitleSubmit={(newName) =>
            updateBoard.mutate({ ...board, name: newName })
          }
          onBackgroundSubmit={handleBackgroundSubmit}
        />

        <div className="kanban-board">
          {Object.values(lists)
            .sort((a, b) => a.position - b.position)
            .map((list) => (
              <List
                list={list}
                key={list.id}
                onUpdateList={updateList}
                onAddCard={handleAddCard}
                onDeleteList={deleteList}
              >
                {Object.values(cards)
                  .filter((card) => card.list === list.id)
                  .sort((a, b) => a.position - b.position)
                  .map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                    />
                  ))}
              </List>
            ))}
          <button onClick={handleAddList}>add list</button>
        </div>
      </DragDropProvider>
    </div>
  );
}
