// TerminalInput is the active prompt line at the bottom.
// It shows the prompt (user@linux-trainer:~$) and a text input.
// When the user presses Enter, it fires onSubmit with the typed command.

import { useState, useRef, useEffect } from "react";
import Prompt from "./Prompt";

type TerminalInputProps = {
  cwd: string;
  onSubmit: (command: string) => void;
};

export default function TerminalInput({ cwd, onSubmit }: TerminalInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <div className="flex items-center">
      <Prompt cwd={cwd} />

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
