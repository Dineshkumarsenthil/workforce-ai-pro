import { useState } from "react";
import api from "./api";
import { Card, COLORS } from "./ui";

const FIELDS = [
  ["salary", "Salary", 60000], ["years_at_company", "Years at company", 3], ["satisfaction", "Satisfaction (1-5)", 3],
  ["overtime_hours", "Overtime hours / month", 20], ["years_since_promotion", "Years since promotion", 2], ["performance", "Performance (1-5)", 3],
];

// What-if tool: HR types in employee details and the AI model returns an attrition risk.
export default function Predict() {
  const [values, setValues] = useState(Object.fromEntries(FIELDS.map(([key, , start]) => [key, start])));
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)]));
    const res = await api.post("/predict", body);
    setResult(res.data);
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card title="Employee details">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {FIELDS.map(([key, label]) => (
            <label key={key} className="text-xs text-slate-500">{label}
              <input type="number" step="any" value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                className="block w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900" />
            </label>
          ))}
          <button className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium">Predict attrition risk</button>
        </form>
      </Card>
      <Card title="Prediction result">
        {!result && <p className="text-sm text-slate-500">Fill in the details and run the prediction.</p>}
        {result && (
          <div>
            <p className="text-5xl font-bold" style={{ color: COLORS[result.risk_level] }}>{(result.risk_score * 100).toFixed(0)}%</p>
            <p className="text-slate-500 mt-1">{result.risk_level} attrition risk</p>
            <div className="h-2 bg-slate-100 rounded-full mt-4"><div className="h-2 rounded-full" style={{ width: `${result.risk_score * 100}%`, background: COLORS[result.risk_level] }} /></div>
          </div>
        )}
      </Card>
    </div>
  );
}
