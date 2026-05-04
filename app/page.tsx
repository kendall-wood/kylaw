"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FileText, BookOpen, Zap, BarChart2, ArrowRight } from "lucide-react";

function Counter({ to, duration = 1400 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

const STATS = [
  { value: 165, suffix: "+", label: "LR questions" },
  { value: 12, suffix: "", label: "Question types" },
  { value: 64, suffix: "", label: "Flashcards" },
  { value: 4, suffix: "", label: "Study tools" },
];

const FEATURES = [
  { href: "/test", Icon: FileText, title: "Test Simulator", desc: "Full 4-section LSAT under timed conditions — identical to LawHub. Split-screen, annotations, flagging, elimination.", tag: "4 sections" },
  { href: "/study/drills", Icon: Zap, title: "Question Drills", desc: "Practice any of the 12 LR question types in isolation. Instant explanations with every answer.", tag: "165 questions" },
  { href: "/study/flashcards", Icon: BookOpen, title: "Flashcards", desc: "3D flip cards across 4 decks: question types, fallacies, RC types, and vocabulary.", tag: "64 cards" },
  { href: "/dashboard", Icon: BarChart2, title: "Dashboard", desc: "Score trends, accuracy by type, and weak-area targeting. Tracks automatically.", tag: "Auto-tracked" },
];

const FORMAT = [
  { label: "Section 1", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { label: "Section 2", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { label: "Break", type: "10-Minute Break", q: "—", t: "10 min", isBreak: true },
  { label: "Section 3", type: "Reading Comprehension", q: "26–28", t: "35 min", scored: true },
  { label: "Section 4", type: "Experimental", q: "22–28", t: "35 min", scored: false },
];

export default function HomePage() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{ position: "relative", padding: "80px 56px 72px", borderBottom: "1px solid var(--color-border)", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.45, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -80, width: 500, height: 500, background: "radial-gradient(circle, rgba(27,79,216,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 680 }}>
          <div className="fade-in" style={{ marginBottom: 32 }}>
            <span style={{
              fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400,
              color: "var(--color-accent)", letterSpacing: "-0.01em",
            }}>KyLaw</span>
          </div>

          <div className="fade-in delay-1" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--color-accent-light)", border: "1px solid rgba(27,79,216,0.18)",
            borderRadius: 100, padding: "5px 14px 5px 10px", marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)",
              display: "inline-block", animation: "pulse-dot 2.2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent)", letterSpacing: "0.04em" }}>
              2026 LSAT Prep Platform
            </span>
          </div>

          <h1 className="fade-up delay-1" style={{
            fontFamily: "var(--font-serif)", fontWeight: 400,
            fontSize: "clamp(40px, 5.5vw, 64px)", lineHeight: 1.07,
            letterSpacing: "-0.01em", marginBottom: 24, color: "var(--color-text-primary)",
          }}>
            The LSAT, <em className="gradient-text" style={{ fontStyle: "italic" }}>exactly</em> as it appears on test day.
          </h1>

          <p className="fade-up delay-2" style={{
            fontSize: 17, lineHeight: 1.7, color: "var(--color-text-secondary)",
            maxWidth: 500, marginBottom: 44,
          }}>
            Pixel-accurate 2026 LawHub interface — real tools, real timer, real format — so test day feels familiar before it begins.
          </p>

          <div className="fade-up delay-3" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/test" style={{ textDecoration: "none" }}>
              <button style={{
                background: "var(--color-accent)", color: "#fff", border: "none",
                padding: "12px 28px", borderRadius: 9, fontWeight: 600, fontSize: 15,
                cursor: "pointer", fontFamily: "var(--font-sans)",
                display: "flex", alignItems: "center", gap: 6,
                transition: "background var(--t), box-shadow var(--t)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                Start free <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/study" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#fff", color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)", padding: "12px 24px",
                borderRadius: 9, fontWeight: 500, fontSize: 15, cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "background var(--t), box-shadow var(--t)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                Study tools
              </button>
            </Link>
          </div>
          <p className="fade-up delay-4" style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 16 }}>
            No account required
          </p>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid var(--color-border)" }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            padding: "28px 40px",
            borderRight: i < STATS.length - 1 ? "1px solid var(--color-border)" : "none",
          }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 42, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: 4 }}>
              <Counter to={s.value} />{s.suffix}
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section style={{ padding: "64px 56px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>Platform</p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 34 }}>Everything you need to score higher</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {FEATURES.map((f) => {
            const active = activeCard === f.title;
            return (
              <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setActiveCard(f.title)}
                  onMouseLeave={() => setActiveCard(null)}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "28px 30px",
                    cursor: "pointer",
                    height: "100%",
                    transition: "box-shadow var(--t), transform var(--t)",
                    boxShadow: active ? "var(--shadow-md), var(--glow-blue)" : "var(--shadow-xs)",
                    transform: active ? "translateY(-2px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: active ? "var(--color-accent)" : "var(--color-surface)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background var(--t)",
                    }}>
                      <f.Icon size={18} color={active ? "#fff" : "var(--color-text-muted)"} strokeWidth={1.6} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", background: "var(--color-accent-light)", padding: "3px 10px", borderRadius: 100 }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FORMAT ────────────────────────────────── */}
      <section style={{ padding: "64px 56px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>Structure</p>
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 34, marginBottom: 6 }}>The 2026 LSAT format</h2>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 36 }}>Logic Games removed · Second LR section added</p>

        <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", maxWidth: 680, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 80px 80px 90px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
            {["Section", "Type", "Qs", "Time", "Scored"].map((h) => (
              <div key={h} style={{ padding: "9px 16px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
            ))}
          </div>
          {FORMAT.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "130px 1fr 80px 80px 90px",
              borderBottom: i < FORMAT.length - 1 ? "1px solid var(--color-border)" : "none",
              background: row.isBreak ? "var(--color-surface)" : "#fff",
              transition: "background var(--t)",
            }}
            onMouseEnter={(e) => { if (!row.isBreak) (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = row.isBreak ? "var(--color-surface)" : "#fff"; }}
            >
              <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>{row.label}</div>
              <div style={{ padding: "12px 16px", fontSize: 14, color: row.isBreak ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>{row.type}</div>
              <div style={{ padding: "12px 16px", fontSize: 13, textAlign: "center", color: "var(--color-text-secondary)" }}>{row.q}</div>
              <div style={{ padding: "12px 16px", fontSize: 13, textAlign: "center", color: "var(--color-text-secondary)" }}>{row.t}</div>
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                {row.isBreak ? <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>—</span>
                  : row.scored
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-correct)", background: "var(--color-correct-bg)", padding: "2px 8px", borderRadius: 100 }}>Scored</span>
                  : <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>Unscored</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section style={{ padding: "72px 56px", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 38, marginBottom: 14, maxWidth: 440 }}>Ready to start?</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 32, maxWidth: 380, lineHeight: 1.65 }}>
            No account required. Begin practicing immediately.
          </p>
          <Link href="/test" style={{ textDecoration: "none" }}>
            <button style={{
              background: "var(--color-accent)", color: "#fff", border: "none",
              padding: "13px 32px", borderRadius: 9, fontWeight: 600, fontSize: 15,
              cursor: "pointer", fontFamily: "var(--font-sans)",
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "background var(--t), box-shadow var(--t)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              Begin free practice <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "18px 56px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--color-accent)" }}>KyLaw</span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>2026 LSAT format · All questions original</span>
      </footer>
    </div>
  );
}
