import { useEffect, useRef, useState } from "react";

export function GhostInput({ className = "", value, setValue, onSubmit }) {
  const [input, setInput] = useState(value);

  const blurInputRef = useRef(null);

  function handleInputSubmit() {
    setValue(input);
    onSubmit(input);
  }

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
      onBlur={() => handleInputSubmit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          blurInputRef.current.blur();
          handleInputSubmit();
        }
      }}
    />
  );
}
