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

async function fetchBoard(boardId) {
  const response = await fetch(BASE_URL + `board/${boardId}/`);
  if (!response.ok) throw new Error("Failed to fetch board");
  return await response.json();
}

export function Board({ boardId }) {
  const {
    data: boardData = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => fetchBoard(boardId),
  });

  const [board, setBoard] = useState({});
  const [lists, setLists] = useState({});
  const [cards, setCards] = useState({});
  const [isEditable, setIsEditable] = useState(false);
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
  const updateBoard = useUpdateBoard({ boardId, setBoard });
  const updateBoardOnCount = useUpdateBoardOnCount(
    boardId,
    boardData.updatedCount,
  );
  const addList = useAddList({ setLists });
  const addCard = useAddCard({ setCards });
  const updateCard = useUpdateCard({ setCards });
  const updateList = useUpdateList({ setLists });
  const deleteCard = useDeleteCard({ setCards });
  const deleteList = useDeleteList({ setLists });

  useEffect(() => {
    setBoard(boardData.board);
    setLists(boardData.lists);
    setCards(boardData.cards);
  }, [boardData]);

  function handleSubmit() {
    setIsEditable(!isEditable);

    if (!isEditable === false) {
      updateBoard.mutate({
        backgroundColor: board.backgroundColor,
        backgroundImageUrl: board.backgroundImageUrl,
      });
    }
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
    board && (
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
          <div className="kanban-board-header">
            <div className="kanban-board-header-main">
              <Link className="back-link" to="/">
                🔙
              </Link>
              <GhostInput
                className={"kanban-title"}
                value={board.name}
                onSubmit={(newName) =>
                  updateBoard.mutate({ ...board, name: newName })
                }
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
                    value={board.backgroundColor || ""}
                    onChange={(e) =>
                      setBoard({ ...board, backgroundColor: e.target.value })
                    }
                  />
                </div>
                <div className="kanban-board-header-option">
                  <label htmlFor="background-image-url">Background Image</label>
                  <input
                    id="background-image-url"
                    name="background-image-url"
                    value={board.backgroundImageUrl || ""}
                    onChange={(e) =>
                      setBoard({ ...board, backgroundImageUrl: e.target.value })
                    }
                    placeholder="put image link here"
                  />
                </div>
              </div>
            )}
            <button onClick={handleSubmit}>edit</button>
          </div>
          <div className="kanban-board">
            {lists &&
              Object.values(lists)
                .sort((a, b) => a.position - b.position)
                .map((list) => (
                  <List
                    list={list}
                    key={list.id}
                    onUpdateList={updateList}
                    onAddCard={handleAddCard}
                    onDeleteList={deleteList}
                  >
                    {cards &&
                      Object.values(cards)
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
    )
  );
}
