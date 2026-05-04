import Link from "next/link";
import GlobalNav from "@/components/layout/GlobalNav";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <GlobalNav />

      {/* Hero */}
      <section
        style={{ borderBottom: "1px solid var(--color-border)" }}
        className="py-24 px-6 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <p
            style={{
              color: "var(--color-accent)",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            2026 LSAT Prep Platform
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif-display)",
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "var(--color-text-primary)",
              lineHeight: "1.1",
              marginBottom: "24px",
            }}
          >
            The LSAT, exactly as it appears on test day.
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "18px",
              lineHeight: "1.6",
              marginBottom: "40px",
              maxWidth: "600px",
              margin: "0 auto 40px",
            }}
          >
            KyLaw replicates the 2026 LawHub interface with pixel-level accuracy.
            Practice with the real tools, the real timer, and the real format —
            so test day feels familiar.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/test"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "16px",
                textDecoration: "none",
              }}
            >
              Start Practicing Free
            </Link>
            <Link
              href="/study"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                padding: "14px 32px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                textDecoration: "none",
                border: "1px solid var(--color-border)",
              }}
            >
              Explore Study Tools
            </Link>
          </div>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "13px",
              marginTop: "20px",
            }}
          >
            No account required to start
          </p>
        </div>
      </section>

      {/* 2026 Format Table */}
      <section
        style={{ borderBottom: "1px solid var(--color-border)" }}
        className="py-20 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-serif-display)",
              fontSize: "32px",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            The 2026 LSAT Format
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              textAlign: "center",
              marginBottom: "40px",
              fontSize: "14px",
            }}
          >
            Updated for August 2024+ — Logic Games removed, second LR section added
          </p>
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 80px 70px 90px",
                background: "var(--color-surface)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {["Section", "Type", "Questions", "Time", "Scored"].map((h) => (
                <div
                  key={h}
                  style={{
                    padding: "10px 16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {[
              { section: "Section 1", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
              { section: "Section 2", type: "Logical Reasoning", q: "24–26", t: "35 min", scored: true },
              { section: "— Break —", type: "10-Minute Break", q: "—", t: "10 min", break: true },
              { section: "Section 3", type: "Reading Comprehension", q: "26–28", t: "35 min", scored: true },
              { section: "Section 4", type: "Experimental (LR or RC)", q: "22–28", t: "35 min", scored: false },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 80px 70px 90px",
                  borderBottom: i < 4 ? "1px solid var(--color-border)" : "none",
                  background: row.break ? "var(--color-surface)" : "var(--color-bg)",
                }}
              >
                <div style={{ padding: "13px 16px", fontSize: "13px", color: "var(--color-text-muted)" }}>{row.section}</div>
                <div style={{ padding: "13px 16px", fontSize: "14px", fontWeight: "500" }}>{row.type}</div>
                <div style={{ padding: "13px 16px", fontSize: "14px", textAlign: "center" }}>{row.q}</div>
                <div style={{ padding: "13px 16px", fontSize: "14px", textAlign: "center" }}>{row.t}</div>
                <div style={{ padding: "13px 16px", fontSize: "13px", textAlign: "center" }}>
                  {row.break ? "—" : row.scored
                    ? <span style={{ color: "var(--color-correct)", fontWeight: "500" }}>Scored</span>
                    : <span style={{ color: "var(--color-text-muted)" }}>Unscored</span>
                  }
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "16px", textAlign: "center" }}>
            Plus: LSAT Argumentative Writing (50 min, administered separately, unscored)
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ borderBottom: "1px solid var(--color-border)" }} className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            style={{
              fontFamily: "var(--font-serif-display)",
              fontSize: "32px",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            Everything you need to score higher
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "⚖️",
                title: "Test Simulator",
                desc: "Full 4-section test or single-section practice. Exact LawHub interface: split-screen layout, annotation tools, 35-minute timer, flagging, and answer elimination.",
                href: "/test",
              },
              {
                icon: "📚",
                title: "Question Bank",
                desc: "1,200+ original LR questions across all 12 question types. Filter by type, difficulty, and section. Instant explanations or batch review mode.",
                href: "/test",
              },
              {
                icon: "🃏",
                title: "Flashcards & Study Tools",
                desc: "Master all 12 LR question types, 7 RC types, 20 logical fallacies, and 25 key LSAT vocabulary terms through active recall, matching, and fill-in-blank.",
                href: "/study",
              },
              {
                icon: "📊",
                title: "Progress Dashboard",
                desc: "Track your score trend over time. Accuracy by question type. Spaced-repetition review queue for your weakest areas. Works without an account.",
                href: "/dashboard",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                style={{
                  display: "block",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  padding: "28px",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{card.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif-display)",
                    fontSize: "20px",
                    color: "var(--color-text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "32px", marginBottom: "16px" }}>
            Ready to start?
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", fontSize: "16px" }}>
            No account required. Begin practicing immediately.
          </p>
          <Link
            href="/test"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              padding: "14px 36px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "16px",
              textDecoration: "none",
            }}
          >
            Begin Free Practice
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--color-text-muted)",
          fontSize: "13px",
        }}
      >
        <span style={{ fontFamily: "var(--font-serif-display)", color: "var(--color-accent)" }}>KyLaw</span>
        <span>2026 LSAT format. All questions original.</span>
      </footer>
    </div>
  );
}
