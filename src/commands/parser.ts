// The parser takes a raw input string and figures out what to do with it.
//
// Supports:
// - Simple commands: "ls", "cat file.txt"
// - Pipes: "cat file.txt | grep error"
// - Redirects: "echo hello > file.txt", "echo more >> file.txt"
// - Bang expansion: "!!" re-runs the last command

import commands from "./commands";
import { getLastCommand } from "./historyState";
import { normalizePath, resolvePath, resolveParent } from "../filesystem/fileSystem";
import { getCwd } from "../filesystem/state";

export type CommandResult = {
  output: string | null;
  action?: "clear";
};

// Commands that can receive piped input (they read from stdin when piped)
function runCommandWithInput(
  name: string,
  args: string[],
  stdin: string
): string {
  const handler = commands[name];
  if (!handler) return `${name}: command not found`;

  // For grep with pipe: grep <pattern> (no file arg, uses stdin)
  if (name === "grep" && args.length === 1) {
    const pattern = args[0];
    let regex: RegExp;
    try {
      regex = new RegExp(pattern);
    } catch {
      return `grep: Invalid regular expression '${pattern}'`;
    }
    return stdin
      .split("\n")
      .filter((line) => regex.test(line))
      .join("\n");
  }

  // For grep -i/-n/-c/-v with pipe
  if (name === "grep") {
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

    // If there's only a pattern (no file), use stdin
    if (positional.length === 1) {
      const pattern = positional[0];
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, ignoreCase ? "i" : "");
      } catch {
        return `grep: Invalid regular expression '${pattern}'`;
      }
      const lines = stdin.split("\n");
      const matched = lines
        .map((line, i) => ({ line, num: i + 1 }))
        .filter(({ line }) => (invert ? !regex.test(line) : regex.test(line)));

      if (countOnly) return String(matched.length);
      return matched
        .map(({ line, num }) => (showLineNums ? `${num}:${line}` : line))
        .join("\n");
    }
  }

  // head with pipe
  if (name === "head") {
    let lines = 10;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        lines = parseInt(args[i + 1]);
        break;
      } else if (args[i].startsWith("-") && !isNaN(parseInt(args[i].slice(1)))) {
        lines = parseInt(args[i].slice(1));
      }
    }
    // Only use stdin if no file args
    const fileArgs = args.filter((a) => !a.startsWith("-") && !/^\d+$/.test(a));
    if (fileArgs.length === 0) {
      return stdin.split("\n").slice(0, lines).join("\n");
    }
  }

  // tail with pipe
  if (name === "tail") {
    let lines = 10;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        lines = parseInt(args[i + 1]);
        break;
      } else if (args[i].startsWith("-") && !isNaN(parseInt(args[i].slice(1)))) {
        lines = parseInt(args[i].slice(1));
      }
    }
    const fileArgs = args.filter((a) => !a.startsWith("-") && !/^\d+$/.test(a));
    if (fileArgs.length === 0) {
      const allLines = stdin.split("\n");
      return allLines.slice(-lines).join("\n");
    }
  }

  // wc with pipe
  if (name === "wc") {
    let showLines = false;
    let showWords = false;
    let showChars = false;
    const fileArgs: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("l")) showLines = true;
        if (arg.includes("w")) showWords = true;
        if (arg.includes("c")) showChars = true;
      } else {
        fileArgs.push(arg);
      }
    }

    if (!showLines && !showWords && !showChars) {
      showLines = showWords = showChars = true;
    }

    if (fileArgs.length === 0) {
      const parts: string[] = [];
      if (showLines) parts.push(String(stdin.split("\n").length).padStart(4));
      if (showWords) parts.push(String(stdin.split(/\s+/).filter(Boolean).length).padStart(4));
      if (showChars) parts.push(String(stdin.length).padStart(4));
      return parts.join(" ");
    }
  }

  // sort with pipe
  if (name === "sort") {
    const fileArgs = args.filter((a) => !a.startsWith("-"));
    if (fileArgs.length === 0) {
      const lines = stdin.split("\n");
      lines.sort();
      if (args.includes("-r")) lines.reverse();
      return lines.join("\n");
    }
  }

  // uniq with pipe
  if (name === "uniq") {
    const fileArgs = args.filter((a) => !a.startsWith("-"));
    if (fileArgs.length === 0) {
      const lines = stdin.split("\n");
      const result: { line: string; count: number }[] = [];
      for (const line of lines) {
        if (result.length > 0 && result[result.length - 1].line === line) {
          result[result.length - 1].count++;
        } else {
          result.push({ line, count: 1 });
        }
      }
      if (args.includes("-c")) {
        return result.map((r) => `${String(r.count).padStart(4)} ${r.line}`).join("\n");
      }
      return result.map((r) => r.line).join("\n");
    }
  }

  // cut with pipe
  if (name === "cut") {
    let delimiter = "\t";
    let fields: number[] = [];
    const fileArgs: string[] = [];

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
        fileArgs.push(args[i]);
      }
    }

    if (fileArgs.length === 0) {
      return stdin
        .split("\n")
        .map((line) => {
          const parts = line.split(delimiter);
          return fields.map((f) => parts[f] ?? "").join(delimiter);
        })
        .join("\n");
    }
  }

  // Default: just run the command normally
  return handler(args);
}

export function parseCommand(input: string): CommandResult {
  let expanded = input.trim();

  // !! (bang bang) — replace with the last command
  if (expanded === "!!") {
    const last = getLastCommand();
    if (!last) return { output: "!!: event not found" };
    const result = parseCommand(last);
    if (result.output !== null) {
      result.output = last + "\n" + result.output;
    }
    return result;
  }

  // Check for output redirect: > or >>
  let redirectFile: string | null = null;
  let appendMode = false;
  const appendMatch = expanded.match(/^(.+?)\s*>>\s*(\S+)\s*$/);
  const writeMatch = expanded.match(/^(.+?)\s*>\s*(\S+)\s*$/);

  if (appendMatch) {
    expanded = appendMatch[1];
    redirectFile = appendMatch[2];
    appendMode = true;
  } else if (writeMatch) {
    expanded = writeMatch[1];
    redirectFile = writeMatch[2];
  }

  // Check for pipes: cmd1 | cmd2 | cmd3
  const pipeSegments = expanded.split(/\s*\|\s*/);
  let output = "";

  for (let i = 0; i < pipeSegments.length; i++) {
    const segment = pipeSegments[i].trim();
    const parts = segment.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === "clear") {
      return { output: null, action: "clear" };
    }

    if (i === 0) {
      // First command in the pipe — no stdin
      const handler = commands[command];
      if (!handler) return { output: `${command}: command not found` };
      output = handler(args);
    } else {
      // Subsequent commands — receive previous output as stdin
      output = runCommandWithInput(command, args, output);
    }
  }

  // Handle redirect
  if (redirectFile) {
    const fullPath = normalizePath(getCwd(), redirectFile);
    const existing = resolvePath(fullPath);

    if (existing && existing.type === "folder") {
      return { output: `bash: ${redirectFile}: Is a directory` };
    }

    if (existing && existing.type === "file") {
      existing.content = appendMode
        ? existing.content + "\n" + output
        : output;
    } else {
      const result = resolveParent(fullPath);
      if (!result) {
        return { output: `bash: ${redirectFile}: No such file or directory` };
      }
      result.parent.children[result.childName] = {
        type: "file",
        name: result.childName,
        content: output,
        permissions: "rw-r--r--",
      };
    }
    return { output: "" };
  }

  return { output };
}
