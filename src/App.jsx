import { useState, useEffect, useRef } from "react";

/* ─── palette ─── */
const C = {
  bg: "#FAFAF8",
  bgWarm: "#F5F3EF",
  ink: "#1C1917",
  inkSoft: "#57534E",
  inkMuted: "#A8A29E",
  accent: "#B45309",    // warm amber — studio identity
  avGreen: "#5E8C61",   // antiviral — muted green per brief
  ivWarm: "#C2410C",    // inner voice — burnt orange/red
  border: "#E7E5E4",
  cardBg: "#FFFFFF",
};

/* ─── intersection observer hook ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── product card ─── */
function ProductCard({ name, tagline, description, accent, features, cta, ctaHref, badge, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal delay={delay} style={{ flex: "1 1 420px", maxWidth: "520px" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: C.cardBg,
          borderRadius: "16px",
          border: `1px solid ${hovered ? accent : C.border}`,
          padding: "44px 40px 40px",
          transition: "all 0.35s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered
            ? `0 20px 60px -12px ${accent}18, 0 8px 24px -8px rgba(0,0,0,0.06)`
            : "0 1px 3px rgba(0,0,0,0.04)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={() => window.open(ctaHref, "_blank")}
      >
        {/* Accent line at top */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: accent,
          opacity: hovered ? 1 : 0.4,
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

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px", flex: 1 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: accent, fontSize: "13px", marginTop: "2px", flexShrink: 0 }}>›</span>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
                lineHeight: 1.55,
                color: C.inkSoft,
              }}>
                {f}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          fontWeight: 500,
          color: accent,
          letterSpacing: "0.02em",
          transition: "gap 0.3s ease",
        }}>
          {cta}
          <span style={{
            transition: "transform 0.3s ease",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
            display: "inline-block",
          }}>→</span>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── main ─── */
export default function StudioIkigai() {
  return (
    <div style={{
      background: C.bg,
      color: C.ink,
      minHeight: "100vh",
      fontFamily: "'Outfit', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: ${C.accent}22; color: ${C.ink}; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes drawLine {
          from { width: 0; }
          to { width: 48px; }
        }

        html { scroll-behavior: smooth; }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        padding: "28px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
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
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "100px 48px 80px",
        textAlign: "center",
      }}>
        <div style={{
          opacity: 0,
          animation: "fadeIn 0.8s ease 0.1s forwards",
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.accent,
            marginBottom: "28px",
            fontWeight: 500,
          }}>
            Software for humans
          </p>
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: C.ink,
          marginBottom: "32px",
          opacity: 0,
          animation: "fadeIn 0.8s ease 0.25s forwards",
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
          opacity: 0,
          animation: "fadeIn 0.8s ease 0.45s forwards",
        }}>
          Your feed was shaped by someone else's interests. Your voice was measured against someone else's standard. We make software that puts both back in your hands.
        </p>

        {/* Drawn line divider */}
        <div style={{
          margin: "56px auto 0",
          height: "1px",
          background: C.accent,
          opacity: 0.3,
          width: "48px",
          animation: "drawLine 0.6s ease 0.8s both",
        }} />
      </section>

      {/* ─── PRODUCTS ─── */}
      <section style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 48px 120px",
      }}>
        <Reveal>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.inkMuted,
            marginBottom: "40px",
            textAlign: "center",
          }}>
            Two products. One philosophy.
          </p>
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

      {/* ─── PHILOSOPHY ─── */}
      <section style={{
        background: C.bgWarm,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "100px 48px",
          textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: C.inkMuted,
              marginBottom: "32px",
            }}>
              Why we build
            </p>
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

      {/* ─── PRINCIPLES ─── */}
      <section style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "100px 48px",
      }}>
        <Reveal>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.inkMuted,
            marginBottom: "48px",
            textAlign: "center",
          }}>
            Principles
          </p>
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
                <div style={{
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

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: "40px 48px",
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

        <div style={{
          display: "flex",
          gap: "24px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
        }}>
          <a href="https://getantiviral.app" target="_blank" rel="noopener noreferrer" style={{
            color: C.inkMuted,
            textDecoration: "none",
            transition: "color 0.2s",
          }}>
            Antiviral
          </a>
          <a href="https://findyourinnervoice.app" target="_blank" rel="noopener noreferrer" style={{
            color: C.inkMuted,
            textDecoration: "none",
            transition: "color 0.2s",
          }}>
            Inner Voice
          </a>
          <a href="mailto:info@studioikigai.ai" style={{
            color: C.inkMuted,
            textDecoration: "none",
            transition: "color 0.2s",
          }}>
            Contact
          </a>
        </div>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          color: C.inkMuted,
          opacity: 0.6,
        }}>
          2026
        </div>
      </footer>
    </div>
  );
}
