"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function Counter({ to, duration = 1600 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

const STATS = [
  { label: "LR Questions", value: 165, suffix: "+" },
  { label: "Question Types", value: 12, suffix: "" },
  { label: "Flashcards", value: 64, suffix: "" },
  { label: "Study Tools", value: 4, suffix: "" },
];

const FEATURES = [
  {
    href: "/test",
    icon: "◻",
    title: "Test Simulator",
    desc: "Full 4-section LSAT under timed, test-center conditions. Split-screen layout, annotation tools, flagging, and answer elimination — identical to LawHub.",
    tag: "4 sections · 35 min each",
  },
  {
    href: "/study/drills",
    icon: "⚡",
    title: "Question Drills",
    desc: "Filter 165+ original questions by type and difficulty. Immediate feedback with detailed explanations for every choice — right and wrong.",
    tag: "All 12 LR types",
  },
  {
    href: "/study/flashcards",
    icon: "◈",
    title: "Flashcards",
    desc: "3D flip cards for LR question types, logical fallacies, RC types, and key vocabulary. Track what you know and cycle back to what needs work.",
    tag: "64 cards · 4 decks",
  },
  {
    href: "/dashboard",
    icon: "◇",
    title: "Dashboard",
    desc: "Score trend, accuracy by question type, and weak-area targeting. Starts tracking on your first session — no account required.",
    tag: "Auto-tracked",
  },
];

const FORMAT = [
  { label: "Section 1", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { label: "Section 2", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { label: "Break", type: "10-Minute Break", q: "—", t: "10 min", isBreak: true },
  { label: "Section 3", type: "Reading Comprehension", q: "26–28", t: "35 min", scored: true },
  { label: "Section 4", type: "Experimental", q: "22–28", t: "35 min", scored: false },
];

export default function HomePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{
        position: "relative",
        padding: "88px 60px 80px",
        borderBottom: "1px solid var(--color-border)",
        overflow: "hidden",
      }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          pointerEvents: "none",
        }} />
        {/* Gradient blob */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-60px",
          width: "520px",
          height: "520px",
          background: "radial-gradient(circle, rgba(27,79,216,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "720px" }}>
          <div className="fade-in" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--color-accent-light)",
            border: "1px solid rgba(27,79,216,0.2)",
            borderRadius: "100px",
            padding: "5px 14px 5px 10px",
            marginBottom: "32px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "var(--color-accent)",
              boxShadow: "0 0 0 3px rgba(27,79,216,0.2)",
              display: "inline-block",
              animation: "pulse-glow 2s infinite",
            }} />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-accent)", letterSpacing: "0.04em" }}>
              2026 LSAT Prep Platform
            </span>
          </div>

          <h1 className="fade-up delay-1" style={{
            fontFamily: "var(--font-serif)",
            fontWeight: "400",
            fontSize: "clamp(42px, 6vw, 68px)",
            lineHeight: "1.06",
            letterSpacing: "-0.01em",
            marginBottom: "28px",
            color: "var(--color-text-primary)",
          }}>
            The LSAT,{" "}
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #1B4FD8 0%, #6366F1 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              exactly
            </span>{" "}
            as it appears on test day.
          </h1>

          <p className="fade-up delay-2" style={{
            fontSize: "17px",
            lineHeight: "1.7",
            color: "var(--color-text-secondary)",
            maxWidth: "520px",
            marginBottom: "48px",
          }}>
            KyLaw replicates the 2026 LawHub interface with the real tools, real timer,
            and real format — so test day feels familiar before it begins.
          </p>

          <div className="fade-up delay-3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/test" style={{ textDecoration: "none" }}>
              <button style={{
                background: "linear-gradient(135deg, #1B4FD8, #4F46E5)",
                color: "#fff",
                border: "none",
                padding: "14px 32px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                boxShadow: "0 4px 16px rgba(27,79,216,0.3)",
                transition: "opacity var(--t), transform var(--t), box-shadow var(--t)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.92";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(27,79,216,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(27,79,216,0.3)";
              }}
              >
                Start practicing free →
              </button>
            </Link>
            <Link href="/study" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#fff",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
                padding: "14px 28px",
                borderRadius: "10px",
                fontWeight: "500",
                fontSize: "15px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "background var(--t), border-color var(--t), color var(--t)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
              }}
              >
                Explore study tools
              </button>
            </Link>
          </div>

          <p className="fade-up delay-4" style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "20px" }}>
            No account required · All questions original
          </p>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section style={{
        borderBottom: "1px solid var(--color-border)",
        padding: "0",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            padding: "32px 40px",
            borderRight: i < STATS.length - 1 ? "1px solid var(--color-border)" : "none",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontWeight: "400",
              fontSize: "44px",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: "6px",
            }}>
              <Counter to={s.value} />{s.suffix}
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: "500" }}>{s.label}</p>
            <div style={{
              position: "absolute",
              bottom: 0, left: "40px",
              width: "24px", height: "2px",
              background: "var(--color-accent)",
              borderRadius: "1px",
            }} />
          </div>
        ))}
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section style={{ padding: "72px 60px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "12px" }}>
              Platform
            </p>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: "400", fontSize: "38px", color: "var(--color-text-primary)" }}>
              Everything you need to score higher
            </h2>
          </div>
          <Link href="/test" style={{ textDecoration: "none", fontSize: "13px", color: "var(--color-accent)", fontWeight: "600", whiteSpace: "nowrap", marginBottom: "8px" }}>
            Begin practice →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div
                onMouseEnter={() => setHovered(f.title)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#fff",
                  border: `1px solid ${hovered === f.title ? "var(--color-accent)" : "var(--color-border)"}`,
                  borderRadius: "14px",
                  padding: "32px 32px 28px",
                  cursor: "pointer",
                  transition: "border-color var(--t), box-shadow var(--t), transform var(--t)",
                  boxShadow: hovered === f.title ? "var(--shadow-md), -3px 0 0 var(--color-accent)" : "var(--shadow-sm)",
                  transform: hovered === f.title ? "translateY(-3px)" : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle top gradient on hover */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, #1B4FD8, #6366F1)",
                  opacity: hovered === f.title ? 1 : 0,
                  transition: "opacity var(--t)",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{
                    fontSize: "22px",
                    color: hovered === f.title ? "var(--color-accent)" : "var(--color-text-muted)",
                    transition: "color var(--t)",
                  }}>{f.icon}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: "700",
                    color: "var(--color-accent)",
                    background: "var(--color-accent-light)",
                    padding: "3px 10px", borderRadius: "100px",
                  }}>
                    {f.tag}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: "400",
                  fontSize: "21px",
                  color: "var(--color-text-primary)",
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
                  {f.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FORMAT TABLE ─────────────────────────────── */}
      <section style={{ padding: "72px 60px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "12px" }}>
          Test structure
        </p>
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: "400", fontSize: "38px", marginBottom: "8px" }}>
          The 2026 LSAT format
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "40px" }}>
          Updated for August 2024+ — Logic Games removed, second LR section added
        </p>

        <div style={{
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          overflow: "hidden",
          maxWidth: "700px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "130px 1fr 80px 80px 90px",
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}>
            {["Section", "Type", "Questions", "Time", "Scored"].map((h) => (
              <div key={h} style={{ padding: "10px 18px", fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {h}
              </div>
            ))}
          </div>
          {FORMAT.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 80px 80px 90px",
                borderBottom: i < FORMAT.length - 1 ? "1px solid var(--color-border)" : "none",
                background: row.isBreak ? "var(--color-surface)" : "#fff",
                transition: "background var(--t)",
              }}
              onMouseEnter={(e) => {
                if (!row.isBreak) (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = row.isBreak ? "var(--color-surface)" : "#fff";
              }}
            >
              <div style={{ padding: "14px 18px", fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "500" }}>{row.label}</div>
              <div style={{ padding: "14px 18px", fontSize: "14px", color: row.isBreak ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>{row.type}</div>
              <div style={{ padding: "14px 18px", fontSize: "14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{row.q}</div>
              <div style={{ padding: "14px 18px", fontSize: "14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{row.t}</div>
              <div style={{ padding: "14px 18px", textAlign: "center" }}>
                {row.isBreak ? <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>—</span>
                  : row.scored
                  ? <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-correct)", background: "var(--color-correct-bg)", padding: "2px 8px", borderRadius: "100px" }}>Scored</span>
                  : <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-muted)" }}>Unscored</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{
        padding: "80px 60px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontWeight: "400",
            fontSize: "42px",
            marginBottom: "16px",
            maxWidth: "480px",
            lineHeight: "1.1",
          }}>
            Ready to start?
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "36px", fontSize: "16px", maxWidth: "400px", lineHeight: "1.6" }}>
            No account required. Begin practicing immediately and track your progress from session one.
          </p>
          <Link href="/test" style={{ textDecoration: "none" }}>
            <button style={{
              background: "linear-gradient(135deg, #1B4FD8, #4F46E5)",
              color: "#fff",
              border: "none",
              padding: "15px 36px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              boxShadow: "0 4px 20px rgba(27,79,216,0.3)",
              transition: "opacity var(--t), transform var(--t)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.9";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
            >
              Begin free practice →
            </button>
          </Link>
        </div>
      </section>

      <footer style={{
        borderTop: "1px solid var(--color-border)",
        padding: "20px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-accent)" }}>KyLaw</span>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>2026 LSAT format · All questions original · No copyright infringement</span>
      </footer>
    </div>
  );
}
