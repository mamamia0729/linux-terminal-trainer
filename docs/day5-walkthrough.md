# Day 5 — LPIC-1 Alignment (18 New Commands, Pipes, Redirects)

## What we built

Restructured the entire app around the LPIC-1 certification. Instead of generic "Lesson 1, Lesson 2" labels, every lesson now maps to a real exam objective like 103.1 or 103.3. We also added 18 new commands and support for pipes (`|`) and redirects (`>`, `>>`).

This was the biggest single-day change so far: ~1,800 lines added across 10 files.

---

## Why LPIC-1?

Building a terminal trainer without a syllabus is like studying without a textbook. LPIC-1 gives us:

- A clear scope (topics 103–105 cover hands-on CLI skills)
- Weighted objectives (so we know what matters most)
- A reason for users to care ("this helps you pass a real exam")

Each lesson now shows a blue badge with the LPIC-1 topic code (e.g. `LPIC-1 103.1`) so you always know what you're studying for.

---

## New commands added

### Environment commands
- **`echo`** — prints text, supports `$VAR` expansion (e.g. `echo $HOME`)
- **`export`** — sets environment variables (`export MYNAME=learner`)
- **`env`** — shows all environment variables
- **`which`** — shows the path of a command (`which grep` → `/usr/bin/grep`)
- **`whoami`** — prints `user`
- **`uname`** — prints system info (`uname -a` for full details)

### File operation commands
- **`touch`** — creates an empty file
- **`mkdir`** — creates a new directory
- **`cp`** — copies a file (`cp source dest`)
- **`mv`** — moves or renames a file
- **`rm`** — removes a file (`rm -r` for directories)
- **`chmod`** — changes file permissions using octal mode (`chmod 755 file`)

### Text filter commands
- **`head`** — shows first N lines (`head -n 3 file`)
- **`tail`** — shows last N lines (`tail -n 2 file`)
- **`wc`** — counts lines, words, characters (`wc -l file`)
- **`sort`** — sorts lines alphabetically
- **`uniq`** — filters adjacent duplicate lines (`uniq -c` for counts)
- **`cut`** — extracts columns (`cut -d: -f1 file`)

### Search commands
- **`grep`** — search text with regex, supports `-i`, `-c`, `-n`, `-v` flags
- **`find`** — search for files by name pattern (`find . -name '*.txt'`)

---

## Pipes and redirects in `parser.ts`

This was the most complex change. The parser went from handling simple `command args` to supporting full pipelines.

### How pipes work

```
cat access.log | grep 403 | wc -l
```

The parser splits on `|`, runs each command left to right, and feeds the output of one command as input to the next.

```ts
// Simplified logic:
const segments = input.split("|");
let currentOutput = "";

for (const segment of segments) {
  const [name, ...args] = segment.trim().split(" ");
  currentOutput = runCommandWithInput(name, args, currentOutput);
}
```

### How redirects work

```
grep ERROR error.log > errors_only.txt    # overwrite
grep WARNING error.log >> errors_only.txt  # append
```

The parser detects `>` or `>>` in the command, creates a new file node in the virtual filesystem, and writes the command's output to it.

- `>` creates or overwrites the file
- `>>` creates or appends to the file
- Both use `resolveParent()` to find the target directory

### Piped commands need special handling

When `grep` runs normally, it reads from a file. When it's piped, it reads from stdin (the previous command's output). The `runCommandWithInput()` function handles this:

- If `grep` has only a pattern (no file argument), it filters stdin
- Same logic for `head`, `tail`, `wc`, `sort` — if no file argument, use stdin

This mirrors how real Unix commands work: they read from a file if given one, or from stdin if piped.

---

## Filesystem changes

### Permissions added to every node

Every file and folder now has a `permissions` field:

```ts
export type FileNode = {
  type: "file";
  name: string;
  content: string;
  permissions: string; // e.g. "rw-r--r--"
};
```

This enables `ls -l` to show permission strings and `chmod` to change them.

### New helper functions

- **`resolveParent(path)`** — returns the parent folder and child name for a path. Used by `mkdir`, `touch`, `cp`, `mv`, `rm`, and redirect operations.
- **`cloneNode(node)`** — deep-copies a filesystem node. Used by `cp` so the copy is independent of the original.

### Expanded filesystem content

Added new files to support the LPIC-1 lessons:

- `~/documents/report.txt` — a server status report for text filter practice
- `~/projects/server.py`, `config.yaml` — realistic project files
- `~/scripts/backup.sh`, `cleanup.sh`, `deploy.sh` — shell scripts with varied permissions
- `~/logs/access.log`, `error.log`, `auth.log` — log files for grep and pipe lessons
- `/etc/hosts`, `/etc/passwd`, `/etc/fstab` — standard Linux config files
- `/var/log/syslog` — system log for filesystem hierarchy lessons
- `~/.bashrc`, `~/.profile` — hidden shell config files

---

## Environment variable system in `state.ts`

Added a module-level `env` object with default variables:

```ts
const env: Record<string, string> = {
  HOME: "/home/user",
  USER: "user",
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  SHELL: "/bin/bash",
  // ... more defaults
};
```

Three new functions: `getEnv(key)`, `setEnv(key, value)`, `getAllEnv()`.

The `echo` command checks if arguments start with `$` and expands them. The `export` command parses `VAR=value` and calls `setEnv()`. The `cd` command now also updates `env.PWD` to stay in sync.

---

## Lesson structure changes

### LPIC-1 topic metadata

The `Lesson` type gained two optional fields:

```ts
export type Lesson = {
  id: string;
  title: string;
  description: string;
  topic?: string;      // "103.1"
  topicTitle?: string;  // "Work on the command line"
  tasks: LessonTask[];
};
```

### LessonPanel badge

The LessonPanel now renders a blue badge when `lesson.topic` exists:

```tsx
<span className="bg-blue-900/50 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-blue-800">
  LPIC-1 {lesson.topic}
</span>
```

### Lessons reorganized

From 3 generic lessons to 5 LPIC-1-aligned lessons:

| Old | New |
|-----|-----|
| Lesson 1: Terminal Basics | 103.1, Command Line Basics |
| — | 103.1, Environment Variables |
| Lesson 2: Navigating the Filesystem | 103.3, Navigating the Filesystem |
| Lesson 3: File Operations | 103.3, File Operations |
| — | 103.3, Finding Files |

### Future lessons

7 more lessons are written and waiting in `futureLessons.ts`: text filters, pipes, grep, permissions, shell environment, filesystem hierarchy, and a capstone scenario. These get moved into `lessonList.ts` one day at a time.

---

## Concepts learned

| Concept | What it means |
|---------|--------------|
| Pipe (`\|`) | Connects stdout of one command to stdin of the next |
| Redirect (`>`, `>>`) | Sends command output to a file instead of the screen |
| stdin/stdout | Standard input and output streams, the foundation of Unix pipelines |
| File permissions | `rwxr-xr-x` means owner can read/write/execute, others can read/execute |
| Octal permissions | `755` = rwxr-xr-x, `644` = rw-r--r--, `444` = r--r--r-- |
| Environment variables | Shell-level key-value pairs that configure program behavior |
| Deep clone | Copying an object so changes to the copy don't affect the original |

## How to test

1. `npm run dev`
2. Notice the LPIC-1 badges on each lesson in the sidebar
3. Try the Environment Variables lesson: `env`, `echo $HOME`, `export MYNAME=test`, `echo $MYNAME`
4. Try the Finding Files lesson: `find . -name '*.txt'`, `which ls`
5. Try pipes: `cat access.log | grep 403 | wc -l` (from ~/logs)
6. Try redirects: `grep ERROR error.log > /tmp/report.txt`, then `cat /tmp/report.txt`
7. Try permissions: `ls -l` in ~/scripts, then `chmod 755 cleanup.sh`, then `ls -l` again
