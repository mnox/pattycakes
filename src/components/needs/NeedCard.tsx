import { useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ChevronDown, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  adoption: "bg-blue-500/20 text-blue-300",
  integration: "bg-purple-500/20 text-purple-300",
  training: "bg-yellow-500/20 text-yellow-300",
  feature_gap: "bg-orange-500/20 text-orange-300",
  process: "bg-teal-500/20 text-teal-300",
  support: "bg-red-500/20 text-red-300",
  other: "bg-gray-500/20 text-gray-300",
};

function priorityColor(score: number): string {
  if (score >= 3) return "text-green-400";
  if (score >= 1.5) return "text-yellow-400";
  return "text-red-400";
}

function ScoreBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

export default function NeedCard({ need }: { need: Doc<"needs"> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className={`text-xs px-2 py-0.5 rounded mt-0.5 shrink-0 ${CATEGORY_COLORS[need.category] ?? CATEGORY_COLORS.other}`}>
              {need.category.replace("_", " ")}
            </span>
            <span className="text-xs font-medium text-gray-100">{need.title}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs font-bold ${priorityColor(need.priorityScore)}`}>
              {need.priorityScore.toFixed(1)}
            </span>
            {expanded ? (
              <ChevronDown size={12} className="text-gray-500" />
            ) : (
              <ChevronRight size={12} className="text-gray-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-xs text-gray-500">Impact</span>
              <span className="text-xs text-gray-400">{need.impactScore}/10</span>
            </div>
            <ScoreBar value={need.impactScore} color="bg-pattern-500" />
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-xs text-gray-500">Effort</span>
              <span className="text-xs text-gray-400">{need.effortScore}/10</span>
            </div>
            <ScoreBar value={need.effortScore} color="bg-orange-500" />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-700">
          <p className="text-xs text-gray-300 mt-2 mb-3 leading-relaxed">{need.description}</p>

          {need.evidenceSnippets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">Evidence</p>
              {need.evidenceSnippets.map((snippet, i) => (
                <blockquote
                  key={i}
                  className="text-xs text-gray-400 border-l-2 border-gray-600 pl-2 italic"
                >
                  "{snippet}"
                </blockquote>
              ))}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-gray-750 rounded p-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Impact Rationale</p>
              <p className="text-xs text-gray-400">{need.impactRationale}</p>
            </div>
            <div className="bg-gray-750 rounded p-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Effort Rationale</p>
              <p className="text-xs text-gray-400">{need.effortRationale}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
