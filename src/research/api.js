async function call(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  if (!res.ok) throw Object.assign(new Error(data?.error || `Request failed (${res.status})`), { status: res.status });
  return data;
}
export const api = {
  submit: (body) => call("/api/research/submit", { method: "POST", body }),
  draft: (body) => call("/api/research/draft", { method: "POST", body }),
  session: () => call("/api/research/admin/login"),
  login: (password) => call("/api/research/admin/login", { method: "POST", body: { password } }),
  logout: () => call("/api/research/admin/login", { method: "DELETE" }),
  data: () => call("/api/research/admin/data"),
};
