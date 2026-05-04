"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTestSessionStore } from "@/lib/store/testSessionStore";
import type { Annotation } from "@/lib/store/testSessionStore";
import { formatTime, getTimerColor } from "@/lib/utils/timer";

interface Props {
  sectionType: "LR" | "RC" | "experimental";
  sectionLabel: string;
  sectionProgress: string;
  activeAnnotationType: Annotation["type"] | null;
  onAnnotationTypeChange: (type: Annotation["type"] | null) => void;
}

const DIRECTIONS = {
  LR: `Each question in this section is based on the reasoning in a brief passage. Choose the best answer — the one that most accurately and completely answers the question. Do not assume anything that is by commonsense standards implausible or incompatible with the passage.`,
  RC: `Each set of questions is based on a single passage or pair of passages. Answer on the basis of what is stated or implied in the passage. Choose the best answer for each question.`,
  experimental: `Each question in this section is based on the reasoning in a brief passage. Choose the best answer — the one that most accurately and completely answers the question.`,
};

export default function TestTopBar({ sectionType, sectionLabel, sectionProgress, activeAnnotationType, onAnnotationTypeChange }: Props) {
  const router = useRouter();
  const {
    timeRemaining, cycleFontSize, cycleLineSpacing, toggleHighContrast,
    studyMode, pauseTimer, resumeTimer, timerRunning, mode,
  } = useTestSessionStore();

  const [showDirections, setShowDirections] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showContrastPopover, setShowContrastPopover] = useState(false);

  const timerColor = getTimerColor(timeRemaining);
  const isUntimed = mode === "question_bank";

  const toggleAnnotation = useCallback((type: Annotation["type"]) => {
    onAnnotationTypeChange(activeAnnotationType === type ? null : type);
  }, [activeAnnotationType, onAnnotationTypeChange]);

  return (
    <>
      <div style={{
        height: 48,
        background: "#fff",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        fontFamily: "var(--font-sans)",
        gap: 8,
      }}>
        {/* Left: Exit + Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "0 0 auto" }}>
          <button onClick={() => setShowBackModal(true)} style={btnStyle}>
            ← Exit
          </button>
          <div style={{ width: 1, height: 20, background: "var(--color-border)" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
              {sectionLabel}
            </span>
            {sectionProgress && (
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                Section {sectionProgress}
              </span>
            )}
          </div>
        </div>

        {/* Center: Annotation tools */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 0 auto" }}>
          <ToolBtn label="U" title="Underline" active={activeAnnotationType === "underline"} onClick={() => toggleAnnotation("underline")} style={{ textDecoration: "underline", fontWeight: "700" }} />
          <ToolBtn label="●" title="Highlight Yellow" active={activeAnnotationType === "yellow"} onClick={() => toggleAnnotation("yellow")} style={{ color: "#b8a600" }} />
          <ToolBtn label="●" title="Highlight Pink"  active={activeAnnotationType === "pink"}   onClick={() => toggleAnnotation("pink")}   style={{ color: "#c62828" }} />
          <ToolBtn label="●" title="Highlight Blue"  active={activeAnnotationType === "blue"}   onClick={() => toggleAnnotation("blue")}   style={{ color: "#1565c0" }} />

          <div style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 4px" }} />

          <ToolBtn label="Aa" title="Cycle Font Size"    onClick={cycleFontSize} />
          <ToolBtn label="≡"  title="Cycle Line Spacing" onClick={cycleLineSpacing} style={{ fontSize: 18 }} />

          <div style={{ position: "relative" }}>
            <ToolBtn label="◐" title="Screen Settings" onClick={() => setShowContrastPopover(!showContrastPopover)} />
            {showContrastPopover && (
              <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 8, padding: "12px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", whiteSpace: "nowrap", zIndex: 100 }}>
                <button onClick={() => { toggleHighContrast(); setShowContrastPopover(false); }} style={btnStyle}>
                  Toggle High Contrast
                </button>
              </div>
            )}
          </div>

          {studyMode && (
            <>
              <div style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 4px" }} />
              <ToolBtn label={timerRunning ? "⏸" : "▶"} title={timerRunning ? "Pause" : "Resume"} onClick={timerRunning ? pauseTimer : resumeTimer} />
            </>
          )}
        </div>

        {/* Right: Directions + Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          <button onClick={() => setShowDirections(true)} style={btnStyle}>
            Directions
          </button>
          <div style={{ width: 1, height: 20, background: "var(--color-border)" }} />
          {isUntimed ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", minWidth: 90, textAlign: "right" }}>
              Untimed
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: timerColor, minWidth: 90, textAlign: "right", letterSpacing: "0.04em" }}>
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      {/* Directions modal */}
      {showDirections && (
        <Modal onClose={() => setShowDirections(false)} title={sectionLabel}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.75, color: "var(--color-text-primary)" }}>
            {DIRECTIONS[sectionType]}
          </p>
        </Modal>
      )}

      {/* Exit confirmation modal */}
      {showBackModal && (
        <Modal onClose={() => setShowBackModal(false)} title="Leave this section?">
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
            Your answers will be lost. Are you sure you want to exit?
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowBackModal(false)} style={btnStyle}>
              Stay in Test
            </button>
            <button
              onClick={() => router.push("/test")}
              style={{ padding: "9px 18px", background: "var(--color-incorrect)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "var(--font-sans)" }}
            >
              Exit
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function ToolBtn({ label, title, active, onClick, style: extra }: { label: string; title: string; active?: boolean; onClick: () => void; style?: React.CSSProperties }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 5,
        border: active ? "2px solid var(--color-accent)" : "1px solid transparent",
        background: active ? "var(--color-accent-light)" : "transparent",
        cursor: "pointer", fontSize: 13, fontWeight: 600,
        color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...extra,
      }}
    >
      {label}
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "28px 32px", maxWidth: 560, width: "90%", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--color-text-muted)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: 5,
  background: "#fff",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "var(--font-sans)",
  whiteSpace: "nowrap",
};
