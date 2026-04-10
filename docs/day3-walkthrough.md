# Day 3 Walkthrough: Virtual Filesystem, Guided Lessons, and Block Cursor

Read this to understand everything we built on Day 3.
Make sure you've read the Day 1 and Day 2 walkthroughs first.

---

## What we built

On Day 2, we had `pwd`, `clear`, and `help`. But `pwd` always returned the same hardcoded path, there was nothing to navigate, and there was no guidance for the user. Day 3 adds three big features:

1. **Virtual filesystem** — a tree of folders and files with `ls`, `cd`, and `cat`
2. **Guided lesson panel** — left sidebar with tasks, hints, and auto-checkmarks
3. **Block cursor** — authentic Linux terminal look with a blinking block cursor

We created 7 new files:
- `src/filesystem/fileSystem.ts` - the filesystem tree and path helpers
- `src/filesystem/state.ts` - tracks the current working directory
- `src/components/Terminal/Prompt.tsx` - reusable prompt component
- `src/lessons/types.ts` - lesson and task type definitions
- `src/lessons/lessonList.ts` - lesson content with validation checks
- `src/components/LessonPanel/LessonPanel.tsx` - the left sidebar UI

And updated 5 files:
- `src/App.tsx` - split-screen layout, lesson state management
- `src/commands/commands.ts` - added ls, cd, cat, updated pwd and help
- `src/components/Terminal/Terminal.tsx` - passes cwd to children, notifies parent on command
- `src/components/Terminal/TerminalInput.tsx` - block cursor, shared Prompt
- `src/components/Terminal/TerminalOutput.tsx` - uses shared Prompt, stores cwd per entry

---

## File 1: fileSystem.ts - The filesystem tree

### The type definitions

```ts
export type FileNode = {
  type: "file";
  name: string;
  content: string;
};

export type FolderNode = {
  type: "folder";
  name: string;
  children: Record<string, FsNode>;
};

export type FsNode = FileNode | FolderNode;
```

### Concepts to understand

**Discriminated union: `FsNode = FileNode | FolderNode`**

This is one of TypeScript's most powerful patterns. Both `FileNode` and `FolderNode` have a `type` field, but with different literal values (`"file"` vs `"folder"`). When you check `node.type`, TypeScript automatically narrows the type:

```ts
if (node.type === "file") {
  // TypeScript KNOWS node is FileNode here
  // node.content is available, node.children is NOT
}
if (node.type === "folder") {
  // TypeScript KNOWS node is FolderNode here
  // node.children is available, node.content is NOT
}
```

This is called **type narrowing** through a **discriminant field**. The `type` field is the discriminant because it tells TypeScript which variant you're dealing with.

**Why `Record<string, FsNode>` for children?**

A folder's children are stored as a dictionary: filename maps to node. This makes lookups fast. When the user types `cd documents`, we just do `folder.children["documents"]` instead of searching through an array.

### The tree structure

```ts
function file(name: string, content: string): FileNode {
  return { type: "file", name, content };
}

function folder(name: string, children: Record<string, FsNode>): FolderNode {
  return { type: "folder", name, children };
}

export const fileSystem: FolderNode = folder("/", {
  home: folder("home", {
    user: folder("user", {
      documents: folder("documents", {
        "notes.txt": file("notes.txt", "Linux terminal basics:\n..."),
        "todo.txt": file("todo.txt", "1. Learn basic terminal commands\n..."),
      }),
      projects: folder("projects", {
        "hello.py": file("hello.py", '#!/usr/bin/env python3\nprint("Hello, world!")'),
      }),
      "readme.txt": file("readme.txt", "Welcome to your home directory!\n..."),
    }),
  }),
  etc: folder("etc", {
    hostname: file("hostname", "linux-trainer"),
  }),
  tmp: folder("tmp", {}),
});
```

**Helper functions `file()` and `folder()`**

These are just shortcuts to avoid writing `{ type: "file", name: "...", content: "..." }` over and over. This is a common pattern called **factory functions**. They don't do anything special, they just reduce repetition.

**The tree is nested objects**

The filesystem is just objects inside objects. The root `/` contains `home`, `etc`, `tmp`. Inside `home` is `user`. Inside `user` is `documents`, `projects`, and `readme.txt`. This nesting mirrors a real filesystem tree.

### resolvePath - Walking the tree

```ts
export function resolvePath(path: string): FsNode | null {
  if (path === "/") return fileSystem;

  const segments = path.split("/").filter(Boolean);
  let current: FsNode = fileSystem;

  for (const segment of segments) {
    if (current.type !== "folder") return null;
    const child = current.children[segment];
    if (!child) return null;
    current = child;
  }

  return current;
}
```

**`path.split("/").filter(Boolean)`**

This splits a path into segments and removes empty strings:
- `"/home/user"` → `["", "home", "user"]` → `["home", "user"]`
- `"/"` → `["", ""]` → `[]` (handled by the early return above)

`filter(Boolean)` removes falsy values. Empty string `""` is falsy, so it gets filtered out.

**The walk loop**

Starting at the root, we go down one level at a time:
1. Check if we're in a folder (can't go deeper into a file)
2. Look up the next segment in that folder's children
3. If found, move to that child. If not, return null.

After the loop, `current` points to whatever node the path leads to.

**Return type `FsNode | null`**

The function returns `null` when the path doesn't exist. The caller has to check for null before using the result, which is how we produce error messages like "No such file or directory."

### normalizePath - Handling .. and relative paths

```ts
export function normalizePath(cwd: string, target: string): string {
  const base = target.startsWith("/") ? "" : cwd;
  const segments = (base + "/" + target).split("/").filter(Boolean);

  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === "..") {
      stack.pop();
    } else if (segment !== ".") {
      stack.push(segment);
    }
  }

  return "/" + stack.join("/");
}
```

**Absolute vs relative paths**

If the target starts with `/`, it's absolute, we ignore the current directory. Otherwise, we prepend the current directory. Examples:
- `normalizePath("/home/user", "documents")` → works on `"/home/user/documents"`
- `normalizePath("/home/user", "/etc")` → works on `"/etc"` (ignores cwd)

**The stack algorithm**

This is a classic algorithm for resolving paths:
- Regular names (`documents`, `user`) get pushed onto the stack
- `..` pops the last item (go up one level)
- `.` is skipped (current directory, does nothing)

Example: `normalizePath("/home/user/documents", "..")`
1. Start with segments: `["home", "user", "documents", ".."]`
2. Push `"home"` → stack: `["home"]`
3. Push `"user"` → stack: `["home", "user"]`
4. Push `"documents"` → stack: `["home", "user", "documents"]`
5. `".."` pops → stack: `["home", "user"]`
6. Result: `"/home/user"`

---

## File 2: state.ts - Current working directory

```ts
let cwd = "/home/user";

export function getCwd(): string {
  return cwd;
}

export function setCwd(path: string): void {
  cwd = path;
}
```

### Concepts to understand

**Module-level state**

This is a plain variable at the top of the file, not React state. Why?

Commands like `cd` and `pwd` are plain functions in `commands.ts`. They can't use React hooks like `useState` because hooks only work inside React components. So we store the cwd in a regular module variable that any file can import and read/write.

**Getter/setter pattern**

Instead of exporting `cwd` directly, we export functions. This gives us control, if we later want to add validation or logging when cwd changes, we only modify these two functions.

**`void` return type**

`setCwd` returns nothing. TypeScript uses `void` to mark this explicitly.

---

## File 3: Prompt.tsx - Shared prompt component

```ts
function displayPath(cwd: string): string {
  if (cwd === "/home/user") return "~";
  if (cwd.startsWith("/home/user/")) return "~" + cwd.slice("/home/user".length);
  return cwd;
}

export default function Prompt({ cwd }: PromptProps) {
  return (
    <>
      <span className="text-green-400">user@linux-trainer</span>
      <span className="text-gray-400">:</span>
      <span className="text-blue-400">{displayPath(cwd)}</span>
      <span className="text-gray-400">$ </span>
    </>
  );
}
```

### Concepts to understand

**`displayPath` - Tilde substitution**

In real Linux terminals, your home directory `/home/user` is displayed as `~`. This function does the same:
- `/home/user` → `~`
- `/home/user/documents` → `~/documents`
- `/etc` → `/etc` (not under home, show full path)

**`cwd.slice("/home/user".length)`**

`slice(n)` returns everything from position `n` onwards. `"/home/user".length` is 10, so for `"/home/user/documents"`, `slice(10)` returns `"/documents"`. We prepend `~` to get `"~/documents"`.

**React fragment `<>...</>`**

The `<>` and `</>` is a React Fragment. It lets us return multiple elements without adding an extra `<div>` to the DOM. The Prompt has 4 `<span>` elements, and we don't want a wrapper div messing up the flex layout.

**Why a separate component?**

Both TerminalInput (the live prompt) and TerminalOutput (the history) display the same prompt. Before Day 3, both had the prompt markup copy-pasted. Now they share one `Prompt` component. This is the **DRY principle**: Don't Repeat Yourself. If we change the prompt style, we change it in one place.

---

## Updated: commands.ts - New commands

### ls - List directory contents

```ts
ls: (args) => {
  const target = args[0]
    ? normalizePath(getCwd(), args[0])
    : getCwd();

  const node = resolvePath(target);

  if (!node) {
    return `ls: cannot access '${args[0] ?? "."}': No such file or directory`;
  }

  if (node.type === "file") {
    return node.name;
  }

  const entries = Object.values(node.children).map((child) =>
    child.type === "folder" ? child.name + "/" : child.name
  );

  return entries.sort().join("  ");
},
```

**How it works:**
1. If the user gave an argument (`ls documents`), resolve it. Otherwise, use the current directory.
2. If the path doesn't exist, return an error.
3. If it's a file, just print the filename (like real `ls` does).
4. If it's a folder, list all children. Folders get a trailing `/` to stand out.

**`Object.values(node.children)`**

`Object.values()` extracts the values from an object as an array. If `children` is `{ "notes.txt": ..., "todo.txt": ... }`, it returns `[FileNode, FileNode]`.

**`.map()` with conditional**

The `.map()` transforms each child into a display string. The ternary `child.type === "folder" ? name + "/" : name` adds a slash after folder names. This mimics the `ls -F` flag in real Linux.

### cd - Change directory

```ts
cd: (args) => {
  const target = args[0] ?? "/home/user";
  const newPath = normalizePath(getCwd(), target);
  const node = resolvePath(newPath);

  if (!node) {
    return `cd: no such file or directory: ${args[0]}`;
  }

  if (node.type !== "folder") {
    return `cd: not a directory: ${args[0]}`;
  }

  setCwd(newPath);
  return "";
},
```

**`args[0] ?? "/home/user"`**

If no argument given, go home. Just like typing `cd` with no arguments in a real terminal.

**`setCwd(newPath)`**

This updates the module-level cwd variable. After this, `getCwd()` returns the new path, and the prompt updates on the next render.

**Empty string return**

`cd` produces no output on success, matching real Linux behavior. The terminal just shows a new prompt at the new path.

### cat - Display file contents

```ts
cat: (args) => {
  if (args.length === 0) {
    return "cat: missing file operand";
  }

  const outputs: string[] = [];

  for (const arg of args) {
    const fullPath = normalizePath(getCwd(), arg);
    const node = resolvePath(fullPath);

    if (!node) {
      outputs.push(`cat: ${arg}: No such file or directory`);
    } else if (node.type === "folder") {
      outputs.push(`cat: ${arg}: Is a directory`);
    } else {
      outputs.push(node.content);
    }
  }

  return outputs.join("\n");
},
```

**Multiple file support**

`cat` can take multiple arguments (`cat file1.txt file2.txt`). We loop through each one, resolve it, and collect the output. This matches real `cat` behavior.

**Three possible outcomes per argument:**
1. Path doesn't exist → error message
2. Path is a folder → "Is a directory" error (just like real Linux)
3. Path is a file → print its content

---

## Updated: Terminal.tsx - CWD in React

```ts
const [cwd, setCwdState] = useState(getCwd());

const handleCommand = (command: string) => {
  const cwdAtEntry = getCwd();  // Capture BEFORE command runs

  // ... parse and execute command ...

  setCwdState(getCwd());  // Sync React state AFTER command runs
};
```

### Concepts to understand

**Two sources of truth for cwd**

This is the trickiest part of Day 3. We have:
1. `state.ts` module variable - the "real" cwd that commands read/write
2. React `useState` - what triggers re-renders so the prompt updates

Why both? Commands are plain functions that can't trigger React re-renders. So they modify the module variable, and after each command, Terminal syncs that into React state.

**`cwdAtEntry` - Snapshot before execution**

We capture the cwd *before* running the command. Why? Because `cd` changes the cwd, but the history entry should show where you *were* when you typed the command, not where you ended up. If you're in `~` and type `cd documents`, the history should show `user@linux-trainer:~$ cd documents`, not `user@linux-trainer:~/documents$ cd documents`.

**History entries now include cwd**

```ts
{ command: trimmed, output: result.output ?? "", cwd: cwdAtEntry }
```

Each history entry stores the cwd at the time it was entered. This way, scrolling through history shows the correct prompt path for each command.

---

## The data flow (how it all connects)

```
User types "cd documents" at ~/

        |
        v
TerminalInput calls onSubmit("cd documents")
        |
        v
Terminal.handleCommand("cd documents")
  - captures cwdAtEntry = "/home/user"
        |
        v
parseCommand("cd documents")
  - splits: ["cd", "documents"]
  - looks up "cd" handler
  - cd calls normalizePath("/home/user", "documents")
    → "/home/user/documents"
  - cd calls resolvePath("/home/user/documents")
    → FolderNode (exists!)
  - cd calls setCwd("/home/user/documents")
  - returns { output: "" }
        |
        v
Terminal adds to history:
  { command: "cd documents", output: "", cwd: "/home/user" }

Terminal syncs: setCwdState(getCwd())
  → React re-renders with new cwd
        |
        v
Prompt now shows: user@linux-trainer:~/documents$
```

---

## Key TypeScript/React concepts from today

| Concept | Example | What it means |
|---------|---------|---------------|
| Discriminated union | `FsNode = FileNode \| FolderNode` | Union type with a shared discriminant field |
| Type narrowing | `if (node.type === "file")` | TypeScript narrows the type after a check |
| Factory function | `file("name", "content")` | Function that creates objects of a specific shape |
| Module-level state | `let cwd = "/home/user"` | Variable shared across imports, not React state |
| React Fragment | `<>...</>` | Group elements without adding a DOM wrapper |
| DRY principle | Shared Prompt component | Don't repeat the same markup in multiple places |
| Object.values() | `Object.values(node.children)` | Extract all values from an object as an array |
| Array.sort().join() | `entries.sort().join("  ")` | Sort then combine into a single string |

---

## Questions to quiz yourself

1. Why do we use a module variable for cwd instead of React state?
2. What does `normalizePath("/home/user", "../..")` return?
3. Why does the history entry store cwd *before* the command runs?
4. What happens if you type `cat documents` (a folder, not a file)?
5. How does TypeScript know that `node.content` exists after `if (node.type === "file")`?
6. Why does `resolvePath` return `null` instead of throwing an error?

### Answers (don't peek until you've tried!)

1. Because commands are plain functions, not React components. They can't call `useState` or `useEffect`. Module variables are accessible from any imported file.

2. `"/"`. Starting at `/home/user`, first `..` goes to `/home`, second `..` goes to `/`. The stack pops twice.

3. Because the prompt should show where you *were* when you typed the command. If you type `cd /etc` from `~`, the history line should show the `~` prompt, not `/etc`.

4. You get `cat: documents: Is a directory`. The cat command checks `node.type` and returns an error for folders, just like real Linux.

5. Discriminated union + type narrowing. TypeScript sees that `FsNode` has two variants distinguished by `type`. After checking `type === "file"`, it knows the node must be `FileNode`, which has a `content` field.

6. Returning `null` is gentler than throwing. The caller can check for `null` and show a friendly error message. Throwing would crash the app unless every call site has a try/catch.

---

## The Guided Lesson System

This is the feature that turns the app from a sandbox into a trainer. A left panel shows tasks, and the terminal validates commands in real time.

### File: types.ts - The lesson data model

```ts
export type TaskCheck = {
  command: string;
  output: string;
};

export type LessonTask = {
  id: string;
  instruction: string;
  hint: string;
  check: (entry: TaskCheck) => boolean;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  tasks: LessonTask[];
};
```

**`check: (entry: TaskCheck) => boolean`**

Each task has a `check` function that receives what the user typed and what the terminal output was. It returns `true` if the task is satisfied. This makes validation flexible — some tasks just check the command name, others also verify the output.

**Why pass both command and output?**

Consider `cat hostname`. You could type that from any directory, but it only works from `/etc`. By checking the output too, we can verify the task was actually completed successfully:

```ts
check: ({ command, output }) =>
  command === "cat hostname" && output.includes("linux-trainer"),
```

### File: lessonList.ts - Lesson content

```ts
const lessons: Lesson[] = [
  {
    id: "basics",
    title: "Lesson 1: Terminal Basics",
    tasks: [
      {
        id: "basics-help",
        instruction: "Type `help` to see all available commands",
        hint: "Just type: help",
        check: ({ command }) => command === "help",
      },
      // ... more tasks
    ],
  },
  // ... more lessons
];
```

**Data-driven design**

Lessons are just data — arrays of objects. Adding a new lesson means adding another object to the array. No component code changes needed. This is the same pattern we used for commands: data and logic are separate.

### File: LessonPanel.tsx - The sidebar UI

```ts
type LessonPanelProps = {
  lessons: Lesson[];
  currentLessonIndex: number;
  completedTasks: Set<string>;
  onSelectLesson: (index: number) => void;
};
```

**`Set<string>` for completed tasks**

We use a `Set` instead of an array for completed task IDs. Sets have O(1) lookup (`set.has(id)`), while arrays need O(n) search (`array.includes(id)`). For a small number of tasks it doesn't matter, but it's the right data structure for "is this item in the collection?" questions.

**The completion check**

```ts
const allDone = lesson.tasks.every((t) => completedTasks.has(t.id));
```

`Array.every()` returns `true` only if every element passes the test. Here it checks if every task in the current lesson is in the completed set. When all tasks are done, we show a "Lesson complete!" message.

### File: App.tsx - Where it all connects

```ts
function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleCommandExecuted = useCallback(
    (entry: TaskCheck) => {
      const lesson = lessons[currentLessonIndex];

      for (const task of lesson.tasks) {
        if (task.check(entry)) {
          setCompletedTasks((prev) => {
            if (prev.has(task.id)) return prev;
            const next = new Set(prev);
            next.add(task.id);
            return next;
          });
        }
      }
    },
    [currentLessonIndex]
  );

  return (
    <div className="flex h-screen">
      <div className="w-[30%] min-w-[280px] max-w-[400px]">
        <LessonPanel ... />
      </div>
      <div className="flex-1">
        <Terminal onCommandExecuted={handleCommandExecuted} />
      </div>
    </div>
  );
}
```

### Concepts to understand

**`useCallback` — Memoized function**

`useCallback` wraps a function so React doesn't recreate it on every render. Without it, `handleCommandExecuted` would be a new function object every time App re-renders, which would cause Terminal to re-render too (since its prop changed). With `useCallback`, the function only changes when `currentLessonIndex` changes.

**Immutable state updates with Set**

React state must be updated immutably — you can't modify the existing Set, you must create a new one:

```ts
setCompletedTasks((prev) => {
  if (prev.has(task.id)) return prev;  // Already done, no update needed
  const next = new Set(prev);          // Create a new Set (copy)
  next.add(task.id);                   // Add to the new Set
  return next;                         // Replace old with new
});
```

Why? React uses reference equality (`===`) to detect changes. If you mutate the existing Set and return it, `prev === next` is `true`, and React skips the re-render. Creating a new Set ensures React sees the change.

**The callback pattern (child notifies parent)**

Terminal doesn't know about lessons. It just calls `onCommandExecuted` after each command. App receives this callback and checks it against lesson tasks. This keeps Terminal focused on being a terminal, and App handles the lesson logic. This is called "inverse data flow" in React — data flows down (props), events flow up (callbacks).

**`prev.has(task.id) return prev` — Skip unnecessary updates**

If the task is already completed, we return the existing Set unchanged. This prevents a pointless re-render. It's a small optimization, but it's a good habit.

---

## The Block Cursor

Real Linux terminals use a block cursor, not a thin vertical line. We can't style the browser's native caret as a block reliably, so we hide it and render our own.

### How it works

```ts
const [cursorPos, setCursorPos] = useState(0);

// Split text at the cursor position
const beforeCursor = input.slice(0, cursorPos);
const cursorChar = input[cursorPos] ?? " ";
const afterCursor = input.slice(cursorPos + 1);

return (
  <>
    <span className="text-gray-100">{beforeCursor}</span>
    <span className="bg-green-400 text-gray-900 animate-blink">{cursorChar}</span>
    <span className="text-gray-100">{afterCursor}</span>

    {/* Hidden input captures actual keystrokes */}
    <input className="absolute opacity-0 w-0 h-0" ... />
  </>
);
```

**The trick: hidden input + visible overlay**

The real `<input>` is invisible (`opacity-0`, `w-0`, `h-0`). It captures keystrokes and selection events, but the user sees our custom-rendered text with a block cursor highlight.

**`input[cursorPos] ?? " "`**

When the cursor is at the end of the text, there's no character under it. We use `?? " "` to show a space character instead, giving the cursor block something to highlight. This matches real terminal behavior — the cursor always has a visible block, even on empty space.

**CSS blink animation**

```css
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
```

`step-end` timing makes it snap between visible and hidden, rather than fading, just like a real terminal cursor.

**`onSelect` for cursor position tracking**

```ts
const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
  const target = e.target as HTMLInputElement;
  setCursorPos(target.selectionStart ?? input.length);
};
```

The `onSelect` event fires whenever the cursor position changes (clicking, arrow keys, home/end). We read `selectionStart` from the hidden input and use it to position our visible block cursor.

---

## Updated data flow (with lessons)

```
User types "ls" in terminal

        |
        v
TerminalInput → onSubmit("ls")
        |
        v
Terminal.handleCommand("ls")
  - parses, executes, adds to history
  - calls onCommandExecuted({ command: "ls", output: "documents/  ..." })
        |
        v
App.handleCommandExecuted
  - loops through current lesson's tasks
  - task "fs-ls" has check: ({ command }) => command === "ls"
  - check returns true!
  - setCompletedTasks adds "fs-ls" to the Set
        |
        v
React re-renders LessonPanel
  - "Use ls to see what's in your home directory" gets a green checkmark
```

---

## Additional concepts from today

| Concept | Example | What it means |
|---------|---------|---------------|
| useCallback | `useCallback(fn, [deps])` | Memoize a function to prevent unnecessary re-renders |
| Set | `new Set<string>()` | Collection with O(1) lookup, no duplicates |
| Set.every() | `tasks.every(t => set.has(t.id))` | True only if all elements pass the test |
| Immutable update | `new Set(prev)` | Create a new copy instead of mutating |
| Callback prop | `onCommandExecuted` | Child notifies parent of events (inverse data flow) |
| Hidden input | `opacity-0 w-0 h-0` | Invisible but still captures keyboard events |
| CSS animation | `@keyframes blink` | Define animation frames in CSS |

---

## Additional questions

7. Why do we use `Set` instead of an array for completed tasks?
8. What would happen if we mutated the Set instead of creating a new one?
9. Why does `useCallback` take `[currentLessonIndex]` as a dependency?
10. Why is the real `<input>` hidden instead of just styled with a block cursor?

### Answers

7. `Set.has()` is O(1) lookup, `Array.includes()` is O(n). Also, Sets prevent duplicates automatically.

8. React wouldn't re-render. It compares the old and new state by reference (`===`). Mutating returns the same object, so React thinks nothing changed.

9. Because the function uses `currentLessonIndex` to look up the current lesson. If the lesson changes, the function needs to be recreated to reference the new lesson. Without this dependency, it would keep checking the old lesson's tasks.

10. Browser support for `caret-shape: block` is limited and inconsistent. The hidden input approach works everywhere and gives us full control over the cursor appearance and animation.
