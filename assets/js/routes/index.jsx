import { createFileRoute } from "@tanstack/react-router";
import Boards from "../Kanban/Board.jsx";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <Boards />
    </div>
  );
}
