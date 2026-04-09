// TerminalInput is the active prompt line at the bottom.
// It shows the prompt (user@linux-trainer:~$) and a text input.
// When the user presses Enter, it fires onSubmit with the typed command.

import { useState, useRef, useEffect } from "react";

type TerminalInputProps = {
  onSubmit: (command: string) => void;
};

export default function TerminalInput({ onSubmit }: TerminalInputProps) {
  // useState stores the current text in the input field.
  // Every time the user types, setInput updates the value,
  // and React re-renders the component with the new text.
  const [input, setInput] = useState("");

  // useRef gives us a direct reference to the HTML input element.
  // We use it to keep the input focused — so the user can always type
  // without having to click on the input first.
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect runs code after the component renders.
  // Here it focuses the input once when the component first appears.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(input);
      setInput(""); // Clear the input after submitting
    }
  };

  return (
    <div className="flex items-center">
      {/* The prompt — styled to look like a real terminal */}
      <span className="text-green-400">user@linux-trainer</span>
      <span className="text-gray-400">:</span>
      <span className="text-blue-400">~</span>
      <span className="text-gray-400">$ </span>

      {/* The actual text input — styled to be invisible (no border, no background)
          so it looks like part of the terminal, not a form field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-gray-100 outline-none caret-green-400 font-mono"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
