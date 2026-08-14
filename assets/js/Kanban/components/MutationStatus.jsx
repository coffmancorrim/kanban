import { createPortal } from "react-dom";

export function MutationStatus({ mutations }) {
  return mutations.map(({ mutation, name }) => {
    if (!mutation.isPaused && !mutation.isError) return null;

    return createPortal(
      <div className="mutation-status">
        <span>❗️</span>
        {mutation.isPaused && (
          <p>
            Unable to {name}. Network connection lost. The request will be
            retried when the connection is restored.
          </p>
        )}
        {mutation.isError && <p>{mutation.error.message}</p>}
      </div>,
      document.body,
      name,
    );
  });
}
