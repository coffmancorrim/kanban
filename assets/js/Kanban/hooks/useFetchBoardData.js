import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";

async function fetchBoard(boardId) {
  const response = await fetch(BASE_URL + `board/${boardId}/`);
  if (!response.ok) throw new Error("Failed to fetch board");
  return await response.json();
}

export function useFetchBoardData(boardId) {
  const {
    data = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => fetchBoard(boardId),
  });

  const [board, setBoard] = useState({});
  const [lists, setLists] = useState({});
  const [cards, setCards] = useState({});

  useEffect(() => {
    setBoard(data.board ?? {});
    setLists(data.lists ?? {});
    setCards(data.cards ?? {});
  }, [data]);

  return [board, lists, cards, setBoard, setLists, setCards, isLoading, error];
}
