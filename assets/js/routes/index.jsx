import { createFileRoute, Link } from "@tanstack/react-router";
import Boards from "../Kanban/components/Boards.jsx";
import { LoadingGrid } from "../Kanban/components/LoadingGrid.jsx";

export const Route = createFileRoute("/")({
  component: Index,
  pendingComponent: LoadingGrid,
});

function Index() {
  return (
    <div className="p-2">
      <Boards />
    </div>
  );
}
