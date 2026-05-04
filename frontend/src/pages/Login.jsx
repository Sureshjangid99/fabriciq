import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [lang, setLang] = useState("hi");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleLogin(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      if (res.access_token) {
        localStorage.setItem("fabriciq_token", res.access_token);
        localStorage.setItem("fabriciq_user", JSON.stringify(res.user));
        onLogin(res.user);
      } else {
        setError(res.detail || "Email ya password galat hai");
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.register(form);
      if (res.token) {
        localStorage.setItem("fabriciq_token", res.token);
        localStorage.setItem("fabriciq_user", JSON.stringify(res.user));
        onLogin(res.user);
      } else {
        setError(res.detail || "Registration fail ho gayi");
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f2c5c, #1a4f8a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>🧵</div>
          <div style={{ fontSize: 28, fontWeight: "bold", color: "#1a4f8a" }}>FabricIQ</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
            {lang === "hi" ? "India ka Pehla Textile AI Super App" : "India's First Textile AI Super App"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <button onClick={() => setLang("hi")} style={{ padding: "5px 16px", borderRadius: 20, border: "1px solid " + (lang === "hi" ? "#1a4f8a" : "#ddd"), background: lang === "hi" ? "#1a4f8a" : "#fff", color: lang === "hi" ? "#fff" : "#666", cursor: "pointer", fontSize: 13 }}>हिंदी</button>
          <button onClick={() => setLang("en")} style={{ padding: "5px 16px", borderRadius: 20, border: "1px solid " + (lang === "en" ? "#1a4f8a" : "#ddd"), background: lang === "en" ? "#1a4f8a" : "#fff", color: lang === "en" ? "#fff" : "#666", cursor: "pointer", fontSize: 13 }}>English</button>
        </div>

        {error && <div style={{ background: "#fde8e8", color: "#c0392b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, textAlign: "center" }}>⚠️ {error}</div>}

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{lang === "hi" ? "Poora Naam" : "Full Name"}</label>
              <input value={form.name} onChange={set("name")} required placeholder="Suresh Jangid" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{lang === "hi" ? "Mobile Number" : "Mobile Number"}</label>
              <input value={form.phone} onChange={set("phone")} required placeholder="9876543210" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
            </div>
          </>}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" value={form.email} onChange={set("email")} required placeholder="suresh@fabriciq.in" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Password</label>
            <input type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "⏳ Wait karo..." : mode === "login" ? (lang === "hi" ? "Login Karo" : "Login") : (lang === "hi" ? "Register Karo" : "Register")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#666" }}>
          {mode === "login"
            ? <>{lang === "hi" ? "Account nahi hai?" : "No account?"} <span onClick={() => setMode("register")} style={{ color: "#1a4f8a", cursor: "pointer", fontWeight: "bold" }}>{lang === "hi" ? "Register Karo" : "Register"}</span></>
            : <>{lang === "hi" ? "Account hai?" : "Have account?"} <span onClick={() => setMode("login")} style={{ color: "#1a4f8a", cursor: "pointer", fontWeight: "bold" }}>{lang === "hi" ? "Login Karo" : "Login"}</span></>
          }
        </div>
      </div>
    </div>
  );
}