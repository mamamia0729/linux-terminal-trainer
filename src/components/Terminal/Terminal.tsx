// Terminal is the main container component.
// It manages the history state and connects TerminalOutput + TerminalInput.
//
// React concept: "lifting state up"
// The history lives here (not in the child components) because BOTH children
// need access to it — Output reads it, Input adds to it.

import { useState, useRef, useEffect } from "react";
import TerminalOutput, { type HistoryEntry } from "./TerminalOutput";
import TerminalInput from "./TerminalInput";
import { parseCommand } from "../../commands/parser";
import { getCwd } from "../../filesystem/state";
import type { TaskCheck } from "../../lessons/types";

type TerminalProps = {
  onCommandExecuted?: (entry: TaskCheck) => void;
};

export default function Terminal({ onCommandExecuted }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cwd, setCwdState] = useState(getCwd());

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
    const trimmed = command.trim();

    // Capture cwd BEFORE the command runs (this is what the prompt showed)
    const cwdAtEntry = getCwd();

    if (!trimmed) {
      setHistory((prev) => [...prev, { command: "", output: "", cwd: cwdAtEntry }]);
      return;
    }

    const result = parseCommand(trimmed);

    // "clear" is a special action: it wipes history instead of adding to it
    if (result.action === "clear") {
      setHistory([]);
      setCwdState(getCwd());
      onCommandExecuted?.({ command: trimmed, output: "" });
      return;
    }

    const output = result.output ?? "";

    setHistory((prev) => [
      ...prev,
      { command: trimmed, output, cwd: cwdAtEntry },
    ]);

    // Update React state to reflect any cwd change (e.g. after "cd")
    setCwdState(getCwd());

    // Notify parent so lessons can check task completion
    onCommandExecuted?.({ command: trimmed, output });
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
        <div>Welcome to Linux Terminal Trainer v0.2</div>
        <div>Type a command and press Enter. Try "help" to get started.</div>
        <div className="mt-1">---</div>
      </div>

      <TerminalOutput history={history} />
      <TerminalInput cwd={cwd} onSubmit={handleCommand} />
    </div>
  );
}
