import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

type Dimension = { key: string; label: string; description: string; weight: number };

export default function ScoringConfigForm({ customerId }: { customerId: Id<"customers"> }) {
  const config = useQuery(api.config.getScoring, { customerId });
  const upsert = useMutation(api.config.upsertScoring);
  const [impactDims, setImpactDims] = useState<Dimension[]>([]);
  const [effortDims, setEffortDims] = useState<Dimension[]>([]);
  const [formula, setFormula] = useState("impact / effort");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setImpactDims(config.impactDimensions);
      setEffortDims(config.effortDimensions);
      setFormula(config.priorityFormula ?? "impact / effort");
    }
  }, [config]);

  const handleSave = async () => {
    await upsert({
      customerId,
      impactDimensions: impactDims,
      effortDimensions: effortDims,
      priorityFormula: formula,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <DimensionEditor
        title="Impact Dimensions"
        description="Define what makes a customer need high-impact."
        dimensions={impactDims}
        onChange={setImpactDims}
      />

      <DimensionEditor
        title="Effort Dimensions"
        description="Define what makes a customer need high-effort to address."
        dimensions={effortDims}
        onChange={setEffortDims}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-200 mb-1">
          Priority Formula
        </label>
        <p className="text-xs text-gray-400 mb-2">
          How impact and effort combine into a priority score. Higher = higher priority.
        </p>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-pattern-500"
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

function DimensionEditor({
  title,
  description,
  dimensions,
  onChange,
}: {
  title: string;
  description: string;
  dimensions: Dimension[];
  onChange: (dims: Dimension[]) => void;
}) {
  const addDimension = () => {
    onChange([
      ...dimensions,
      { key: `dim_${Date.now()}`, label: "New Dimension", description: "", weight: 1.0 },
    ]);
  };

  const updateDimension = (idx: number, patch: Partial<Dimension>) => {
    onChange(dimensions.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const removeDimension = (idx: number) => {
    onChange(dimensions.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        <button
          onClick={addDimension}
          className="flex items-center gap-1 text-xs text-pattern-400 hover:text-pattern-300"
        >
          <Plus size={12} />
          Add
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">{description}</p>

      <div className="space-y-2">
        {dimensions.map((dim, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dim.label}
                onChange={(e) => updateDimension(idx, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pattern-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">w:</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={dim.weight}
                  onChange={(e) =>
                    updateDimension(idx, { weight: parseFloat(e.target.value) })
                  }
                  className="w-14 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center"
                />
              </div>
              <button
                onClick={() => removeDimension(idx)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <input
              type="text"
              value={dim.description}
              onChange={(e) => updateDimension(idx, { description: e.target.value })}
              placeholder="Description (shown to Patrick)"
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
