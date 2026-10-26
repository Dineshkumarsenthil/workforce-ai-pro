import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Icon, Card, COLORS, RiskBadge, StatusPill, Table } from "./ui";

const DEPT_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6"];
const tooltipStyle = { background: "#1e1b4b", border: "none", borderRadius: 8, color: "#fff" };

export default function Overview({ summary, employees, alerts, empOf, setPage }) {
  const openAlerts = alerts.filter((a) => a.status === "Open").length;
  const closedAlerts = alerts.filter((a) => a.status === "Closed").length;
  const highCount = employees.filter((e) => e.risk_level === "High").length;
  const avgRisk = employees.length ? employees.reduce((sum, e) => sum + e.risk_score, 0) / employees.length : 0;
  const avgLevel = avgRisk >= 0.4 ? "Medium" : "Low";

  // Employees per department (donut) and risk levels per department (area chart)
  const departments = [...new Set(employees.map((e) => e.department))];
  const deptCounts = departments.map((d) => ({ name: d, value: employees.filter((e) => e.department === d).length }));
  const deptRisk = departments.map((d) => {
    const inDept = employees.filter((e) => e.department === d);
    const count = (level) => inDept.filter((e) => e.risk_level === level).length;
    return { department: d, High: count("High"), Medium: count("Medium"), Low: count("Low") };
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-5">
        <Kpi icon="users" tint="#4f46e5" title="Total employees" value={summary.total_employees} badge={`${departments.length} departments`} badgeColor="#4f46e5" />
        <Kpi icon="bell" tint="#f43f5e" title="Open alerts" value={openAlerts} badge={`${closedAlerts} closed`} badgeColor="#16a34a" />
        <Kpi icon="alert" tint="#f59e0b" title="High-risk employees" value={highCount} badge={`${employees.length ? ((highCount / employees.length) * 100).toFixed(1) : 0}%`} badgeColor="#dc2626" />
        <Kpi icon="trend" tint="#0ea5e9" title="Average risk" value={`${(avgRisk * 100).toFixed(0)}%`} badge={avgLevel} badgeColor={COLORS[avgLevel]} />
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-5">
        <Card title="Department Breakdown">
          <div className="relative">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={deptCounts} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={2} stroke="none">
                  {deptCounts.map((d, i) => <Cell key={d.name} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <p className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">{summary.total_employees}</span><span className="text-xs text-slate-500">Employees</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-slate-600">
            {deptCounts.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />{d.name}</span>
            ))}
          </div>
        </Card>

        <Card title="Risk Trends by Department">
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={deptRisk}>
              <defs>
                {["High", "Medium", "Low"].map((lvl) => (
                  <linearGradient key={lvl} id={`fill${lvl}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[lvl]} stopOpacity={0.25} /><stop offset="100%" stopColor={COLORS[lvl]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#e0e7ff" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="department" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#f97316", strokeDasharray: "4 4" }} />
              <Legend />
              {["Low", "Medium", "High"].map((lvl) => (
                <Area key={lvl} type="monotone" dataKey={lvl} stroke={COLORS[lvl]} strokeWidth={2} fill={`url(#fill${lvl})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-lg font-semibold">Recent Alerts</h2>
          <button onClick={() => setPage("alerts")} className="text-sm text-indigo-600 hover:underline">View all</button>
        </div>
        <Table head={["Employee", "Department", "Risk", "Status", "Raised on"]}>
          {alerts.slice(0, 5).map((a) => {
            const emp = empOf(a.employee_id);
            return (
              <tr key={a.id}>
                <td className="px-4 py-3.5 font-medium">{emp?.name}</td>
                <td className="px-4">{emp?.department}</td>
                <td className="px-4">{emp && <RiskBadge emp={emp} />}</td>
                <td className="px-4"><StatusPill status={a.status} /></td>
                <td className="px-4 text-slate-500">{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

function Kpi({ icon, tint, title, value, badge, badgeColor }) {
  return (
    <div className="bg-white border border-indigo-100/70 shadow-sm shadow-indigo-100/50 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: tint + "1a", border: `1px solid ${tint}33` }}>
        <Icon name={icon} color={tint} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{title}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-3xl font-bold">{value}</p>
          <span className="text-xs px-2 py-1 rounded-full border" style={{ color: badgeColor, borderColor: badgeColor + "55", background: badgeColor + "10" }}>{badge}</span>
        </div>
      </div>
    </div>
  );
}