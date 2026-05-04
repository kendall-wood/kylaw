"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import { calculateScaledScore, getPercentile } from "@/lib/utils/score";
import AnswerChoices from "@/components/test-interface/AnswerChoices";
import AnnotatedText from "@/components/test-interface/AnnotatedText";

type ReviewView = "results" | "questions";

interface TypeBreakdown {
  type: string;
  correct: number;
  total: number;
}

function ScoreCounter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(120);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 120;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return <>{displayed}</>;
}

function percentileLabel(p: number) {
  if (p >= 99) return "Top 1%";
  if (p >= 90) return "Top 10%";
  if (p >= 75) return "Top 25%";
  return `${p}th percentile`;
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
  main_point: "Main Point",
  inference: "Inference",
  detail: "Detail",
  function: "Function",
  authors_attitude: "Author's Attitude",
  analogy: "Analogy",
  comparative: "Comparative",
};

export default function ReviewPage() {
  const router = useRouter();
  const store = useTestSessionStore();
  const { sections, answers, annotations, status, resetSession } = store;

  const [view, setView] = useState<ReviewView>("results");
  const [reviewSectionIdx, setReviewSectionIdx] = useState(0);
  const [reviewQuestionIdx, setReviewQuestionIdx] = useState(0);
  const [scoreReady, setScoreReady] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (status === "idle") router.push("/test");
    else setTimeout(() => setScoreReady(true), 100);
  }, [status, router]);

  if (status === "idle" || !sections.length) return null;

  // Calculate scores
  const scoredSections = sections.filter((s) => s.scored);
  const allScoredQuestions = scoredSections.flatMap((s) => s.questions);
  const rawCorrect = allScoredQuestions.filter((q) => answers[q.id] === q.correct_answer).length;
  const rawTotal = allScoredQuestions.length;
  const scaledScore = calculateScaledScore(rawCorrect, rawTotal);
  const percentile = getPercentile(scaledScore);

  // Per-section breakdown
  const sectionBreakdowns = sections.map((sec) => {
    const correct = sec.questions.filter((q) => answers[q.id] === q.correct_answer).length;
    return { id: sec.id, type: sec.type, scored: sec.scored, correct, total: sec.questions.length };
  });

  // Per question-type breakdown
  const typeMap: Record<string, { correct: number; total: number }> = {};
  allScoredQuestions.forEach((q) => {
    if (!typeMap[q.question_type]) typeMap[q.question_type] = { correct: 0, total: 0 };
    typeMap[q.question_type].total++;
    if (answers[q.id] === q.correct_answer) typeMap[q.question_type].correct++;
  });
  const typeBreakdowns: TypeBreakdown[] = Object.entries(typeMap)
    .map(([type, { correct, total }]) => ({ type, correct, total }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total);

  const accuracy = rawTotal > 0 ? Math.round((rawCorrect / rawTotal) * 100) : 0;

  // Save session to localStorage once
  useEffect(() => {
    if (savedRef.current || status !== "complete" || !rawTotal) return;
    savedRef.current = true;
    try {
      const key = "kylaw_sessions";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
      prev.push({
        date: new Date().toISOString(),
        mode: store.mode ?? "section",
        scaledScore,
        rawCorrect,
        rawTotal,
        accuracy,
      });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
  }, [status, rawTotal, scaledScore, rawCorrect, accuracy, store.mode]);

  // Review mode
  const reviewSection = sections[reviewSectionIdx];
  const reviewQuestion = reviewSection?.questions[reviewQuestionIdx];
  const reviewAnnotations = reviewQuestion ? (annotations[reviewQuestion.id] ?? []) : [];

  const handleNewTest = () => { resetSession(); router.push("/test"); };
  const handleHome = () => { resetSession(); router.push("/"); };

  const scoreColor =
    scaledScore >= 170 ? "#059669" :
    scaledScore >= 160 ? "#1B4FD8" :
    scaledScore >= 150 ? "#D97706" :
    "#DC2626";

  if (view === "questions" && reviewSection && reviewQuestion) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--font-sans)" }}>
        {/* Review top bar */}
        <div style={{
          height: "48px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "#fff",
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => setView("results")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--color-accent)", fontWeight: "600", fontFamily: "var(--font-sans)" }}
          >
            ← Back to Results
          </button>
          <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            Review Mode — {reviewSection.type === "LR" ? "Logical Reasoning" : "Reading Comprehension"}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {sections.map((sec, i) => (
              <button
                key={sec.id}
                onClick={() => { setReviewSectionIdx(i); setReviewQuestionIdx(0); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "5px",
                  border: "1px solid var(--color-border)",
                  background: i === reviewSectionIdx ? "var(--color-accent)" : "#fff",
                  color: i === reviewSectionIdx ? "#fff" : "var(--color-text-secondary)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Section {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: "48px", marginBottom: "48px", overflow: "hidden" }}>
          {/* Left panel */}
          <div className="panel-scroll" style={{ flex: 1, borderRight: "1px solid var(--color-border)", padding: "32px 40px", background: "#fff" }}>
            {reviewSection.type === "RC" && (reviewQuestion as any).passage_title && (
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontVariant: "small-caps", letterSpacing: "0.05em", marginBottom: "16px" }}>
                {(reviewQuestion as any).passage_title}
              </p>
            )}
            <AnnotatedText
              text={(reviewQuestion as any).passage_text ?? reviewQuestion.stimulus}
              annotations={reviewAnnotations}
              onAnnotate={() => {}}
              fontSize="16px"
              lineSpacing="1.6"
            />
          </div>

          {/* Right panel */}
          <div className="panel-scroll" style={{ flex: 1, padding: "24px 32px 80px", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: "500" }}>
                Question {reviewQuestionIdx + 1} of {reviewSection.questions.length}
              </span>
              <span style={{
                fontSize: "12px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "100px",
                background: answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)",
                color: answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)",
              }}>
                {answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "✓ Correct" : "✗ Incorrect"}
              </span>
            </div>

            <p style={{ fontFamily: "var(--font-serif-body)", lineHeight: "1.55", color: "var(--color-text-primary)", marginBottom: "20px", fontSize: "16px" }}>
              {reviewQuestion.question_stem}
            </p>

            <AnswerChoices question={reviewQuestion} reviewMode />

            {/* Always-visible explanation */}
            <div style={{
              marginTop: "24px",
              background: answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)",
              border: `1px solid ${answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)"}`,
              borderRadius: "8px",
              padding: "16px 20px",
            }}>
              <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "10px", color: answers[reviewQuestion.id] === reviewQuestion.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)" }}>
                {answers[reviewQuestion.id] === reviewQuestion.correct_answer
                  ? "✓ Correct!"
                  : answers[reviewQuestion.id]
                    ? `✗ You chose ${answers[reviewQuestion.id]} — Correct answer: ${reviewQuestion.correct_answer}`
                    : `— Unanswered — Correct answer: ${reviewQuestion.correct_answer}`}
              </p>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-primary)", marginBottom: answers[reviewQuestion.id] && answers[reviewQuestion.id] !== reviewQuestion.correct_answer ? "10px" : "0" }}>
                <strong>Why {reviewQuestion.correct_answer} is correct:</strong> {reviewQuestion.explanation.correct}
              </p>
              {answers[reviewQuestion.id] && answers[reviewQuestion.id] !== reviewQuestion.correct_answer && (
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
                  <strong>Why {answers[reviewQuestion.id]} is wrong:</strong>{" "}
                  {reviewQuestion.explanation[answers[reviewQuestion.id] as keyof typeof reviewQuestion.explanation]}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div style={{ marginTop: "auto", paddingTop: "24px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setReviewQuestionIdx(Math.max(0, reviewQuestionIdx - 1))}
                disabled={reviewQuestionIdx === 0}
                style={{
                  padding: "10px 20px",
                  background: reviewQuestionIdx === 0 ? "var(--color-surface)" : "#fff",
                  border: "1px solid var(--color-border)",
                  borderRadius: "7px",
                  cursor: reviewQuestionIdx === 0 ? "default" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: reviewQuestionIdx === 0 ? "var(--color-text-muted)" : "var(--color-text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setReviewQuestionIdx(Math.min(reviewSection.questions.length - 1, reviewQuestionIdx + 1))}
                disabled={reviewQuestionIdx === reviewSection.questions.length - 1}
                style={{
                  padding: "10px 20px",
                  background: "var(--color-accent)",
                  border: "none",
                  borderRadius: "7px",
                  cursor: reviewQuestionIdx === reviewSection.questions.length - 1 ? "default" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                  opacity: reviewQuestionIdx === reviewSection.questions.length - 1 ? 0.5 : 1,
                  fontFamily: "var(--font-sans)",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom question nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "48px",
          background: "#fff",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "6px",
          overflowX: "auto",
        }}>
          {reviewSection.questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            const isCurrent = i === reviewQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => setReviewQuestionIdx(i)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: isCurrent ? "2px solid var(--color-accent)" : "none",
                  background: isCorrect ? "var(--color-correct)" : "var(--color-incorrect)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: "var(--font-sans)",
                  outline: isCurrent ? "2px solid var(--color-accent-light)" : "none",
                  outlineOffset: "2px",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "48px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Score hero */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          padding: "48px 40px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: "600", marginBottom: "8px" }}>
            Your Score
          </p>
          <div style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: "96px",
            fontWeight: "400",
            color: scoreReady ? scoreColor : "#D8DCE3",
            lineHeight: 1,
            marginBottom: "12px",
            transition: "color 0.3s",
          }}>
            {scoreReady ? <ScoreCounter target={scaledScore} /> : 120}
          </div>
          <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
            {percentileLabel(percentile)}
          </p>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            {rawCorrect} of {rawTotal} correct ({accuracy}%)
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "32px" }}>
            <button
              onClick={() => setView("questions")}
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
              Review Questions
            </button>
            <button
              onClick={handleNewTest}
              style={{
                padding: "12px 28px",
                background: "#fff",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              New Test
            </button>
            <button
              onClick={handleHome}
              style={{
                padding: "12px 28px",
                background: "#fff",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Home
            </button>
          </div>
        </div>

        {/* Section breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${sectionBreakdowns.length}, 1fr)`, gap: "16px", marginBottom: "24px" }}>
          {sectionBreakdowns.map((sec, i) => {
            const pct = sec.total > 0 ? Math.round((sec.correct / sec.total) * 100) : 0;
            return (
              <div key={sec.id} style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                padding: "20px 24px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  Section {i + 1}
                  {!sec.scored && <span style={{ color: "var(--color-flagged)", marginLeft: "6px" }}>Exp.</span>}
                </p>
                <p style={{ fontFamily: "var(--font-serif-display)", fontSize: "36px", fontWeight: "400", color: "var(--color-text-primary)", lineHeight: 1, marginBottom: "4px" }}>
                  {sec.correct}/{sec.total}
                </p>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{pct}% correct</p>
                <div style={{ marginTop: "12px", height: "6px", background: "var(--color-surface)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--color-correct)" : pct >= 60 ? "var(--color-accent)" : "var(--color-incorrect)", borderRadius: "3px", transition: "width 1s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Question type breakdown */}
        {typeBreakdowns.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "28px 32px" }}>
            <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "20px", fontWeight: "400", marginBottom: "20px" }}>
              Performance by Question Type
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {typeBreakdowns.map(({ type, correct, total }) => {
                const pct = Math.round((correct / total) * 100);
                const barColor = pct >= 80 ? "var(--color-correct)" : pct >= 60 ? "var(--color-accent)" : pct >= 40 ? "var(--color-timer-warning)" : "var(--color-incorrect)";
                return (
                  <div key={type}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)" }}>
                        {TYPE_LABELS[type] ?? type}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
                        {correct}/{total} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: "8px", background: "var(--color-surface)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "4px", transition: "width 1.2s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
