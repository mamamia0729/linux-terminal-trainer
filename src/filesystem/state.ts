// Filesystem state — tracks where the user "is" in the virtual filesystem
// and environment variables.
//
// We use module-level variables instead of React state because:
// - Commands need to read/write cwd, but they're plain functions, not components
// - The Terminal component will call getCwd() to update the prompt after each command

let cwd = "/home/user";

const env: Record<string, string> = {
  HOME: "/home/user",
  USER: "user",
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  SHELL: "/bin/bash",
  PWD: "/home/user",
  LANG: "en_US.UTF-8",
  EDITOR: "vim",
  TERM: "xterm-256color",
};

export function getCwd(): string {
  return cwd;
}

export function setCwd(path: string): void {
  cwd = path;
  env.PWD = path;
}

export function getEnv(key: string): string | undefined {
  return env[key];
}

export function setEnv(key: string, value: string): void {
  env[key] = value;
}

export function getAllEnv(): Record<string, string> {
  return { ...env };
}
