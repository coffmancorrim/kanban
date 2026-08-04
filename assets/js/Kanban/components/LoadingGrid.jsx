import { Grid } from "ldrs/react";
import "ldrs/react/Grid.css";

export function LoadingGrid() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
      }}
    >
      <h2>Loading...</h2>
      <Grid size="150" />
    </div>
  );
}
