import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import RunEventItem from "./RunEventItem";

export default function RunStream({ runId }: { runId: Id<"runs"> | null }) {
  const events = useQuery(api.runs.getEvents, runId ? { runId } : "skip");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events?.length]);

  if (!runId) return null;

  const textContent = events
    ?.filter((e) => e.type === "text_delta")
    .map((e) => e.textDelta ?? "")
    .join("") ?? "";

  const toolEvents = events?.filter(
    (e) => e.type === "tool_call" || e.type === "tool_result"
  ) ?? [];

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Patrick's Analysis</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {toolEvents.map((event) => (
          <RunEventItem key={event._id} event={event} />
        ))}

        {textContent && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-pattern-500 flex items-center justify-center text-xs font-bold text-white">
                P
              </div>
              <span className="text-xs font-medium text-pattern-300">Patrick</span>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {textContent}
            </p>
          </div>
        )}

        {!events?.length && (
          <p className="text-xs text-gray-500 text-center py-4">
            Analysis events will appear here in real-time.
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
