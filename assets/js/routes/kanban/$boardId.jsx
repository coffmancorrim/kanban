import { createFileRoute } from "@tanstack/react-router";
import { LoadingGrid } from "../../Kanban/components/LoadingGrid.jsx";
import { Board } from "../../Kanban/components/Board.jsx";

export const Route = createFileRoute("/kanban/$boardId")({
  component: BoardPage,
  pendingComponent: LoadingGrid,
});

function BoardPage() {
  const { boardId } = Route.useParams();

  return <Board boardId={boardId} />;
}
