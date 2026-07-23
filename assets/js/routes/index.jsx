import { createFileRoute, Link } from "@tanstack/react-router";
import Boards from "../Kanban/Boards.jsx";

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
