"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Annotation } from "@/lib/store/testSessionStore";
import { formatTime, getTimerColor } from "@/lib/utils/timer";

interface Props {
  sectionType: "LR" | "RC" | "experimental";
  activeAnnotationType: Annotation["type"] | null;
  onAnnotationTypeChange: (type: Annotation["type"] | null) => void;
}

const DIRECTIONS = {
  LR: `The questions in this section are based on the reasoning presented in brief passages. In answering the questions, you should not make assumptions that are by commonsense standards implausible, superfluous, or incompatible with the passage. For some questions, more than one of the choices could conceivably answer the question. However, you are to choose the best answer; that is, the response that most accurately and completely answers the question.`,
  RC: `Each set of questions in this section is based on a single passage or a pair of passages. The questions are to be answered on the basis of what is stated or implied in the passage or pair of passages. For some questions, more than one of the choices could conceivably answer the question. However, you are to choose the best answer; that is, the response that most accurately and completely answers the question.`,
  experimental: `The questions in this section are based on the reasoning presented in brief passages. In answering the questions, you should not make assumptions that are by commonsense standards implausible, superfluous, or incompatible with the passage. For some questions, more than one of the choices could conceivably answer the question. However, you are to choose the best answer; that is, the response that most accurately and completely answers the question.`,
};

export default function TestTopBar({ sectionType, activeAnnotationType, onAnnotationTypeChange }: Props) {
  const router = useRouter();
  const { timeRemaining, cycleFontSize, cycleLineSpacing, toggleHighContrast, studyMode, pauseTimer, resumeTimer, timerRunning } = useTestSessionStore();
  const [showDirections, setShowDirections] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showContrastPopover, setShowContrastPopover] = useState(false);

  const timerColor = getTimerColor(timeRemaining);

  const toggleAnnotation = useCallback((type: Annotation["type"]) => {
    onAnnotationTypeChange(activeAnnotationType === type ? null : type);
  }, [activeAnnotationType, onAnnotationTypeChange]);

  return (
    <>
      <div
        style={{
          height: "48px",
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setShowBackModal(true)}
            style={btnStyle}
          >
            ← Back
          </button>
          <button
            onClick={() => setShowDirections(true)}
            style={btnStyle}
          >
            Directions
          </button>
        </div>

        {/* Center: Annotation toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <ToolBtn
            label="U"
            title="Underline"
            active={activeAnnotationType === "underline"}
            onClick={() => toggleAnnotation("underline")}
            style={{ textDecoration: "underline", fontWeight: "700" }}
          />
          <ToolBtn
            label="●"
            title="Highlight Yellow"
            active={activeAnnotationType === "yellow"}
            onClick={() => toggleAnnotation("yellow")}
            style={{ color: "#b8a600" }}
          />
          <ToolBtn
            label="●"
            title="Highlight Pink"
            active={activeAnnotationType === "pink"}
            onClick={() => toggleAnnotation("pink")}
            style={{ color: "#c62828" }}
          />
          <ToolBtn
            label="●"
            title="Highlight Blue"
            active={activeAnnotationType === "blue"}
            onClick={() => toggleAnnotation("blue")}
            style={{ color: "#1565c0" }}
          />

          <div style={{ width: "1px", height: "20px", background: "var(--color-border)", margin: "0 6px" }} />

          <ToolBtn label="Aa" title="Font Size" onClick={cycleFontSize} />
          <ToolBtn label="≡" title="Line Spacing" onClick={cycleLineSpacing} style={{ fontSize: "18px" }} />

          <div style={{ position: "relative" }}>
            <ToolBtn
              label="◐"
              title="Screen Settings"
              onClick={() => setShowContrastPopover(!showContrastPopover)}
            />
            {showContrastPopover && (
              <div
                style={{
                  position: "absolute",
                  top: "38px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  whiteSpace: "nowrap",
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => { toggleHighContrast(); setShowContrastPopover(false); }}
                  style={{ ...btnStyle, fontSize: "13px" }}
                >
                  Toggle High Contrast
                </button>
              </div>
            )}
          </div>

          {/* Pause in study mode */}
          {studyMode && (
            <>
              <div style={{ width: "1px", height: "20px", background: "var(--color-border)", margin: "0 6px" }} />
              <ToolBtn
                label={timerRunning ? "⏸" : "▶"}
                title={timerRunning ? "Pause" : "Resume"}
                onClick={timerRunning ? pauseTimer : resumeTimer}
              />
            </>
          )}
        </div>

        {/* Right: Timer */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "15px",
            fontWeight: "700",
            color: timerColor,
            minWidth: "140px",
            textAlign: "right",
          }}
        >
          Time Remaining: {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Directions modal */}
      {showDirections && (
        <Modal onClose={() => setShowDirections(false)} title="Directions">
          <p
            style={{
              fontFamily: "var(--font-serif-body)",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "var(--color-text-primary)",
            }}
          >
            {DIRECTIONS[sectionType]}
          </p>
        </Modal>
      )}

      {/* Back confirmation modal */}
      {showBackModal && (
        <Modal onClose={() => setShowBackModal(false)} title="Leave Test?">
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
            Are you sure you want to leave? Your progress will be lost.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowBackModal(false)} style={btnStyle}>
              Stay in Test
            </button>
            <button
              onClick={() => router.push("/test")}
              style={{
                padding: "9px 18px",
                background: "var(--color-incorrect)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
              }}
            >
              Leave Test
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ToolBtn({
  label, title, active, onClick, style: extraStyle,
}: {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "5px",
        border: active ? "2px solid var(--color-accent)" : "1px solid transparent",
        background: active ? "var(--color-accent-light)" : "transparent",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...extraStyle,
      }}
    >
      {label}
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
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
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-bg)",
          borderRadius: "10px",
          padding: "28px 32px",
          maxWidth: "560px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "22px" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--color-text-muted)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: "5px",
  background: "var(--color-bg)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500",
  fontFamily: "var(--font-sans)",
};
