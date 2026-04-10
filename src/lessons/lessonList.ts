// All available lessons.
// Each lesson has tasks with a check function that validates
// whether the user's command + output satisfies the requirement.

import type { Lesson } from "./types";

const lessons: Lesson[] = [
  {
    id: "basics",
    title: "Lesson 1: Terminal Basics",
    description:
      "Learn the essential commands every Linux user needs: pwd to find where you are, help to discover commands, and clear to tidy up.",
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
        id: "basics-clear",
        instruction: "Use `clear` to clean up the terminal",
        hint: "Just type: clear",
        check: ({ command }) => command === "clear",
      },
    ],
  },
  {
    id: "filesystem",
    title: "Lesson 2: Exploring the Filesystem",
    description:
      "Navigate the virtual filesystem using ls, cd, and cat. Learn to move between directories and read files.",
    tasks: [
      {
        id: "fs-ls",
        instruction: "Use `ls` to see what's in your home directory",
        hint: "Just type: ls",
        check: ({ command }) => command === "ls",
      },
      {
        id: "fs-cd-docs",
        instruction: "Navigate into the `documents` folder with `cd`",
        hint: "Type: cd documents",
        check: ({ command }) =>
          command === "cd documents" || command === "cd documents/",
      },
      {
        id: "fs-ls-docs",
        instruction: "Use `ls` to see what files are in documents",
        hint: "Type: ls",
        check: ({ command, output }) =>
          command === "ls" && output.includes("notes.txt"),
      },
      {
        id: "fs-cat",
        instruction: "Read a file with `cat notes.txt`",
        hint: "Type: cat notes.txt",
        check: ({ command }) => command === "cat notes.txt",
      },
      {
        id: "fs-cd-up",
        instruction: "Go back up one directory with `cd ..`",
        hint: "Type: cd ..",
        check: ({ command }) => command === "cd .." || command === "cd ../",
      },
      {
        id: "fs-cd-absolute",
        instruction: "Navigate to `/etc` using an absolute path",
        hint: "Type: cd /etc",
        check: ({ command }) => command === "cd /etc" || command === "cd /etc/",
      },
      {
        id: "fs-cat-hostname",
        instruction: "Read the hostname file with `cat hostname`",
        hint: "Type: cat hostname",
        check: ({ command, output }) =>
          command === "cat hostname" && output.includes("linux-trainer"),
      },
    ],
  },
];

export default lessons;
