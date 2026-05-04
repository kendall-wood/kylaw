"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";
import { Clock, FileText, BookOpen, Zap, Shuffle, ChevronRight, ArrowRight, Info } from "lucide-react";

async function loadSections(mode: "full_test" | "section" | "question_bank", sectionType?: string) {
  const files = [
    "/lib/data/lr_flaw_mbt.json",
    "/lib/data/lr_strengthen_na.json",
    "/lib/data/lr_weaken_sa.json",
    "/lib/data/lr_method_mc.json",
    "/lib/data/lr_principle_rp.json",
    "/lib/data/lr_parallel_pai.json",
  ];

  const allLR: Section["questions"] = [];
  for (const f of files) {
    try {
      const res = await fetch(f);
      if (!res.ok) continue;
      const data = await res.json();
      allLR.push(...(data.questions ?? []));
    } catch {}
  }

  let rcQuestions: Section["questions"] = [];
  try {
    const res = await fetch("/lib/data/rc_passages.json");
    if (res.ok) {
      const data = await res.json();
      const sets = data.passage_sets ?? [];
      for (const set of sets) {
        const qs = (set.questions ?? []).map((q: Section["questions"][0]) => ({
          ...q,
          passage_id: set.id,
          passage_title: set.passage_title,
          passage_text: set.passage_text ?? set.passage_text_a,
          passage_text_b: set.passage_text_b,
          passage_type: set.type,
        }));
        rcQuestions.push(...qs);
      }
    }
  } catch {}

  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  if (mode === "full_test") {
    const lr1 = shuffle(allLR.filter(q => q.section_type === "LR")).slice(0, 25);
    const lr2 = shuffle(allLR.filter(q => q.section_type === "LR")).slice(25, 50);
    const rc = shuffle(rcQuestions).slice(0, 27);
    const exp = shuffle(allLR.filter(q => q.section_type === "LR")).slice(50, 75);
    return [
      { id: "lr1", type: "LR" as const, questions: lr1, scored: true },
      { id: "lr2", type: "LR" as const, questions: lr2, scored: true },
      { id: "rc", type: "RC" as const, questions: rc, scored: true },
      { id: "exp", type: "experimental" as const, questions: exp, scored: false },
    ] as Section[];
  }

  if (mode === "section") {
    if (sectionType === "RC") {
      return [{ id: "rc", type: "RC" as const, questions: shuffle(rcQuestions).slice(0, 27), scored: true }] as Section[];
    }
    return [{ id: "lr", type: "LR" as const, questions: shuffle(allLR.filter(q => q.section_type === "LR")).slice(0, 25), scored: true }] as Section[];
  }

  return [{ id: "bank", type: "LR" as const, questions: shuffle(allLR), scored: false }] as Section[];
}

const STUDY_TOOLS = [
  { href: "/study/flashcards", Icon: BookOpen, label: "Flashcards", desc: "64 cards across 4 decks" },
  { href: "/study/drills", Icon: Zap, label: "Drills", desc: "165 questions by type" },
  { href: "/study/matching", Icon: Shuffle, label: "Matching", desc: "Term recognition game" },
];

export default function TestPage() {
  const router = useRouter();
  const { startSession } = useTestSessionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  async function handleStart(mode: "full_test" | "section" | "question_bank", sectionType?: string) {
    const key = mode + (sectionType ?? "");
    setLoading(key);
    const sections = await loadSections(mode, sectionType);
    startSession(mode, sections, studyMode);
    router.push("/test/session");
  }

  const isLoading = (mode: string, type?: string) => loading === mode + (type ?? "");

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── Header ─── */}
      <section style={{ padding: "48px 56px 44px", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
          Practice
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 38, lineHeight: 1.1, marginBottom: 10, color: "var(--color-text-primary)" }}>
          Choose your session
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 480 }}>
          Full simulations, single-section timed runs, or untimed drilling — all scored and tracked automatically.
        </p>
      </section>

      <div style={{ padding: "40px 56px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Full Test — primary, hero card ─── */}
        <div
          onMouseEnter={() => setHoveredCard("full")}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "36px 40px",
            boxShadow: hoveredCard === "full" ? "var(--shadow-md), var(--glow-blue)" : "var(--shadow-xs)",
            transition: "box-shadow var(--t), transform var(--t)",
            transform: hoveredCard === "full" ? "translateY(-1px)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            {/* Left: Info */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={19} color="#fff" strokeWidth={1.6} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 22, color: "var(--color-text-primary)", lineHeight: 1 }}>
                    Full Test Simulation
                  </h2>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.04em" }}>
                    MOST REALISTIC
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20, maxWidth: 440 }}>
                All 4 sections in order with the 10-minute break, identical to LawHub. Fully timed with no pausing. Your score is calculated and saved at the end.
              </p>

              {/* Section breakdown */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { label: "LR I", sub: "25 Qs · 35 min", scored: true },
                  { label: "LR II", sub: "25 Qs · 35 min", scored: true },
                  { label: "Break", sub: "10 min", scored: false, isBreak: true },
                  { label: "RC", sub: "27 Qs · 35 min", scored: true },
                  { label: "Exp.", sub: "25 Qs · 35 min", scored: false },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: s.isBreak ? "var(--color-surface)" : s.scored ? "var(--color-accent-light)" : "var(--color-surface)",
                    border: `1px solid ${s.isBreak ? "var(--color-border)" : s.scored ? "rgba(27,79,216,0.18)" : "var(--color-border)"}`,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.isBreak ? "var(--color-text-muted)" : s.scored ? "var(--color-accent)" : "var(--color-text-secondary)" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 1 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end", minWidth: 200 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10,
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
              }}>
                <Clock size={14} color="var(--color-text-muted)" />
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>~2 hr 40 min total</span>
              </div>

              <button
                onClick={() => handleStart("full_test")}
                disabled={loading !== null}
                style={{
                  background: "var(--color-accent)", color: "#fff", border: "none",
                  padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
                  cursor: loading !== null ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)",
                  display: "flex", alignItems: "center", gap: 7, opacity: loading !== null ? 0.7 : 1,
                  transition: "background var(--t), box-shadow var(--t)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {isLoading("full_test") ? "Loading…" : "Begin full test"}
                {!isLoading("full_test") && <ArrowRight size={15} />}
              </button>

              <p style={{ fontSize: 11, color: "var(--color-text-muted)", textAlign: "right", maxWidth: 200 }}>
                No pausing · Scored at end · Identical to LawHub
              </p>
            </div>
          </div>
        </div>

        {/* ── Section Practice ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            {
              key: "sectionLR",
              mode: "section" as const,
              type: "LR",
              title: "Logical Reasoning",
              sub: "Section Practice",
              desc: "One 35-minute LR section. Timer runs but can be paused. Explanations shown after you submit each answer.",
              meta: ["25 questions", "35 min", "Pause OK"],
              Icon: Zap,
            },
            {
              key: "sectionRC",
              mode: "section" as const,
              type: "RC",
              title: "Reading Comprehension",
              sub: "Section Practice",
              desc: "One 35-minute RC section with 4 passage sets. Pause allowed. Score and review when done.",
              meta: ["27 questions", "35 min", "Pause OK"],
              Icon: BookOpen,
            },
          ].map((card) => {
            const active = hoveredCard === card.key;
            const busy = isLoading(card.mode, card.type);
            return (
              <div
                key={card.key}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  padding: "28px 30px",
                  boxShadow: active ? "var(--shadow-md), var(--glow-blue)" : "var(--shadow-xs)",
                  transition: "box-shadow var(--t), transform var(--t)",
                  transform: active ? "translateY(-1px)" : "none",
                  display: "flex", flexDirection: "column", gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: active ? "var(--color-accent)" : "var(--color-surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background var(--t)",
                  }}>
                    <card.Icon size={17} color={active ? "#fff" : "var(--color-text-muted)"} strokeWidth={1.6} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", paddingTop: 4 }}>
                    {card.sub}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 19, color: "var(--color-text-primary)", marginBottom: 6 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                    {card.desc}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {card.meta.map((m) => (
                    <span key={m} style={{
                      fontSize: 11, fontWeight: 600,
                      padding: "3px 9px", borderRadius: 100,
                      background: "var(--color-surface)", color: "var(--color-text-muted)",
                      border: "1px solid var(--color-border)",
                    }}>{m}</span>
                  ))}
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => handleStart(card.mode, card.type)}
                    disabled={loading !== null}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 9,
                      background: "var(--color-accent)", color: "#fff", border: "none",
                      fontWeight: 600, fontSize: 14, cursor: loading !== null ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-sans)", opacity: loading !== null ? 0.7 : 1,
                      transition: "background var(--t), box-shadow var(--t)",
                    }}
                    onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    {busy ? "Loading…" : `Start ${card.type} section`}
                  </button>

                  {/* Study mode toggle per-card */}
                  <button
                    onClick={() => setStudyMode((s) => !s)}
                    title={studyMode ? "Study mode on — instant explanations" : "Study mode off — explanations after section"}
                    style={{
                      width: 40, height: 40, borderRadius: 9, border: "1px solid var(--color-border)",
                      background: studyMode ? "var(--color-accent-light)" : "#fff",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "background var(--t)",
                      color: studyMode ? "var(--color-accent)" : "var(--color-text-muted)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  >
                    <Info size={15} strokeWidth={1.8} />
                  </button>
                </div>

                {studyMode && (
                  <p style={{ fontSize: 11, color: "var(--color-accent)", marginTop: -6 }}>
                    Study mode on — explanations shown after each answer
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Question Bank ─── */}
        <div
          onMouseEnter={() => setHoveredCard("bank")}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            padding: "24px 30px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
            boxShadow: hoveredCard === "bank" ? "var(--shadow-sm), var(--glow-sm)" : "var(--shadow-xs)",
            transition: "box-shadow var(--t)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: hoveredCard === "bank" ? "var(--color-surface-2)" : "var(--color-surface)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background var(--t)",
            }}>
              <Zap size={17} color="var(--color-text-muted)" strokeWidth={1.6} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 17, color: "var(--color-text-primary)", marginBottom: 3 }}>
                Open Question Bank
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                165 LR questions · no timer · instant explanations · untimed drilling
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStart("question_bank")}
            disabled={loading !== null}
            style={{
              padding: "10px 22px", borderRadius: 9,
              background: "#fff", color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              fontWeight: 500, fontSize: 14, cursor: loading !== null ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", opacity: loading !== null ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
              transition: "background var(--t), box-shadow var(--t)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm)"; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            {isLoading("question_bank") ? "Loading…" : "Browse questions"}
            {!isLoading("question_bank") && <ChevronRight size={14} />}
          </button>
        </div>

        {/* ── Study tools crosslink ─── */}
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 28, marginTop: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 14 }}>
            Study Tools
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {STUDY_TOOLS.map((t) => (
              <Link key={t.href} href={t.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "10px 16px", borderRadius: 10,
                  background: "#fff", border: "1px solid var(--color-border)",
                  cursor: "pointer", transition: "background var(--t), box-shadow var(--t)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-sm)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <t.Icon size={15} color="var(--color-text-muted)" strokeWidth={1.6} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{t.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
