"use client";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";

interface Props {
  section: Section;
  sectionLabel: string;
  sectionProgress: string;
}

export default function BottomNav({ section, sectionLabel, sectionProgress }: Props) {
  const { currentQuestionIndex, answers, flags, navigateToQuestion } = useTestSessionStore();

  const answered = section.questions.filter((q) => !!answers[q.id]).length;
  const total = section.questions.length;

  return (
    <div style={{
      height: 48,
      background: "#fff",
      borderTop: "1px solid var(--color-border)",
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      display: "flex",
      alignItems: "center",
      zIndex: 50,
      fontFamily: "var(--font-sans)",
    }}>
      {/* Section label + answered count — left */}
      <div style={{ flexShrink: 0, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid var(--color-border)", height: "100%" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1 }}>
            {sectionLabel}
            {sectionProgress && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> · {sectionProgress}</span>}
          </div>
          <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2 }}>
            {answered}/{total} answered
          </div>
        </div>
      </div>

      {/* Question dots — center, scrollable */}
      <div style={{ flex: 1, overflowX: "auto", display: "flex", alignItems: "center", padding: "0 12px" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", margin: "0 auto" }}>
          {section.questions.map((q, i) => {
            const answered = !!answers[q.id];
            const flagged = !!flags[q.id];
            const current = i === currentQuestionIndex;

            let bg = "#fff";
            let border = "1px solid var(--color-border)";
            let color = "var(--color-text-secondary)";

            if (current) {
              bg = "var(--color-accent)";
              border = "1px solid var(--color-accent)";
              color = "#fff";
            } else if (answered) {
              bg = "var(--color-accent-light)";
              border = "1px solid rgba(27,79,216,0.3)";
              color = "var(--color-accent)";
            }

            return (
              <button
                key={q.id}
                onClick={() => navigateToQuestion(i)}
                title={`Q${i + 1}${flagged ? " · Flagged" : ""}${answers[q.id] ? " · Answered" : ""}`}
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: bg, border,
                  color, fontSize: 10, fontWeight: 700,
                  cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", fontFamily: "var(--font-sans)",
                  outline: current ? `2px solid rgba(27,79,216,0.3)` : "none",
                  outlineOffset: 2,
                  transition: "background 0.1s, border-color 0.1s",
                }}
              >
                {i + 1}
                {flagged && (
                  <span style={{ position: "absolute", top: -3, right: -3, width: 7, height: 7, borderRadius: "50%", background: "var(--color-flagged)", border: "1px solid #fff" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prev / Next arrows — right */}
      <div style={{ flexShrink: 0, padding: "0 12px", display: "flex", gap: 6, borderLeft: "1px solid var(--color-border)", height: "100%", alignItems: "center" }}>
        <button
          onClick={() => navigateToQuestion(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          style={arrowBtn(currentQuestionIndex === 0)}
        >
          ←
        </button>
        <button
          onClick={() => navigateToQuestion(Math.min(section.questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === section.questions.length - 1}
          style={arrowBtn(currentQuestionIndex === section.questions.length - 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}

const arrowBtn = (disabled: boolean): React.CSSProperties => ({
  width: 32, height: 32, borderRadius: 6,
  border: "1px solid var(--color-border)",
  background: "#fff", cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 14, color: disabled ? "var(--color-border)" : "var(--color-text-secondary)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "var(--font-sans)", opacity: disabled ? 0.4 : 1,
  transition: "opacity 0.15s",
});
