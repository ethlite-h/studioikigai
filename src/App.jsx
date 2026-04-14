import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#FAFAF8",
  bgWarm: "#F5F3EF",
  ink: "#1C1917",
  inkSoft: "#57534E",
  inkMuted: "#78716C",
  accent: "#B45309",
  avGreen: "#4A7A4F",
  ivWarm: "#C2410C",
  border: "#E7E5E4",
  cardBg: "#FFFFFF",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(() => {
    if (typeof window === "undefined") return true;
    if (typeof IntersectionObserver === "undefined") return true;
    return prefersReducedMotion();
  });
  useEffect(() => {
    if (vis) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, vis]);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal();
  const reduce = prefersReducedMotion();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: reduce ? "none" : `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function ProductCard({ name, tagline, description, accent, features, cta, ctaHref, badge, delay = 0 }) {
  const [active, setActive] = useState(false);

  return (
    <Reveal delay={delay} style={{ flex: "1 1 420px", maxWidth: "520px", display: "flex" }}>
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        aria-label={`${name} — ${tagline} Visit ${cta} (opens in a new tab).`}
        style={{
          background: C.cardBg,
          borderRadius: "16px",
          border: `1px solid ${active ? accent : C.border}`,
          padding: "44px 40px 40px",
          transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
          transform: active ? "translateY(-4px)" : "translateY(0)",
          boxShadow: active
            ? `0 20px 60px -12px ${accent}18, 0 8px 24px -8px rgba(0,0,0,0.06)`
            : "0 1px 3px rgba(0,0,0,0.04)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div aria-hidden="true" style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: accent,
          opacity: active ? 1 : 0.4,
          transition: "opacity 0.35s ease",
        }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: accent,
            fontWeight: 600,
          }}>
            {name}
          </span>
          {badge && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.inkMuted,
              padding: "3px 10px",
              borderRadius: "100px",
              border: `1px solid ${C.border}`,
            }}>
              {badge}
            </span>
          )}
        </div>

        <h3 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "28px",
          fontWeight: 400,
          color: C.ink,
          lineHeight: 1.2,
          marginBottom: "16px",
        }}>
          {tagline}
        </h3>

        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "15px",
          lineHeight: 1.7,
          color: C.inkSoft,
          marginBottom: "28px",
        }}>
          {description}
        </p>

        <ul style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "32px",
          flex: 1,
        }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ color: accent, fontSize: "13px", marginTop: "2px", flexShrink: 0 }}>›</span>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
                lineHeight: 1.55,
                color: C.inkSoft,
              }}>
                {f}
              </span>
            </li>
          ))}
        </ul>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          fontWeight: 500,
          color: accent,
          letterSpacing: "0.02em",
        }}>
          {cta}
          <span aria-hidden="true" style={{
            transition: "transform 0.3s ease",
            transform: active ? "translateX(4px)" : "translateX(0)",
            display: "inline-block",
          }}>→</span>
        </div>
      </a>
    </Reveal>
  );
}

export default function StudioIkigai() {
  const reduce = prefersReducedMotion();
  const sectionPadX = "clamp(20px, 5vw, 48px)";

  return (
    <div style={{
      background: C.bg,
      color: C.ink,
      minHeight: "100vh",
      fontFamily: "'Outfit', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: ${C.accent}22; color: ${C.ink}; }

        a:focus-visible, button:focus-visible {
          outline: 2px solid ${C.accent};
          outline-offset: 3px;
          border-radius: 4px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes drawLine {
          from { width: 0; }
          to { width: 48px; }
        }

        html { scroll-behavior: smooth; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <header style={{
        padding: `28px ${sectionPadX}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "20px",
          color: C.ink,
          letterSpacing: "-0.01em",
        }}>
          Studio Ikigai
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: C.inkMuted,
          letterSpacing: "0.04em",
        }}>
          studioikigai.ai
        </div>
      </header>

      <main>
        <section style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: `100px ${sectionPadX} 80px`,
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.accent,
            marginBottom: "28px",
            fontWeight: 500,
            opacity: reduce ? 1 : 0,
            animation: reduce ? "none" : "fadeIn 0.8s ease 0.1s forwards",
          }}>
            Software for humans
          </p>

          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: C.ink,
            marginBottom: "32px",
            opacity: reduce ? 1 : 0,
            animation: reduce ? "none" : "fadeIn 0.8s ease 0.25s forwards",
          }}>
            Tools that give back<br />
            what was taken.
          </h1>

          <p style={{
            fontSize: "18px",
            lineHeight: 1.75,
            color: C.inkSoft,
            maxWidth: "560px",
            margin: "0 auto",
            fontWeight: 300,
            opacity: reduce ? 1 : 0,
            animation: reduce ? "none" : "fadeIn 0.8s ease 0.45s forwards",
          }}>
            Your feed was shaped by someone else's interests. Your voice was measured against someone else's standard. We make software that puts both back in your hands.
          </p>

          <div aria-hidden="true" style={{
            margin: "56px auto 0",
            height: "1px",
            background: C.accent,
            opacity: 0.3,
            width: reduce ? "48px" : "0",
            animation: reduce ? "none" : "drawLine 0.6s ease 0.8s both",
          }} />
        </section>

        <section aria-labelledby="products-heading" style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: `40px ${sectionPadX} 120px`,
        }}>
          <Reveal>
            <h2 id="products-heading" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.inkMuted,
              marginBottom: "40px",
              textAlign: "center",
            }}>
              Two products. One philosophy.
            </h2>
          </Reveal>

          <div style={{
            display: "flex",
            gap: "32px",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "stretch",
          }}>
            <ProductCard
              name="Antiviral"
              tagline="Your feed, finally yours."
              description="An on-device AI that curates your feed from your own subscriptions — YouTube, podcasts, blogs — answering to nobody but you. No servers, no tracking, no algorithmic agenda. Talk to your feed. It listens."
              accent={C.avGreen}
              badge="Free"
              features={[
                "Conversational feed control — say what you want, dismiss what you don't",
                "Transparent topic list you can see and edit",
                "On-device AI, no accounts, no tracking, no servers",
                "Family edition with parental dashboard",
              ]}
              cta="getantiviral.app"
              ctaHref="https://getantiviral.app"
              delay={0.1}
            />

            <ProductCard
              name="Inner Voice"
              tagline="Hear yourself clearly."
              description="A vocal wellness app that transforms your voice recordings into Visual Voice Prints and gives you AI feedback on authentic self-expression. Not how you perform. How you sound when you're being real."
              accent={C.ivWarm}
              badge="Beta"
              features={[
                "Voice recordings transformed into Voice Prints",
                "AI feedback on expression, not performance",
                "Voice Expression Index — authenticity over technique",
                "Companion apps for singing and music creation",
              ]}
              cta="findyourinnervoice.app"
              ctaHref="https://findyourinnervoice.app"
              delay={0.25}
            />
          </div>
        </section>

        <section aria-labelledby="philosophy-heading" style={{
          background: C.bgWarm,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: `100px ${sectionPadX}`,
            textAlign: "center",
          }}>
            <Reveal>
              <h2 id="philosophy-heading" style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.inkMuted,
                marginBottom: "32px",
              }}>
                Why we build
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <blockquote style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(22px, 3.5vw, 30px)",
                fontStyle: "italic",
                lineHeight: 1.55,
                color: C.ink,
                margin: "0 0 32px",
                fontWeight: 400,
              }}>
                Every platform built a model of your interests and hid it from you. They used it to sell your attention, shape your behavior, and measure your voice against metrics that serve their interests, not yours. We hand it back.
              </blockquote>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{
                fontSize: "17px",
                lineHeight: 1.75,
                color: C.inkSoft,
                fontWeight: 300,
              }}>
                This is the workshop where the tools are made. On-device intelligence. Transparent models. Your data stays on your phone. We build for people who want to understand themselves — what they pay attention to, how they express themselves — without handing that understanding to someone else.
              </p>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="principles-heading" style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: `100px ${sectionPadX}`,
        }}>
          <Reveal>
            <h2 id="principles-heading" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.inkMuted,
              marginBottom: "48px",
              textAlign: "center",
            }}>
              Principles
            </h2>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "40px 48px",
          }}>
            {[
              {
                title: "On-device first",
                body: "Intelligence runs on your hardware. Your data never leaves your phone. There's no server to breach because there's no server.",
              },
              {
                title: "Transparent by default",
                body: "Every model we build of your interests, your voice, your attention — you can see it, edit it, export it, delete it. It's yours.",
              },
              {
                title: "Expression over performance",
                body: "We don't optimize for engagement metrics or vocal perfection. We build tools that help you be more authentically yourself.",
              },
              {
                title: "Honesty over polish",
                body: "We ship what's real. No inflated metrics, no dark patterns, no language designed to obscure what the software actually does.",
              },
              {
                title: "Restraint as craft",
                body: "The features we leave out matter as much as the ones we build. Every addition is weighed against the cost of complexity.",
              },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div>
                  <div aria-hidden="true" style={{
                    width: "32px",
                    height: "2px",
                    background: C.accent,
                    opacity: 0.5,
                    marginBottom: "20px",
                  }} />
                  <h3 style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 400,
                    color: C.ink,
                    marginBottom: "10px",
                  }}>
                    {p.title}
                  </h3>
                  <p style={{
                    fontSize: "14.5px",
                    lineHeight: 1.7,
                    color: C.inkSoft,
                    fontWeight: 300,
                  }}>
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: `40px ${sectionPadX}`,
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "15px",
          color: C.inkSoft,
        }}>
          Studio Ikigai
        </div>

        <nav aria-label="Footer" style={{
          display: "flex",
          gap: "24px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
        }}>
          <a href="https://getantiviral.app" target="_blank" rel="noopener noreferrer" style={{
            color: C.inkMuted,
            textDecoration: "none",
          }}>
            Antiviral
          </a>
          <a href="https://findyourinnervoice.app" target="_blank" rel="noopener noreferrer" style={{
            color: C.inkMuted,
            textDecoration: "none",
          }}>
            Inner Voice
          </a>
          <a href="mailto:info@studioikigai.ai" style={{
            color: C.inkMuted,
            textDecoration: "none",
          }}>
            Contact
          </a>
        </nav>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          color: C.inkMuted,
        }}>
          © 2026 Studio Ikigai
        </div>
      </footer>
    </div>
  );
}
