"use client";
import Link from "next/link";

const tools = [
  {
    href: "/study/flashcards",
    title: "Flashcards",
    description: "Master LR question types, fallacies, and key LSAT vocabulary with spaced-repetition cards.",
    icon: "🃏",
    badge: "64 cards",
  },
  {
    href: "/study/drills",
    title: "Question Drills",
    description: "Practice by question type in a focused, single-question view with instant feedback.",
    icon: "⚡",
    badge: "165 questions",
  },
  {
    href: "/study/matching",
    title: "Matching",
    description: "Match LR question types to their definitions — a fast way to sharpen type recognition.",
    icon: "🔗",
    badge: "Timed game",
  },
  {
    href: "/test",
    title: "Full Simulation",
    description: "Sit a complete 4-section LSAT under timed, test-center conditions.",
    icon: "📝",
    badge: "3 hrs 30 min",
  },
];

export default function StudyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "64px 24px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: "700", color: "var(--color-accent)", marginBottom: "10px" }}>
            Study Tools
          </p>
          <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "42px", fontWeight: "700", color: "var(--color-text-primary)", lineHeight: "1.15", marginBottom: "14px" }}>
            Build your skills
          </h1>
          <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", maxWidth: "480px", lineHeight: "1.6" }}>
            Choose a study mode below. Each tool isolates a different skill so you can target your weaknesses before the full test.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff",
                border: "1px solid var(--color-border)",
                borderRadius: "14px",
                padding: "28px 28px 24px",
                cursor: "pointer",
                transition: "box-shadow 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(27,79,216,0.10)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <span style={{ fontSize: "32px" }}>{tool.icon}</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "var(--color-accent)",
                    background: "var(--color-accent-light)",
                    padding: "3px 10px",
                    borderRadius: "100px",
                    letterSpacing: "0.03em",
                  }}>
                    {tool.badge}
                  </span>
                </div>
                <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "22px", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "8px" }}>
                  {tool.title}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.55" }}>
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
