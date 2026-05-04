"use client";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Question } from "@/lib/store/testSessionStore";

interface Props {
  question: Question;
  reviewMode?: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E"] as const;

export default function AnswerChoices({ question, reviewMode = false }: Props) {
  const { answers, eliminations, selectAnswer, toggleElimination } = useTestSessionStore();

  const selected = answers[question.id];
  const elim = eliminations[question.id] ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
      {LETTERS.map((letter) => {
        const text = question.choices[letter];
        const isSelected = selected === letter;
        const isEliminated = elim.includes(letter);
        const isCorrect = reviewMode && letter === question.correct_answer;
        const isWrong = reviewMode && isSelected && letter !== question.correct_answer;

        let rowBg = "var(--color-bg)";
        let borderColor = "var(--color-border)";
        let circleBg = "transparent";
        let circleText = "var(--color-text-primary)";
        let circleBorder = "2px solid var(--color-border)";

        if (isCorrect) {
          rowBg = "var(--color-correct-bg)";
          borderColor = "var(--color-correct)";
          circleBg = "var(--color-correct)";
          circleText = "#fff";
          circleBorder = "2px solid var(--color-correct)";
        } else if (isWrong) {
          rowBg = "var(--color-incorrect-bg)";
          borderColor = "var(--color-incorrect)";
          circleBg = "var(--color-incorrect)";
          circleText = "#fff";
          circleBorder = "2px solid var(--color-incorrect)";
        } else if (isSelected) {
          circleBg = "var(--color-accent)";
          circleText = "#fff";
          circleBorder = "2px solid var(--color-accent)";
        }

        return (
          <div
            key={letter}
            className={isEliminated && !reviewMode ? "answer-eliminated" : ""}
            style={{
              display: "flex",
              alignItems: "flex-start",
              border: `1px solid ${borderColor}`,
              borderRadius: "7px",
              background: rowBg,
              cursor: reviewMode ? "default" : "pointer",
              transition: "background 0.1s, border-color 0.1s",
            }}
            onClick={() => !reviewMode && !isEliminated && selectAnswer(question.id, letter)}
          >
            {/* Letter circle */}
            <div
              style={{ padding: "12px 10px 12px 14px", flexShrink: 0 }}
              onClick={(e) => {
                if (!reviewMode) {
                  e.stopPropagation();
                  selectAnswer(question.id, letter);
                }
              }}
            >
              <div
                className="letter-circle"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: circleBg,
                  border: circleBorder,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: circleText,
                  fontFamily: "var(--font-sans)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {letter}
              </div>
            </div>

            {/* Answer text */}
            <div
              style={{
                padding: "13px 12px",
                flex: 1,
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                lineHeight: "1.55",
                color: "var(--color-text-primary)",
              }}
            >
              {text}
            </div>

            {/* Eliminate button */}
            {!reviewMode && (
              <button
                title="Eliminate this choice"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleElimination(question.id, letter);
                }}
                style={{
                  padding: "12px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isEliminated ? "var(--color-incorrect)" : "var(--color-text-muted)",
                  fontSize: "17px",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ⊘
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
