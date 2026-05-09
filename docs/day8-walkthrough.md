# Day 8 - Database + Authentication (Supabase + Clerk)

## What we built

Added two features that work together:

1. **User authentication (Clerk)** - users can sign in with email or Google
2. **Database persistence (Supabase)** - completed tasks are saved to a real database, tied to the user's account

Before today, progress was stored in localStorage (the browser's sticky note). That meant progress was stuck on one browser, on one computer. Now it follows the user anywhere they sign in.

---

## Why these two features had to be built together

Think of it like a gym locker.

- **The database is the locker** - it stores your stuff (completed tasks)
- **Auth is the lock + your ID card** - it identifies WHO the stuff belongs to

Without auth, the database has no way to tell one user's progress from another. You'd be writing rows like "someone completed basics-pwd" with no way to know who that someone is.

Without the database, auth gives you a user ID but nowhere to store it. You'd know WHO the user is but have no place to save their progress.

If you built the database first without auth, you'd design a schema without a `user_id` column. Then when you add auth later, you'd have to:
1. Add a `user_id` column
2. Rewrite every query
3. Figure out what to do with the orphaned anonymous rows
4. Test everything again

Building them together means the schema is right from the start: every row has a `clerk_user_id` that ties progress to a real person.

---

## The three new services

### Clerk (authentication)

Clerk handles sign in, sign up, sessions, and user management. We don't write any login forms or password hashing. Clerk provides:

- A `<SignInButton>` that opens a modal
- A `<UserButton>` that shows the user's avatar with a dropdown
- A `useUser()` hook that gives us the current user's ID
- All the security stuff (password hashing, session tokens, OAuth) behind the scenes

**Why Clerk instead of building our own auth?** Auth is one of the easiest things to get wrong in security. Clerk handles the hard parts so we can focus on the app.

### Supabase (database)

Supabase is a hosted PostgreSQL database with a JavaScript client library. We use it to store one table:

```sql
create table user_progress (
  id bigint generated always as identity primary key,
  clerk_user_id text not null,    -- WHO completed it
  task_id text not null,           -- WHAT they completed
  completed_at timestamptz not null default now(),  -- WHEN
  unique (clerk_user_id, task_id)  -- no duplicate rows
);
```

Each row says: "User X completed task Y at time Z."

The `unique` constraint means if you somehow complete the same task twice, it won't create a duplicate row.

### Vercel (environment variables)

The Clerk publishable key and Supabase URL/key are stored as Vercel environment variables. This keeps them out of the code and lets us use different values for development vs production.

---

## Files that changed

### New files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Creates the Supabase client using env vars |
| `src/hooks/useProgress.ts` | The brain - syncs progress to Supabase or localStorage |
| `src/components/Auth/AuthBar.tsx` | Sign in/out UI at the top of the lesson panel |
| `supabase/schema.sql` | Database table definition (run once in Supabase dashboard) |
| `.env.example` | Template showing what env vars are needed |

### Modified files

| File | What changed |
|------|-------------|
| `src/main.tsx` | Wrapped app in `ClerkProvider` for auth context |
| `src/App.tsx` | Replaced localStorage logic with `useProgress` hook, added `AuthBar` |
| `src/components/LessonPanel/LessonPanel.tsx` | Changed `h-screen` to `h-full` (AuthBar sits above it now) |
| `.gitignore` | Added `.env` files so secrets don't get committed |
| `package.json` | Added `@supabase/supabase-js`, `@clerk/clerk-react`, `@clerk/themes` |

---

## How useProgress works

This is the most important new file. It's a custom React hook that decides WHERE to save progress based on whether the user is signed in.

```
Guest (not signed in):
  Load: read from localStorage
  Save: write to localStorage
  Same behavior as Day 7

Signed in:
  Load: fetch from Supabase WHERE clerk_user_id = user.id
  Save: write to Supabase AND localStorage (backup)
```

### The merge trick

When a guest signs in for the first time, they might already have localStorage progress from before they created an account. The hook handles this:

1. Fetch progress from Supabase (probably empty for new users)
2. Read progress from localStorage (might have tasks from guest mode)
3. Merge both sets together
4. Save any localStorage-only tasks back to Supabase

This way, users never lose progress when they create an account.

### Key code from useProgress.ts

```ts
// Decide based on auth state
const { user, isLoaded } = useUser();  // from Clerk

if (!user) {
  // Guest: use localStorage (same as Day 7)
  setCompletedTasks(loadLocal());
} else {
  // Signed in: fetch from Supabase
  const { data } = await supabase
    .from("user_progress")
    .select("task_id")
    .eq("clerk_user_id", user.id);
  // ... merge with localStorage, save back
}
```

### Completing a task

```ts
const completeTask = async (taskId: string) => {
  // Always save to localStorage as backup
  saveLocal(next);

  // If signed in, also save to Supabase
  if (user) {
    await supabase.from("user_progress").upsert(
      { clerk_user_id: user.id, task_id: taskId },
      { onConflict: "clerk_user_id,task_id" }
    );
  }
};
```

`upsert` means "insert if new, do nothing if it already exists." The `onConflict` tells it which columns to check for duplicates.

---

## How ClerkProvider works

In `main.tsx`, we wrap the entire app in `<ClerkProvider>`:

```tsx
<ClerkProvider publishableKey={clerkPubKey} appearance={{ baseTheme: dark }}>
  <App />
</ClerkProvider>
```

This is the **React Context pattern**. ClerkProvider puts auth state (current user, loading status) into React's context system. Any component inside can call `useUser()` to access it without passing props through every level.

Think of it like WiFi: ClerkProvider is the router, and any component can connect to it from anywhere in the house.

---

## How AuthBar works

The `AuthBar` component sits at the top of the lesson panel:

```tsx
<SignedOut>
  <SignInButton mode="modal">
    <button>Sign in</button>
  </SignInButton>
</SignedOut>

<SignedIn>
  <UserButton />  {/* avatar with dropdown */}
</SignedIn>
```

- `<SignedOut>` only renders when NOT signed in
- `<SignedIn>` only renders when signed in
- `mode="modal"` opens a popup instead of redirecting to a separate page

---

## Row Level Security (RLS)

In `schema.sql`, we enabled RLS on the `user_progress` table. RLS is a PostgreSQL feature that controls which rows a user can see or modify.

Our policies are simple (allow all reads/writes through the anon key) because we filter by `clerk_user_id` in the app code. For a production app with more sensitive data, you'd use Supabase Auth + JWT-based RLS policies for tighter security.

---

## Environment variables

Three env vars stored in Vercel:

| Variable | What it is | Safe to expose? |
|----------|-----------|----------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Identifies your Clerk app | Yes, designed for client-side |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes, public endpoint |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous access key | Yes, RLS controls what it can do |

The `VITE_` prefix tells Vite to include these in the browser bundle. That's fine because all three are public keys. Secret keys (like `CLERK_SECRET_KEY`) should NEVER have the `VITE_` prefix.

---

## What the user sees

1. **Not signed in:** App works exactly like before (localStorage). A green "Sign in" button appears at the top left.
2. **Click Sign in:** Clerk modal pops up with email/Google options.
3. **After sign in:** Avatar appears top left, "Progress saved" label shows. Any localStorage progress merges into the database.
4. **Complete tasks:** Progress saves to both Supabase and localStorage.
5. **Different device:** Sign in on another computer, same progress loads from database.

---

## Concepts learned

- **Supabase** - hosted PostgreSQL with a JavaScript client
- **Clerk** - drop-in authentication with React components
- **Custom hooks** - `useProgress` encapsulates complex state logic
- **React Context** - ClerkProvider shares auth state across the component tree
- **upsert** - insert-or-update in one operation
- **Row Level Security** - database-level access control
- **Environment variables** - keeping config out of code, `VITE_` prefix for client-side
- **Why auth + database are coupled** - you need a user ID to make per-user data meaningful
