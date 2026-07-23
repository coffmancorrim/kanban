import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Boards from "./Kanban/Board.jsx";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={queryClient}>
    <Boards />
  </QueryClientProvider>,
);
