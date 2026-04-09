// TerminalOutput renders all the lines of history — previous commands and their results.
// Each entry has: the command the user typed, the output it produced,
// and the cwd at the time (so the prompt shows the right directory).

import Prompt from "./Prompt";

type HistoryEntry = {
  command: string;
  output: string;
  cwd: string;
};

type TerminalOutputProps = {
  history: HistoryEntry[];
};

export default function TerminalOutput({ history }: TerminalOutputProps) {
  return (
    <div>
      {history.map((entry, index) => (
        <div key={index}>
          {/* The command line — shows what the user typed */}
          <div className="flex">
            <Prompt cwd={entry.cwd} />
            <span className="text-gray-100">{entry.command}</span>
          </div>

          {/* The output — what the command returned */}
          {entry.output && (
            <div className="text-gray-300 whitespace-pre-wrap">
              {entry.output}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export type { HistoryEntry };
