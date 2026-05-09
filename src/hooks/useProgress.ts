// useProgress - syncs completed tasks to Supabase when signed in,
// falls back to localStorage for guests.
//
// Think of it like a save file in a video game:
// - Guest mode = save file on YOUR console only (localStorage)
// - Signed in = save file in the cloud (Supabase), follows you anywhere

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

const LOCAL_KEY = "completedTasks";

// Load guest progress from localStorage
function loadLocal(): Set<string> {
  const saved = localStorage.getItem(LOCAL_KEY);
  if (saved) {
    return new Set<string>(JSON.parse(saved));
  }
  return new Set();
}

// Save guest progress to localStorage
function saveLocal(tasks: Set<string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...tasks]));
}

export function useProgress() {
  const { user, isLoaded } = useUser();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(loadLocal);
  const [loading, setLoading] = useState(true);

  // When auth loads or user changes, fetch progress from the right place
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Guest mode: use localStorage
      setCompletedTasks(loadLocal());
      setLoading(false);
      return;
    }

    // Signed in: fetch from Supabase
    async function fetchProgress() {
      const { data, error } = await supabase
        .from("user_progress")
        .select("task_id")
        .eq("clerk_user_id", user!.id);

      if (error) {
        console.error("Failed to load progress:", error);
        // Fall back to localStorage if DB fails
        setCompletedTasks(loadLocal());
      } else {
        const dbTasks = new Set<string>(data.map((row) => row.task_id));

        // Signed in = Supabase is the source of truth.
        // Clear localStorage so stale guest data doesn't bleed in.
        localStorage.removeItem(LOCAL_KEY);

        setCompletedTasks(dbTasks);
      }
      setLoading(false);
    }

    fetchProgress();
  }, [user, isLoaded]);

  // Mark a task as completed
  const completeTask = useCallback(
    async (taskId: string) => {
      setCompletedTasks((prev) => {
        if (prev.has(taskId)) return prev;
        const next = new Set(prev);
        next.add(taskId);

        // Always save to localStorage as backup
        saveLocal(next);

        return next;
      });

      // If signed in, also save to Supabase
      if (user) {
        await supabase.from("user_progress").upsert(
          { clerk_user_id: user.id, task_id: taskId },
          { onConflict: "clerk_user_id,task_id" }
        );
      }
    },
    [user]
  );

  return { completedTasks, completeTask, loading };
}
