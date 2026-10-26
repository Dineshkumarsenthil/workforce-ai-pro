// Small shared pieces used by every page: colours, icons, cards and badges.

export const COLORS = { High: "#dc2626", Medium: "#f59e0b", Low: "#16a34a" };
export const BRAND = "linear-gradient(135deg, #6366f1, #8b5cf6)";

const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  trend: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3",
};

export function Icon({ name, size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

export const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white border border-indigo-100/70 shadow-sm shadow-indigo-100/50 rounded-2xl p-6 ${className}`}>
    {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
    {children}
  </div>
);

export const RiskBadge = ({ emp }) => (
  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: COLORS[emp.risk_level], background: COLORS[emp.risk_level] + "1a" }}>
    {(emp.risk_score * 100).toFixed(0)}% {emp.risk_level}
  </span>
);

export const StatusPill = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
    <Icon name="check" size={12} /> {status}
  </span>
);

export const Select = ({ label, value, onChange, options }) => (
  <label className="text-xs text-slate-500">
    {label}
    <select value={value} onChange={(e) => onChange(e.target.value)} className="block mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>
);

// Table wrapper so every table has the same header style
export const Table = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
      <thead className="bg-indigo-50/60 text-xs uppercase text-indigo-900/60">
        <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100 [&>tr:hover]:bg-indigo-50/50">{children}</tbody>
    </table>
  </div>
);