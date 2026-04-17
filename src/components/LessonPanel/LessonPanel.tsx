// LessonPanel is the left sidebar that shows the current lesson,
// its tasks, and checkmarks for completed tasks.
// It also has a lesson selector at the top to switch between lessons.

import type { Lesson } from "../../lessons/types";

type LessonPanelProps = {
  lessons: Lesson[];
  currentLessonIndex: number;
  completedTasks: Set<string>;
  onSelectLesson: (index: number) => void;
};

export default function LessonPanel({
  lessons,
  currentLessonIndex,
  completedTasks,
  onSelectLesson,
}: LessonPanelProps) {
  const lesson = lessons[currentLessonIndex];
  const allDone = lesson.tasks.every((t) => completedTasks.has(t.id));

  return (
    <div className="h-screen bg-gray-950 border-r border-gray-800 p-5 overflow-y-auto flex flex-col">
      {/* Lesson selector */}
      <div className="mb-5">
        <label className="text-gray-500 text-xs uppercase tracking-wide block mb-2">
          Lesson
        </label>
        <select
          value={currentLessonIndex}
          onChange={(e) => onSelectLesson(Number(e.target.value))}
          className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
        >
          {lessons.map((l, i) => (
            <option key={l.id} value={i}>
              {l.title}
            </option>
          ))}
        </select>
      </div>

      {/* LPIC topic badge */}
      {lesson.topic && (
        <div className="mb-4 flex items-center gap-2">
          <span className="bg-blue-900/50 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-blue-800">
            LPIC-1 {lesson.topic}
          </span>
          {lesson.topicTitle && (
            <span className="text-gray-500 text-xs">{lesson.topicTitle}</span>
          )}
        </div>
      )}

      {/* Lesson description */}
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        {lesson.description}
      </p>

      {/* Task list */}
      <div className="flex-1">
        <h3 className="text-gray-500 text-xs uppercase tracking-wide mb-3">
          Tasks
        </h3>
        <ul className="space-y-3">
          {lesson.tasks.map((task) => {
            const done = completedTasks.has(task.id);
            return (
              <li key={task.id} className="flex items-start gap-3">
                {/* Checkbox */}
                <span
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                    done
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-600 text-transparent"
                  }`}
                >
                  {done && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>

                {/* Task text */}
                <div>
                  <p
                    className={`text-sm ${
                      done ? "text-gray-500 line-through" : "text-gray-200"
                    }`}
                  >
                    {task.instruction}
                  </p>
                  {!done && (
                    <p className="text-xs text-gray-600 mt-1">{task.hint}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Completion message */}
      {allDone && (
        <div className="mt-6 bg-green-900/30 border border-green-800 rounded-lg p-4 text-center">
          <p className="text-green-400 font-medium text-sm">
            Lesson complete!
          </p>
          <p className="text-green-600 text-xs mt-1">
            {currentLessonIndex < lessons.length - 1
              ? "Select the next lesson to continue."
              : "You've finished all available lessons!"}
          </p>
        </div>
      )}
    </div>
  );
}
