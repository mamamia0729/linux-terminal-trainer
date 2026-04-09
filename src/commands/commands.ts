// Each command is a function that takes an array of arguments
// and returns a string (the output to display in the terminal).
//
// We use a Record<string, CommandFn> to map command names to their handlers.
// Think of it like a dictionary: { "pwd": pwdFunction, "ls": lsFunction, ... }

import { resolvePath, normalizePath } from "../filesystem/fileSystem";
import type { FolderNode } from "../filesystem/fileSystem";
import { getCwd, setCwd } from "../filesystem/state";

type CommandFn = (args: string[]) => string;

const commands: Record<string, CommandFn> = {
  // pwd — print working directory
  // Now reads from the filesystem state instead of returning a hardcoded path
  pwd: () => getCwd(),

  // ls — list directory contents
  // With no arguments, lists the current directory.
  // With an argument, lists that path instead.
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

    // Get the names of all children in this folder.
    // Folders get a trailing "/" to visually distinguish them from files,
    // just like "ls -F" does in a real terminal.
    const entries = Object.values(node.children).map((child) =>
      child.type === "folder" ? child.name + "/" : child.name
    );

    if (entries.length === 0) {
      return ""; // Empty directory, no output
    }

    return entries.sort().join("  ");
  },

  // cd — change directory
  // Resolves the target path, checks it's a folder, and updates cwd.
  // With no arguments, goes to /home/user (home directory), like a real shell.
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
    return ""; // cd produces no output on success, just like in real Linux
  },

  // cat — concatenate and print file contents
  // Takes one or more filenames and prints their contents.
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

  help: () =>
    [
      "Available commands:",
      "",
      "  pwd      Print the current working directory",
      "  ls       List directory contents",
      "  cd       Change directory (cd .., cd /home, cd documents)",
      "  cat      Display file contents (cat readme.txt)",
      "  clear    Clear the terminal screen",
      "  help     Show this help message",
    ].join("\n"),
};

export default commands;
