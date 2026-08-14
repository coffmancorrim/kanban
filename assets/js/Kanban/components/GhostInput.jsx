import { useEffect, useRef, useState } from "react";

export function GhostInput({
  className = "",
  value,
  onHandleSubmit,
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
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={placeholderText}
      onBlur={() => onHandleSubmit(input)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          blurInputRef.current.blur();
        }
      }}
    />
  );
}
