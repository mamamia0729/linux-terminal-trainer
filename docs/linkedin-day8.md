Day 8: Linux Terminal Trainer, Database + Authentication

Today I added user accounts and a real database to the terminal trainer. Your progress now follows you across browsers and devices.

What's new:
- Sign in with email or Google (powered by Clerk)
- Completed tasks save to a PostgreSQL database (Supabase)
- Progress syncs across any browser or device you sign in from
- Guest mode still works, falls back to localStorage
- Auth bar at the top of the lesson panel with sign in/out

Why these two features had to ship together: a database without auth is like a gym locker without a lock. You need a user ID to know whose progress is whose. Building the database first without auth would mean rewriting the schema and every query when auth comes in later. Wiring them together from the start means the data model is right from day one.

Bug found and fixed: on first sign-in, old localStorage data from guest sessions was merging into the database, making all tasks appear completed. Fixed by making Supabase the single source of truth when signed in and clearing stale localStorage on login.

Built with React, TypeScript, Supabase, and Clerk. Try it live: https://linux-terminal-trainer-psi.vercel.app

Day 1: Terminal UI
Day 2: Command parser
Day 3: Virtual filesystem
Day 4: Command history
Day 5: LPIC-1 alignment + 18 commands
Day 6: Text filters (head, tail, wc, sort)
Day 7: localStorage persistence + progress bar
Day 8: Database + authentication (Supabase + Clerk)

#Linux #LPIC1 #WebDev #React #TypeScript #Supabase #Clerk #BuildInPublic #100DaysOfCode
