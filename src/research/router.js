import { useEffect, useState } from "react";

// Five routes; a History-API switch is enough.
const listeners = new Set();
export function navigate(path, { replace = false } = {}) {
  window.history[replace ? "replaceState" : "pushState"](null, "", path);
  listeners.forEach((l) => l(window.location.pathname));
  window.scrollTo(0, 0);
}
export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    listeners.add(setPath);
    const pop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", pop);
    return () => { listeners.delete(setPath); window.removeEventListener("popstate", pop); };
  }, []);
  return path.replace(/\/+$/, "") || "/";
}
export function cohortFromUrl() {
  const c = new URLSearchParams(window.location.search).get("c") || "";
  return c.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}
