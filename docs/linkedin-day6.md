Day 6: Linux Terminal Trainer, Text Filters

Today I added LPIC-1 objective 103.2, processing text streams with filters. This is where Linux gets powerful. Instead of opening a file and scrolling through it, you use small, focused tools to slice exactly what you need.

What's new:
- A guided lesson on text filters: head, tail, wc, and sort
- head shows the first N lines, tail shows the last N lines
- wc counts lines, words, and characters in a file
- sort reorders lines alphabetically
- Each command works on the virtual filesystem, so you practice on realistic files without breaking anything

Why this matters: on a real server, you rarely read entire files. You check the last 20 lines of a log, count how many errors happened, or sort output to find patterns. These filters are the building blocks of every Linux pipeline.

Built with React + TypeScript. Try it live: https://linux-terminal-trainer-psi.vercel.app

Day 1: Terminal UI
Day 2: Command parser
Day 3: Virtual filesystem
Day 4: Command history
Day 5: LPIC-1 alignment + 18 commands
Day 6: Text filters (head, tail, wc, sort)

#Linux #LPIC1 #WebDev #React #TypeScript #BuildInPublic #100DaysOfCode
