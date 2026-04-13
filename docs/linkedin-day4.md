Day 4 of building my Linux Terminal Trainer, and today it learned to remember.

Every beginner retypes the same command over and over. That's the first thing I wanted to fix. Now the trainer handles history the same way a real Linux terminal does.

What's new:

- Press Up/Down arrow keys to recall previous commands
- Type `history` to see a numbered list of everything you've done
- Type `!!` to re-run your last command (the classic "bang bang" shortcut)
- Consecutive duplicate commands are stored only once, matching bash's default behavior
- Your in-progress typing is preserved when you navigate history and come back

The architecture challenge: the `history` command is a plain function, but arrow key navigation lives in a React hook. Both need the same data. Solution was a shared module-level store, same pattern as the virtual filesystem. One source of truth, two consumers.

Small detail that matters: when you type `!!`, the terminal shows what it expanded to before showing the output. Beginners shouldn't have to guess what just ran.

Try it: https://linux-terminal-trainer-psi.vercel.app
Source: https://github.com/mamamia0729/linux-terminal-trainer

Tomorrow: tab completion, so pressing Tab auto-completes file and folder names.

What's the first terminal shortcut you teach a beginner?

#buildinpublic #webdevelopment #typescript #linux #react
