import { useState } from "react";
import api from "./api";
import { BRAND } from "./ui";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      onLogin();
    } catch {
      setError("Wrong username or password");
    }
  }

  const input = "w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-100 to-sky-200">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-96 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: BRAND }}>W</div>
          <span className="font-semibold text-lg">WorkForce AI Pro</span>
        </div>
        <p className="text-sm text-slate-500">Sign in to the HR intelligence platform</p>
        <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Sign in</button>
      </form>
    </div>
  );
}