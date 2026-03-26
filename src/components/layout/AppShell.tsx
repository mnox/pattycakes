import { Link, useLocation, useParams } from "react-router-dom";
import { Users, Settings, Activity, Bot } from "lucide-react";
import CustomerSelector from "../customers/CustomerSelector";

const navItems = [
  { label: "Customers", icon: Users, href: "/customers" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { customerId } = useParams();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-pattern-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Patrick</div>
            <div className="text-xs text-gray-400">by Pattern</div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname.startsWith(href)
                  ? "bg-pattern-500/20 text-pattern-300"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {customerId && (
          <div className="border-t border-gray-800 px-2 py-3 space-y-0.5">
            <p className="px-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Customer
            </p>
            <Link
              to={`/customers/${customerId}/config`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname.includes("/config")
                  ? "bg-pattern-500/20 text-pattern-300"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              }`}
            >
              <Settings size={16} />
              Configure
            </Link>
            <Link
              to={`/customers/${customerId}/runs`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname.includes("/runs")
                  ? "bg-pattern-500/20 text-pattern-300"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              }`}
            >
              <Activity size={16} />
              Run History
            </Link>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
