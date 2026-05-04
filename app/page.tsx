"use client";
import Link from "next/link";

const features = [
  {
    title: "Test Simulator",
    desc: "Full 4-section test or single-section practice. Exact LawHub interface: split-screen layout, annotation tools, 35-minute timer, flagging, and answer elimination.",
    href: "/test",
    tag: "4 sections",
  },
  {
    title: "Question Bank",
    desc: "165+ original LR questions across all 12 question types. Filter by type and difficulty. Instant explanations with every answer.",
    href: "/study/drills",
    tag: "165 questions",
  },
  {
    title: "Flashcards",
    desc: "Master all 12 LR question types, 7 RC types, 20 logical fallacies, and 25 key LSAT terms through active recall with 3D flip cards.",
    href: "/study/flashcards",
    tag: "64 cards",
  },
  {
    title: "Score Dashboard",
    desc: "Track your score trend. See accuracy by question type. Identify weak areas and drill them directly from your results.",
    href: "/dashboard",
    tag: "Auto-tracked",
  },
];

const formatRows = [
  { section: "Section 1", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { section: "Section 2", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
  { section: "Break", type: "10-Minute Break", q: "—", t: "10 min", isBreak: true },
  { section: "Section 3", type: "Reading Comprehension", q: "26–28", t: "35 min", scored: true },
  { section: "Section 4", type: "Experimental", q: "22–28", t: "35 min", scored: false },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>

      {/* Hero */}
      <section style={{
        padding: "80px 56px 72px",
        borderBottom: "1px solid var(--color-border)",
        maxWidth: "840px",
      }}>
        <p className="fade-up" style={{
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: "24px",
        }}>
          2026 LSAT Prep Platform
        </p>

        <h1 className="fade-up fade-up-1 serif" style={{
          fontSize: "clamp(38px, 5vw, 62px)",
          lineHeight: "1.08",
          color: "var(--color-text-primary)",
          marginBottom: "28px",
          maxWidth: "680px",
        }}>
          The LSAT, exactly as it appears on test day.
        </h1>

        <p className="fade-up fade-up-2" style={{
          fontSize: "17px",
          lineHeight: "1.7",
          color: "var(--color-text-secondary)",
          maxWidth: "520px",
          marginBottom: "44px",
        }}>
          KyLaw replicates the 2026 LawHub interface with the real tools, the real timer,
          and the real format — so test day feels familiar.
        </p>

        <div className="fade-up fade-up-3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/test" style={{
            background: "var(--color-accent)",
            color: "#fff",
            padding: "13px 30px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "15px",
            textDecoration: "none",
            transition: "background 0.15s, box-shadow 0.15s",
            boxShadow: "0 2px 8px rgba(27,79,216,0.2)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(27,79,216,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-accent)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(27,79,216,0.2)";
          }}
          >
            Start practicing free →
          </Link>
          <Link href="/study" style={{
            color: "var(--color-text-secondary)",
            fontSize: "15px",
            textDecoration: "none",
            padding: "13px 20px",
            borderRadius: "8px",
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
            (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
          >
            Explore study tools
          </Link>
        </div>

        <p className="fade-up fade-up-4" style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "20px" }}>
          No account required to start
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: "72px 56px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "14px" }}>
          What's included
        </p>
        <h2 className="serif" style={{ fontSize: "32px", color: "var(--color-text-primary)", marginBottom: "48px" }}>
          Everything you need to score higher
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "var(--color-border)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
          {features.map((f, i) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
              <div
                className="card-hover"
                style={{
                  background: "#fff",
                  padding: "32px 36px",
                  borderRadius: 0,
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <h3 className="serif" style={{ fontSize: "20px", color: "var(--color-text-primary)" }}>
                    {f.title}
                  </h3>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--color-accent)",
                    background: "var(--color-accent-light)",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}>
                    {f.tag}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
                  {f.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Format table */}
      <section style={{ padding: "72px 56px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "14px" }}>
          Test structure
        </p>
        <h2 className="serif" style={{ fontSize: "32px", color: "var(--color-text-primary)", marginBottom: "8px" }}>
          The 2026 LSAT format
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "36px" }}>
          Updated for August 2024+ — Logic Games removed, second LR section added
        </p>

        <div style={{ border: "1px solid var(--color-border)", borderRadius: "10px", overflow: "hidden", maxWidth: "680px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 80px 80px 90px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
            {["Section", "Type", "Questions", "Time", "Scored"].map((h) => (
              <div key={h} style={{ padding: "10px 16px", fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </div>
            ))}
          </div>
          {formatRows.map((row, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "130px 1fr 80px 80px 90px",
              borderBottom: i < formatRows.length - 1 ? "1px solid var(--color-border)" : "none",
              background: row.isBreak ? "var(--color-surface)" : "#fff",
            }}>
              <div style={{ padding: "13px 16px", fontSize: "13px", color: "var(--color-text-muted)" }}>{row.section}</div>
              <div style={{ padding: "13px 16px", fontSize: "14px", color: row.isBreak ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>{row.type}</div>
              <div style={{ padding: "13px 16px", fontSize: "14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{row.q}</div>
              <div style={{ padding: "13px 16px", fontSize: "14px", textAlign: "center", color: "var(--color-text-secondary)" }}>{row.t}</div>
              <div style={{ padding: "13px 16px", fontSize: "13px", textAlign: "center" }}>
                {row.isBreak ? <span style={{ color: "var(--color-text-muted)" }}>—</span>
                  : row.scored
                    ? <span style={{ color: "var(--color-correct)", fontWeight: "500" }}>Scored</span>
                    : <span style={{ color: "var(--color-text-muted)" }}>Unscored</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 56px" }}>
        <h2 className="serif" style={{ fontSize: "36px", color: "var(--color-text-primary)", marginBottom: "16px" }}>
          Ready to start?
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", fontSize: "16px" }}>
          No account required. Begin practicing immediately.
        </p>
        <Link href="/test" style={{
          display: "inline-block",
          background: "var(--color-accent)",
          color: "#fff",
          padding: "13px 30px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "15px",
          textDecoration: "none",
        }}>
          Begin free practice →
        </Link>
      </section>

      <footer style={{
        borderTop: "1px solid var(--color-border)",
        padding: "20px 56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "var(--color-text-muted)",
        fontSize: "13px",
      }}>
        <span className="serif" style={{ color: "var(--color-accent)", fontSize: "18px" }}>KyLaw</span>
        <span>2026 LSAT format · All questions original</span>
      </footer>
    </div>
  );
}
