import { createFileRoute } from "@tanstack/react-router";
import { Board } from "../../Kanban/Board.jsx";

export const Route = createFileRoute("/kanban/$boardId")({
  component: BoardPage,
});

function BoardPage() {
  const { boardId } = Route.useParams();

  return <Board boardId={boardId} />;
}
