import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import CustomerForm from "./CustomerForm";

export default function CustomerSelector({ selectedId }: { selectedId?: string }) {
  const customers = useQuery(api.customers.list);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Customers
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-pattern-400 hover:text-pattern-300 transition-colors"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      <div className="space-y-1">
        {customers?.map((c) => (
          <button
            key={c._id}
            onClick={() => navigate(`/customers/${c._id}`)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedId === c._id
                ? "bg-pattern-500/20 text-pattern-200 border border-pattern-500/30"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <div className="font-medium">{c.company}</div>
            <div className="text-xs text-gray-500">{c.name}</div>
          </button>
        ))}
        {customers?.length === 0 && (
          <p className="text-xs text-gray-500 px-3 py-2">No customers yet.</p>
        )}
      </div>

      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
