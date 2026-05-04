import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fabriciq_token");
    const saved = localStorage.getItem("fabriciq_user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setChecking(false);
  }, []);

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f2c5c" }}>
      <div style={{ color: "#fff", fontSize: 20, fontFamily: "Arial" }}>🧵 FabricIQ load ho raha hai...</div>
    </div>
  );

  return user
    ? <Dashboard user={user} onLogout={() => { localStorage.removeItem("fabriciq_token"); localStorage.removeItem("fabriciq_user"); setUser(null); }} />
    : <Login onLogin={u => setUser(u)} />;
}