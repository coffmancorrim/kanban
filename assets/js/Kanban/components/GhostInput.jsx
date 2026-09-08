import { useEffect, useRef, useState } from "react";

export function GhostInput({
  className = "",
  value,
  onSubmit,
  placeholderText = "",
}) {
  const [input, setInput] = useState(value);
  const blurInputRef = useRef(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  return (
    <input
      className={className}
      type="text"
      ref={blurInputRef}
      value={input ?? ""}
      onChange={(e) => setInput(e.target.value)}
      placeholder={placeholderText}
      onBlur={() => onSubmit(input)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          blurInputRef.current.blur();
        }
      }}
    />
  );
}
