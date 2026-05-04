"use client";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Section } from "@/lib/store/testSessionStore";

interface Props {
  section: Section;
  sectionLabel: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SectionReviewModal({ section, sectionLabel, onClose, onSubmit }: Props) {
  const { answers, flags, navigateToQuestion } = useTestSessionStore();

  const answeredCount = section.questions.filter((q) => answers[q.id]).length;
  const total = section.questions.length;
  const unanswered = total - answeredCount;
  const flaggedCount = section.questions.filter((q) => flags[q.id]).length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "32px", width: 580, maxWidth: "95vw", maxHeight: "82vh", overflowY: "auto", fontFamily: "var(--font-sans)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 6 }}>
            Section Review
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 22, marginBottom: 10 }}>
            {sectionLabel}
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "var(--color-correct-bg)", color: "var(--color-correct)", fontWeight: 600 }}>
              {answeredCount} answered
            </span>
            {unanswered > 0 && (
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "var(--color-incorrect-bg)", color: "var(--color-incorrect)", fontWeight: 600 }}>
                {unanswered} unanswered
              </span>
            )}
            {flaggedCount > 0 && (
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 100, background: "#fef3c7", color: "#b45309", fontWeight: 600 }}>
                {flaggedCount} flagged
              </span>
            )}
          </div>
        </div>

        {/* Question list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
          {section.questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isFlagged = !!flags[q.id];
            return (
              <button
                key={q.id}
                onClick={() => { navigateToQuestion(i); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: isFlagged ? "#fffbeb" : "#fff",
                  cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isFlagged ? "#fffbeb" : "#fff"; }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: isAnswered ? "var(--color-accent)" : "var(--color-surface)",
                  border: isFlagged ? "2px solid var(--color-flagged)" : "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: isAnswered ? "#fff" : "var(--color-text-muted)",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", flex: 1 }}>
                  Question {i + 1}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {isFlagged && (
                    <span style={{ fontSize: 11, padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: 100, fontWeight: 600 }}>
                      Flagged
                    </span>
                  )}
                  <span style={{ fontSize: 11, padding: "2px 8px", background: isAnswered ? "var(--color-correct-bg)" : "var(--color-incorrect-bg)", color: isAnswered ? "var(--color-correct)" : "var(--color-incorrect)", borderRadius: 100, fontWeight: 600 }}>
                    {isAnswered ? "Answered" : "Blank"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid var(--color-border)", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)" }}>
            Return to Section
          </button>
          <button
            onClick={onSubmit}
            style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--color-accent)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", transition: "background var(--t)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; }}
          >
            Submit Section →
          </button>
        </div>
      </div>
    </div>
  );
}
