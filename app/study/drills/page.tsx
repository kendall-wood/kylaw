"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import lrData from "@/lib/data/questions_lr.json";
import { ArrowLeft, ChevronRight, Zap } from "lucide-react";

interface Question {
  id: string;
  question_type: string;
  difficulty: string;
  stimulus: string;
  question_stem: string;
  choices: Record<string, string>;
  correct_answer: string;
  explanation: Record<string, string>;
}

const TYPE_LABELS: Record<string, string> = {
  flaw: "Flaw",
  must_be_true: "Must Be True",
  strengthen: "Strengthen",
  necessary_assumption: "Necessary Assumption",
  weaken: "Weaken",
  sufficient_assumption: "Sufficient Assumption",
  method_of_reasoning: "Method of Reasoning",
  main_conclusion: "Main Conclusion",
  principle: "Principle",
  resolve_paradox: "Resolve Paradox",
  parallel_reasoning: "Parallel Reasoning",
  point_at_issue: "Point at Issue",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#059669",
  medium: "#D97706",
  hard: "#DC2626",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "landing" | "drilling" | "done";

function DrillsContent() {
  const allQuestions: Question[] = (lrData as any).questions;

  const typeCounts = Object.fromEntries(
    Object.keys(TYPE_LABELS).map((t) => [
      t,
      allQuestions.filter((q) => q.question_type === t).length,
    ])
  );

  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);

  const searchParams = useSearchParams();

  const startDrill = useCallback(
    (type: string) => {
      const filtered =
        type === "all"
          ? allQuestions
          : allQuestions.filter((q) => q.question_type === type);
      setQueue(shuffle(filtered));
      setIndex(0);
      setSelected(null);
      setShowExplanation(false);
      setCorrect(0);
      setAttempted(0);
      setSelectedType(type);
      setPhase("drilling");
    },
    [allQuestions]
  );

  // Auto-start drill when navigating from dashboard with ?type=X
  useEffect(() => {
    const type = searchParams.get("type");
    if (type && (type === "all" || TYPE_LABELS[type])) {
      startDrill(type);
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Landing ─────────────────────────────────────── */
  if (phase === "landing") {
    return (
      <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>
        <section style={{ padding: "48px 56px 44px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
            Study · Drills
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 38, lineHeight: 1.1, marginBottom: 10, color: "var(--color-text-primary)" }}>
            Question Drills
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 500 }}>
            Drill any of the 12 LR question types in isolation. Questions are randomized with instant explanations after every answer.
          </p>
        </section>

        <div style={{ padding: "40px 56px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* All types — hero card */}
          <div
            onClick={() => startDrill("all")}
            onMouseEnter={() => setHoveredType("all")}
            onMouseLeave={() => setHoveredType(null)}
            style={{
              background: "var(--color-accent)",
              borderRadius: 14, padding: "26px 32px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", gap: 16,
              boxShadow: hoveredType === "all" ? "var(--shadow-md), 0 0 0 3px rgba(27,79,216,0.2)" : "var(--shadow-sm)",
              transform: hoveredType === "all" ? "translateY(-1px)" : "none",
              transition: "box-shadow var(--t), transform var(--t)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={20} color="#fff" strokeWidth={1.6} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Recommended
                </div>
                <div style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 22, color: "#fff", marginBottom: 4 }}>
                  Mixed — All Types
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  {allQuestions.length} questions · all 12 types shuffled together
                </div>
              </div>
            </div>
            <ChevronRight size={20} color="rgba(255,255,255,0.7)" strokeWidth={2} style={{ flexShrink: 0 }} />
          </div>

          {/* Type grid */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 12 }}>
              By Question Type
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {Object.entries(TYPE_LABELS).map(([key, label]) => {
                const active = hoveredType === key;
                return (
                  <div
                    key={key}
                    onClick={() => startDrill(key)}
                    onMouseEnter={() => setHoveredType(key)}
                    onMouseLeave={() => setHoveredType(null)}
                    style={{
                      background: "#fff", border: "1px solid var(--color-border)", borderRadius: 12,
                      padding: "16px 18px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                      boxShadow: active ? "var(--shadow-sm), var(--glow-sm)" : "var(--shadow-xs)",
                      transform: active ? "translateY(-1px)" : "none",
                      transition: "box-shadow var(--t), transform var(--t)",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 15, color: "var(--color-text-primary)", marginBottom: 3 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                        {typeCounts[key] ?? 0} questions
                      </div>
                    </div>
                    <ChevronRight size={14} color={active ? "var(--color-accent)" : "var(--color-text-muted)"} strokeWidth={2} style={{ flexShrink: 0, transition: "color var(--t)" }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Done ────────────────────────────────────────── */
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  if (phase === "done") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--color-border)", padding: "48px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "var(--shadow-md)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Zap size={24} color="var(--color-accent)" strokeWidth={1.6} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 28, marginBottom: 6 }}>Drill complete</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 24 }}>
            {selectedType === "all" ? "All Types" : TYPE_LABELS[selectedType]}
          </p>
          <p style={{
            fontSize: 48, fontFamily: "var(--font-serif)", fontWeight: 400, lineHeight: 1,
            color: accuracy >= 80 ? "var(--color-correct)" : accuracy >= 60 ? "var(--color-accent)" : "var(--color-incorrect)",
            marginBottom: 6,
          }}>
            {accuracy}%
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 32 }}>
            {correct} of {attempted} correct
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => startDrill(selectedType)}
              style={{ padding: "12px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; }}
            >
              Drill again
            </button>
            <button
              onClick={() => setPhase("landing")}
              style={{ padding: "12px", background: "#fff", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              Choose another type
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Drilling ────────────────────────────────────── */
  const question = queue[index];
  if (!question) return null;
  const isCorrect = selected === question.correct_answer;

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const isCorrectAnswer = choice === question.correct_answer;
    setAttempted((n) => n + 1);
    if (isCorrectAnswer) setCorrect((n) => n + 1);

    try {
      const stored = localStorage.getItem("kylaw_drill_stats");
      const stats: Record<string, { correct: number; total: number }> = stored ? JSON.parse(stored) : {};
      const t = question.question_type;
      const prev = stats[t] ?? { correct: 0, total: 0 };
      stats[t] = { correct: prev.correct + (isCorrectAnswer ? 1 : 0), total: prev.total + 1 };
      localStorage.setItem("kylaw_drill_stats", JSON.stringify(stats));
    } catch {}
  };

  const handleNext = () => {
    if (index >= queue.length - 1) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)" }}>
      {/* Compact top bar — no filter pills */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#fff", borderBottom: "1px solid var(--color-border)",
        padding: "0 20px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={() => setPhase("landing")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "6px 8px", borderRadius: 7, display: "flex", alignItems: "center", flexShrink: 0, transition: "background var(--t), color var(--t)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"; }}
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedType === "all" ? "All Types" : TYPE_LABELS[selectedType]}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          {attempted > 0 && (
            <span style={{ fontSize: 13, fontWeight: 600, color: accuracy >= 70 ? "var(--color-correct)" : "var(--color-text-muted)" }}>
              {accuracy}%
            </span>
          )}
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            {index + 1} / {queue.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Meta badges */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
            {TYPE_LABELS[question.question_type] ?? question.question_type}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: `${DIFFICULTY_COLOR[question.difficulty]}18`, color: DIFFICULTY_COLOR[question.difficulty] }}>
            {question.difficulty}
          </span>
        </div>

        {/* Stimulus */}
        <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 10, padding: "24px 28px", marginBottom: 24, fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.7, color: "var(--color-text-primary)", boxShadow: "var(--shadow-xs)" }}>
          {question.stimulus}
        </div>

        {/* Question stem */}
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.55, color: "var(--color-text-primary)", marginBottom: 20, fontWeight: 600 }}>
          {question.question_stem}
        </p>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {(["A", "B", "C", "D", "E"] as const).map((letter) => {
            const isSelected = selected === letter;
            const isRight = letter === question.correct_answer;
            let bg = "#fff", border = "var(--color-border)", color = "var(--color-text-primary)";
            if (selected) {
              if (isRight) { bg = "var(--color-correct-bg)"; border = "var(--color-correct)"; color = "var(--color-correct)"; }
              else if (isSelected) { bg = "var(--color-incorrect-bg)"; border = "var(--color-incorrect)"; color = "var(--color-incorrect)"; }
            }
            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                disabled={!!selected}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 18px", background: bg,
                  border: `1.5px solid ${border}`, borderRadius: 9,
                  cursor: selected ? "default" : "pointer",
                  textAlign: "left", fontFamily: "var(--font-sans)",
                  transition: "all 0.15s", boxShadow: "var(--shadow-xs)",
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${selected ? (isRight ? "var(--color-correct)" : isSelected ? "var(--color-incorrect)" : "var(--color-border)") : "var(--color-border)"}`,
                  background: selected && isRight ? "var(--color-correct)" : selected && isSelected ? "var(--color-incorrect)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: selected && (isRight || isSelected) ? "#fff" : "var(--color-text-secondary)",
                }}>
                  {letter}
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.5, color, paddingTop: 2 }}>
                  {question.choices[letter]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {selected && (
          <div style={{ background: isCorrect ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)", border: `1px solid ${isCorrect ? "var(--color-correct)" : "var(--color-incorrect)"}`, borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: isCorrect ? "var(--color-correct)" : "var(--color-incorrect)" }}>
              {isCorrect ? "Correct" : `Incorrect — correct answer: ${question.correct_answer}`}
            </p>
            {!showExplanation ? (
              <button onClick={() => setShowExplanation(true)} style={{ fontSize: 13, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0, fontFamily: "var(--font-sans)" }}>
                Show explanation
              </button>
            ) : (
              <>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: !isCorrect ? 10 : 0 }}>
                  <strong>Why {question.correct_answer} is correct:</strong> {question.explanation.correct}
                </p>
                {!isCorrect && question.explanation[selected] && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
                    <strong>Why {selected} is wrong:</strong> {question.explanation[selected]}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {selected && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNext}
              style={{ padding: "12px 28px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t), box-shadow var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              {index >= queue.length - 1 ? "See Results" : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DrillsPage() {
  return (
    <Suspense fallback={null}>
      <DrillsContent />
    </Suspense>
  );
}
