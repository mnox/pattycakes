import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { X } from "lucide-react";

export default function CustomerForm({ onClose }: { onClose: () => void }) {
  const createCustomer = useMutation(api.customers.create);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    company: "",
    industry: "",
    tier: "" as "" | "enterprise" | "mid-market" | "smb",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await createCustomer({
      name: form.name,
      company: form.company,
      industry: form.industry || undefined,
      tier: form.tier || undefined,
    });
    navigate(`/customers/${id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">New Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Contact Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
          />
          <Field
            label="Company"
            value={form.company}
            onChange={(v) => setForm((f) => ({ ...f, company: v }))}
            required
          />
          <Field
            label="Industry"
            value={form.industry}
            onChange={(v) => setForm((f) => ({ ...f, industry: v }))}
          />
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Tier</label>
            <select
              value={form.tier}
              onChange={(e) =>
                setForm((f) => ({ ...f, tier: e.target.value as typeof form.tier }))
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pattern-500"
            >
              <option value="">Select tier</option>
              <option value="smb">SMB</option>
              <option value="mid-market">Mid-Market</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-pattern-500 hover:bg-pattern-600 text-white text-sm font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pattern-500"
      />
    </div>
  );
}
