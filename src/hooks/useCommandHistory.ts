// useCommandHistory — navigates command history with Up/Down arrow keys.
//
// In a real terminal, pressing Up recalls the previous command.
// Pressing Down goes forward again. If you were typing something
// before pressing Up, it's saved as a "draft" and restored when
// you arrow back down past the newest entry.
//
// The actual history storage lives in commands/historyState.ts
// (a shared module). This hook only manages the navigation index
// and draft — it doesn't own the history data.

import { useState, useCallback } from "react";
import {
  pushHistory,
  getHistoryEntry,
  getHistoryLength,
} from "../commands/historyState";

export function useCommandHistory() {
  // index tracks where we are in the history list.
  // When index === history length, we're at the "new command" position.
  const [index, setIndex] = useState(0);

  // draft stores what the user was typing before they pressed Up.
  // This way we can restore it when they arrow back down.
  const [draft, setDraft] = useState("");

  // Record a command — called when the user presses Enter.
  const push = useCallback((command: string) => {
    pushHistory(command);
    // Reset index to point past the end — ready for new input
    setIndex(getHistoryLength());
    setDraft("");
  }, []);

  // Navigate to an older command (Up arrow).
  // Returns the command string to display, or null if already at the top.
  const goUp = useCallback(
    (currentInput: string) => {
      const len = getHistoryLength();
      if (len === 0) return null;

      // Save what user was typing before they started navigating
      if (index === len) {
        setDraft(currentInput);
      }

      const newIndex = Math.max(0, index - 1);
      setIndex(newIndex);
      return getHistoryEntry(newIndex) ?? null;
    },
    [index]
  );

  // Navigate to a newer command (Down arrow).
  // Returns the command string, or the draft if we're back at the bottom.
  const goDown = useCallback(
    (_currentInput: string) => {
      const len = getHistoryLength();
      if (index >= len) return null;

      const newIndex = index + 1;
      setIndex(newIndex);

      // Past the last history entry — restore the draft
      if (newIndex === len) {
        return draft;
      }

      return getHistoryEntry(newIndex) ?? null;
    },
    [index, draft]
  );

  return { push, goUp, goDown };
}
