# Day 6 — Text Filters (LPIC-1 103.2)

## What we built

Added a new guided lesson for LPIC-1 objective 103.2: "Process text streams using filters." This lesson teaches `head`, `tail`, `wc`, and `sort` through 7 hands-on tasks using a todo list file.

No new commands were needed — all four were already implemented on Day 5. Today was about making them teachable.

---

## Why text filters matter

On a real Linux server, you almost never read an entire file. You:

- Check the **last 20 lines** of a log to see what just happened (`tail`)
- Look at the **first few lines** of a config to check the header (`head`)
- **Count** how many lines match a pattern (`wc -l`)
- **Sort** output to find duplicates or spot patterns (`sort`)

These are the building blocks of every Linux pipeline. Once you know filters, you can chain them with pipes (Day 7) to do powerful things in one line.

---

## The lesson flow

The lesson walks through a realistic scenario: you have a `todo.txt` file and you want to inspect it without reading the whole thing.

| Step | Command | What you learn |
|------|---------|---------------|
| 1 | `cd documents` | Navigate to where the file is |
| 2 | `cat todo.txt` | See the full file first |
| 3 | `head -n 3 todo.txt` | Show only the first 3 lines |
| 4 | `tail -n 2 todo.txt` | Show only the last 2 lines |
| 5 | `wc -l todo.txt` | Count the lines |
| 6 | `wc todo.txt` | See lines, words, and characters |
| 7 | `sort todo.txt` | Sort lines alphabetically |

The progression is intentional: first see the whole file (cat), then slice it (head/tail), then measure it (wc), then reorder it (sort). Each step builds on the previous one.

---

## How the commands work (recap from Day 5)

### `head -n N file`

Splits the file content on newlines, takes the first N lines with `.slice(0, N)`, joins them back.

```ts
head: (args) => {
  // parse -n flag
  // ...
  outputs.push(node.content.split("\n").slice(0, lines).join("\n"));
}
```

Default is 10 lines if no `-n` flag is given.

### `tail -n N file`

Same idea, but takes from the end with `.slice(-N)`.

```ts
const allLines = node.content.split("\n");
outputs.push(allLines.slice(-lines).join("\n"));
```

Negative slice in JavaScript means "count from the end" — `slice(-2)` gives you the last 2 elements.

### `wc file`

Counts three things:
- **Lines:** split on `\n`, count the pieces
- **Words:** split on whitespace (`/\s+/`), filter out empty strings, count
- **Characters:** `.length` of the whole string

Supports flags: `-l` (lines only), `-w` (words only), `-c` (chars only). No flag = show all three.

### `sort file`

Splits on newlines, calls JavaScript's `.sort()` (alphabetical by default), joins back. Supports `-r` for reverse.

---

## What changed in the code

### `lessonList.ts`

Moved the 103.2 text filters lesson from `futureLessons.ts` into the active lesson list. This is the same pattern we'll follow for each future day: the lesson content is pre-written, we just move it into production.

### `futureLessons.ts`

Removed the 103.2 entry and updated the comment header. The next lesson in the queue is now Day 7: 103.4 Pipes & Redirects.

### No new commands

All four commands (`head`, `tail`, `wc`, `sort`) were implemented on Day 5 as part of the LPIC-1 alignment. Today was purely about releasing the guided lesson.

---

## The virtual filesystem file

The lesson uses `~/documents/todo.txt`:

```
1. Learn basic terminal commands
2. Practice navigating the filesystem
3. Write a shell script
4. Study for LPIC-1
5. Set up a home lab
```

5 lines, numbered, simple enough to see exactly what each filter does. When you run `head -n 3`, you get lines 1–3. When you run `tail -n 2`, you get lines 4–5. When you run `wc -l`, you get `5`. No ambiguity.

---

## Concepts learned

| Concept | What it means |
|---------|--------------|
| `head` | Show the first N lines of a file (default 10) |
| `tail` | Show the last N lines of a file (default 10) |
| `wc` | Word count: lines (-l), words (-w), characters (-c) |
| `sort` | Reorder lines alphabetically (or reverse with -r) |
| Text stream | A sequence of lines flowing through a command, the core idea behind Unix filters |
| LPIC-1 103.2 | "Process text streams using filters," weight 2 on the exam |

## How to test

1. `npm run dev`
2. Select "103.2, Text Filters" from the lesson dropdown
3. Follow the 7 tasks in order
4. Try variations: `head -n 1 todo.txt`, `tail -n 4 todo.txt`, `wc -w todo.txt`
5. Notice that `sort` reorders the numbered lines alphabetically (1, 2, 3...), not numerically — this is how real `sort` works too
