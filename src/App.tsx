// App.tsx is the root component — everything starts here.
// It manages lesson state and renders the two-column layout:
// LessonPanel on the left, Terminal on the right.

import { useState, useCallback } from "react";
import Terminal from "./components/Terminal/Terminal";
import LessonPanel from "./components/LessonPanel/LessonPanel";
import lessons from "./lessons/lessonList";
import type { TaskCheck } from "./lessons/types";

function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Called by Terminal after every command.
  // Checks the current lesson's tasks and marks any newly completed ones.
  const handleCommandExecuted = useCallback(
    (entry: TaskCheck) => {
      const lesson = lessons[currentLessonIndex];

      for (const task of lesson.tasks) {
        if (task.check(entry)) {
          setCompletedTasks((prev) => {
            if (prev.has(task.id)) return prev;
            const next = new Set(prev);
            next.add(task.id);
            return next;
          });
        }
      }
    },
    [currentLessonIndex]
  );

  const handleSelectLesson = (index: number) => {
    setCurrentLessonIndex(index);
    // Reset completed tasks when switching lessons
    setCompletedTasks(new Set());
  };

  return (
    <div className="flex h-screen">
      {/* Left pane: lesson panel (30%) */}
      <div className="w-[30%] min-w-[280px] max-w-[400px]">
        <LessonPanel
          lessons={lessons}
          currentLessonIndex={currentLessonIndex}
          completedTasks={completedTasks}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Right pane: terminal (70%) */}
      <div className="flex-1">
        <Terminal onCommandExecuted={handleCommandExecuted} />
      </div>
    </div>
  );
}

export default App;
