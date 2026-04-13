// Command history state — shared module that tracks every command the user enters.
//
// Why a module-level array instead of React state?
// Same reason as filesystem/state.ts — the `history` command is a plain function
// that needs to read this list, and the useCommandHistory hook needs to write to it.
// Module-level state lets both sides access the same data.
//
// In real bash, history is stored in ~/.bash_history (a plain text file).
// We're using an array in memory — same idea, different storage.

const commandHistory: string[] = [];

// Add a command to history.
// Skips duplicate consecutive entries — bash does this by default (HISTCONTROL=ignoredups).
// Example: typing "ls" three times in a row only stores it once.
export function pushHistory(command: string): void {
  const trimmed = command.trim();
  if (trimmed === "") return;

  // Don't store "!!" literally — bash stores the expanded command, not the shortcut.
  // The expanded command is already in history (it was the last command), so skip.
  if (trimmed === "!!") return;

  // Skip duplicate consecutive entries — bash does this by default (HISTCONTROL=ignoredups).
  // Example: typing "ls" three times in a row only stores it once.
  if (commandHistory.length > 0 && commandHistory[commandHistory.length - 1] === trimmed) {
    return;
  }

  commandHistory.push(trimmed);
}

// Get the full history array (read-only copy).
// The `history` command uses this to print a numbered list.
export function getHistory(): string[] {
  return [...commandHistory];
}

// Get a specific entry by index (0-based).
// Used by the useCommandHistory hook for arrow key navigation.
export function getHistoryEntry(index: number): string | undefined {
  return commandHistory[index];
}

// Get the total number of entries.
export function getHistoryLength(): number {
  return commandHistory.length;
}

// Get the last command entered.
// Used by !! (bang bang) expansion.
export function getLastCommand(): string | undefined {
  return commandHistory.length > 0
    ? commandHistory[commandHistory.length - 1]
    : undefined;
}
