import { useState } from "react";
import { api } from "../api.js";
import { navigate } from "../router.js";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api.login(password);
      navigate("/research/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <form className="wrap research-page narrow" onSubmit={submit}>
      <p className="mono kicker">Research admin</p>
      <h1 className="h4">Sign in</h1>
      <label className="q-sub">Password
        <input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-nav">
        <button type="submit" className="btn" disabled={busy || !password}><span>Sign in</span><span className="arr">→</span></button>
      </div>
    </form>
  );
}
