Day 3 of building my Linux Terminal Trainer, and it just went from sandbox to actual trainer.

Yesterday it was just pwd, clear, and help. Today it has a guided lesson panel, a virtual filesystem, and a block cursor that makes it look like a real terminal.

What's new:

- Split-screen layout: lesson panel on the left, terminal on the right
- Guided lessons with step-by-step tasks and auto-checkmarks when you complete them
- Virtual filesystem with folders and files you can explore
- ls, cd, cat commands with proper error handling
- Block cursor with blink animation, just like a real Linux terminal
- Prompt updates dynamically to show your current directory

The lesson system is data-driven. Each task has a check function that validates the user's command and output. Adding a new lesson is just adding an object to an array, no component changes needed.

One interesting pattern: the terminal notifies the parent via a callback after each command. The parent checks it against the current lesson's tasks and updates a Set of completed task IDs. The terminal doesn't know about lessons at all, it just does its job.

Try it: https://linux-terminal-trainer-psi.vercel.app
Source: https://github.com/mamamia0729/linux-terminal-trainer

Tomorrow: command history with arrow keys, so you can press up/down to recall previous commands.

What Linux command would you add next?

#buildinpublic #webdevelopment #typescript #linux #react
