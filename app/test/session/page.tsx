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
  // Seed synchronously — if already hydrated (fresh navigation) we don't flash blank
  const [hydrated, setHydrated] = useState(() => {
    try { return useTestSessionStore.persist.hasHydrated(); } catch { return true; }
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoResume = useRef(false);
  const breakEndedRef = useRef(false);

  const sectionLabel = getSectionLabel(mode, sections, currentSectionIndex);
  const sectionProgress = sections.length > 1 ? `${currentSectionIndex + 1} of ${sections.length}` : "";

  // On refresh: wait for sessionStorage rehydration; failsafe unblocks after 600ms
  useEffect(() => {
    if (hydrated) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    try {
      if (useTestSessionStore.persist.hasHydrated()) {
        setHydrated(true);
        return;
      }
      const unsub = useTestSessionStore.persist.onFinishHydration(() => setHydrated(true));
      timeoutId = setTimeout(() => setHydrated(true), 600);
      return () => { unsub(); clearTimeout(timeoutId); };
    } catch {
      setHydrated(true);
    }
  }, [hydrated]);

  // Redirect only after hydration so a page refresh doesn't lose the session
  useEffect(() => {
    if (!hydrated) return;
    if (status === "idle") router.push("/test");
    if (status === "complete") router.push("/test/review");
  }, [status, router, hydrated]);

  // After hydration: if the session was active and timer is stopped (due to refresh), restart it
  useEffect(() => {
    if (!hydrated || didAutoResume.current) return;
    didAutoResume.current = true;
    const { status: s, timerRunning: tr, mode: m } = useTestSessionStore.getState();
    if (s === "active" && !tr && m !== "question_bank") {
      store.resumeTimer();
    }
  }, [hydrated, store]);

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

  // Break countdown — seeds from breakStartedAt so refresh restores correct time.
  // endBreak() is intentionally NOT called here — calling Zustand actions inside
  // React state updaters causes double-invocation in Strict Mode (see effect below).
  useEffect(() => {
    if (status !== "break") return;
    breakEndedRef.current = false;
    const bsa = useTestSessionStore.getState().breakStartedAt;
    const initial = bsa
      ? Math.max(0, 10 * 60 - Math.floor((Date.now() - bsa) / 1000))
      : 10 * 60;
    setBreakTimeLeft(initial > 0 ? initial : 0);
    if (initial <= 0) return;
    const id = setInterval(() => {
      setBreakTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // End break when the countdown hits 0 — separate from the timer effect so
  // endBreak() is never called inside a React state updater.
  useEffect(() => {
    if (status === "break" && breakTimeLeft === 0 && !breakEndedRef.current) {
      breakEndedRef.current = true;
      endBreak();
    }
  }, [status, breakTimeLeft, endBreak]);

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
    const justCompleted = getSectionLabel("full_test", sections, currentSectionIndex);
    const upNext = getSectionLabel("full_test", sections, currentSectionIndex + 1);

    const breakTotal = 10 * 60;
    const svgR = 110;
    const circ = 2 * Math.PI * svgR;
    const strokeDashoffset = circ * (1 - breakTimeLeft / breakTotal);
    const timerColor = breakTimeLeft < 60
      ? "var(--color-timer-critical)"
      : breakTimeLeft < 120
      ? "var(--color-timer-warning)"
      : "var(--color-accent)";

    return (
      <>
        <style>{`
          @keyframes breakFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .break-screen { animation: breakFadeIn 0.45s ease both; }
        `}</style>

        <div className="break-screen" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", fontFamily: "var(--font-sans)", gap: 18, padding: 24 }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 6 }}>
              {justCompleted} Complete
            </p>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 28 }}>
              10-Minute Break
            </h1>
          </div>

          {/* Animated ring + timer */}
          <div style={{ position: "relative", width: 280, height: 280 }}>
            <svg width={280} height={280} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={140} cy={140} r={svgR} fill="none" stroke="var(--color-border)" strokeWidth={7} />
              <circle
                cx={140} cy={140} r={svgR}
                fill="none"
                stroke={timerColor}
                strokeWidth={7}
                strokeDasharray={circ}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 50, fontWeight: 700, letterSpacing: "0.04em", color: timerColor, lineHeight: 1 }}>
                {String(bm).padStart(2, "0")}:{String(bs).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6, letterSpacing: "0.05em" }}>remaining</div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "var(--color-text-muted)", maxWidth: 360, textAlign: "center", lineHeight: 1.65 }}>
            You may leave your testing area. The next section begins automatically when the break ends.
          </p>

          <div style={{ padding: "9px 18px", background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Up next: <strong style={{ color: "var(--color-text-primary)" }}>{upNext}</strong>
            </p>
          </div>

          {/* Skip — always visible */}
          <button
            onClick={endBreak}
            style={{ padding: "10px 28px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", transition: "background var(--t), box-shadow var(--t)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            Skip Break →
          </button>

          {/* Bottom-right section progress */}
          <div style={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 16px", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {sections.map((_, i) => (
                <div key={i} style={{
                  height: 6, borderRadius: 3,
                  width: i <= currentSectionIndex ? 20 : 8,
                  background: i <= currentSectionIndex ? "var(--color-accent)" : "var(--color-border)",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
              {currentSectionIndex + 1} of {sections.length} sections
            </span>
          </div>
        </div>
      </>
    );
  }

  // Show nothing while sessionStorage hydrates — prevents false "idle" redirect flash
  if (!hydrated) return null;

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
