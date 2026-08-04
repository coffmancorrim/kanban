import { DragDropProvider } from "@dnd-kit/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { BASE_URL, getCookie } from "./config.js";
import { Link } from "@tanstack/react-router";
import { List } from "./List.jsx";
import { applyDrag } from "./dnd.js";
import {
  useAddCard,
  useAddList,
  useDeleteCard,
  useDeleteList,
  useUpdateBoard,
  useUpdateBoardOnCount,
  useUpdateCardPosition,
} from "./BoardOperations.js";
import { useDrag } from "./useDrag.js";
import { MutationStatus } from "./MutationStatus.jsx";
import { LoadingGrid } from "./LoadingGrid.jsx";

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
  const [name, setName] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [readOnly, setReadOnly] = useState(true);

  const { onDragStart, onDragOver, onDragEnd } = useDrag({ board, setBoard });
  const updateBoard = useUpdateBoard(boardId);
  const updateBoardOnCount = useUpdateBoardOnCount(
    boardId,
    boardData.updatedCount,
  );
  const addList = useAddList({ setBoard });
  const addCard = useAddCard({ setBoard });
  const deleteCard = useDeleteCard({ setBoard });
  const deleteList = useDeleteList({ setBoard });

  useEffect(() => {
    setBoard(boardData);
    setName(boardData.name ?? "");
    setBackgroundColor(boardData.backgroundColor ?? "");
    setBackgroundImageUrl(boardData.backgroundImageUrl ?? "");
  }, [boardData]);

  function handleSubmit() {
    if (readOnly === false) {
      const editedBoard = {
        name: name,
        backgroundColor: backgroundColor,
        backgroundImageUrl: backgroundImageUrl,
      };
      if (
        name !== board.name ||
        backgroundColor !== board.backgroundColor ||
        backgroundImageUrl !== board.backgroundImageUrl
      ) {
        updateBoard.mutate(editedBoard);
      }
    }

    setReadOnly(!readOnly);
  }

  function handleAddList() {
    if (board.lists.length != 0) {
      addList.mutate({
        name: "enter name here",
        position: board.lists[board.lists.length - 1].position + 1,
        board: board.id,
      });
    } else {
      addList.mutate({
        name: "enter name here",
        position: 1,
        board: board.id,
      });
    }
  }

  function handleAddCard(listId, listPosition) {
    addCard.mutate({
      description: "enter name here",
      position: listPosition,
      list: listId,
    });
  }

  function handleDeleteCard(card) {
    deleteCard.mutate(card);
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
    <div
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: `url(${backgroundImageUrl})`,
        height: "100%",
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
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <Link to="/">🔙</Link>
        board:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={readOnly}
        />
        {!readOnly && (
          <div>
            <label htmlFor="background-color">Background Color: </label>
            <input
              type="color"
              id="background-color"
              name="background-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />

            <br></br>
            <label htmlFor="background-image-url">Background Image: </label>
            <input
              id="background-image-url"
              name="background-image-url"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="put image link here"
            />
          </div>
        )}
        <button onClick={handleSubmit}>✏️</button>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {board.lists.map((list) => (
            <List
              list={list}
              key={list.id}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onDeleteList={handleDeleteList}
            />
          ))}
        </div>
        <button onClick={handleAddList}>add list</button>
      </DragDropProvider>
    </div>
  );
}
