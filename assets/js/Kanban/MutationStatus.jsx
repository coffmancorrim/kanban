import { createPortal } from "react-dom";

export function MutationStatus({ mutations }) {
  return mutations.map(({ mutation, name }) =>
    createPortal(
      <div
        key={name}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
      >
        {mutation.isPaused && (
          <h1>
            Unable to {name}. Network connection lost. The request will be
            retried when the connection is restored.
          </h1>
        )}

        {mutation.isError && (
          <h1>
            Unable to {name}: {mutation.error.message}
          </h1>
        )}
      </div>,
      document.body,
    ),
  );
}
