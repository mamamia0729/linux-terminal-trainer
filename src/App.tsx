// App.tsx is the root component - everything starts here.
// It manages lesson state and renders the two-column layout:
// AuthBar + LessonPanel on the left, Terminal on the right.

import { useState, useCallback } from "react";
import Terminal from "./components/Terminal/Terminal";
import LessonPanel from "./components/LessonPanel/LessonPanel";
import AuthBar from "./components/Auth/AuthBar";
import lessons from "./lessons/lessonList";
import { useProgress } from "./hooks/useProgress";
import type { TaskCheck } from "./lessons/types";

function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const { completedTasks, completeTask, loading } = useProgress();

  // Called by Terminal after every command.
  // Checks the current lesson's tasks and marks any newly completed ones.
  const handleCommandExecuted = useCallback(
    (entry: TaskCheck) => {
      const lesson = lessons[currentLessonIndex];

      for (const task of lesson.tasks) {
        if (task.check(entry)) {
          completeTask(task.id);
        }
      }
    },
    [currentLessonIndex, completeTask]
  );

  const handleSelectLesson = (index: number) => {
    setCurrentLessonIndex(index);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-gray-500 text-sm font-mono">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left pane: auth bar + lesson panel (30%) */}
      <div className="w-[30%] min-w-[280px] max-w-[400px] flex flex-col">
        <AuthBar />
        <div className="flex-1 overflow-hidden">
          <LessonPanel
            lessons={lessons}
            currentLessonIndex={currentLessonIndex}
            completedTasks={completedTasks}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      </div>

      {/* Right pane: terminal (70%) */}
      <div className="flex-1">
        <Terminal onCommandExecuted={handleCommandExecuted} />
      </div>
    </div>
  );
}

export default App;
