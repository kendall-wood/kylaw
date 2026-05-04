"use client";
import { useEffect, useState, useCallback } from "react";
import lrData from "@/lib/data/questions_lr.json";

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

export default function DrillsPage() {
  const allQuestions: Question[] = (lrData as any).questions;
  const questionTypes = Object.keys(TYPE_LABELS);

  const [selectedType, setSelectedType] = useState<string>("all");
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const buildQueue = useCallback((type: string) => {
    const filtered = type === "all" ? allQuestions : allQuestions.filter((q) => q.question_type === type);
    setQueue(shuffle(filtered));
    setIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setCorrect(0);
    setAttempted(0);
    setSessionDone(false);
  }, [allQuestions]);

  useEffect(() => { buildQueue(selectedType); }, [selectedType, buildQueue]);

  const question = queue[index];
  const isCorrect = selected === question?.correct_answer;

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    setAttempted((n) => n + 1);
    if (choice === question.correct_answer) setCorrect((n) => n + 1);
  };

  const handleNext = () => {
    if (index >= queue.length - 1) {
      setSessionDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  if (sessionDone) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "48px 40px", maxWidth: "440px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Drill complete</h2>
          <p style={{ fontSize: "32px", fontWeight: "700", color: accuracy >= 80 ? "var(--color-correct)" : accuracy >= 60 ? "var(--color-accent)" : "var(--color-incorrect)", marginBottom: "4px" }}>
            {accuracy}%
          </p>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "32px" }}>
            {correct} of {attempted} correct
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => buildQueue(selectedType)}
              style={{ padding: "13px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              Drill again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#fff",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 24px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}>
          {["all", ...questionTypes].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: "5px 14px",
                borderRadius: "100px",
                border: "1px solid var(--color-border)",
                background: selectedType === type ? "var(--color-accent)" : "#fff",
                color: selectedType === type ? "#fff" : "var(--color-text-secondary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-sans)",
              }}
            >
              {type === "all" ? "All Types" : TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: "var(--color-text-muted)", marginLeft: "16px", whiteSpace: "nowrap" }}>
          {attempted > 0 ? `${accuracy}% · ` : ""}{index + 1}/{queue.length}
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Meta */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
          <span style={{
            fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "100px",
            background: "var(--color-accent-light)", color: "var(--color-accent)",
          }}>
            {TYPE_LABELS[question.question_type] ?? question.question_type}
          </span>
          <span style={{
            fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "100px",
            background: `${DIFFICULTY_COLOR[question.difficulty]}18`,
            color: DIFFICULTY_COLOR[question.difficulty],
          }}>
            {question.difficulty}
          </span>
        </div>

        {/* Stimulus */}
        <div style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "24px 28px",
          marginBottom: "24px",
          fontFamily: "var(--font-serif-body)",
          fontSize: "16px",
          lineHeight: "1.7",
          color: "var(--color-text-primary)",
        }}>
          {question.stimulus}
        </div>

        {/* Question stem */}
        <p style={{ fontFamily: "var(--font-serif-body)", fontSize: "16px", lineHeight: "1.55", color: "var(--color-text-primary)", marginBottom: "20px", fontWeight: "600" }}>
          {question.question_stem}
        </p>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {(["A", "B", "C", "D", "E"] as const).map((letter) => {
            const isSelected = selected === letter;
            const isRight = letter === question.correct_answer;
            let bg = "#fff";
            let border = "var(--color-border)";
            let color = "var(--color-text-primary)";

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
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "14px 18px",
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: "9px",
                  cursor: selected ? "default" : "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  border: `1.5px solid ${selected ? (isRight ? "var(--color-correct)" : isSelected ? "var(--color-incorrect)" : "var(--color-border)") : "var(--color-border)"}`,
                  background: selected && isRight ? "var(--color-correct)" : selected && isSelected ? "var(--color-incorrect)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700",
                  color: selected && (isRight || isSelected) ? "#fff" : "var(--color-text-secondary)",
                  flexShrink: 0,
                }}>
                  {letter}
                </span>
                <span style={{ fontSize: "15px", lineHeight: "1.5", color, paddingTop: "2px" }}>
                  {question.choices[letter]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation + Next */}
        {selected && (
          <div style={{
            background: isCorrect ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)",
            border: `1px solid ${isCorrect ? "var(--color-correct)" : "var(--color-incorrect)"}`,
            borderRadius: "10px",
            padding: "20px 24px",
            marginBottom: "20px",
          }}>
            <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "10px", color: isCorrect ? "var(--color-correct)" : "var(--color-incorrect)" }}>
              {isCorrect ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${question.correct_answer}`}
            </p>
            {!showExplanation ? (
              <button
                onClick={() => setShowExplanation(true)}
                style={{ fontSize: "13px", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: "600", padding: 0, fontFamily: "var(--font-sans)" }}
              >
                Show explanation ↓
              </button>
            ) : (
              <>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-primary)", marginBottom: !isCorrect ? "10px" : "0" }}>
                  <strong>Why {question.correct_answer} is correct:</strong> {question.explanation.correct}
                </p>
                {!isCorrect && question.explanation[selected] && (
                  <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
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
              style={{
                padding: "12px 28px",
                background: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {index >= queue.length - 1 ? "See Results" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
