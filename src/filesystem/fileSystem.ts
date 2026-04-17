// The virtual filesystem is a tree of nodes.
// Each node is either a "folder" (has children) or a "file" (has content).
//
// This is similar to how real filesystems work — directories contain
// other directories and files, forming a tree structure.

export type FileNode = {
  type: "file";
  name: string;
  content: string;
  permissions: string; // e.g. "rw-r--r--"
};

export type FolderNode = {
  type: "folder";
  name: string;
  children: Record<string, FsNode>;
  permissions: string; // e.g. "rwxr-xr-x"
};

export type FsNode = FileNode | FolderNode;

// Helper to create file/folder nodes without repeating { type: "file", ... }
function file(name: string, content: string, permissions = "rw-r--r--"): FileNode {
  return { type: "file", name, content, permissions };
}

function folder(
  name: string,
  children: Record<string, FsNode>,
  permissions = "rwxr-xr-x"
): FolderNode {
  return { type: "folder", name, children, permissions };
}

// The full filesystem tree.
// Expanded to support LPIC-1 lessons: text filters, grep, pipes, permissions.
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
          "1. Learn basic terminal commands\n2. Practice navigating the filesystem\n3. Write a shell script\n4. Study for LPIC-1\n5. Set up a home lab"
        ),
        "report.txt": file(
          "report.txt",
          "Server Status Report\n====================\nDate: 2024-03-15\n\nWeb Server: running\nDatabase: running\nCache: stopped\nBackup: completed\n\nDisk Usage: 45%\nMemory Usage: 62%\nCPU Load: 0.8\n\nErrors found in /var/log/syslog:\n- WARNING: disk space low on /dev/sda2\n- ERROR: connection timeout to backup server\n- WARNING: high memory usage detected"
        ),
      }),
      projects: folder("projects", {
        "hello.py": file(
          "hello.py",
          '#!/usr/bin/env python3\nprint("Hello, world!")'
        ),
        "server.py": file(
          "server.py",
          '#!/usr/bin/env python3\nimport http.server\nimport socketserver\n\nPORT = 8080\nHandler = http.server.SimpleHTTPRequestHandler\n\nwith socketserver.TCPServer(("", PORT), Handler) as httpd:\n    print(f"Serving on port {PORT}")\n    httpd.serve_forever()',
          "rwxr-xr-x"
        ),
        "config.yaml": file(
          "config.yaml",
          "database:\n  host: localhost\n  port: 5432\n  name: myapp\n\nserver:\n  port: 8080\n  debug: true\n  workers: 4"
        ),
      }),
      logs: folder("logs", {
        "access.log": file(
          "access.log",
          '192.168.1.10 - - [15/Mar/2024:10:15:30] "GET /index.html HTTP/1.1" 200 1234\n192.168.1.10 - - [15/Mar/2024:10:15:31] "GET /style.css HTTP/1.1" 200 567\n192.168.1.22 - - [15/Mar/2024:10:16:05] "POST /api/login HTTP/1.1" 401 89\n192.168.1.22 - - [15/Mar/2024:10:16:10] "POST /api/login HTTP/1.1" 200 156\n10.0.0.5 - - [15/Mar/2024:10:17:00] "GET /admin HTTP/1.1" 403 45\n192.168.1.10 - - [15/Mar/2024:10:18:22] "GET /api/users HTTP/1.1" 200 890\n10.0.0.5 - - [15/Mar/2024:10:19:01] "DELETE /api/users/5 HTTP/1.1" 403 45\n192.168.1.30 - - [15/Mar/2024:10:20:15] "GET /index.html HTTP/1.1" 200 1234'
        ),
        "error.log": file(
          "error.log",
          "[ERROR] 2024-03-15 10:16:05 Authentication failed for user admin\n[WARNING] 2024-03-15 10:17:00 Unauthorized access attempt from 10.0.0.5\n[ERROR] 2024-03-15 10:19:01 Permission denied: DELETE /api/users/5\n[INFO] 2024-03-15 10:20:00 Daily backup started\n[INFO] 2024-03-15 10:25:00 Daily backup completed\n[WARNING] 2024-03-15 10:30:00 Disk usage above 80% on /dev/sda1\n[ERROR] 2024-03-15 10:35:00 Connection refused: database port 5432"
        ),
        "auth.log": file(
          "auth.log",
          "Mar 15 10:16:05 server sshd: Failed password for admin from 10.0.0.5 port 22\nMar 15 10:16:08 server sshd: Failed password for admin from 10.0.0.5 port 22\nMar 15 10:16:12 server sshd: Failed password for admin from 10.0.0.5 port 22\nMar 15 10:17:00 server sshd: Accepted password for user1 from 192.168.1.10 port 22\nMar 15 10:18:30 server sudo: user1 : TTY=pts/0 ; PWD=/home/user1 ; COMMAND=/bin/systemctl restart nginx"
        ),
      }),
      scripts: folder("scripts", {
        "backup.sh": file(
          "backup.sh",
          '#!/bin/bash\n# Simple backup script\nSOURCE="/home/user/documents"\nDEST="/tmp/backup"\nDATE=$(date +%Y%m%d)\n\nmkdir -p "$DEST"\ntar -czf "$DEST/backup-$DATE.tar.gz" "$SOURCE"\necho "Backup completed: $DEST/backup-$DATE.tar.gz"',
          "rwxr-xr-x"
        ),
        "cleanup.sh": file(
          "cleanup.sh",
          '#!/bin/bash\n# Clean up temp files older than 7 days\nfind /tmp -type f -mtime +7 -delete\necho "Cleanup done"',
          "rwxr--r--"
        ),
      }),
      "readme.txt": file(
        "readme.txt",
        "Welcome to your home directory!\nExplore the folders to find files."
      ),
      ".bashrc": file(
        ".bashrc",
        '# ~/.bashrc: executed by bash for non-login shells\nexport PATH="$HOME/bin:$PATH"\nexport EDITOR=vim\n\nalias ll="ls -la"\nalias ..="cd .."\n\nPS1="\\u@\\h:\\w$ "'
      ),
      ".profile": file(
        ".profile",
        "# ~/.profile: executed by the command interpreter for login shells\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi"
      ),
    }),
  }),
  etc: folder("etc", {
    hostname: file("hostname", "linux-trainer"),
    passwd: file(
      "passwd",
      "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nuser1:x:1000:1000:User One:/home/user:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin"
    ),
    group: file(
      "group",
      "root:x:0:\ndaemon:x:1:\nuser1:x:1000:\nwww-data:x:33:\nsudo:x:27:user1"
    ),
    hosts: file(
      "hosts",
      "127.0.0.1\tlocalhost\n127.0.1.1\tlinux-trainer\n192.168.1.100\twebserver\n192.168.1.101\tdbserver"
    ),
    "resolv.conf": file("resolv.conf", "nameserver 8.8.8.8\nnameserver 8.8.4.4"),
    fstab: file(
      "fstab",
      "# <file system>  <mount point>  <type>  <options>        <dump>  <pass>\n/dev/sda1        /              ext4    errors=remount-ro 0       1\n/dev/sda2        /home          ext4    defaults          0       2\n/dev/sda3        none           swap    sw                0       0"
    ),
  }),
  var: folder("var", {
    log: folder("log", {
      "syslog": file(
        "syslog",
        "Mar 15 09:00:00 linux-trainer systemd[1]: Started Daily apt download activities.\nMar 15 09:00:01 linux-trainer systemd[1]: Starting Daily cleanup of temporary directories...\nMar 15 10:00:00 linux-trainer CRON[1234]: (root) CMD (test -x /usr/sbin/anacron)\nMar 15 10:16:05 linux-trainer sshd[5678]: Failed password for admin from 10.0.0.5\nMar 15 10:30:00 linux-trainer kernel: [UFW BLOCK] IN=eth0 OUT= SRC=10.0.0.5 DST=192.168.1.1"
      ),
    }),
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
    const child: FsNode | undefined = current.children[segment];
    if (!child) return null;
    current = child;
  }

  return current;
}

// Resolve the PARENT folder of a path, plus the child name.
// e.g. "/home/user/newdir" → { parent: <user folder>, childName: "newdir" }
// Returns null if the parent doesn't exist or isn't a folder.
export function resolveParent(
  path: string
): { parent: FolderNode; childName: string } | null {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const childName = segments.pop()!;
  const parentPath = "/" + segments.join("/");
  const parent = resolvePath(parentPath);

  if (!parent || parent.type !== "folder") return null;
  return { parent, childName };
}

// Deep-clone a filesystem node (so copies are independent of originals)
export function cloneNode(node: FsNode): FsNode {
  if (node.type === "file") {
    return { type: "file", name: node.name, content: node.content, permissions: node.permissions };
  }
  const clonedChildren: Record<string, FsNode> = {};
  for (const [key, child] of Object.entries(node.children)) {
    clonedChildren[key] = cloneNode(child);
  }
  return { type: "folder", name: node.name, children: clonedChildren, permissions: node.permissions };
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

// Collect all files recursively under a node, returning their full paths
export function collectFiles(
  node: FsNode,
  currentPath: string
): { path: string; node: FileNode }[] {
  if (node.type === "file") {
    return [{ path: currentPath, node }];
  }
  const results: { path: string; node: FileNode }[] = [];
  for (const [name, child] of Object.entries(node.children)) {
    results.push(...collectFiles(child, currentPath + "/" + name));
  }
  return results;
}
