import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import IngestionConfigForm from "./IngestionConfigForm";
import ScoringConfigForm from "./ScoringConfigForm";

export default function ConfigPanel({ customerId }: { customerId: Id<"customers"> }) {
  const [tab, setTab] = useState<"ingestion" | "scoring">("ingestion");

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-gray-800">
        {(["ingestion", "scoring"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? "text-pattern-300 border-b-2 border-pattern-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t === "ingestion" ? "Data Sources" : "Scoring Criteria"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "ingestion" ? (
          <IngestionConfigForm customerId={customerId} />
        ) : (
          <ScoringConfigForm customerId={customerId} />
        )}
      </div>
    </div>
  );
}
