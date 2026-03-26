import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import CustomerSelector from "../components/customers/CustomerSelector";
import DataSourcePanel from "../components/ingestion/DataSourcePanel";
import AgentLauncher from "../components/agent/AgentLauncher";
import RunStream from "../components/agent/RunStream";
import NeedsBoard from "../components/needs/NeedsBoard";
import RoadmapView from "../components/roadmap/RoadmapView";

export default function CustomerPage() {
  const { customerId } = useParams<{ customerId?: string }>();
  const customer = useQuery(
    api.customers.get,
    customerId ? { id: customerId as Id<"customers"> } : "skip"
  );
  const [activeRunId, setActiveRunId] = useState<Id<"runs"> | null>(null);
  const [activeTab, setActiveTab] = useState<"stream" | "needs" | "roadmap">("stream");

  if (!customerId) {
    return (
      <div className="flex h-full">
        <div className="w-72 border-r border-gray-800 overflow-y-auto">
          <CustomerSelector />
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">Select or create a customer to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-800 overflow-y-auto shrink-0">
        <CustomerSelector selectedId={customerId} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div>
            <h1 className="text-sm font-semibold text-white">{customer?.company ?? "..."}</h1>
            <p className="text-xs text-gray-400">{customer?.name}</p>
          </div>
          <AgentLauncher
            customerId={customerId as Id<"customers">}
            onRunStarted={(id) => {
              setActiveRunId(id);
              setActiveTab("stream");
            }}
          />
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-72 border-r border-gray-800 shrink-0 overflow-hidden">
            <DataSourcePanel customerId={customerId as Id<"customers">} />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex border-b border-gray-800 px-4">
              {(["stream", "needs", "roadmap"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-3 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "text-pattern-300 border-b-2 border-pattern-500"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab === "stream" ? "Analysis" : tab === "needs" ? "Needs" : "Roadmap"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === "stream" && (
                <RunStream runId={activeRunId} />
              )}
              {activeTab === "needs" && (
                <NeedsBoard
                  customerId={customerId as Id<"customers">}
                  runId={activeRunId}
                />
              )}
              {activeTab === "roadmap" && (
                <RoadmapView
                  customerId={customerId as Id<"customers">}
                  runId={activeRunId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
