import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import TextPasteModal from "./TextPasteModal";

const SOURCE_LABELS: Record<string, string> = {
  metrics: "Metrics",
  transcript: "Transcript",
  email: "Email",
  survey: "Survey",
  support_ticket: "Support Ticket",
  custom: "Custom",
};

const SOURCE_COLORS: Record<string, string> = {
  metrics: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  transcript: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  email: "bg-green-500/20 text-green-300 border-green-500/30",
  survey: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  support_ticket: "bg-red-500/20 text-red-300 border-red-500/30",
  custom: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function DataSourcePanel({ customerId }: { customerId: Id<"customers"> }) {
  const records = useQuery(api.ingestion.list, { customerId });
  const removeRecord = useMutation(api.ingestion.remove);
  const [pasteModal, setPasteModal] = useState<{
    open: boolean;
    sourceType: string;
  }>({ open: false, sourceType: "transcript" });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Data Sources</h2>
        <button
          onClick={() => setPasteModal({ open: true, sourceType: "transcript" })}
          className="flex items-center gap-1.5 text-xs bg-pattern-500 hover:bg-pattern-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={12} />
          Add Data
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {records?.map((record) => (
          <div
            key={record._id}
            className="bg-gray-800 rounded-lg p-3 group hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-200 truncate">
                    {record.sourceLabel ?? record.fileName ?? "Untitled"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {record.content.slice(0, 120)}...
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeRecord({ id: record._id })}
                className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded border ${SOURCE_COLORS[record.sourceType] ?? SOURCE_COLORS.custom}`}
              >
                {SOURCE_LABELS[record.sourceType] ?? record.sourceType}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded border ${
                  record.ingestionStatus === "processed"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-gray-600/20 text-gray-400 border-gray-600/20"
                }`}
              >
                {record.ingestionStatus}
              </span>
            </div>
          </div>
        ))}

        {records?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">No data sources yet.</p>
            <p className="text-xs mt-1">Add transcripts, metrics, or emails to get started.</p>
          </div>
        )}
      </div>

      {pasteModal.open && (
        <TextPasteModal
          customerId={customerId}
          initialSourceType={pasteModal.sourceType}
          onClose={() => setPasteModal({ open: false, sourceType: "transcript" })}
        />
      )}
    </div>
  );
}
