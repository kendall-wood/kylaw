"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface StoredSession {
  date: string;
  mode: string;
  scaledScore: number;
  rawCorrect: number;
  rawTotal: number;
  accuracy: number;
}

const TYPE_LABELS: Record<string, string> = {
  flaw: "Flaw",
  must_be_true: "Must Be True",
  strengthen: "Strengthen",
  necessary_assumption: "Necessary Assumption",
  weaken: "Weaken",
  sufficient_assumption: "Sufficient Assumption",
  method_of_reasoning: "Method of Reasoning",
  main_conclusion: "Main Conclusion",
  principle: "Principle",
  resolve_paradox: "Resolve Paradox",
  parallel_reasoning: "Parallel Reasoning",
  point_at_issue: "Point at Issue",
};

function getScoreColor(score: number) {
  if (score >= 170) return "#059669";
  if (score >= 160) return "#1B4FD8";
  if (score >= 150) return "#D97706";
  return "#DC2626";
}

function SparkLine({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const min = Math.min(...scores, 120);
  const max = Math.max(...scores, 180);
  const range = max - min || 1;
  const w = 200;
  const h = 50;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-accent)" />;
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [drillStats, setDrillStats] = useState<Record<string, { correct: number; total: number }>>({});
  const [flashcardStats, setFlashcardStats] = useState<{ known: number; total: number }>({ known: 0, total: 214 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kylaw_sessions");
      if (stored) setSessions(JSON.parse(stored));
      const drills = localStorage.getItem("kylaw_drill_stats");
      if (drills) setDrillStats(JSON.parse(drills));
      const fc = localStorage.getItem("kylaw_flashcard_stats");
      if (fc) setFlashcardStats(JSON.parse(fc));
    } catch {}
  }, []);

  const recentScores = sessions.slice(-10).map((s) => s.scaledScore);
  const latestScore = sessions.length > 0 ? sessions[sessions.length - 1].scaledScore : null;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.scaledScore, 0) / sessions.length)
    : null;
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.scaledScore)) : null;

  const weakTypes = Object.entries(drillStats)
    .filter(([, v]) => v.total >= 5)
    .map(([type, { correct, total }]) => ({ type, pct: Math.round((correct / total) * 100), total }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);

  const hasData = sessions.length > 0 || Object.keys(drillStats).length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "48px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "36px", fontWeight: "400", marginBottom: "6px" }}>Dashboard</h1>
            <p style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>Your practice history and performance trends</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/test" style={{
              padding: "10px 20px",
              background: "var(--color-accent)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}>
              New Test
            </Link>
            <Link href="/study" style={{
              padding: "10px 20px",
              background: "#fff",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}>
              Study
            </Link>
          </div>
        </div>

        {!hasData ? (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "64px 40px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", marginBottom: "16px" }}>📈</p>
            <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "24px", fontWeight: "400", marginBottom: "10px" }}>No practice data yet</h2>
            <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "28px", maxWidth: "380px", margin: "0 auto 28px" }}>
              Complete a test or drill session to see your score trends, accuracy by question type, and study recommendations.
            </p>
            <Link href="/test" style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "var(--color-accent)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
            }}>
              Take your first test
            </Link>
          </div>
        ) : (
          <>
            {/* Score stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Latest Score", value: latestScore, suffix: "" },
                { label: "Average Score", value: avgScore, suffix: "" },
                { label: "Best Score", value: bestScore, suffix: "" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "24px 28px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700", color: "var(--color-text-muted)", marginBottom: "8px" }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-serif-display)", fontSize: "44px", fontWeight: "400", color: value ? getScoreColor(value) : "var(--color-border)", lineHeight: 1 }}>
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Score trend */}
            {recentScores.length >= 2 && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "24px 28px", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Score Trend</h2>
                <SparkLine scores={recentScores} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Oldest</span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Most recent</span>
                </div>
              </div>
            )}

            {/* Weak areas */}
            {weakTypes.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "24px 28px", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Focus Areas</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {weakTypes.map(({ type, pct }) => (
                    <div key={type}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>{TYPE_LABELS[type] ?? type}</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "7px", background: "var(--color-surface)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct < 50 ? "var(--color-incorrect)" : pct < 70 ? "var(--color-timer-warning)" : "var(--color-correct)", borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/study/drills" style={{
                  display: "inline-block",
                  marginTop: "20px",
                  padding: "9px 18px",
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                  borderRadius: "7px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}>
                  Drill weak types →
                </Link>
              </div>
            )}

            {/* Recent sessions table */}
            {sessions.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid var(--color-border)", padding: "24px 28px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Recent Sessions</h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      {["Date", "Mode", "Score", "Accuracy"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "12px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice().reverse().slice(0, 10).map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--color-surface)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{new Date(s.date).toLocaleDateString()}</td>
                        <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>{s.mode.replace("_", " ")}</td>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: getScoreColor(s.scaledScore) }}>{s.scaledScore}</td>
                        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{s.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
