// A Lesson is a guided session with a list of tasks to complete.
// Each task describes what the user should do and how to check if they did it.

export type TaskCheck = {
  // The command the user typed (trimmed)
  command: string;
  // The output the command produced
  output: string;
};

export type LessonTask = {
  id: string;
  instruction: string;
  hint: string;
  // Returns true if this task is satisfied by the command + output
  check: (entry: TaskCheck) => boolean;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  tasks: LessonTask[];
};
