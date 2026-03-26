import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import CustomerPage from "./pages/CustomerPage";
import ConfigPage from "./pages/ConfigPage";
import RunsPage from "./pages/RunsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerPage />} />
        <Route path="/customers/:customerId" element={<CustomerPage />} />
        <Route path="/customers/:customerId/config" element={<ConfigPage />} />
        <Route path="/customers/:customerId/runs" element={<RunsPage />} />
      </Routes>
    </AppShell>
  );
}
