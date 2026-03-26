import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { X } from "lucide-react";

type SourceType = "metrics" | "transcript" | "email" | "survey" | "support_ticket" | "custom";

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: "transcript", label: "Meeting Transcript" },
  { value: "email", label: "Email / Communication" },
  { value: "metrics", label: "Metrics / Analytics" },
  { value: "survey", label: "Survey Response" },
  { value: "support_ticket", label: "Support Ticket" },
  { value: "custom", label: "Custom" },
];

export default function TextPasteModal({
  customerId,
  initialSourceType,
  onClose,
}: {
  customerId: Id<"customers">;
  initialSourceType: string;
  onClose: () => void;
}) {
  const createRecord = useMutation(api.ingestion.create);
  const [sourceType, setSourceType] = useState<SourceType>(
    (initialSourceType as SourceType) ?? "transcript"
  );
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createRecord({
      customerId,
      sourceType,
      sourceLabel: label || undefined,
      content: content.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Add Data Source</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Source Type
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pattern-500"
              >
                {SOURCE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Q1 Kickoff Call"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder="Paste transcript, email, metrics data, or any other customer content here..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500 resize-none font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-pattern-500 hover:bg-pattern-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
