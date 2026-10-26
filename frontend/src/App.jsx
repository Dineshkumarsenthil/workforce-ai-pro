import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  function logout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
  }

  return loggedIn ? <Dashboard onLogout={logout} /> : <Login onLogin={() => setLoggedIn(true)} />;
}
