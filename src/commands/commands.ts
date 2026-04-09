// Each command is a function that takes an array of arguments
// and returns a string (the output to display in the terminal).
//
// We use a Record<string, CommandFn> to map command names to their handlers.
// Think of it like a dictionary: { "pwd": pwdFunction, "help": helpFunction }

type CommandFn = (args: string[]) => string;

const commands: Record<string, CommandFn> = {
  pwd: () => "/home/user",

  help: () =>
    [
      "Available commands:",
      "",
      "  pwd      Print the current working directory",
      "  clear    Clear the terminal screen",
      "  help     Show this help message",
      "",
      "More commands coming soon!",
    ].join("\n"),
};

export default commands;
