import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, CheckSquare } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";

const TOOL_LABELS: Record<string, string> = {
  getScoringCriteria: "Loading scoring criteria",
  fetchCustomerData: "Loading customer data",
  searchRecordsByKeyword: "Searching records",
  recordNeed: "Recording identified need",
  listIdentifiedNeeds: "Reviewing identified needs",
  buildRoadmap: "Building Time-to-Value roadmap",
};

export default function RunEventItem({ event }: { event: Doc<"runEvents"> }) {
  const [expanded, setExpanded] = useState(false);

  if (event.type === "tool_call") {
    const label = TOOL_LABELS[event.toolName ?? ""] ?? event.toolName;
    const input = event.toolInput ? JSON.parse(event.toolInput) : null;

    return (
      <div className="bg-gray-800/60 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors"
        >
          <Wrench size={12} className="text-pattern-400 shrink-0" />
          <span className="text-xs text-gray-300 flex-1">{label}</span>
          {expanded ? (
            <ChevronDown size={12} className="text-gray-500" />
          ) : (
            <ChevronRight size={12} className="text-gray-500" />
          )}
        </button>
        {expanded && input && (
          <pre className="px-3 pb-3 text-xs text-gray-400 overflow-x-auto">
            {JSON.stringify(input, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (event.type === "tool_result") {
    const result = event.toolResult ? JSON.parse(event.toolResult) : null;

    return (
      <div className="bg-gray-800/40 rounded-lg overflow-hidden border-l-2 border-green-500/30">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors"
        >
          <CheckSquare size={12} className="text-green-400 shrink-0" />
          <span className="text-xs text-gray-400 flex-1">Result</span>
          {expanded ? (
            <ChevronDown size={12} className="text-gray-500" />
          ) : (
            <ChevronRight size={12} className="text-gray-500" />
          )}
        </button>
        {expanded && result && (
          <pre className="px-3 pb-3 text-xs text-gray-500 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  return null;
}
