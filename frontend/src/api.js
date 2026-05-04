const BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("fabriciq_token");
}

async function req(path, method = "GET", body = null) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Kuch galat hua");
  }
  return res.json();
}

export const api = {
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    }).then(r => r.json());
  },
  register: (data) => req("/api/auth/register", "POST", data),
  me: () => req("/api/auth/me"),
  dashboard: () => req("/api/dashboard/stats"),
  agents: () => req("/api/dashboard/agents"),
  alerts: () => req("/api/dashboard/alerts"),
  markAlertRead: (id) => req(`/api/dashboard/alerts/${id}/read`, "POST"),
  marketPrices: () => req("/api/dashboard/market-prices"),
  clients: () => req("/api/clients"),
  addClient: (data) => req("/api/clients", "POST", data),
  deleteClient: (id) => req(`/api/clients/${id}`, "DELETE"),
  invoices: () => req("/api/invoices"),
  generateInvoice: (data) => req("/api/invoices/generate", "POST", data),
  markPaid: (id) => req(`/api/invoices/${id}/paid`, "POST"),
  waMessages: () => req("/api/whatsapp/messages"),
  runAgent: (name) => req(`/api/agents/run/${name}`, "POST"),
};