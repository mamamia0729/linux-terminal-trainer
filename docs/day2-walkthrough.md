# Day 2 Walkthrough: Command Parser + pwd, clear, help

Read this on the plane to understand everything we built on Day 2.
Make sure you've read through the Day 1 code first (Terminal, TerminalOutput, TerminalInput).

---

## What we built

On Day 1, every command just said "Command not found." On Day 2, we added a **command parser** so the terminal can actually understand and respond to commands.

We created 2 new files:
- `src/commands/commands.ts` - the dictionary of commands
- `src/commands/parser.ts` - the logic that reads input and routes it

And updated 1 file:
- `src/components/Terminal/Terminal.tsx` - wired the parser in

---

## File 1: commands.ts - The command dictionary

```ts
type CommandFn = (args: string[]) => string;

const commands: Record<string, CommandFn> = {
  pwd: () => "/home/user",
  help: () => [
    "Available commands:",
    "",
    "  pwd      Print the current working directory",
    "  clear    Clear the terminal screen",
    "  help     Show this help message",
    "",
    "More commands coming soon!",
  ].join("\n"),
};
```

### Concepts to understand

**`type CommandFn = (args: string[]) => string`**

This defines a function type. It says: "a CommandFn is any function that takes an array of strings and returns a string." We use this to make sure every command follows the same pattern.

Think of it like a job description: "every command must accept arguments and return text output."

**`Record<string, CommandFn>`**

`Record` is a TypeScript utility type. `Record<string, CommandFn>` means "an object where every key is a string and every value is a CommandFn." It's like a dictionary:

```
{
  "pwd": [a function],
  "help": [a function]
}
```

Why not just use a regular object? `Record` gives us type safety. If you accidentally set a value to a number instead of a function, TypeScript will catch it.

**`() => "/home/user"`**

This is an arrow function that takes no arguments and returns a string. The `args` parameter is available but `pwd` doesn't need it, so we omit it. TypeScript allows this because it's safe to ignore extra parameters.

**`.join("\n")`**

The `help` command builds its output as an array of strings (one per line), then joins them with `\n` (newline character). This is cleaner than writing one giant string with `\n` scattered throughout.

**Why is `clear` not in this file?**

Because `clear` doesn't produce output. It wipes the terminal history, which is React state inside Terminal.tsx. Commands in this file just return text. `clear` needs special handling, so we deal with it in the parser.

---

## File 2: parser.ts - The routing logic

```ts
import commands from "./commands";

export type CommandResult = {
  output: string | null;
  action?: "clear";
};

export function parseCommand(input: string): CommandResult {
  const parts = input.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (command === "clear") {
    return { output: null, action: "clear" };
  }

  const handler = commands[command];

  if (handler) {
    return { output: handler(args) };
  }

  return { output: `${command}: command not found` };
}
```

### Concepts to understand

**`export type CommandResult`**

This is the shape of what the parser returns. Two fields:
- `output`: the text to display (or `null` if there's nothing to show)
- `action?`: the `?` means this field is **optional**. It's only present when the command needs special handling (like `clear`).

**`string | null`**

The `|` means "or" in TypeScript. `string | null` means "this can be either a string or null." `clear` returns `null` because it doesn't produce output, it just wipes the screen.

**`input.trim().split(/\s+/)`**

This is method chaining. Step by step:
1. `trim()` removes spaces from both ends: `"  pwd  "` becomes `"pwd"`
2. `split(/\s+/)` splits on whitespace. `/\s+/` is a regex meaning "one or more whitespace characters." So `"ls -la /home"` becomes `["ls", "-la", "/home"]`

**`parts[0]` and `parts.slice(1)`**

After splitting, the first element is the command name, everything else is arguments:
- Input: `"ls -la /home"`
- `parts[0]` = `"ls"` (the command)
- `parts.slice(1)` = `["-la", "/home"]` (the arguments)

We don't use arguments yet, but the structure is ready for when we add commands like `cd /home` or `cat file.txt`.

**`commands[command]`**

This looks up the command name in our dictionary. If it exists, `handler` is the function. If not, `handler` is `undefined`, which is falsy, so we fall through to "command not found."

**Why separate parser.ts from commands.ts?**

Separation of concerns:
- `commands.ts` = the data (what commands exist and what they do)
- `parser.ts` = the logic (how to interpret input and route it)

When we add 20 more commands, `commands.ts` grows but `parser.ts` stays the same.

---

## Changes to Terminal.tsx

```ts
import { parseCommand } from "../../commands/parser";

const handleCommand = (command: string) => {
  const trimmed = command.trim();

  if (!trimmed) {
    setHistory((prev) => [...prev, { command: "", output: "" }]);
    return;
  }

  const result = parseCommand(trimmed);

  if (result.action === "clear") {
    setHistory([]);
    return;
  }

  setHistory((prev) => [
    ...prev,
    { command: trimmed, output: result.output ?? "" },
  ]);
};
```

### What changed from Day 1

Before: every command got "Command not found."
After: we call `parseCommand()` and use the result.

**`result.output ?? ""`**

The `??` is the **nullish coalescing operator**. It means: "use `result.output` if it's not null/undefined, otherwise use empty string." We need this because `output` can be `null` (for the `clear` command), and React doesn't like rendering `null` in a string position.

**`setHistory([])`**

For `clear`, we just set history to an empty array. All previous commands disappear. Simple.

---

## The data flow (how it all connects)

```
User types "pwd" and hits Enter
        |
        v
TerminalInput calls onSubmit("pwd")
        |
        v
Terminal.handleCommand("pwd")
        |
        v
parseCommand("pwd")
  - splits into parts: ["pwd"]
  - command = "pwd", args = []
  - looks up "pwd" in commands dictionary
  - finds the handler, calls it
  - returns { output: "/home/user" }
        |
        v
Terminal adds to history:
  { command: "pwd", output: "/home/user" }
        |
        v
React re-renders, TerminalOutput shows the new entry
```

---

## Key TypeScript concepts from today

| Concept | Example | What it means |
|---------|---------|---------------|
| Function type | `(args: string[]) => string` | Describes a function's shape |
| Record | `Record<string, CommandFn>` | Object with typed keys and values |
| Union type | `string \| null` | Can be either type |
| Optional field | `action?:` | Field may or may not exist |
| Nullish coalescing | `value ?? fallback` | Use fallback only if value is null/undefined |
| Regex split | `split(/\s+/)` | Split on pattern (whitespace) |
| Method chaining | `input.trim().split()` | Call methods one after another |

---

## Questions to quiz yourself

1. Why is `clear` handled in the parser instead of the commands dictionary?
2. What would happen if you typed `PWD` (uppercase)? Why?
3. If we add a `cd` command later, which file do we add it to?
4. What does `parts.slice(1)` return if the user just types `pwd` with no arguments?
5. Why do we use `??` instead of `||` for `result.output ?? ""`?

### Answers (don't peek until you've tried!)

1. Because `clear` modifies React state (wipes history). The commands dictionary only returns text output, it can't change state. So the parser flags it with `action: "clear"` and lets Terminal.tsx handle it.

2. It would work! Because we do `.toLowerCase()` in the parser, `"PWD"` becomes `"pwd"` before lookup.

3. `commands.ts`, just add a new entry to the dictionary. The parser doesn't need to change.

4. An empty array `[]`. `.slice(1)` on a single-element array returns `[]`.

5. `||` treats empty string `""` as falsy and would replace it. `??` only triggers on `null` or `undefined`. If a command intentionally returns an empty string, `??` preserves it, `||` would replace it with the fallback.
