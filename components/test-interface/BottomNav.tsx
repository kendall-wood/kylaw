"use client";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";

interface Props {
  section: Section;
}

export default function BottomNav({ section }: Props) {
  const { currentQuestionIndex, answers, flags, navigateToQuestion } = useTestSessionStore();

  return (
    <div
      style={{
        height: "48px",
        background: "var(--color-bg)",
        borderTop: "1px solid var(--color-border)",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "0 80px",
        zIndex: 50,
        overflowX: "auto",
      }}
    >
      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "nowrap" }}>
        {section.questions.map((q, i) => {
          const answered = !!answers[q.id];
          const flagged = !!flags[q.id];
          const current = i === currentQuestionIndex;

          let bg = "var(--color-bg)";
          let border = "1px solid var(--color-border)";
          let color = "var(--color-text-secondary)";
          let outline = "none";

          if (current) {
            bg = "#1740B8";
            border = "1px solid #1740B8";
            color = "#fff";
            outline = "2px solid var(--color-accent)";
          } else if (answered) {
            bg = "var(--color-accent)";
            border = "1px solid var(--color-accent)";
            color = "#fff";
          }

          if (flagged && !current) {
            border = "3px solid var(--color-flagged)";
          }

          return (
            <button
              key={q.id}
              onClick={() => navigateToQuestion(i)}
              title={`Question ${i + 1}${flagged ? " (Flagged)" : ""}${answered ? " (Answered)" : ""}`}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: bg,
                border,
                color,
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                position: "relative",
                outline: current ? outline : "none",
                outlineOffset: "2px",
                fontFamily: "var(--font-sans)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i + 1}
              {flagged && (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--color-flagged)",
                    border: "1px solid white",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Prev / Next arrows */}
      <div style={{ position: "fixed", right: "16px", display: "flex", gap: "6px" }}>
        <button
          onClick={() => navigateToQuestion(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          style={arrowBtn}
        >
          ←
        </button>
        <button
          onClick={() => navigateToQuestion(Math.min(section.questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === section.questions.length - 1}
          style={arrowBtn}
        >
          →
        </button>
      </div>
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg)",
  cursor: "pointer",
  fontSize: "14px",
  color: "var(--color-text-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-sans)",
};
