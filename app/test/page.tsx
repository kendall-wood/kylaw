"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlobalNav from "@/components/layout/GlobalNav";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";

// Lazy-loaded question data helper
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

  // Shuffle helper
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

  // question_bank — return all, session handles pagination
  return [{ id: "bank", type: "LR" as const, questions: shuffle(allLR), scored: false }] as Section[];
}

export default function TestPage() {
  const router = useRouter();
  const { startSession } = useTestSessionStore();
  const [loading, setLoading] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  async function handleStart(mode: "full_test" | "section" | "question_bank", sectionType?: string) {
    setLoading(true);
    const sections = await loadSections(mode, sectionType);
    startSession(mode, sections, studyMode);
    router.push("/test/session");
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-surface)" }}>
      <GlobalNav />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: "36px",
            marginBottom: "8px",
          }}
        >
          Practice
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "48px", fontSize: "16px" }}>
          Choose your practice mode below.
        </p>

        {/* Study mode toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
            padding: "16px 20px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            width: "fit-content",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500" }}>Study Mode</span>
          <button
            onClick={() => setStudyMode(!studyMode)}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              background: studyMode ? "var(--color-accent)" : "var(--color-border)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: studyMode ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </button>
          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            {studyMode ? "Instant explanations after each answer" : "Explanations shown after submission"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Full Test */}
          <ModeCard
            title="Full Test Simulation"
            icon="⚖️"
            badges={["4 Sections", "~2h 40m", "No Pause"]}
            description="All 4 sections in order with a 10-minute break. Fully timed, exactly like test day. Scores revealed at the end."
            warning={studyMode ? "Study Mode disabled for Full Test" : undefined}
            actions={[
              {
                label: loading ? "Loading..." : "Start Full Test",
                primary: true,
                onClick: () => handleStart("full_test"),
                disabled: loading,
              },
            ]}
          />

          {/* Section Practice */}
          <ModeCard
            title="Section Practice"
            icon="📋"
            badges={["35 Min", "Pause OK", "Choose Section"]}
            description="Practice one section at a time. Timer runs but can be paused. Choose Logical Reasoning or Reading Comprehension."
            actions={[
              {
                label: "LR Section",
                primary: true,
                onClick: () => handleStart("section", "LR"),
                disabled: loading,
              },
              {
                label: "RC Section",
                primary: false,
                onClick: () => handleStart("section", "RC"),
                disabled: loading,
              },
            ]}
          />

          {/* Question Bank */}
          <ModeCard
            title="Question Bank"
            icon="🎯"
            badges={["No Timer", "Filter by Type", "Instant Explanations"]}
            description="Drill specific question types. Filter by LR type, difficulty, or section. No timer pressure — focus on accuracy."
            actions={[
              {
                label: "Open Question Bank",
                primary: true,
                onClick: () => handleStart("question_bank"),
                disabled: loading,
              },
            ]}
          />
        </div>

        {/* Quick nav to study tools */}
        <div
          style={{
            marginTop: "48px",
            padding: "20px 24px",
            background: "var(--color-accent-light)",
            borderRadius: "8px",
            border: "1px solid #c7d7f8",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--color-accent)", fontWeight: "500" }}>
            Not ready for timed practice? Start with{" "}
            <a href="/study" style={{ color: "var(--color-accent)", fontWeight: "700" }}>
              Study Tools
            </a>{" "}
            — flashcards, matching, and fill-in-blank exercises to build your foundation first.
          </p>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  title, icon, badges, description, actions, warning,
}: {
  title: string;
  icon: string;
  badges: string[];
  description: string;
  actions: { label: string; primary: boolean; onClick: () => void; disabled?: boolean }[];
  warning?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "32px" }}>{icon}</div>
      <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "20px" }}>{title}</h2>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {badges.map((b) => (
          <span
            key={b}
            style={{
              fontSize: "11px",
              fontWeight: "600",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6", flex: 1 }}>
        {description}
      </p>
      {warning && (
        <p style={{ fontSize: "12px", color: "var(--color-timer-warning)" }}>{warning}</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            disabled={a.disabled}
            style={{
              padding: "11px 16px",
              borderRadius: "7px",
              border: a.primary ? "none" : "1px solid var(--color-border)",
              background: a.primary ? "var(--color-accent)" : "var(--color-bg)",
              color: a.primary ? "#fff" : "var(--color-text-primary)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: a.disabled ? "not-allowed" : "pointer",
              opacity: a.disabled ? 0.6 : 1,
              fontFamily: "var(--font-sans)",
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
