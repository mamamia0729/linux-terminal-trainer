// Terminal is the main container component.
// It manages the history state and connects TerminalOutput + TerminalInput.
//
// React concept: "lifting state up"
// The history lives here (not in the child components) because BOTH children
// need access to it — Output reads it, Input adds to it.

import { useState, useRef, useEffect } from "react";
import TerminalOutput, { type HistoryEntry } from "./TerminalOutput";
import TerminalInput from "./TerminalInput";

export default function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Ref to the scrollable container — we'll auto-scroll to the bottom
  // every time a new command is added, just like a real terminal.
  const scrollRef = useRef<HTMLDivElement>(null);

  // This useEffect watches `history` — every time it changes (new command added),
  // it scrolls the terminal to the bottom so the latest output is visible.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (command: string) => {
    // For now, just echo the command back.
    // Tomorrow we'll replace this with a real command parser.
    const trimmed = command.trim();

    if (!trimmed) {
      // Empty enter — just add a blank prompt line (like a real terminal)
      setHistory((prev) => [...prev, { command: "", output: "" }]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        command: trimmed,
        output: `Command not found: ${trimmed}. (Coming soon!)`,
      },
    ]);
  };

  // Re-focus the input when clicking anywhere in the terminal.
  // This way the user doesn't have to click exactly on the input field.
  const handleClick = () => {
    const input = scrollRef.current?.querySelector("input");
    input?.focus();
  };

  return (
    <div
      ref={scrollRef}
      onClick={handleClick}
      className="h-screen bg-gray-900 text-sm font-mono p-4 overflow-y-auto cursor-text"
    >
      {/* Welcome message — like when you first open a terminal */}
      <div className="text-gray-500 mb-4">
        <div>Welcome to Linux Terminal Trainer v0.1</div>
        <div>Type a command and press Enter. Try "help" to get started.</div>
        <div className="mt-1">---</div>
      </div>

      <TerminalOutput history={history} />
      <TerminalInput onSubmit={handleCommand} />
    </div>
  );
}
