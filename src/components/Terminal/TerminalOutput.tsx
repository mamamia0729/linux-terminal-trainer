// TerminalOutput renders all the lines of history — previous commands and their results.
// Each entry has: the command the user typed, and the output it produced.

type HistoryEntry = {
  command: string;
  output: string;
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
            <span className="text-green-400">user@linux-trainer</span>
            <span className="text-gray-400">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-gray-400">$ </span>
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
