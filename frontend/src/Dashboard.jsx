import { useEffect, useState } from "react";
import api from "./api";
import Overview from "./Overview";
import Predict from "./Predict";
import { Icon, Card, RiskBadge, StatusPill, Select, Table, BRAND } from "./ui";

const MENU = [
  { id: "overview", label: "Dashboard", icon: "grid", title: "Dashboard Overview" },
  { id: "employees", label: "Employees", icon: "users", title: "Employee Risk Register" },
  { id: "alerts", label: "Alerts", icon: "bell", title: "HR Alerts & Interventions" },
  { id: "logs", label: "Monitoring Logs", icon: "list", title: "Monitoring Logs" },
  { id: "predict", label: "Risk Predictor", icon: "zap", title: "Attrition Risk Predictor" },
];

export default function Dashboard({ onLogout }) {
  const [page, setPage] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  async function loadData() {
    try {
      const [s, e, a, l] = await Promise.all([
        api.get("/analytics/summary"), api.get("/employees"), api.get("/alerts"), api.get("/logs"),
      ]);
      setSummary(s.data); setEmployees(e.data); setAlerts(a.data); setLogs(l.data);
      setError("");
    } catch {
      setError("Cannot reach the server. Check that the backend is running on port 8000.");
    }
  }

  // Refresh every 10 seconds so the dashboard behaves like a live monitor
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  async function startIntervention(id) {
    await api.post(`/alerts/${id}/intervene`, { action: "HR meeting scheduled" });
    loadData();
  }
  async function closeAlert(id) {
    await api.post(`/alerts/${id}/close`);
    loadData();
  }
  async function simulateOvertime(emp) {
    await api.put(`/employees/${emp.id}/activity`, {
      overtime_hours: Math.min(emp.overtime_hours + 15, 60),
      satisfaction: Math.max(emp.satisfaction - 1, 1),
    });
    loadData();
  }
  function exportCsv() {
    const rows = employees.map((e) => [e.name, e.department, e.satisfaction, e.overtime_hours, e.risk_score.toFixed(2), e.risk_level].join(","));
    const csv = ["Name,Department,Satisfaction,Overtime,Risk score,Risk level", ...rows].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "employee_risk_report.csv";
    link.click();
  }
  // Typing in the search box jumps to the Employees page
  function handleSearch(text) {
    setQuery(text);
    if (text) setPage("employees");
  }

  if (!summary) return <p className="p-8">{error || "Loading..."}</p>;

  const empOf = (id) => employees.find((e) => e.id === id);
  const openAlerts = alerts.filter((a) => a.status === "Open").length;
  const current = MENU.find((m) => m.id === page);
  const visibleEmployees = employees.filter((e) =>
    (deptFilter === "All" || e.department === deptFilter) &&
    (riskFilter === "All" || e.risk_level === riskFilter) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-sky-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 relative p-4 bg-gradient-to-b from-[#1e1b4b] to-[#312e81]">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: BRAND }}>W</div>
          <span className="font-semibold text-lg text-white">WorkForce AI</span>
        </div>
        {MENU.map((m) => (
          <button key={m.id} onClick={() => setPage(m.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm ${page === m.id ? "bg-white/15 text-white font-medium" : "text-indigo-200 hover:bg-white/10"}`}>
            <Icon name={m.icon} size={16} /> {m.label}
            {m.id === "alerts" && openAlerts > 0 && <span className="ml-auto text-xs bg-rose-500 text-white rounded-full px-2">{openAlerts}</span>}
          </button>
        ))}
        <button onClick={onLogout} className="absolute bottom-6 flex items-center gap-3 px-3 text-sm text-indigo-300 hover:text-white">
          <Icon name="logout" size={16} /> Logout
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0">
        <header className="bg-white/70 backdrop-blur border-b border-white/60 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Dashboard</p>
            <h1 className="text-xl font-semibold">{current.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-indigo-100 bg-white rounded-lg px-3 py-2 w-72">
              <Icon name="search" size={15} color="#94a3b8" />
              <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search employees..." className="text-sm outline-none flex-1" />
            </div>
            <button onClick={exportCsv} className="flex items-center gap-2 border border-indigo-100 bg-white rounded-lg px-3 py-2 text-sm hover:bg-indigo-50">
              <Icon name="download" size={15} /> Export CSV
            </button>
          </div>
        </header>

        <main className="p-8">
          {page === "overview" && <Overview {...{ summary, employees, alerts, empOf, setPage }} />}

          {page === "employees" && (
            <Card className="!p-0 overflow-hidden">
              <div className="flex gap-3 p-6 pb-4">
                <Select label="Department" value={deptFilter} onChange={setDeptFilter} options={["All", ...new Set(employees.map((e) => e.department))]} />
                <Select label="Risk level" value={riskFilter} onChange={setRiskFilter} options={["All", "High", "Medium", "Low"]} />
              </div>
              <Table head={["Name", "Department", "Satisfaction", "Overtime (h)", "Risk", ""]}>
                {visibleEmployees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3.5 font-medium">{e.name}</td><td className="px-4">{e.department}</td>
                    <td className="px-4">{e.satisfaction}</td><td className="px-4">{e.overtime_hours}</td>
                    <td className="px-4"><RiskBadge emp={e} /></td>
                    <td className="px-4"><button className="text-xs text-indigo-600 hover:underline" onClick={() => simulateOvertime(e)}>Simulate overtime</button></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {page === "alerts" && (
            <Card className="!p-0 overflow-hidden">
              <Table head={["Employee", "Message", "Status", "Raised on", ""]}>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3.5 font-medium">{empOf(a.employee_id)?.name}</td>
                    <td className="px-4">{a.message}</td>
                    <td className="px-4"><StatusPill status={a.status} /></td>
                    <td className="px-4 text-slate-500">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="px-4 space-x-4 whitespace-nowrap">
                      {a.status === "Open" && <button className="text-indigo-600" onClick={() => startIntervention(a.id)}>Start intervention</button>}
                      {a.status !== "Closed" && <button className="text-green-600" onClick={() => closeAlert(a.id)}>Close</button>}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {page === "logs" && (
            <Card className="!p-0 overflow-hidden">
              <Table head={["Time", "Employee", "Event"]}>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-4 font-medium">{empOf(l.employee_id)?.name}</td><td className="px-4">{l.event}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {page === "predict" && <Predict />}
        </main>
      </div>
    </div>
  );
}