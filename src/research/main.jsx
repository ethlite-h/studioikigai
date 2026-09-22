import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../styles.css";
import { Seal } from "../components/Seal.jsx";
import { usePath } from "./router.js";
import { Landing } from "./pages/Landing.jsx";
import { ParentSurvey } from "./pages/ParentSurvey.jsx";
import { KidInterview } from "./pages/KidInterview.jsx";
import { Thanks } from "./pages/Thanks.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { Admin } from "./pages/Admin.jsx";

// No analytics, no fonts, no third-party anything on /research/*.
function Header() {
  return (
    <header className="nav solid research-nav">
      <div className="wrap bar">
        <a className="brand" href="/"><Seal size={30} /><span>Studio Ikigai</span></a>
        <span className="mono">Research</span>
      </div>
    </header>
  );
}

function NotFound() {
  return <div className="wrap research-page"><p className="body">Nothing here.</p></div>;
}

const TITLES = {
  "/research": "YouTube talks to our kids every day. Let's be part of the conversation.",
  "/research/parents": "The parent survey — Studio Ikigai",
  "/research/kids": "A conversation with your kid — Studio Ikigai",
  "/research/thanks": "Thank you — Studio Ikigai",
  "/research/admin": "Research dashboard — Studio Ikigai",
  "/research/admin/login": "Sign in — Studio Ikigai",
};

function App() {
  const path = usePath();
  useEffect(() => { document.title = TITLES[path] || "Studio Ikigai — Research"; }, [path]);
  const page =
    path === "/research" ? <Landing /> :
    path === "/research/parents" ? <ParentSurvey /> :
    path === "/research/kids" ? <KidInterview /> :
    path === "/research/thanks" ? <Thanks /> :
    path === "/research/admin" ? <Admin /> :
    path === "/research/admin/login" ? <AdminLogin /> :
    <NotFound />;
  return (
    <div className={`research ${path.startsWith("/research/admin") ? "is-admin" : ""}`}>
      <Header />
      <main>{page}</main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>,
);
