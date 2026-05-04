"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Zap, Shuffle, FileText, ArrowRight } from "lucide-react";

const TOOLS = [
  {
    href: "/study/flashcards",
    Icon: BookOpen,
    title: "Flashcards",
    desc: "3D flip cards across 4 decks: question types, fallacies, RC types, and vocabulary. Great for daily review.",
    badge: "64 cards",
    meta: "4 decks",
  },
  {
    href: "/study/drills",
    Icon: Zap,
    title: "Question Drills",
    desc: "Practice any of the 12 LR question types in isolation. Filter by type and get instant explanations with every answer.",
    badge: "165 questions",
    meta: "12 types",
  },
  {
    href: "/study/matching",
    Icon: Shuffle,
    title: "Matching",
    desc: "Match question types to definitions under a timer. Fast, high-rep type recognition to make identification automatic.",
    badge: "Timed game",
    meta: "8 pairs",
  },
];

export default function StudyPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── Header ─── */}
      <section style={{ padding: "48px 56px 44px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
          Study
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 38, lineHeight: 1.1, marginBottom: 10, color: "var(--color-text-primary)" }}>
          Build your foundation
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 480 }}>
          Each tool isolates a different skill. Master the concepts here before taking on timed practice.
        </p>
      </section>

      {/* ── Tools grid ─── */}
      <section style={{ padding: "40px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {TOOLS.map((t) => {
            const active = hovered === t.href;
            return (
              <Link key={t.href} href={t.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHovered(t.href)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "28px 28px 24px",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex", flexDirection: "column", gap: 12,
                    boxShadow: active ? "var(--shadow-md), var(--glow-blue)" : "var(--shadow-xs)",
                    transform: active ? "translateY(-2px)" : "none",
                    transition: "box-shadow var(--t), transform var(--t)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: active ? "var(--color-accent)" : "var(--color-surface)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background var(--t)",
                    }}>
                      <t.Icon size={18} color={active ? "#fff" : "var(--color-text-muted)"} strokeWidth={1.6} />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "var(--color-accent)",
                      background: "var(--color-accent-light)", padding: "3px 10px", borderRadius: 100,
                    }}>
                      {t.badge}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 20, color: "var(--color-text-primary)", marginBottom: 8 }}>
                      {t.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                      {t.desc}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-accent)", fontSize: 13, fontWeight: 600, opacity: active ? 1 : 0, transition: "opacity var(--t)" }}>
                    Open <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Practice crosslink ─── */}
        <div style={{ marginTop: 14 }}>
          <Link href="/test" style={{ textDecoration: "none" }}>
            <div
              onMouseEnter={() => setHovered("test")}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "22px 28px", borderRadius: 14,
                background: "#fff", border: "1px solid var(--color-border)",
                cursor: "pointer", gap: 16, flexWrap: "wrap",
                boxShadow: hovered === "test" ? "var(--shadow-sm), var(--glow-sm)" : "var(--shadow-xs)",
                transition: "box-shadow var(--t)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "var(--color-surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={17} color="var(--color-text-muted)" strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>Ready for timed practice?</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Full test simulation · Section runs · Question bank</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--color-accent)", fontSize: 13, fontWeight: 600 }}>
                Go to Practice <ArrowRight size={13} />
              </div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
