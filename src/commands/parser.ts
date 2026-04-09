// The parser takes a raw input string like "pwd" or "help"
// and figures out what to do with it.
//
// It returns a CommandResult with:
// - output: the text to display (or null if the command handles it differently)
// - action: a special flag, like "clear", that the Terminal component
//           needs to handle itself (because clearing history = changing React state)

import commands from "./commands";

export type CommandResult = {
  output: string | null;
  action?: "clear";
};

export function parseCommand(input: string): CommandResult {
  // Split "pwd -a -b" into ["pwd", "-a", "-b"]
  const parts = input.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // "clear" is special: it doesn't produce output,
  // it tells the Terminal to wipe the history.
  if (command === "clear") {
    return { output: null, action: "clear" };
  }

  // Look up the command in our dictionary
  const handler = commands[command];

  if (handler) {
    return { output: handler(args) };
  }

  // Unknown command, just like a real shell
  return { output: `${command}: command not found` };
}
