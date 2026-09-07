import "./styles.css";
import { Intro } from "./components/Intro.jsx";
import { Nav } from "./components/Nav.jsx";
import { Thesis } from "./components/Thesis.jsx";
import { Ticker } from "./components/Ticker.jsx";
import { MathSection } from "./components/Math.jsx";
import { Products } from "./components/Products.jsx";
import { CaseStudy } from "./components/CaseStudy.jsx";
import { Founder } from "./components/Founder.jsx";
import { Manifesto } from "./components/Manifesto.jsx";
import { Stack } from "./components/Stack.jsx";
import { Essay } from "./components/Essay.jsx";
import { Footer } from "./components/Footer.jsx";
import { Cursor } from "./components/Cursor.jsx";

export default function App() {
  return (
    <div id="top">
      <Intro />
      <Nav />
      <main>
        <Thesis />
        <Ticker />
        <MathSection />
        <Products />
        <CaseStudy />
        <Founder />
        <Manifesto />
        <Stack />
        <Essay />
      </main>
      <Footer />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
