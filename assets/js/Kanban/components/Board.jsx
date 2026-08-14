import { DragDropProvider } from "@dnd-kit/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import "../styles.css";
import { BASE_URL, getCookie } from "../config.js";
import { Link } from "@tanstack/react-router";
import { List } from "./List.jsx";
import { applyDrag } from "../util/dnd.js";
import {
  useAddCard,
  useAddList,
  useDeleteCard,
  useDeleteList,
  useUpdateBoard,
  useUpdateBoardOnCount,
  useUpdateCard,
  useUpdateCardPosition,
  useUpdateList,
} from "../hooks/BoardOperations.js";
import { useDrag } from "../hooks/useDrag.js";
import { MutationStatus } from "./MutationStatus.jsx";
import { LoadingGrid } from "./LoadingGrid.jsx";
import { GhostInput } from "./GhostInput.jsx";
import { Card } from "./Card.jsx";

async function fetchBoard(boardId) {
  const response = await fetch(BASE_URL + `board/${boardId}/`);
  if (!response.ok) throw new Error("Failed to fetch board");
  return await response.json();
}

export function Board({ boardId }) {
  const {
    data: boardData = { lists: [] },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => fetchBoard(boardId),
  });

  const [board, setBoard] = useState({ lists: [] });
  const [lists, setLists] = useState({});
  const [cards, setCards] = useState({});

  const [isEditable, setIsEditable] = useState(true);

  const { onDragStart, onDragOverHelper, onDragEndHelper } = useDrag({
    cards,
    setCards,
    lists,
    setLists,
  });
  const updateBoard = useUpdateBoard({ setBoard });
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
    if (isEditable === false) {
      const editedBoard = {
        ...board,
        backgroundColor: board.backgroundColor,
        backgroundImageUrl: board.backgroundImageUrl,
      };
      updateBoard.mutate(editedBoard);
    }

    setIsEditable(!isEditable);
  }

  function handleAddList() {
    const listsArray = Object.values(lists);
    if (listsArray.length === 0) {
      addList.mutate({
        name: "enter name here",
        position: 1,
        board: board.id,
      });
    } else {
      const lastObject = listsArray
        .sort((a, b) => a.position - b.position)
        .at(-1);
      addList.mutate({
        name: "enter name here",
        position: lastObject.position + 1,
        board: board.id,
      });
    }
  }

  function handleAddCard(listId) {
    const cardsList = Object.values(cards).filter(
      (card) => card.list === listId,
    );
    if (cardsList.length === 0) {
      addCard.mutate({
        description: "enter name here",
        position: 1,
        list: listId,
      });
    } else {
      const lastobject = cardsList
        .sort((a, b) => a.position - b.position)
        .at(-1);

      addCard.mutate({
        description: "enter name here",
        position: lastobject.position + 1,
        list: listId,
      });
    }
  }

  function handleDeleteCard(card) {
    deleteCard.mutate(card);
  }

  function handleCardNameChange(newName, card) {
    updateCard.mutate({ ...card, name: newName });
  }
  function handleCardImageChange(newImageUrl, card) {
    updateCard.mutate({ ...card, imageUrl: newImageUrl });
  }

  function handleListNameChange(newName, list) {
    setLists({ ...lists, [list.id]: { ...list, name: newName } });
  }

  function handleDeleteList(listId) {
    deleteList.mutate(listId);
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
          backgroundImage: `url(${board.backgroundImageUrl})`,
        }}
      >
        <MutationStatus
          mutations={[
            { mutation: addList, name: "add list" },
            { mutation: addCard, name: "add card" },
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
            <div className="kanban-board-header-main ">
              <Link className="back-link" to="/">
                🔙
              </Link>
              <GhostInput
                className={"kanban-title"}
                value={board.name}
                onHandleSubmit={(newName) =>
                  updateBoard.mutate({ ...board, name: newName })
                }
              />
            </div>
            {!isEditable && (
              <div className="kanban-board-header-options">
                <div className="kanban-board-header-option">
                  <label htmlFor="background-color">Background Color</label>
                  <input
                    type="color"
                    id="background-color"
                    name="background-color"
                    value={board.backgroundColor}
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
                    value={board.backgroundImageUrl}
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
                    onDeleteCard={handleDeleteCard}
                    onDeleteList={handleDeleteList}
                  >
                    {cards &&
                      Object.values(cards)
                        .filter((card) => card.list === list.id)
                        .sort((a, b) => a.position - b.position)
                        .map((card, index) => (
                          <Card
                            card={card}
                            key={card.id}
                            index={index}
                            onUpdateCard={updateCard}
                            onDeleteCard={handleDeleteCard}
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
