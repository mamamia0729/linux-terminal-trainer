Day 3 of building my Linux Terminal Trainer, and you can now actually navigate a filesystem in the browser.

Yesterday it was just pwd, clear, and help. Today:

- Virtual filesystem with folders and files you can explore
- ls to list directory contents (folders show a trailing /)
- cd to navigate around, supports relative paths, .., and absolute paths
- cat to read file contents
- Prompt updates dynamically to show your current directory

The filesystem is a tree of typed nodes, folders have children, files have content. Path resolution walks the tree segment by segment, and cd/ls/cat all build on the same resolvePath function.

One interesting challenge: commands are plain functions, not React components. They can't use useState. So the current directory lives in a module-level variable, and React syncs with it after each command. Two sources of truth that stay in lockstep.

Try it: https://linux-terminal-trainer-psi.vercel.app
Source: https://github.com/mamamia0729/linux-terminal-trainer

Tomorrow: command history with arrow keys, so you can press up/down to recall previous commands.

What folder would you cd into first?

#buildinpublic #webdevelopment #typescript #linux #react
