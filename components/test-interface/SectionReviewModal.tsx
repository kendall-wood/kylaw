"use client";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";

interface Props {
  section: Section;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SectionReviewModal({ section, onClose, onSubmit }: Props) {
  const { answers, flags, navigateToQuestion } = useTestSessionStore();

  const answered = section.questions.filter((q) => answers[q.id]).length;
  const total = section.questions.length;
  const unanswered = total - answered;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          borderRadius: "10px",
          padding: "32px",
          width: "560px",
          maxWidth: "95vw",
          maxHeight: "80vh",
          overflowY: "auto",
          fontFamily: "var(--font-sans)",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "24px", marginBottom: "6px" }}>
          Section Review
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", fontSize: "14px" }}>
          {answered} of {total} questions answered
          {unanswered > 0 && (
            <span style={{ color: "var(--color-timer-warning)", fontWeight: "600" }}>
              {" "}— {unanswered} unanswered
            </span>
          )}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "28px" }}>
          {section.questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isFlagged = !!flags[q.id];

            return (
              <button
                key={q.id}
                onClick={() => { navigateToQuestion(i); onClose(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "7px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isAnswered ? "var(--color-accent)" : "var(--color-surface)",
                    border: isFlagged ? "2px solid var(--color-flagged)" : "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isAnswered ? "#fff" : "var(--color-text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  Question {i + 1}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                  {isFlagged && (
                    <span style={{ fontSize: "11px", padding: "2px 7px", background: "#fef3c7", color: "var(--color-flagged)", borderRadius: "4px", fontWeight: "600" }}>
                      Flagged
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 7px",
                      background: isAnswered ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)",
                      color: isAnswered ? "var(--color-correct)" : "var(--color-incorrect)",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    {isAnswered ? "Answered" : "Unanswered"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "1px solid var(--color-border)",
              borderRadius: "7px",
              background: "var(--color-bg)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              fontFamily: "var(--font-sans)",
            }}
          >
            Return to Section
          </button>
          <button
            onClick={onSubmit}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "7px",
              background: "var(--color-accent)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-sans)",
            }}
          >
            Submit Section
          </button>
        </div>
      </div>
    </div>
  );
}
