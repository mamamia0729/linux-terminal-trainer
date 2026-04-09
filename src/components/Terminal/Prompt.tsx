// Prompt displays the "user@linux-trainer:~/path$" prefix.
// It converts "/home/user" to "~" for a realistic look.
// Used by both TerminalInput (live prompt) and TerminalOutput (history).

type PromptProps = {
  cwd: string;
};

// Convert absolute path to display path:
// "/home/user" → "~"
// "/home/user/documents" → "~/documents"
// "/etc" → "/etc"
function displayPath(cwd: string): string {
  if (cwd === "/home/user") return "~";
  if (cwd.startsWith("/home/user/")) return "~" + cwd.slice("/home/user".length);
  return cwd;
}

export default function Prompt({ cwd }: PromptProps) {
  return (
    <>
      <span className="text-green-400">user@linux-trainer</span>
      <span className="text-gray-400">:</span>
      <span className="text-blue-400">{displayPath(cwd)}</span>
      <span className="text-gray-400">$ </span>
    </>
  );
}
