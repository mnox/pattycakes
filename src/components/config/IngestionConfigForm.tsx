import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

type Source = {
  type: "metrics" | "transcript" | "email" | "survey" | "support_ticket" | "custom";
  enabled: boolean;
  weight: number;
  label?: string;
  parsingHint?: string;
};

export default function IngestionConfigForm({ customerId }: { customerId: Id<"customers"> }) {
  const config = useQuery(api.config.getIngestion, { customerId });
  const upsert = useMutation(api.config.upsertIngestion);
  const [sources, setSources] = useState<Source[]>([]);
  const [globalNotes, setGlobalNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setSources(config.sources as Source[]);
      setGlobalNotes(config.globalParsingNotes ?? "");
    }
  }, [config]);

  const handleSave = async () => {
    await upsert({ customerId, sources, globalParsingNotes: globalNotes || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSource = (idx: number, patch: Partial<Source>) => {
    setSources((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-1">Data Source Weights</h3>
        <p className="text-xs text-gray-400 mb-4">
          Configure which sources are active and how much each influences need identification. Higher weight = more signal strength.
        </p>

        <div className="space-y-3">
          {sources.map((source, idx) => (
            <div key={source.type} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={(e) => updateSource(idx, { enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-200">
                    {source.label ?? source.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    step="0.1"
                    value={source.weight}
                    onChange={(e) => updateSource(idx, { weight: parseFloat(e.target.value) })}
                    className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Parsing hint for this source (optional)"
                value={source.parsingHint ?? ""}
                onChange={(e) => updateSource(idx, { parsingHint: e.target.value || undefined })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-200 mb-1">
          Global Parsing Notes
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Any special instructions for Patrick when interpreting this customer's data.
        </p>
        <textarea
          value={globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
          rows={4}
          placeholder="e.g. This customer uses custom terminology — 'hub' refers to their main integration platform..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 bg-pattern-500 hover:bg-pattern-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Save size={14} />
        {saved ? "Saved!" : "Save Configuration"}
      </button>
    </div>
  );
}
