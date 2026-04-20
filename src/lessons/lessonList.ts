// All available lessons, aligned to LPIC-1 exam objectives (v5.0).
// Each lesson maps to a specific LPIC-1 topic so users know exactly
// what exam objective they're practicing.
//
// LPIC-1 = two exams (101-500 and 102-500), topics numbered 101-110.
// We focus on hands-on CLI topics that can be practiced interactively.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  // ─── 103.1 Work on the command line (Weight: 4) ───
  {
    id: "103.1-basics",
    title: "103.1, Command Line Basics",
    description:
      "LPIC-1 objective 103.1: Work on the command line. Learn essential commands, get help, and understand your shell environment.",
    topic: "103.1",
    topicTitle: "Work on the command line",
    tasks: [
      {
        id: "basics-help",
        instruction: "Type `help` to see all available commands",
        hint: "Just type: help",
        check: ({ command }) => command === "help",
      },
      {
        id: "basics-pwd",
        instruction: "Use `pwd` to print your current directory",
        hint: "Just type: pwd",
        check: ({ command }) => command === "pwd",
      },
      {
        id: "basics-whoami",
        instruction: "Use `whoami` to see which user you are",
        hint: "Type: whoami",
        check: ({ command }) => command === "whoami",
      },
      {
        id: "basics-uname",
        instruction: "Use `uname -a` to see system information",
        hint: "Type: uname -a",
        check: ({ command }) => command === "uname -a",
      },
      {
        id: "basics-echo",
        instruction: "Use `echo hello` to print text to the terminal",
        hint: "Type: echo hello",
        check: ({ command }) => command.startsWith("echo "),
      },
      {
        id: "basics-history",
        instruction: "Use `history` to see your previous commands",
        hint: "Just type: history",
        check: ({ command }) => command === "history",
      },
      {
        id: "basics-clear",
        instruction: "Use `clear` to clean up the terminal",
        hint: "Just type: clear",
        check: ({ command }) => command === "clear",
      },
    ],
  },

  {
    id: "103.1-env",
    title: "103.1, Environment Variables",
    description:
      "LPIC-1 objective 103.1 continued: Environment variables control how your shell behaves. Learn to view, set, and use them.",
    topic: "103.1",
    topicTitle: "Work on the command line",
    tasks: [
      {
        id: "env-view",
        instruction: "Type `env` to see all environment variables",
        hint: "Just type: env",
        check: ({ command }) => command === "env",
      },
      {
        id: "env-echo-home",
        instruction: "Print your HOME variable with `echo $HOME`",
        hint: "Type: echo $HOME",
        check: ({ command }) => command === "echo $HOME",
      },
      {
        id: "env-echo-path",
        instruction: "Print your PATH with `echo $PATH`",
        hint: "Type: echo $PATH",
        check: ({ command }) => command === "echo $PATH",
      },
      {
        id: "env-export",
        instruction: "Create a variable: `export MYNAME=learner`",
        hint: "Type: export MYNAME=learner",
        check: ({ command }) =>
          command.startsWith("export MYNAME="),
      },
      {
        id: "env-echo-custom",
        instruction: "Print your new variable with `echo $MYNAME`",
        hint: "Type: echo $MYNAME",
        check: ({ command, output }) =>
          command === "echo $MYNAME" && output.length > 0,
      },
      {
        id: "env-which",
        instruction: "Use `which grep` to find where a command lives",
        hint: "Type: which grep",
        check: ({ command }) => command.startsWith("which "),
      },
    ],
  },

  // ─── 103.3 Perform basic file management (Weight: 4) ───
  {
    id: "103.3-navigation",
    title: "103.3, Navigating the Filesystem",
    description:
      "LPIC-1 objective 103.3: Basic file management. Start by learning to navigate with ls, cd, and cat.",
    topic: "103.3",
    topicTitle: "Perform basic file management",
    tasks: [
      {
        id: "nav-ls",
        instruction: "Use `ls` to see what's in your home directory",
        hint: "Just type: ls",
        check: ({ command }) => command === "ls",
      },
      {
        id: "nav-cd-docs",
        instruction: "Navigate into the `documents` folder with `cd`",
        hint: "Type: cd documents",
        check: ({ command }) =>
          command === "cd documents" || command === "cd documents/",
      },
      {
        id: "nav-ls-docs",
        instruction: "Use `ls` to see what files are in documents",
        hint: "Type: ls",
        check: ({ command, output }) =>
          command === "ls" && output.includes("notes.txt"),
      },
      {
        id: "nav-cat",
        instruction: "Read a file with `cat notes.txt`",
        hint: "Type: cat notes.txt",
        check: ({ command }) => command === "cat notes.txt",
      },
      {
        id: "nav-cd-up",
        instruction: "Go back up one directory with `cd ..`",
        hint: "Type: cd ..",
        check: ({ command }) => command === "cd .." || command === "cd ../",
      },
      {
        id: "nav-cd-absolute",
        instruction: "Navigate to `/etc` using an absolute path",
        hint: "Type: cd /etc",
        check: ({ command }) => command === "cd /etc" || command === "cd /etc/",
      },
      {
        id: "nav-cat-hostname",
        instruction: "Read the hostname file with `cat hostname`",
        hint: "Type: cat hostname",
        check: ({ command, output }) =>
          command === "cat hostname" && output.includes("linux-trainer"),
      },
    ],
  },

  {
    id: "103.3-file-ops",
    title: "103.3, File Operations",
    description:
      "LPIC-1 objective 103.3 continued: Create, copy, move, and delete files and directories.",
    topic: "103.3",
    topicTitle: "Perform basic file management",
    tasks: [
      {
        id: "ops-cd-home",
        instruction: "Go to your home directory with `cd`",
        hint: "Just type: cd",
        check: ({ command }) => command === "cd",
      },
      {
        id: "ops-mkdir",
        instruction: "Create a new directory called `practice` with `mkdir`",
        hint: "Type: mkdir practice",
        check: ({ command }) => command === "mkdir practice",
      },
      {
        id: "ops-cd-practice",
        instruction: "Navigate into your new `practice` directory",
        hint: "Type: cd practice",
        check: ({ command }) =>
          command === "cd practice" || command === "cd practice/",
      },
      {
        id: "ops-touch",
        instruction: "Create an empty file called `myfile.txt` with `touch`",
        hint: "Type: touch myfile.txt",
        check: ({ command }) => command === "touch myfile.txt",
      },
      {
        id: "ops-ls-verify",
        instruction: "Verify the file was created with `ls`",
        hint: "Type: ls",
        check: ({ command, output }) =>
          command === "ls" && output.includes("myfile.txt"),
      },
      {
        id: "ops-cp",
        instruction: "Copy `myfile.txt` to `backup.txt`",
        hint: "Type: cp myfile.txt backup.txt",
        check: ({ command }) => command === "cp myfile.txt backup.txt",
      },
      {
        id: "ops-mv",
        instruction: "Rename `backup.txt` to `old.txt` with `mv`",
        hint: "Type: mv backup.txt old.txt",
        check: ({ command }) => command === "mv backup.txt old.txt",
      },
      {
        id: "ops-rm",
        instruction: "Delete `old.txt` with `rm`",
        hint: "Type: rm old.txt",
        check: ({ command }) => command === "rm old.txt",
      },
      {
        id: "ops-ls-final",
        instruction: "Confirm only `myfile.txt` remains with `ls`",
        hint: "Type: ls",
        check: ({ command, output }) =>
          command === "ls" &&
          output.includes("myfile.txt") &&
          !output.includes("old.txt"),
      },
    ],
  },

  {
    id: "103.3-find",
    title: "103.3, Finding Files",
    description:
      "LPIC-1 objective 103.3 continued: Use find to search for files in the directory tree, and which to locate commands.",
    topic: "103.3",
    topicTitle: "Perform basic file management",
    tasks: [
      {
        id: "find-cd-home",
        instruction: "Go to your home directory with `cd`",
        hint: "Just type: cd",
        check: ({ command }) => command === "cd",
      },
      {
        id: "find-all-txt",
        instruction: "Find all .txt files: `find . -name '*.txt'`",
        hint: "Type: find . -name '*.txt'",
        check: ({ command, output }) =>
          command.includes("find") &&
          command.includes("*.txt") &&
          output.includes(".txt"),
      },
      {
        id: "find-all-py",
        instruction: "Find all Python files: `find . -name '*.py'`",
        hint: "Type: find . -name '*.py'",
        check: ({ command, output }) =>
          command.includes("find") &&
          command.includes("*.py") &&
          output.includes(".py"),
      },
      {
        id: "find-all-log",
        instruction: "Find all log files: `find . -name '*.log'`",
        hint: "Type: find . -name '*.log'",
        check: ({ command, output }) =>
          command.includes("find") &&
          command.includes("*.log") &&
          output.includes(".log"),
      },
      {
        id: "find-which-ls",
        instruction: "Use `which ls` to see where the ls command lives",
        hint: "Type: which ls",
        check: ({ command, output }) =>
          command === "which ls" && output.includes("/usr/bin/ls"),
      },
    ],
  },

  // ─── 103.2 Process text streams using filters (Weight: 2) ───
  {
    id: "103.2-filters",
    title: "103.2, Text Filters",
    description:
      "LPIC-1 objective 103.2: Process text streams using filters. Learn head, tail, wc, sort, and cut to slice and dice text.",
    topic: "103.2",
    topicTitle: "Process text streams using filters",
    tasks: [
      {
        id: "filter-cd",
        instruction: "Navigate to `~/documents`: `cd ~/documents`",
        hint: "Type: cd documents (from home) or cd /home/user/documents",
        check: ({ command }) =>
          command === "cd documents" ||
          command === "cd /home/user/documents" ||
          command === "cd ~/documents",
      },
      {
        id: "filter-cat-todo",
        instruction: "View the todo list: `cat todo.txt`",
        hint: "Type: cat todo.txt",
        check: ({ command }) => command === "cat todo.txt",
      },
      {
        id: "filter-head",
        instruction: "Show only the first 3 lines: `head -n 3 todo.txt`",
        hint: "Type: head -n 3 todo.txt",
        check: ({ command, output }) =>
          command === "head -n 3 todo.txt" && output.includes("1."),
      },
      {
        id: "filter-tail",
        instruction: "Show only the last 2 lines: `tail -n 2 todo.txt`",
        hint: "Type: tail -n 2 todo.txt",
        check: ({ command }) => command === "tail -n 2 todo.txt",
      },
      {
        id: "filter-wc",
        instruction: "Count the lines in the file: `wc -l todo.txt`",
        hint: "Type: wc -l todo.txt",
        check: ({ command }) => command === "wc -l todo.txt",
      },
      {
        id: "filter-wc-full",
        instruction: "See full word count stats: `wc todo.txt`",
        hint: "Type: wc todo.txt",
        check: ({ command }) => command === "wc todo.txt",
      },
      {
        id: "filter-sort",
        instruction: "Sort the lines alphabetically: `sort todo.txt`",
        hint: "Type: sort todo.txt",
        check: ({ command }) => command === "sort todo.txt",
      },
    ],
  },

  // Future lessons (103.4, 103.7, 104.5, 105.1, 104.7, Capstone)
  // are saved in futureLessons.ts for Days 7-12.
];

export default lessons;
