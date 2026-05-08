# Day 7 - localStorage Persistence + Progress Bar

## What we built

Added two features based on feedback from a senior developer who tested the trainer:

1. **localStorage persistence** - completed tasks now survive page refreshes and lesson switching
2. **Progress bar** - shows "3 / 7 tasks complete" with a green fill bar above the task list

Before today, all progress was lost the moment you refreshed the page or switched lessons.

---

## Why this matters

Imagine doing 6 out of 7 tasks in a lesson, accidentally refreshing the page, and losing all your checkmarks. That's what was happening. Users had no way to track progress across sessions, and no visual indicator of how far along they were.

This is also the first step toward a bigger plan:
1. localStorage for progress tracking + progress bar (done, today)
2. Move lesson data to a database (next)
3. Add user authentication (later)

---

## What is localStorage?

localStorage is a key-value storage built into every browser. Think of it like a sticky note pad that lives on the user's computer, inside the browser.

- Each website gets its own storage area
- Other websites can't read your data
- Data persists until the user clears browser data or you explicitly delete it
- It can only store **strings**, not objects, arrays, or Sets

### The three methods

```ts
// Save
localStorage.setItem("name", "Thinh");

// Read
localStorage.getItem("name"); // returns "Thinh"

// Delete
localStorage.removeItem("name");
```

### The catch: strings only

Our `completedTasks` state is a `Set<string>`. localStorage can't store a Set directly. So we need to convert:

**Saving (freeze):**
```
Set{"task1", "task2"}  ->  ["task1", "task2"]  ->  '["task1","task2"]'
```

**Loading (thaw):**
```
'["task1","task2"]'  ->  ["task1", "task2"]  ->  Set{"task1", "task2"}
```

The two tools for this:
- `JSON.stringify()` - packs an array into a string
- `JSON.parse()` - unpacks a string back into an array

Think of it like buying meat at the store: put it in a bag, freeze it, then later thaw it and cook it. Same data, different form at each step.

---

## What changed in the code

### `src/App.tsx` - Three changes

#### Change 1: Thaw on page load

**Before:**
```ts
const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
```

**After:**
```ts
const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
  const saved = localStorage.getItem("completedTasks");
  if (saved) {
    return new Set<string>(JSON.parse(saved));
  }
  return new Set();
});
```

This is called a **lazy initializer** - useState can take a function instead of a value. React only runs it once, on the very first render. It checks localStorage for saved progress and restores it. If nothing is saved (first visit), it starts with an empty Set.

The `if (saved)` check is important. On a user's very first visit, `getItem` returns `null`. Without that check, `JSON.parse(null)` would crash.

#### Change 2: Freeze when a task completes

```ts
const next = new Set(prev);
next.add(task.id);
// Freeze to localStorage so progress persists across refresh
localStorage.setItem("completedTasks", JSON.stringify([...next]));
return next;
```

Every time a task is marked complete, we save the entire Set to localStorage. The `[...next]` spread syntax converts the Set to an array so `JSON.stringify` can pack it into a string.

#### Change 3: Stop wiping progress on lesson switch

**Before:**
```ts
const handleSelectLesson = (index: number) => {
  setCurrentLessonIndex(index);
  setCompletedTasks(new Set()); // wiped everything!
};
```

**After:**
```ts
const handleSelectLesson = (index: number) => {
  setCurrentLessonIndex(index);
  // Progress is kept, localStorage handles persistence
};
```

The old code reset `completedTasks` to an empty Set every time you switched lessons. That's why switching away and coming back lost your checkmarks. Now we just change the lesson index and let the existing Set (which has tasks from all lessons) stay intact.

---

### `src/components/LessonPanel/LessonPanel.tsx` - Progress bar

Added a progress bar between the lesson description and the task list:

```tsx
{/* Progress bar */}
<div className="mb-4">
  <div className="flex justify-between text-xs text-gray-400 mb-1">
    <span>Progress</span>
    <span>
      {lesson.tasks.filter((t) => completedTasks.has(t.id)).length} / {lesson.tasks.length} tasks complete
    </span>
  </div>
  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-green-600 rounded-full transition-all duration-300"
      style={{
        width: `${(lesson.tasks.filter((t) => completedTasks.has(t.id)).length / lesson.tasks.length) * 100}%`,
      }}
    />
  </div>
</div>
```

How it works:
- Counts how many of the current lesson's tasks are in `completedTasks`
- Divides by total tasks to get a percentage
- Sets the inner div's width to that percentage
- `transition-all duration-300` makes the bar animate smoothly when a task completes

The outer div is a dark gray track (`bg-gray-800`). The inner div is the green fill (`bg-green-600`). `overflow-hidden` with `rounded-full` keeps the fill bar clipped to the rounded shape.

---

## Key concepts learned

| Concept | What it means |
|---------|--------------|
| localStorage | Browser-based key-value storage that persists across sessions |
| JSON.stringify | Converts a JavaScript value (array, object) to a JSON string |
| JSON.parse | Converts a JSON string back to a JavaScript value |
| Spread syntax `[...set]` | Converts a Set to an array |
| Lazy initializer | A function passed to useState that runs only on first render |
| Persistence | Saving state so it survives page refreshes and navigation |

---

## Limitations of localStorage

- **Browser-only** - data lives on the user's machine, not a server
- **One browser** - Chrome and Firefox have separate storage
- **One device** - progress on your laptop won't show on your phone
- **~5MB limit** - plenty for task IDs, not enough for large data
- **No authentication** - anyone on the same browser shares the same data

These limitations are why Feature 2 (database) and Feature 3 (auth) are planned.

---

## How to test

1. `npm run dev`
2. Complete a few tasks in any lesson
3. Check the progress bar updates (should show "3 / 7 tasks complete" or similar)
4. Refresh the page - progress should still be there
5. Switch to a different lesson and come back - progress should still be there
6. Open browser DevTools (F12) > Application tab > Local Storage - you should see the `completedTasks` key with your saved task IDs

---

## Three-feature roadmap (from senior developer feedback)

1. **localStorage persistence + progress bar** - done (today)
2. **Move lesson data to a database** - store lessons in Supabase instead of hardcoded arrays
3. **User authentication** - Clerk for login, so progress is per-user and stored server-side
