import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Map, Copy, Check } from "lucide-react";
import { useState } from "react";

const EFFORT_COLORS = { Low: "text-green-400", Medium: "text-yellow-400", High: "text-red-400" };
const IMPACT_COLORS = { Low: "text-gray-400", Medium: "text-blue-400", High: "text-pattern-400" };

export default function RoadmapView({
  customerId,
  runId,
}: {
  customerId: Id<"customers">;
  runId: Id<"runs"> | null;
}) {
  const roadmap = useQuery(
    api.roadmaps.getByRun,
    runId ? { runId } : "skip"
  );
  const [copied, setCopied] = useState(false);

  if (!roadmap) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200">Time-to-Value Roadmap</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Map size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">Roadmap will appear once Patrick completes analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  const copyMarkdown = () => {
    const lines = [
      `# ${roadmap.title}`,
      "",
      roadmap.executiveSummary,
      "",
      ...roadmap.phases.flatMap((phase) => [
        `## ${phase.label}`,
        "",
        `**Objective:** ${phase.objective}`,
        "",
        ...phase.items.map(
          (item) =>
            `### ${item.title}\n- **Impact:** ${item.impact} | **Effort:** ${item.effort}\n- **Rationale:** ${item.rationale}\n- **Expected outcome:** ${item.expectedOutcome}`
        ),
        "",
      ]),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">{roadmap.title}</h3>
        <button
          onClick={copyMarkdown}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <p className="text-sm text-gray-300 leading-relaxed">{roadmap.executiveSummary}</p>

        {roadmap.phases.map((phase) => (
          <div key={phase.phaseNumber}>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pattern-500/20 text-pattern-300 text-xs font-bold">
                {phase.phaseNumber}
              </span>
              <h4 className="text-sm font-semibold text-gray-100">{phase.label}</h4>
            </div>
            <p className="text-xs text-gray-400 mb-3 ml-8">{phase.objective}</p>

            <div className="ml-8 space-y-2">
              {phase.items.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-100">{item.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs ${IMPACT_COLORS[item.impact]}`}>
                        ↑ {item.impact}
                      </span>
                      <span className={`text-xs ${EFFORT_COLORS[item.effort]}`}>
                        ⚙ {item.effort}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{item.rationale}</p>
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400">Outcome:</span> {item.expectedOutcome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
