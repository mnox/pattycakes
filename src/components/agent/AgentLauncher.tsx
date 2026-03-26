import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "idle" | "running" | "done" | "error";

export default function AgentLauncher({
  customerId,
  onRunStarted,
}: {
  customerId: Id<"customers">;
  onRunStarted: (runId: Id<"runs">) => void;
}) {
  const createRun = useMutation(api.runs.create);
  const records = useQuery(api.ingestion.list, { customerId });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async () => {
    if (!records?.length) return;
    setStatus("running");
    setError(null);

    try {
      const runId = await createRun({ customerId });
      onRunStarted(runId);

      const res = await fetch(
        `${import.meta.env.VITE_CONVEX_SITE_URL}/agent/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, runId }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }

      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  const hasData = (records?.length ?? 0) > 0;

  return (
    <div className="flex items-center gap-3">
      {status === "idle" && (
        <button
          onClick={handleLaunch}
          disabled={!hasData}
          className="flex items-center gap-2 px-4 py-2 bg-pattern-500 hover:bg-pattern-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Play size={14} />
          Run Patrick
        </button>
      )}
      {status === "running" && (
        <div className="flex items-center gap-2 text-sm text-pattern-300">
          <Loader2 size={14} className="animate-spin" />
          Patrick is analyzing...
        </div>
      )}
      {status === "done" && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 size={14} />
          Analysis complete
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <XCircle size={14} />
          {error ?? "An error occurred"}
        </div>
      )}
      {!hasData && status === "idle" && (
        <span className="text-xs text-gray-500">Add data sources to run Patrick</span>
      )}
    </div>
  );
}
