import { useParams } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import ConfigPanel from "../components/config/ConfigPanel";
import CustomerSelector from "../components/customers/CustomerSelector";

export default function ConfigPage() {
  const { customerId } = useParams<{ customerId?: string }>();

  if (!customerId) {
    return (
      <div className="flex h-full">
        <div className="w-72 border-r border-gray-800">
          <CustomerSelector />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">Select a customer to configure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-800 shrink-0">
        <CustomerSelector selectedId={customerId} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ConfigPanel customerId={customerId as Id<"customers">} />
      </div>
    </div>
  );
}
