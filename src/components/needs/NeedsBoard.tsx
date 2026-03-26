import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import NeedCard from "./NeedCard";
import { Target } from "lucide-react";

export default function NeedsBoard({
  customerId,
  runId,
}: {
  customerId: Id<"customers">;
  runId: Id<"runs"> | null;
}) {
  const allNeeds = useQuery(api.needs.listByCustomer, { customerId });
  const runNeeds = useQuery(
    api.needs.listByRun,
    runId ? { runId } : "skip"
  );

  const needs = (runId ? runNeeds : allNeeds) ?? [];
  const sorted = [...needs].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Identified Needs</h3>
        {needs.length > 0 && (
          <span className="text-xs text-gray-500">{needs.length} found</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.map((need) => (
          <NeedCard key={need._id} need={need} />
        ))}

        {!sorted.length && (
          <div className="text-center py-8 text-gray-500">
            <Target size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">No needs identified yet.</p>
            <p className="text-xs mt-1">Run Patrick to analyze your data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
