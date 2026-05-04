import { useState, useEffect } from "react";
import { api } from "../api";

const AGENT_ICONS = {
  "Data Agent": "🗄️", "Forecast Agent": "📈", "Alert Agent": "🔔",
  "Report Agent": "📄", "Billing Agent": "💳", "Support Agent": "💬",
  "Sales Agent": "🤝", "Market Agent": "🌐", "WhatsApp Agent": "📱"
};

export default function Dashboard({ user, onLogout }) {
  const [lang, setLang] = useState(localStorage.getItem("fabriciq_lang") || "hi");
  const [tab, setTab] = useState("home");
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [agentRunning, setAgentRunning] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function setLanguage(l) { setLang(l); localStorage.setItem("fabriciq_lang", l); }

  async function loadHome() {
    setLoading(true);
    try {
      const [s, a, al, p] = await Promise.all([api.dashboard(), api.agents(), api.alerts(), api.marketPrices()]);
      setStats(s); setAgents(a); setAlerts(al); setPrices(p);
    } catch (e) { showToast("Error: " + e.message); }
    setLoading(false);
  }

  async function loadClients() { setLoading(true); try { setClients(await api.clients()); } catch (e) {} setLoading(false); }
  async function loadInvoices() { setLoading(true); try { setInvoices(await api.invoices()); } catch (e) {} setLoading(false); }

  useEffect(() => {
    if (tab === "home") loadHome();
    else if (tab === "clients") loadClients();
    else if (tab === "invoices") loadInvoices();
  }, [tab]);

  async function runAgent(name) {
    setAgentRunning(name);
    try { await api.runAgent(name); showToast("✅ Agent run ho gaya!"); await loadHome(); }
    catch (e) { showToast("Error: " + e.message); }
    setAgentRunning("");
  }

  const navItems = [
    { key: "home", icon: "🏠", label: lang === "hi" ? "Dashboard" : "Dashboard" },
    { key: "clients", icon: "👥", label: "Clients" },
    { key: "invoices", icon: "📄", label: "Invoices" },
    { key: "agents", icon: "🤖", label: "Agents" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial", background: "#f0f2f5" }}>
      {/* SIDEBAR */}
      <div style={{ width: 220, background: "#0f2c5c", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>🧵 FabricIQ</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 4 }}>India ka Textile AI</div>
        </div>
        <div style={{ flex: 1, marginTop: 8 }}>
          {navItems.map(n => (
            <div key={n.key} onClick={() => setTab(n.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", color: tab === n.key ? "#fff" : "rgba(255,255,255,0.6)", background: tab === n.key ? "rgba(255,255,255,0.15)" : "transparent", cursor: "pointer", borderLeft: tab === n.key ? "3px solid #4a90d9" : "3px solid transparent", fontSize: 14 }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>CEO</div>
          <div style={{ color: "#fff", fontSize: 13, marginTop: 2 }}>{user?.name}</div>
          <button onClick={onLogout} style={{ marginTop: 10, width: "100%", padding: "7px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
            {lang === "hi" ? "Logout" : "Logout"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 220, flex: 1, padding: "24px 28px" }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}>
            {navItems.find(n => n.key === tab)?.icon} {navItems.find(n => n.key === tab)?.label}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setLanguage("hi")} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid " + (lang === "hi" ? "#1a4f8a" : "#ddd"), background: lang === "hi" ? "#1a4f8a" : "#fff", color: lang === "hi" ? "#fff" : "#666", cursor: "pointer", fontSize: 12 }}>हिंदी</button>
            <button onClick={() => setLanguage("en")} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid " + (lang === "en" ? "#1a4f8a" : "#ddd"), background: lang === "en" ? "#1a4f8a" : "#fff", color: lang === "en" ? "#fff" : "#666", cursor: "pointer", fontSize: 12 }}>EN</button>
          </div>
        </div>

        {/* HOME */}
        {tab === "home" && (loading ? <div style={{ textAlign: "center", padding: 60, color: "#888" }}>⏳ Load ho raha hai...</div> : <>
          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { icon: "💰", label: lang === "hi" ? "Monthly Revenue" : "Monthly Revenue", value: `₹${((stats?.mrr || 0) / 100000).toFixed(1)}L`, color: "#2ecc71" },
              { icon: "👥", label: lang === "hi" ? "Total Clients" : "Total Clients", value: stats?.total_clients || 0, color: "#3498db" },
              { icon: "⏳", label: lang === "hi" ? "Pending Payment" : "Pending Payment", value: `₹${((stats?.pending_amount || 0) / 1000).toFixed(0)}K`, color: "#f39c12" },
              { icon: "🔔", label: lang === "hi" ? "Alerts" : "Alerts", value: stats?.unread_alerts || 0, color: "#e74c3c" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#1a1a1a", marginTop: 6 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* AGENTS */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 14 }}>🤖 Agent Status</div>
              {agents.map(a => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.status === "success" ? "#2ecc71" : a.status === "failed" ? "#e74c3c" : "#bbb" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: "bold" }}>{AGENT_ICONS[a.name]} {a.name}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{a.last_ran ? new Date(a.last_ran).toLocaleString() : (lang === "hi" ? "Abhi tak nahi chala" : "Never ran")}</div>
                    </div>
                  </div>
                  <button onClick={() => runAgent(a.name.split(" ")[0].toLowerCase())} disabled={!!agentRunning} style={{ padding: "4px 12px", background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                    {agentRunning === a.name.split(" ")[0].toLowerCase() ? "⏳" : (lang === "hi" ? "Run" : "Run")}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* ALERTS */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 14 }}>🔔 Alerts</div>
                {alerts.filter(a => !a.is_read).length === 0
                  ? <div style={{ color: "#888", fontSize: 13 }}>✅ {lang === "hi" ? "Koi alert nahi" : "No alerts"}</div>
                  : alerts.filter(a => !a.is_read).slice(0, 4).map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, background: a.type === "danger" ? "#e74c3c" : a.type === "warning" ? "#f39c12" : "#3498db", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: "bold" }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{a.message}</div>
                      </div>
                      <button onClick={() => api.markAlertRead(a.id).then(loadHome)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>✕</button>
                    </div>
                  ))
                }
              </div>

              {/* MARKET PRICES */}
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 14 }}>📊 Market Rates</div>
                {prices.length === 0
                  ? <div style={{ color: "#888", fontSize: 13 }}>{lang === "hi" ? "Market agent run karo" : "Run market agent"}</div>
                  : prices.slice(0, 5).map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: "bold" }}>{p.commodity} <span style={{ color: "#aaa", fontWeight: "normal", fontSize: 12 }}>({p.city})</span></div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{p.unit}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: "bold" }}>₹{p.price.toFixed(0)}</div>
                        <div style={{ fontSize: 11, color: p.change_percent > 0 ? "#2ecc71" : "#e74c3c" }}>{p.change_percent > 0 ? "▲" : "▼"} {Math.abs(p.change_percent).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </>)}

        {/* CLIENTS */}
        {tab === "clients" && <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => setShowClientForm(true)} style={{ padding: "9px 20px", background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
              {lang === "hi" ? "+ Naya Client" : "+ New Client"}
            </button>
          </div>
          {showClientForm && <ClientForm lang={lang} onClose={() => setShowClientForm(false)} onSaved={() => { setShowClientForm(false); loadClients(); showToast("✅ Client add ho gaya!"); }} />}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {loading ? <div style={{ textAlign: "center", padding: 40 }}>⏳</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Naam", "Company", "City", "Plan", "Amount", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", background: "#f8f9fa", fontSize: 12, color: "#666" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {clients.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>{lang === "hi" ? "Koi client nahi — pehla client add karo!" : "No clients yet!"}</td></tr>
                    : clients.map(c => (
                      <tr key={c.id}>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: "bold" }}>{c.name}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>{c.company || "—"}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>{c.city || "—"}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}><span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, background: "#d5e8f5", color: "#1a5276" }}>{c.plan}</span></td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>₹{(c.plan_amount || 0).toLocaleString()}/mo</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>
                          <button onClick={() => setShowInvoiceForm(c.id)} style={{ padding: "4px 12px", background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Invoice</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
          {showInvoiceForm && <InvoiceForm lang={lang} clientId={showInvoiceForm} clients={clients} onClose={() => setShowInvoiceForm(false)} onSaved={() => { setShowInvoiceForm(false); showToast("✅ Invoice ban gayi!"); }} />}
        </>}

        {/* INVOICES */}
        {tab === "invoices" && <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => { loadClients(); setShowInvoiceForm(true); }} style={{ padding: "9px 20px", background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
              {lang === "hi" ? "Invoice Banao" : "Generate Invoice"}
            </button>
          </div>
          {showInvoiceForm && <InvoiceForm lang={lang} clientId={null} clients={clients} onClose={() => setShowInvoiceForm(false)} onSaved={() => { setShowInvoiceForm(false); loadInvoices(); showToast("✅ Invoice ban gayi!"); }} />}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {loading ? <div style={{ textAlign: "center", padding: 40 }}>⏳</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Invoice #", "Client", "Amount", "Total", "Status", "Due Date", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", background: "#f8f9fa", fontSize: 12, color: "#666" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {invoices.length === 0
                    ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>{lang === "hi" ? "Koi invoice nahi" : "No invoices yet"}</td></tr>
                    : invoices.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0", color: "#1a4f8a", fontWeight: "bold" }}>{inv.invoice_number}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>{inv.client_name}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>₹{(inv.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: "bold" }}>₹{(inv.total_amount || 0).toLocaleString()}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: inv.status === "paid" ? "#d5f5e3" : inv.status === "overdue" ? "#fde8e8" : "#fef9e7", color: inv.status === "paid" ? "#1e8449" : inv.status === "overdue" ? "#c0392b" : "#b7950b" }}>{inv.status}</span>
                        </td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #f0f0f0" }}>
                          {inv.status !== "paid" && <button onClick={() => api.markPaid(inv.id).then(loadInvoices)} style={{ padding: "4px 12px", background: "#2ecc71", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Paid</button>}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        </>}

        {/* AGENTS TAB */}
        {tab === "agents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { name: "Data Agent", key: "data", icon: "🗄️", desc: lang === "hi" ? "Raat 12 AM — client data sync" : "Midnight — client data sync" },
              { name: "Forecast Agent", key: "forecast", icon: "📈", desc: lang === "hi" ? "Subah 6 AM — demand forecast" : "6 AM — demand forecast" },
              { name: "Alert Agent", key: "alert", icon: "🔔", desc: lang === "hi" ? "24/7 — problems monitor karta hai" : "24/7 — monitors all problems" },
              { name: "Report Agent", key: "report", icon: "📄", desc: lang === "hi" ? "Weekly — PDF reports clients ko" : "Weekly — PDF reports to clients" },
              { name: "Billing Agent", key: "billing", icon: "💳", desc: lang === "hi" ? "Monthly — invoices auto-generate" : "Monthly — auto invoices" },
              { name: "Market Agent", key: "market", icon: "🌐", desc: lang === "hi" ? "Daily — market rates update" : "Daily — market rates update" },
              { name: "Sales Agent", key: "sales", icon: "🤝", desc: lang === "hi" ? "Daily — follow-up aur leads" : "Daily — follow-up and leads" },
              { name: "WhatsApp Agent", key: "whatsapp", icon: "📱", desc: lang === "hi" ? "24/7 — WhatsApp se poora app control" : "24/7 — control app via WhatsApp" },
            ].map(a => {
              const agentData = agents.find(ag => ag.name === a.name);
              return (
                <div key={a.key} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: "bold", color: "#1a1a1a" }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{a.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: agentData?.status === "success" ? "#2ecc71" : agentData?.status === "failed" ? "#e74c3c" : "#bbb" }} />
                        <span style={{ fontSize: 11, color: "#888" }}>{agentData?.status || "—"}</span>
                      </div>
                      <button onClick={() => runAgent(a.key)} disabled={!!agentRunning} style={{ padding: "6px 16px", background: agentRunning === a.key ? "#aaa" : "#1a4f8a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                        {agentRunning === a.key ? "⏳" : (lang === "hi" ? "Run Karo" : "Run Now")}
                      </button>
                    </div>
                  </div>
                  {agentData?.last_ran && <div style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>Last: {new Date(agentData.last_ran).toLocaleString()}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1a1a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>}
    </div>
  );
}

function ClientForm({ lang, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", company: "", phone: "", whatsapp: "", email: "", city: "", plan: "starter", plan_amount: 8000, gst_number: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.addClient(form); onSaved(); }
    catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>{lang === "hi" ? "Naya Client Add Karo" : "Add New Client"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {error && <div style={{ background: "#fde8e8", color: "#c0392b", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { k: "name", l: lang === "hi" ? "Naam *" : "Name *", r: true, p: "Suresh Jangid" },
              { k: "company", l: "Company", r: false, p: "XYZ Textiles" },
              { k: "phone", l: "Phone *", r: true, p: "9876543210" },
              { k: "whatsapp", l: "WhatsApp", r: false, p: "9876543210" },
              { k: "email", l: "Email", r: false, p: "suresh@xyz.com" },
              { k: "city", l: lang === "hi" ? "Shehar" : "City", r: false, p: "Surat" },
              { k: "gst_number", l: "GST Number", r: false, p: "27XXXXX..." },
            ].map(f => (
              <div key={f.k}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{f.l}</label>
                <input value={form[f.k]} onChange={set(f.k)} required={f.r} placeholder={f.p} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value, plan_amount: e.target.value === "starter" ? 8000 : e.target.value === "professional" ? 22000 : 50000 }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14 }}>
                <option value="starter">Starter — ₹8,000/mo</option>
                <option value="professional">Professional — ₹22,000/mo</option>
                <option value="enterprise">Enterprise — Custom</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={set("notes")} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, height: 70, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, background: "#f0f0f0", border: "none", borderRadius: 7, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 10, background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: "bold" }}>
              {loading ? "⏳..." : (lang === "hi" ? "✅ Client Add Karo" : "✅ Add Client")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceForm({ lang, clientId, clients, onClose, onSaved }) {
  const [form, setForm] = useState({ client_id: clientId || "", amount: "", due_days: 15 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault(); setLoading(true); setError("");
    try { await api.generateInvoice({ client_id: parseInt(form.client_id), amount: parseFloat(form.amount), due_days: parseInt(form.due_days) }); onSaved(); }
    catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>{lang === "hi" ? "Invoice Banao" : "Generate Invoice"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {error && <div style={{ background: "#fde8e8", color: "#c0392b", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
        <form onSubmit={save}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Client</label>
          <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} required style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, marginBottom: 14 }}>
            <option value="">{lang === "hi" ? "Client choose karo" : "Select Client"}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company || c.city}</option>)}
          </select>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount (₹)</label>
          <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="8000" style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{lang === "hi" ? "Due kitne din mein?" : "Due in days?"}</label>
          <input type="number" value={form.due_days} onChange={e => setForm(f => ({ ...f, due_days: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 7, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
          {form.amount && <div style={{ background: "#f0f7ff", padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 13, color: "#1a4f8a", fontWeight: "bold" }}>Total (with 18% GST): ₹{(parseFloat(form.amount) * 1.18).toFixed(0)}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, background: "#f0f0f0", border: "none", borderRadius: 7, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 10, background: "#1a4f8a", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: "bold" }}>
              {loading ? "⏳..." : (lang === "hi" ? "📄 Invoice Banao" : "📄 Generate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}