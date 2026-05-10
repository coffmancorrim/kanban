import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Board from "./Kanban/Board.jsx";

const ENDPOINT = `${window.location.origin}/`;
const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={queryClient}>
    <Board />
  </QueryClientProvider>,
);
