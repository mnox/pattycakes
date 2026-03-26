import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import CustomerSelector from "../components/customers/CustomerSelector";

const STATUS_ICONS = {
  running: <Loader2 size={14} className="text-pattern-400 animate-spin" />,
  completed: <CheckCircle2 size={14} className="text-green-400" />,
  failed: <XCircle size={14} className="text-red-400" />,
};

export default function RunsPage() {
  const { customerId } = useParams<{ customerId?: string }>();
  const runs = useQuery(
    api.runs.list,
    customerId ? { customerId: customerId as Id<"customers"> } : "skip"
  );

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-800 shrink-0">
        <CustomerSelector selectedId={customerId} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={16} />
          Run History
        </h1>

        {!customerId && (
          <p className="text-sm text-gray-500">Select a customer to view their run history.</p>
        )}

        {customerId && (
          <div className="space-y-3">
            {runs?.map((run) => (
              <div key={run._id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[run.status]}
                    <span className="text-sm font-medium text-gray-100 capitalize">
                      {run.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(run.startedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Duration</span>
                    <div className="text-gray-300 mt-0.5">
                      {run.completedAt
                        ? `${Math.round((run.completedAt - run.startedAt) / 1000)}s`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Steps</span>
                    <div className="text-gray-300 mt-0.5">{run.stepCount ?? "—"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Tokens</span>
                    <div className="text-gray-300 mt-0.5">
                      {run.totalInputTokens != null
                        ? `${run.totalInputTokens + (run.totalOutputTokens ?? 0)} total`
                        : "—"}
                    </div>
                  </div>
                </div>

                {run.errorMessage && (
                  <p className="mt-2 text-xs text-red-400">{run.errorMessage}</p>
                )}
              </div>
            ))}

            {runs?.length === 0 && (
              <p className="text-sm text-gray-500">No runs yet for this customer.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
