import { Grid } from "ldrs/react";
import "ldrs/react/Grid.css";
import "./loading-grid.css";

export function LoadingGrid() {
  return (
    <div className="loading-grid">
      <h2>Loading...</h2>
      <Grid size="150" />
    </div>
  );
}
