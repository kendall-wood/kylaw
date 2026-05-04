"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Annotation } from "@/lib/store/testSessionStore";
import TestTopBar from "@/components/test-interface/TestTopBar";
import AnnotatedText from "@/components/test-interface/AnnotatedText";
import AnswerChoices from "@/components/test-interface/AnswerChoices";
import BottomNav from "@/components/test-interface/BottomNav";
import SectionReviewModal from "@/components/test-interface/SectionReviewModal";

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

  // Tab visibility: continue timer in full_test, pause in study/section
  useEffect(() => {
    const handleVisibility = () => {
      if (mode === "full_test") return; // never pause
      if (document.hidden) store.pauseTimer();
      else if (status === "active") store.resumeTimer();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mode, status, store]);

  // Break timer
  useEffect(() => {
    if (status !== "break") return;
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

  // beforeunload warning for full test
  useEffect(() => {
    if (mode !== "full_test") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mode]);

  if (status === "break") {
    const bm = Math.floor(breakTimeLeft / 60);
    const bs = breakTimeLeft % 60;
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-surface)",
        fontFamily: "var(--font-sans)",
        gap: "20px",
      }}>
        <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "36px" }}>Section 2 Complete</h1>
        <h2 style={{ fontSize: "20px", color: "var(--color-text-secondary)", fontWeight: "400" }}>10-Minute Break</h2>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "72px",
          fontWeight: "700",
          color: breakTimeLeft < 60 ? "var(--color-timer-critical)" : "var(--color-timer-normal)",
          letterSpacing: "0.05em",
        }}>
          {String(bm).padStart(2, "0")}:{String(bs).padStart(2, "0")}
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "15px", maxWidth: "420px", textAlign: "center" }}>
          You may leave your testing area. You must check back in before the break ends.
        </p>
        {studyMode && (
          <button
            onClick={endBreak}
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-sans)",
            }}
          >
            End Break Early
          </button>
        )}
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

  // Mobile warning
  const mobileWarning = (
    <div style={{
      background: "#fff3cd",
      borderBottom: "1px solid #ffc107",
      padding: "10px 16px",
      fontSize: "13px",
      textAlign: "center",
      display: "none",
    }} className="mobile-warning">
      ⚠️ KyLaw's test simulator is optimized for desktop (the real LSAT is also desktop-only). For the most accurate experience, switch to a computer.
    </div>
  );

  return (
    <div
      className={highContrast ? "high-contrast" : ""}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Mobile warning via CSS */}
      <style>{`@media (max-width: 1024px) { .mobile-warning { display: block !important; } }`}</style>
      <div className="mobile-warning" style={{
        background: "#fff3cd",
        borderBottom: "1px solid #ffc107",
        padding: "10px 16px",
        fontSize: "13px",
        textAlign: "center",
      }}>
        ⚠️ KyLaw's test simulator is optimized for desktop (the real LSAT is also desktop-only). For the most accurate experience, switch to a computer.
      </div>

      <TestTopBar
        sectionType={section.type}
        activeAnnotationType={activeAnnotationType}
        onAnnotationTypeChange={setActiveAnnotationType}
      />

      {/* Main split panels — shifted down 48px for top bar */}
      <div style={{ display: "flex", flex: 1, marginTop: "48px", marginBottom: "48px", overflow: "hidden" }}>

        {/* LEFT PANEL — Stimulus / Passage */}
        <div
          className={`panel-scroll ${spacingClass}`}
          style={{
            flex: 1,
            borderRight: "1px solid var(--color-border)",
            padding: "32px 40px",
            background: "#fff",
          }}
        >
          {section.type === "RC" && question.passage_title && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600", marginBottom: "4px" }}>
                Passage {currentQuestionIndex + 1} of {section.questions.length}
              </p>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontVariant: "small-caps", letterSpacing: "0.05em" }}>
                {question.passage_title}
              </p>
            </div>
          )}
          <AnnotatedText
            text={(question as any).passage_text ?? question.stimulus}
            annotations={questionAnnotations}
            onAnnotate={handleAnnotate}
            fontSize={fontSize === "default" ? "16px" : fontSize === "large" ? "19px" : "22px"}
            lineSpacing={lineSpacing === "normal" ? "1.6" : "2.1"}
          />
        </div>

        {/* RIGHT PANEL — Question + Choices */}
        <div
          className="panel-scroll"
          style={{
            flex: 1,
            padding: "24px 32px 80px",
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Question header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: "500" }}>
              Question {currentQuestionIndex + 1} of {section.questions.length}
            </span>
            <button
              onClick={() => toggleFlag(question.id)}
              title={isFlagged ? "Unflag question" : "Flag for review"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: isFlagged ? "var(--color-flagged)" : "var(--color-border)",
                padding: "4px",
              }}
            >
              {isFlagged ? "🚩" : "⚑"}
            </button>
          </div>

          {/* Question stem */}
          <p
            className={fontSizeClass}
            style={{
              fontFamily: "var(--font-serif-body)",
              lineHeight: "1.55",
              color: "var(--color-text-primary)",
              marginBottom: "20px",
            }}
          >
            {question.question_stem}
          </p>

          {/* Answer choices */}
          <AnswerChoices question={question} />

          {/* Study mode explanation */}
          {studyMode && selectedAnswer && (
            <div style={{ marginTop: "20px" }}>
              {!showStudyExplanation ? (
                <button
                  onClick={() => setShowStudyExplanation(true)}
                  style={{
                    padding: "10px 20px",
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Show Explanation
                </button>
              ) : (
                <div
                  style={{
                    background: selectedAnswer === question.correct_answer ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)",
                    border: `1px solid ${selectedAnswer === question.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)"}`,
                    borderRadius: "8px",
                    padding: "16px 20px",
                  }}
                >
                  <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "10px", color: selectedAnswer === question.correct_answer ? "var(--color-correct)" : "var(--color-incorrect)" }}>
                    {selectedAnswer === question.correct_answer ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${question.correct_answer}`}
                  </p>
                  <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-primary)", marginBottom: "10px" }}>
                    <strong>Why {question.correct_answer} is correct:</strong> {question.explanation.correct}
                  </p>
                  {selectedAnswer !== question.correct_answer && (
                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-secondary)" }}>
                      <strong>Why {selectedAnswer} is wrong:</strong>{" "}
                      {question.explanation[selectedAnswer as keyof typeof question.explanation]}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Next / Submit button */}
          <div style={{ marginTop: "auto", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNext}
              style={{
                padding: "11px 24px",
                background: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {isLastQuestion ? "Submit Section" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <BottomNav section={section} />

      {showReviewModal && (
        <SectionReviewModal
          section={section}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitSection}
        />
      )}
    </div>
  );
}
