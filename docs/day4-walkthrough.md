# Day 4 — Command History (Arrow Keys, `history`, `!!`)

## What we built

Three features that match how a real Linux terminal handles command history:

1. **Arrow keys** (Up/Down) to recall previous commands
2. **`history` command** to see a numbered list of everything you've typed
3. **`!!` (bang bang)** to re-run your last command

These are the first things that make a beginner feel fast in the terminal.

---

## Architecture: shared history state

The biggest design decision: where does the history data live?

The `history` command is a plain function in `commands.ts`. The arrow key
navigation lives in a React hook inside `TerminalInput`. Both need to read
the same list of commands. React state can't be shared with plain functions,
so we use the same pattern as the filesystem — a **module-level store**.

```
src/commands/historyState.ts    ← the single source of truth
src/hooks/useCommandHistory.ts  ← reads from historyState, manages navigation
src/commands/commands.ts        ← `history` command reads from historyState
src/commands/parser.ts          ← `!!` reads last command from historyState
```

This is like how bash uses a single `~/.bash_history` file that multiple
features all read from.

---

## New file: `src/commands/historyState.ts`

A module-level array with helper functions:

```ts
const commandHistory: string[] = [];
```

### pushHistory(command)

Adds a command to the list, with two rules:

1. **Skip `!!`** — bash stores the expanded command, not the shortcut itself
2. **Skip consecutive duplicates** — typing `ls` three times stores it once
   (this matches bash's default `HISTCONTROL=ignoredups` behavior)

```ts
export function pushHistory(command: string): void {
  const trimmed = command.trim();
  if (trimmed === "") return;
  if (trimmed === "!!") return;
  if (commandHistory.length > 0 && commandHistory[commandHistory.length - 1] === trimmed) {
    return;
  }
  commandHistory.push(trimmed);
}
```

### Other exports

- `getHistory()` — returns a copy of the full array (used by `history` command)
- `getHistoryEntry(index)` — get one entry by position (used by arrow navigation)
- `getHistoryLength()` — how many entries exist
- `getLastCommand()` — the most recent entry (used by `!!`)

---

## Updated file: `src/hooks/useCommandHistory.ts`

The hook no longer stores its own history array. It only manages two things:

- **`index`** — where you are in the history as you press Up/Down
- **`draft`** — what you were typing before you started pressing Up

Think of it like a cursor in a text editor. The document (history) lives
elsewhere. The cursor (index) just points at a line.

```
history:  ["ls", "cd docs", "cat readme.txt"]
index:     ^0      ^1         ^2               ^3 (new command)
```

- `index === 3` means you're typing a new command
- Press Up → `index` drops to 2, shows "cat readme.txt"
- Press Up again → `index` drops to 1, shows "cd docs"
- Press Down → `index` goes to 2, shows "cat readme.txt"
- Press Down again → `index` goes to 3, restores your draft

### Draft preservation

If you typed "hel" then pressed Up, the hook saves "hel" as the draft.
When you arrow back down to index 3, it restores "hel" instead of clearing
the input. This matches real bash behavior.

---

## New command: `history`

Added to `commands.ts`. Prints a numbered list just like bash:

```
    1  ls
    2  cd documents
    3  cat readme.txt
    4  history
```

Note that `history` includes itself in the list — that's because the command
gets recorded before it runs (TerminalInput calls `push` on Enter, then
Terminal runs the command). This matches bash.

---

## New expansion: `!!` (bang bang)

Added to `parser.ts`. Before parsing the command normally, the parser checks
if the input is `!!`. If so, it:

1. Looks up the last command from `historyState`
2. Runs that command
3. Prepends the expanded command to the output, so you see what ran

```
user@linux-trainer:~$ ls
documents/  readme.txt
user@linux-trainer:~$ !!
ls
documents/  readme.txt
```

The first line of `!!`'s output shows `ls` — that's bash telling you
"here's what I actually ran." This prevents confusion.

`!!` is not stored in history. In bash, the expanded command is what gets
recorded. Since the expanded command is already the last entry, nothing new
is added.

---

## Changes to `TerminalInput.tsx`

Three additions to `handleKeyDown`:

```ts
if (e.key === "Enter") {
  push(input);          // record in history before submitting
  onSubmit(input);
  setInput("");
} else if (e.key === "ArrowUp") {
  e.preventDefault();   // stop cursor from jumping to start
  const prev = goUp(input);
  if (prev !== null) setInput(prev);
} else if (e.key === "ArrowDown") {
  e.preventDefault();
  const next = goDown(input);
  if (next !== null) setInput(next);
}
```

`e.preventDefault()` is needed because browsers move the text cursor to the
beginning of an input field when you press Up. We want Up to mean "previous
command," not "move cursor."

---

## Updated `help` output

The help command now shows history features and tips:

```
Available commands:
  ...
  history    Show your command history (numbered list)
  ...

Tips:
  ↑ / ↓      Press arrow keys to recall previous commands
  !!         Re-run your last command
```

Beginners won't discover arrow keys or `!!` on their own. Putting them in
`help` means they'll find them the first time they ask for help.

---

## Concepts learned

| Concept | What it means |
|---------|--------------|
| Module-level state | Sharing data between React and plain functions via a JS module |
| Custom hook | A `use`-prefixed function that encapsulates reusable stateful logic |
| `useCallback` | Memoizes a function to prevent unnecessary re-creation on re-render |
| `e.preventDefault()` | Stops the browser's default behavior for a keyboard event |
| History expansion | Replacing shortcuts like `!!` with actual commands before execution |
| HISTCONTROL=ignoredups | Bash behavior: consecutive duplicate commands stored only once |

## How to test

1. `npm run dev`
2. Type several commands: `ls`, `pwd`, `cd documents`, `ls`
3. Press **Up** — should show `ls` (your last command)
4. Keep pressing **Up** — walks backward through history
5. Press **Down** — walks forward, restores your draft at the bottom
6. Type `history` — should see a numbered list of everything you typed
7. Type `!!` — should re-run your last command and show what it expanded to
8. Type `ls` twice in a row, then `history` — only one `ls` entry (no duplicates)
