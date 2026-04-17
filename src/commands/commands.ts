// Each command is a function that takes an array of arguments
// and returns a string (the output to display in the terminal).
//
// We use a Record<string, CommandFn> to map command names to their handlers.
// Think of it like a dictionary: { "pwd": pwdFunction, "ls": lsFunction, ... }

import {
  resolvePath,
  normalizePath,
  resolveParent,
  cloneNode,
} from "../filesystem/fileSystem";
import type { FsNode } from "../filesystem/fileSystem";
import { getCwd, setCwd, getEnv, setEnv, getAllEnv } from "../filesystem/state";
import { getHistory } from "./historyState";

export type CommandFn = (args: string[]) => string;

// Parse octal "754" into permission string "rwxr-xr--"
function octalToPerm(octal: string): string {
  let perm = "";
  for (const ch of octal) {
    const val = parseInt(ch);
    perm += val & 4 ? "r" : "-";
    perm += val & 2 ? "w" : "-";
    perm += val & 1 ? "x" : "-";
  }
  return perm;
}

const commands: Record<string, CommandFn> = {
  // pwd — print working directory
  pwd: () => getCwd(),

  // ls — list directory contents
  // Supports: ls, ls <path>, ls -l, ls -a, ls -la
  ls: (args) => {
    let showLong = false;
    let showHidden = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("l")) showLong = true;
        if (arg.includes("a")) showHidden = true;
      } else {
        paths.push(arg);
      }
    }

    const target = paths[0]
      ? normalizePath(getCwd(), paths[0])
      : getCwd();

    const node = resolvePath(target);

    if (!node) {
      return `ls: cannot access '${paths[0] ?? "."}': No such file or directory`;
    }

    if (node.type === "file") {
      if (showLong) {
        return `-${node.permissions} 1 user user ${String(node.content.length).padStart(5)} ${node.name}`;
      }
      return node.name;
    }

    let entries = Object.values(node.children);

    // Filter hidden files unless -a
    if (!showHidden) {
      entries = entries.filter((child) => !child.name.startsWith("."));
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    if (entries.length === 0) return "";

    if (showLong) {
      return entries
        .map((child) => {
          const typeChar = child.type === "folder" ? "d" : "-";
          const size =
            child.type === "file"
              ? String(child.content.length).padStart(5)
              : "4096".padStart(5);
          const name =
            child.type === "folder" ? child.name + "/" : child.name;
          return `${typeChar}${child.permissions} 1 user user ${size} ${name}`;
        })
        .join("\n");
    }

    return entries
      .map((child) =>
        child.type === "folder" ? child.name + "/" : child.name
      )
      .sort()
      .join("  ");
  },

  // cd — change directory
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

  // cat — concatenate and print file contents
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

  // head — show first N lines of a file (default 10)
  head: (args) => {
    let lines = 10;
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        lines = parseInt(args[i + 1]);
        i++;
      } else if (args[i].startsWith("-") && !isNaN(parseInt(args[i].slice(1)))) {
        lines = parseInt(args[i].slice(1));
      } else {
        files.push(args[i]);
      }
    }

    if (files.length === 0) return "head: missing file operand";

    const outputs: string[] = [];
    for (const f of files) {
      const fullPath = normalizePath(getCwd(), f);
      const node = resolvePath(fullPath);
      if (!node) {
        outputs.push(`head: ${f}: No such file or directory`);
      } else if (node.type === "folder") {
        outputs.push(`head: ${f}: Is a directory`);
      } else {
        outputs.push(node.content.split("\n").slice(0, lines).join("\n"));
      }
    }
    return outputs.join("\n");
  },

  // tail — show last N lines of a file (default 10)
  tail: (args) => {
    let lines = 10;
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        lines = parseInt(args[i + 1]);
        i++;
      } else if (args[i].startsWith("-") && !isNaN(parseInt(args[i].slice(1)))) {
        lines = parseInt(args[i].slice(1));
      } else {
        files.push(args[i]);
      }
    }

    if (files.length === 0) return "tail: missing file operand";

    const outputs: string[] = [];
    for (const f of files) {
      const fullPath = normalizePath(getCwd(), f);
      const node = resolvePath(fullPath);
      if (!node) {
        outputs.push(`tail: ${f}: No such file or directory`);
      } else if (node.type === "folder") {
        outputs.push(`tail: ${f}: Is a directory`);
      } else {
        const allLines = node.content.split("\n");
        outputs.push(allLines.slice(-lines).join("\n"));
      }
    }
    return outputs.join("\n");
  },

  // wc — word count (lines, words, chars)
  // Supports: wc <file>, wc -l <file>, wc -w <file>, wc -c <file>
  wc: (args) => {
    let showLines = false;
    let showWords = false;
    let showChars = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("l")) showLines = true;
        if (arg.includes("w")) showWords = true;
        if (arg.includes("c")) showChars = true;
      } else {
        files.push(arg);
      }
    }

    // Default: show all three
    if (!showLines && !showWords && !showChars) {
      showLines = showWords = showChars = true;
    }

    if (files.length === 0) return "wc: missing file operand";

    const outputs: string[] = [];
    for (const f of files) {
      const fullPath = normalizePath(getCwd(), f);
      const node = resolvePath(fullPath);
      if (!node) {
        outputs.push(`wc: ${f}: No such file or directory`);
        continue;
      }
      if (node.type === "folder") {
        outputs.push(`wc: ${f}: Is a directory`);
        continue;
      }

      const content = node.content;
      const parts: string[] = [];
      if (showLines) parts.push(String(content.split("\n").length).padStart(4));
      if (showWords) parts.push(String(content.split(/\s+/).filter(Boolean).length).padStart(4));
      if (showChars) parts.push(String(content.length).padStart(4));
      parts.push(f);
      outputs.push(parts.join(" "));
    }
    return outputs.join("\n");
  },

  // sort — sort lines of a file
  sort: (args) => {
    const reverse = args.includes("-r");
    const files = args.filter((a) => !a.startsWith("-"));

    if (files.length === 0) return "sort: missing file operand";

    const fullPath = normalizePath(getCwd(), files[0]);
    const node = resolvePath(fullPath);
    if (!node) return `sort: ${files[0]}: No such file or directory`;
    if (node.type === "folder") return `sort: ${files[0]}: Is a directory`;

    const lines = node.content.split("\n");
    lines.sort();
    if (reverse) lines.reverse();
    return lines.join("\n");
  },

  // uniq — filter adjacent duplicate lines
  uniq: (args) => {
    const countFlag = args.includes("-c");
    const files = args.filter((a) => !a.startsWith("-"));

    if (files.length === 0) return "uniq: missing file operand";

    const fullPath = normalizePath(getCwd(), files[0]);
    const node = resolvePath(fullPath);
    if (!node) return `uniq: ${files[0]}: No such file or directory`;
    if (node.type === "folder") return `uniq: ${files[0]}: Is a directory`;

    const lines = node.content.split("\n");
    const result: { line: string; count: number }[] = [];

    for (const line of lines) {
      if (result.length > 0 && result[result.length - 1].line === line) {
        result[result.length - 1].count++;
      } else {
        result.push({ line, count: 1 });
      }
    }

    if (countFlag) {
      return result.map((r) => `${String(r.count).padStart(4)} ${r.line}`).join("\n");
    }
    return result.map((r) => r.line).join("\n");
  },

  // cut — extract columns from text
  // Supports: cut -d<delim> -f<fields> <file>
  cut: (args) => {
    let delimiter = "\t";
    let fields: number[] = [];
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-d" && args[i + 1]) {
        delimiter = args[i + 1];
        i++;
      } else if (args[i].startsWith("-d")) {
        delimiter = args[i].slice(2);
      } else if (args[i] === "-f" && args[i + 1]) {
        fields = args[i + 1].split(",").map((n) => parseInt(n) - 1);
        i++;
      } else if (args[i].startsWith("-f")) {
        fields = args[i].slice(2).split(",").map((n) => parseInt(n) - 1);
      } else {
        files.push(args[i]);
      }
    }

    if (files.length === 0) return "cut: missing file operand";

    const fullPath = normalizePath(getCwd(), files[0]);
    const node = resolvePath(fullPath);
    if (!node) return `cut: ${files[0]}: No such file or directory`;
    if (node.type === "folder") return `cut: ${files[0]}: Is a directory`;

    return node.content
      .split("\n")
      .map((line) => {
        const parts = line.split(delimiter);
        return fields.map((f) => parts[f] ?? "").join(delimiter);
      })
      .join("\n");
  },

  // grep — search for patterns in files
  // Supports: grep <pattern> <file>, grep -i, grep -c, grep -n, grep -v
  grep: (args) => {
    let ignoreCase = false;
    let countOnly = false;
    let showLineNums = false;
    let invert = false;
    const positional: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-") && !arg.startsWith("--")) {
        if (arg.includes("i")) ignoreCase = true;
        if (arg.includes("c")) countOnly = true;
        if (arg.includes("n")) showLineNums = true;
        if (arg.includes("v")) invert = true;
      } else {
        positional.push(arg);
      }
    }

    if (positional.length < 2) {
      return "Usage: grep [options] PATTERN FILE";
    }

    const pattern = positional[0];
    const files = positional.slice(1);
    const outputs: string[] = [];

    for (const f of files) {
      const fullPath = normalizePath(getCwd(), f);
      const node = resolvePath(fullPath);
      if (!node) {
        outputs.push(`grep: ${f}: No such file or directory`);
        continue;
      }
      if (node.type === "folder") {
        outputs.push(`grep: ${f}: Is a directory`);
        continue;
      }

      const lines = node.content.split("\n");
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, ignoreCase ? "i" : "");
      } catch {
        return `grep: Invalid regular expression '${pattern}'`;
      }

      const matched = lines
        .map((line, i) => ({ line, num: i + 1 }))
        .filter(({ line }) => (invert ? !regex.test(line) : regex.test(line)));

      if (countOnly) {
        outputs.push(String(matched.length));
      } else {
        for (const { line, num } of matched) {
          const prefix = showLineNums ? `${num}:` : "";
          outputs.push(prefix + line);
        }
      }
    }

    return outputs.join("\n");
  },

  // mkdir — create a new directory
  mkdir: (args) => {
    if (args.length === 0) return "mkdir: missing operand";

    for (const arg of args) {
      const fullPath = normalizePath(getCwd(), arg);
      const result = resolveParent(fullPath);

      if (!result) {
        return `mkdir: cannot create directory '${arg}': No such file or directory`;
      }
      if (result.parent.children[result.childName]) {
        return `mkdir: cannot create directory '${arg}': File exists`;
      }

      result.parent.children[result.childName] = {
        type: "folder",
        name: result.childName,
        children: {},
        permissions: "rwxr-xr-x",
      };
    }
    return "";
  },

  // touch — create an empty file
  touch: (args) => {
    if (args.length === 0) return "touch: missing file operand";

    for (const arg of args) {
      const fullPath = normalizePath(getCwd(), arg);
      const existing = resolvePath(fullPath);
      if (existing) continue;

      const result = resolveParent(fullPath);
      if (!result) {
        return `touch: cannot touch '${arg}': No such file or directory`;
      }

      result.parent.children[result.childName] = {
        type: "file",
        name: result.childName,
        content: "",
        permissions: "rw-r--r--",
      };
    }
    return "";
  },

  // cp — copy files
  cp: (args) => {
    if (args.length < 2) return "cp: missing file operand";

    const srcPath = normalizePath(getCwd(), args[0]);
    const srcNode = resolvePath(srcPath);

    if (!srcNode) return `cp: cannot stat '${args[0]}': No such file or directory`;
    if (srcNode.type === "folder") return `cp: omitting directory '${args[0]}'`;

    const destPath = normalizePath(getCwd(), args[1]);
    const destNode = resolvePath(destPath);

    if (destNode && destNode.type === "folder") {
      destNode.children[srcNode.name] = cloneNode(srcNode);
      return "";
    }

    const result = resolveParent(destPath);
    if (!result) return `cp: cannot create '${args[1]}': No such file or directory`;

    const copy = cloneNode(srcNode) as { name: string };
    copy.name = result.childName;
    result.parent.children[result.childName] = copy as FsNode;
    return "";
  },

  // mv — move or rename
  mv: (args) => {
    if (args.length < 2) return "mv: missing file operand";

    const srcPath = normalizePath(getCwd(), args[0]);
    const srcNode = resolvePath(srcPath);
    if (!srcNode) return `mv: cannot stat '${args[0]}': No such file or directory`;

    const srcParent = resolveParent(srcPath);
    if (!srcParent) return `mv: cannot move '${args[0]}'`;

    const destPath = normalizePath(getCwd(), args[1]);
    const destNode = resolvePath(destPath);

    if (destNode && destNode.type === "folder") {
      delete srcParent.parent.children[srcParent.childName];
      destNode.children[srcNode.name] = srcNode;
      return "";
    }

    const destParent = resolveParent(destPath);
    if (!destParent) return `mv: cannot move '${args[1]}': No such file or directory`;

    delete srcParent.parent.children[srcParent.childName];
    srcNode.name = destParent.childName;
    destParent.parent.children[destParent.childName] = srcNode;
    return "";
  },

  // rm — remove files
  rm: (args) => {
    if (args.length === 0) return "rm: missing operand";

    const recursive = args[0] === "-r" || args[0] === "-rf";
    const targets = recursive ? args.slice(1) : args;
    if (targets.length === 0) return "rm: missing operand";

    for (const target of targets) {
      const fullPath = normalizePath(getCwd(), target);
      const node = resolvePath(fullPath);
      if (!node) return `rm: cannot remove '${target}': No such file or directory`;
      if (node.type === "folder" && !recursive) return `rm: cannot remove '${target}': Is a directory`;

      const parentResult = resolveParent(fullPath);
      if (!parentResult) return `rm: cannot remove '${target}'`;
      delete parentResult.parent.children[parentResult.childName];
    }
    return "";
  },

  // chmod — change file permissions
  // Supports octal mode: chmod 755 <file>
  chmod: (args) => {
    if (args.length < 2) return "chmod: missing operand";

    const mode = args[0];
    const target = args[1];
    const fullPath = normalizePath(getCwd(), target);
    const node = resolvePath(fullPath);

    if (!node) return `chmod: cannot access '${target}': No such file or directory`;

    // Only support octal for now (e.g. 755, 644)
    if (!/^[0-7]{3}$/.test(mode)) {
      return `chmod: invalid mode: '${mode}' (use octal like 755)`;
    }

    node.permissions = octalToPerm(mode);
    return "";
  },

  // echo — print text
  echo: (args) => {
    // Handle $VAR expansion
    return args
      .map((arg) => {
        if (arg.startsWith("$")) {
          const varName = arg.slice(1);
          return getEnv(varName) ?? "";
        }
        return arg;
      })
      .join(" ");
  },

  // export — set environment variable
  // Usage: export VAR=value
  export: (args) => {
    if (args.length === 0) {
      // Show all variables
      const env = getAllEnv();
      return Object.entries(env)
        .map(([k, v]) => `declare -x ${k}="${v}"`)
        .join("\n");
    }

    for (const arg of args) {
      const eqIndex = arg.indexOf("=");
      if (eqIndex === -1) {
        return `export: '${arg}': not a valid identifier`;
      }
      const key = arg.slice(0, eqIndex);
      const value = arg.slice(eqIndex + 1).replace(/^["']|["']$/g, "");
      setEnv(key, value);
    }
    return "";
  },

  // env — print environment variables
  env: () => {
    const env = getAllEnv();
    return Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
  },

  // find — search for files in directory tree
  // Supports: find <path> -name <pattern>
  find: (args) => {
    let searchPath = getCwd();
    let namePattern = "*";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-name" && args[i + 1]) {
        namePattern = args[i + 1];
        i++;
      } else if (!args[i].startsWith("-")) {
        searchPath = normalizePath(getCwd(), args[i]);
      }
    }

    const startNode = resolvePath(searchPath);
    if (!startNode) return `find: '${args[0]}': No such file or directory`;

    // Convert glob pattern to regex (simple * and ? support)
    const regexStr = namePattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${regexStr}$`);

    const results: string[] = [];

    function walk(node: FsNode, path: string) {
      if (regex.test(node.name)) {
        results.push(path);
      }
      if (node.type === "folder") {
        for (const [name, child] of Object.entries(node.children)) {
          walk(child, path + "/" + name);
        }
      }
    }

    // Start the walk
    if (startNode.type === "folder") {
      results.push(searchPath === "/" ? "/" : searchPath);
      for (const [name, child] of Object.entries(startNode.children)) {
        walk(child, (searchPath === "/" ? "" : searchPath) + "/" + name);
      }
    } else {
      if (regex.test(startNode.name)) results.push(searchPath);
    }

    return results.join("\n");
  },

  // which — show the path of a command
  which: (args) => {
    if (args.length === 0) return "which: missing argument";
    const knownPaths: Record<string, string> = {
      ls: "/usr/bin/ls",
      cat: "/usr/bin/cat",
      grep: "/usr/bin/grep",
      find: "/usr/bin/find",
      chmod: "/usr/bin/chmod",
      mkdir: "/usr/bin/mkdir",
      cp: "/usr/bin/cp",
      mv: "/usr/bin/mv",
      rm: "/usr/bin/rm",
      touch: "/usr/bin/touch",
      head: "/usr/bin/head",
      tail: "/usr/bin/tail",
      wc: "/usr/bin/wc",
      sort: "/usr/bin/sort",
      uniq: "/usr/bin/uniq",
      cut: "/usr/bin/cut",
      echo: "/usr/bin/echo",
      pwd: "/usr/bin/pwd",
      bash: "/usr/bin/bash",
    };

    return args
      .map((cmd) => knownPaths[cmd] ?? `${cmd} not found`)
      .join("\n");
  },

  // whoami — print current user
  whoami: () => "user",

  // uname — print system info
  uname: (args) => {
    if (args.includes("-a")) {
      return "Linux linux-trainer 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux";
    }
    return "Linux";
  },

  // history — show numbered list of past commands
  history: () => {
    const entries = getHistory();
    if (entries.length === 0) return "No commands in history yet.";

    return entries
      .map((cmd, i) => {
        const num = String(i + 1).padStart(5, " ");
        return `${num}  ${cmd}`;
      })
      .join("\n");
  },

  help: () =>
    [
      "Available commands:",
      "",
      "  Navigation:",
      "    pwd        Print the current working directory",
      "    ls         List directory contents (ls -l, ls -a)",
      "    cd         Change directory (cd .., cd /home, cd documents)",
      "",
      "  File Operations:",
      "    cat        Display file contents",
      "    head       Show first lines of a file (head -n 5 file)",
      "    tail       Show last lines of a file (tail -n 5 file)",
      "    touch      Create an empty file",
      "    mkdir      Create a new directory",
      "    cp         Copy a file (cp source dest)",
      "    mv         Move or rename (mv source dest)",
      "    rm         Remove a file (rm file, rm -r folder)",
      "",
      "  Search & Filter:",
      "    grep       Search text in files (grep pattern file)",
      "    find       Find files by name (find . -name '*.txt')",
      "    wc         Count lines, words, chars (wc -l file)",
      "    sort       Sort lines of a file",
      "    uniq       Filter duplicate lines",
      "    cut        Extract columns (cut -d: -f1 file)",
      "",
      "  Environment:",
      "    echo       Print text (supports $VAR expansion)",
      "    export     Set environment variable (export VAR=value)",
      "    env        Show all environment variables",
      "    which      Show path of a command",
      "    whoami     Print current username",
      "    uname      Print system info (uname -a)",
      "",
      "  Other:",
      "    chmod      Change file permissions (chmod 755 file)",
      "    history    Show your command history",
      "    clear      Clear the terminal screen",
      "    help       Show this help message",
      "",
      "  Piping & Redirects:",
      "    cmd | cmd   Pipe output to another command",
      "    cmd > file  Write output to a file",
      "    cmd >> file Append output to a file",
      "",
      "Tips:",
      "  ↑ / ↓      Press arrow keys to recall previous commands",
      "  !!         Re-run your last command",
    ].join("\n"),
};

export default commands;
