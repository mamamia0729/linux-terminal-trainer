// Filesystem state — tracks where the user "is" in the virtual filesystem.
//
// We use a simple module-level variable instead of React state because:
// - Commands need to read/write cwd, but they're plain functions, not components
// - The Terminal component will call getCwd() to update the prompt after each command
//
// The user starts in /home/user, just like a real Linux terminal.

let cwd = "/home/user";

export function getCwd(): string {
  return cwd;
}

export function setCwd(path: string): void {
  cwd = path;
}
