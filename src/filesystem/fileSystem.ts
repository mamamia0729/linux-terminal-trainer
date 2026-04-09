// The virtual filesystem is a tree of nodes.
// Each node is either a "folder" (has children) or a "file" (has content).
//
// This is similar to how real filesystems work — directories contain
// other directories and files, forming a tree structure.

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

// Helper to create file/folder nodes without repeating { type: "file", ... }
function file(name: string, content: string): FileNode {
  return { type: "file", name, content };
}

function folder(name: string, children: Record<string, FsNode>): FolderNode {
  return { type: "folder", name, children };
}

// The full filesystem tree.
// Structure:
//   /
//   ├── home/
//   │   └── user/
//   │       ├── documents/
//   │       │   ├── notes.txt
//   │       │   └── todo.txt
//   │       ├── projects/
//   │       │   └── hello.py
//   │       └── readme.txt
//   ├── etc/
//   │   └── hostname
//   └── tmp/
export const fileSystem: FolderNode = folder("/", {
  home: folder("home", {
    user: folder("user", {
      documents: folder("documents", {
        "notes.txt": file(
          "notes.txt",
          "Linux terminal basics:\n- Use ls to list files\n- Use cd to change directories\n- Use cat to read file contents"
        ),
        "todo.txt": file(
          "todo.txt",
          "1. Learn basic terminal commands\n2. Practice navigating the filesystem\n3. Write a shell script"
        ),
      }),
      projects: folder("projects", {
        "hello.py": file(
          "hello.py",
          '#!/usr/bin/env python3\nprint("Hello, world!")'
        ),
      }),
      "readme.txt": file(
        "readme.txt",
        "Welcome to your home directory!\nExplore the folders to find files."
      ),
    }),
  }),
  etc: folder("etc", {
    hostname: file("hostname", "linux-trainer"),
  }),
  tmp: folder("tmp", {}),
});

// Resolve a path like "/home/user/documents" to the node at that location.
// Returns null if the path doesn't exist.
//
// How it works:
// 1. Start at the root node
// 2. Split the path into segments: "/home/user" → ["home", "user"]
// 3. Walk down one segment at a time, checking each folder's children
export function resolvePath(path: string): FsNode | null {
  // Root path
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

// Normalize a path that might contain ".." (parent) or "." (current).
// For example: "/home/user/../user/./documents" → "/home/user/documents"
//
// This works like a stack:
// - Regular names get pushed onto the stack
// - ".." pops the last name off (go up one level)
// - "." does nothing (stay in current directory)
export function normalizePath(cwd: string, target: string): string {
  // If target starts with /, it's absolute — start from root
  // Otherwise, it's relative — start from the current directory
  const base = target.startsWith("/") ? "" : cwd;
  const segments = (base + "/" + target).split("/").filter(Boolean);

  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === "..") {
      stack.pop(); // Go up one level
    } else if (segment !== ".") {
      stack.push(segment); // Go deeper
    }
  }

  return "/" + stack.join("/");
}
