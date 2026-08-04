import { createFileRoute } from "@tanstack/react-router";
import { Board } from "../../Kanban/Board.jsx";
import { LoadingGrid } from "../../Kanban/LoadingGrid.jsx";

export const Route = createFileRoute("/kanban/$boardId")({
  component: BoardPage,
  pendingComponent: LoadingGrid,
});

function BoardPage() {
  const { boardId } = Route.useParams();

  return <Board boardId={boardId} />;
}
