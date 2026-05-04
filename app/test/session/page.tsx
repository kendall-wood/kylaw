"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Annotation, SessionMode, Section } from "@/lib/store/testSessionStore";
import TestTopBar from "@/components/test-interface/TestTopBar";
import AnnotatedText from "@/components/test-interface/AnnotatedText";
import AnswerChoices from "@/components/test-interface/AnswerChoices";
import BottomNav from "@/components/test-interface/BottomNav";
import SectionReviewModal from "@/components/test-interface/SectionReviewModal";

const FULL_TEST_LABELS = ["Logical Reasoning I", "Logical Reasoning II", "Reading Comprehension", "Experimental"];

function getSectionLabel(mode: SessionMode | null, sections: Section[], idx: number): string {
  if (mode === "full_test") return FULL_TEST_LABELS[idx] ?? "Section";
  if (mode === "section") return sections[idx]?.type === "RC" ? "Reading Comprehension" : "Logical Reasoning";
  return "Question Bank";
}

export default function TestSessionPage() {
  const router = useRouter();
  const store = useTestSessionStore();
  const {
    status, sections, currentSectionIndex, currentQuestionIndex,
    answers, flags, annotations, fontSize, lineSpacing, highContrast,
    tickTimer, timerRunning, studyMode, toggleFlag, addAnnotation,
    submitSection, navigateToQuestion, endBreak, mode,
  } = store;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeAnnotationType, setActiveAnnotationType] = useState<Annotation["type"] | null>(null);
  const [showStudyExplanation, setShowStudyExplanation] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(10 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sectionLabel = getSectionLabel(mode, sections, currentSectionIndex);
  const sectionProgress = sections.length > 1 ? `${currentSectionIndex + 1} of ${sections.length}` : "";

  // Redirect if no active session
  useEffect(() => {
    if (status === "idle") router.push("/test");
    if (status === "complete") router.push("/test/review");
  }, [status, router]);

  // Main timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timerRunning) {
      timerRef.current = setInterval(tickTimer, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, tickTimer]);

  // Tab visibility: pause for non-full_test
  useEffect(() => {
    const handler = () => {
      if (mode === "full_test") return;
      if (document.hidden) store.pauseTimer();
      else if (status === "active") store.resumeTimer();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [mode, status, store]);

  // Break countdown
  useEffect(() => {
    if (status !== "break") return;
    setBreakTimeLeft(10 * 60);
    const id = setInterval(() => {
      setBreakTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); endBreak(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status, endBreak]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (status !== "active") return;
      const section = sections[currentSectionIndex];
      if (!section) return;
      const q = section.questions[currentQuestionIndex];
      if (!q) return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        store.selectAnswer(q.id, key);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        navigateToQuestion(Math.min(section.questions.length - 1, currentQuestionIndex + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        navigateToQuestion(Math.max(0, currentQuestionIndex - 1));
      } else if (e.key === "f" || e.key === "F") {
        toggleFlag(q.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, currentSectionIndex, currentQuestionIndex, sections, store, navigateToQuestion, toggleFlag]);

  // Reset study explanation on question change
  useEffect(() => {
    setShowStudyExplanation(false);
  }, [currentQuestionIndex, currentSectionIndex]);

  // Warn before unload on full test
  useEffect(() => {
    if (mode !== "full_test") return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mode]);

  /* ── Break screen ──────────────────────────────────────── */
  if (status === "break") {
    const bm = Math.floor(breakTimeLeft / 60);
    const bs = breakTimeLeft % 60;
    // currentSectionIndex is still pointing at lr2 (index 1) during break
    const justCompleted = getSectionLabel("full_test", sections, currentSectionIndex);

    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", fontFamily: "var(--font-sans)", gap: 16, padding: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          {justCompleted} Complete
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 36, marginBottom: 4 }}>
          10-Minute Break
        </h1>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 72, fontWeight: 700, letterSpacing: "0.05em",
          color: breakTimeLeft < 60 ? "var(--color-timer-critical)" : breakTimeLeft < 120 ? "var(--color-timer-warning)" : "var(--color-timer-normal)",
        }}>
          {String(bm).padStart(2, "0")}:{String(bs).padStart(2, "0")}
        </div>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", maxWidth: 420, textAlign: "center", lineHeight: 1.6 }}>
          You may leave your testing area. The next section will begin automatically when the break ends.
        </p>
        {studyMode && (
          <button onClick={endBreak} style={{ marginTop: 8, padding: "10px 24px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            End Break Early
          </button>
        )}
        <div style={{ marginTop: 16, padding: "10px 20px", background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Up next: <strong style={{ color: "var(--color-text-primary)" }}>
              {getSectionLabel("full_test", sections, currentSectionIndex + 1)}
            </strong>
          </p>
        </div>
      </div>
    );
  }

  if (status !== "active" || !sections.length) return null;

  const section = sections[currentSectionIndex];
  const question = section?.questions[currentQuestionIndex];
  if (!section || !question) return null;

  const isLastQuestion = currentQuestionIndex === section.questions.length - 1;
  const questionAnnotations = annotations[question.id] ?? [];
  const isFlagged = !!flags[question.id];
  const selectedAnswer = answers[question.id];

  const fontSizeClass = `test-font-${fontSize}`;
  const spacingClass = `test-spacing-${lineSpacing}`;

  const handleAnnotate = useCallback((annotation: Annotation) => {
    if (!activeAnnotationType) return;
    addAnnotation(question.id, { ...annotation, type: activeAnnotationType });
  }, [activeAnnotationType, addAnnotation, question.id]);

  const handleNext = () => {
    if (isLastQuestion) {
      setShowReviewModal(true);
    } else {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleSubmitSection = () => {
    setShowReviewModal(false);
    submitSection();
  };

  return (
    <div
      className={highContrast ? "high-contrast" : ""}
      style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--font-sans)" }}
    >
      {/* Mobile warning (CSS-only, desktop-first) */}
      <style>{`@media (max-width: 1024px) { .mobile-warn { display: block !important; } }`}</style>
      <div className="mobile-warn" style={{ display: "none", background: "#fff3cd", borderBottom: "1px solid #ffc107", padding: "10px 16px", fontSize: 13, textAlign: "center" }}>
        This simulator is optimized for desktop — the real LSAT is also desktop-only.
      </div>

      <TestTopBar
        sectionType={section.type}
        sectionLabel={sectionLabel}
        sectionProgress={sectionProgress}
        activeAnnotationType={activeAnnotationType}
        onAnnotationTypeChange={setActiveAnnotationType}
      />

      {/* Split panels — 48px top bar, 48px bottom nav */}
      <div style={{ display: "flex", flex: 1, marginTop: 48, marginBottom: 48, overflow: "hidden" }}>

        {/* LEFT — Stimulus / Passage */}
        <div className={`panel-scroll ${spacingClass}`} style={{ flex: 1, borderRight: "1px solid var(--color-border)", padding: "32px 40px", background: "#fff" }}>
          {section.type === "RC" && question.passage_title && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>
                {question.passage_title}
              </p>
            </div>
          )}
          <AnnotatedText
            text={(question as any).passage_text ?? question.stimulus}
            annotations={questionAnnotations}
            onAnnotate={handleAnnotate}
            fontSize={fontSize === "default" ? "16px" : fontSize === "large" ? "19px" : "22px"}
            lineSpacing={lineSpacing === "normal" ? "1.65" : "2.1"}
          />
        </div>

        {/* RIGHT — Question + Choices */}
        <div className="panel-scroll" style={{ flex: 1, padding: "24px 32px 80px", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
          {/* Question header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>
              Question {currentQuestionIndex + 1} of {section.questions.length}
            </span>
            <button
              onClick={() => toggleFlag(question.id)}
              title={isFlagged ? "Remove flag" : "Flag for review"}
              style={{ background: isFlagged ? "#fef3c7" : "var(--color-surface)", border: `1px solid ${isFlagged ? "#f59e0b" : "var(--color-border)"}`, borderRadius: 6, cursor: "pointer", padding: "5px 10px", fontSize: 12, fontWeight: 600, color: isFlagged ? "#b45309" : "var(--color-text-muted)", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
            >
              {isFlagged ? "🚩 Flagged" : "⚑ Flag"}
            </button>
          </div>

          {/* Question stem */}
          <p
            className={fontSizeClass}
            style={{ fontFamily: "var(--font-serif)", lineHeight: 1.6, color: "var(--color-text-primary)", marginBottom: 20 }}
          >
            {question.question_stem}
          </p>

          {/* Answer choices */}
          <AnswerChoices question={question} />

          {/* Study mode explanation */}
          {studyMode && selectedAnswer && (
            <div style={{ marginTop: 20 }}>
              {!showStudyExplanation ? (
                <button
                  onClick={() => setShowStudyExplanation(true)}
                  style={{ padding: "10px 20px", background: "var(--color-accent-light)", color: "var(--color-accent)", border: "1px solid rgba(27,79,216,0.25)", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "var(--font-sans)" }}
                >
                  Show Explanation
                </button>
              ) : (
                <div style={{ background: selectedAnswer === question.correct_answer ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)", border: `1px solid ${selectedAnswer === question.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)"}`, borderRadius: 9, padding: "16px 20px" }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: selectedAnswer === question.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)" }}>
                    {selectedAnswer === question.correct_answer ? "Correct" : `Incorrect — Correct answer: ${question.correct_answer}`}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-text-primary)", marginBottom: 10 }}>
                    <strong>Why {question.correct_answer} is correct:</strong> {question.explanation.correct}
                  </p>
                  {selectedAnswer !== question.correct_answer && (
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
                      <strong>Why {selectedAnswer} is wrong:</strong>{" "}
                      {question.explanation[selectedAnswer as keyof typeof question.explanation]}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Next / Submit */}
          <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNext}
              style={{ padding: "11px 24px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "var(--font-sans)", transition: "background var(--t), box-shadow var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              {isLastQuestion ? "Submit Section →" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <BottomNav section={section} sectionLabel={sectionLabel} sectionProgress={sectionProgress} />

      {showReviewModal && (
        <SectionReviewModal
          section={section}
          sectionLabel={sectionLabel}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitSection}
        />
      )}
    </div>
  );
}
