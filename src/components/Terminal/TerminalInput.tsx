// TerminalInput is the active prompt line at the bottom.
// It shows the prompt (user@linux-trainer:~$) and a text input
// with a block cursor, like a real Linux terminal.

import { useState, useRef, useEffect } from "react";
import Prompt from "./Prompt";

type TerminalInputProps = {
  cwd: string;
  onSubmit: (command: string) => void;
};

export default function TerminalInput({ cwd, onSubmit }: TerminalInputProps) {
  const [input, setInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(input);
      setInput("");
      setCursorPos(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart ?? e.target.value.length);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPos(target.selectionStart ?? input.length);
  };

  // Split text into: before cursor, cursor char, after cursor.
  // If cursor is at the end, show a space as the cursor block.
  const beforeCursor = input.slice(0, cursorPos);
  const cursorChar = input[cursorPos] ?? " ";
  const afterCursor = input.slice(cursorPos + 1);

  return (
    <div
      className="flex items-center"
      onClick={() => inputRef.current?.focus()}
    >
      <Prompt cwd={cwd} />

      {/* Visible text with block cursor */}
      <span className="relative font-mono">
        <span className="text-gray-100">{beforeCursor}</span>
        <span className="bg-green-400 text-gray-900 animate-blink">
          {cursorChar}
        </span>
        <span className="text-gray-100">{afterCursor}</span>
      </span>

      {/* Hidden input that captures keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        className="absolute opacity-0 w-0 h-0"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
