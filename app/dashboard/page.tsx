"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TypeBreakdown {
  type: string;
  correct: number;
  total: number;
}

interface StoredSession {
  date: string;
  mode: string;
  scaledScore: number;
  rawCorrect: number;
  rawTotal: number;
  accuracy: number;
  typeBreakdowns?: TypeBreakdown[];
  questionResults?: { type: string; correct: boolean; answered: boolean }[];
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
  main_point: "Main Point",
  inference: "Inference",
  detail: "Detail",
  function: "Function",
  authors_attitude: "Author's Attitude",
};

function getScoreColor(score: number) {
  if (score >= 170) return "#059669";
  if (score >= 160) return "#1B4FD8";
  if (score >= 150) return "#D97706";
  return "#DC2626";
}

function SparkLine({ scores, width = 300 }: { scores: number[]; width?: number }) {
  if (scores.length < 2) return null;
  const min = Math.min(...scores, 120);
  const max = Math.max(...scores, 180);
  const range = max - min || 1;
  const h = 60;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = h - ((s - min) / range) * h;
    return { x, y, s };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width={width} height={h + 20} style={{ overflow: "visible" }}>
      <polyline points={polyline} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(({ x, y, s }, i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="var(--color-accent)" />
          <text x={x} y={y - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill={getScoreColor(s)} fontFamily="var(--font-sans)">
            {s}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TypeBarRow({ type, correct, total }: TypeBreakdown) {
  const pct = Math.round((correct / total) * 100);
  const barColor = pct >= 80 ? "var(--color-correct)" : pct >= 60 ? "var(--color-accent)" : pct >= 40 ? "var(--color-timer-warning)" : "var(--color-incorrect)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", width: 180, flexShrink: 0 }}>
        {TYPE_LABELS[type] ?? type}
      </span>
      <div style={{ flex: 1, height: 8, background: "var(--color-surface)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", width: 60, textAlign: "right", flexShrink: 0 }}>
        {correct}/{total}
      </span>
      <Link
        href={`/study/drills?type=${encodeURIComponent(type)}`}
        style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent)", textDecoration: "none", whiteSpace: "nowrap", padding: "3px 10px", background: "var(--color-accent-light)", borderRadius: 5, flexShrink: 0 }}
      >
        Drill →
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [drillStats, setDrillStats] = useState<Record<string, { correct: number; total: number }>>({});
  const [flashcardStats, setFlashcardStats] = useState<{ known: number; total: number }>({ known: 0, total: 214 });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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

  // Aggregate type breakdown across all sessions that have it
  const aggregateTypeMap: Record<string, { correct: number; total: number }> = {};
  for (const s of sessions) {
    for (const t of s.typeBreakdowns ?? []) {
      if (!aggregateTypeMap[t.type]) aggregateTypeMap[t.type] = { correct: 0, total: 0 };
      aggregateTypeMap[t.type].correct += t.correct;
      aggregateTypeMap[t.type].total += t.total;
    }
  }
  const aggregateTypes: TypeBreakdown[] = Object.entries(aggregateTypeMap)
    .map(([type, { correct, total }]) => ({ type, correct, total }))
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total));

  const hasData = sessions.length > 0 || Object.keys(drillStats).length > 0;
  const reversedSessions = sessions.slice().reverse();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "48px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 36, marginBottom: 6 }}>Dashboard</h1>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)" }}>Your practice history and performance trends</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/test" style={{ padding: "10px 20px", background: "var(--color-accent)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              New Test
            </Link>
            <Link href="/study" style={{ padding: "10px 20px", background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Study
            </Link>
          </div>
        </div>

        {!hasData ? (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--color-border)", padding: "64px 40px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 400, marginBottom: 10 }}>No practice data yet</h2>
            <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              Complete a test or drill session to see your score trends, accuracy by question type, and study recommendations.
            </p>
            <Link href="/test" style={{ display: "inline-block", padding: "12px 28px", background: "var(--color-accent)", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              Take your first test
            </Link>
          </div>
        ) : (
          <>
            {/* Score stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Latest Score", value: latestScore },
                { label: "Average Score", value: avgScore },
                { label: "Best Score", value: bestScore },
                { label: "Tests Taken", value: sessions.length, plain: true },
              ].map(({ label, value, plain }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--color-border)", padding: "20px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 40, fontWeight: 400, color: (plain || !value) ? "var(--color-text-primary)" : getScoreColor(value as number), lineHeight: 1 }}>
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Score trend */}
            {recentScores.length >= 2 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--color-border)", padding: "24px 28px", marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Score Trend</h2>
                <SparkLine scores={recentScores} width={Math.min(880, recentScores.length * 80)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Oldest</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Most recent</span>
                </div>
              </div>
            )}

            {/* Aggregate type performance */}
            {aggregateTypes.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--color-border)", padding: "24px 28px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Performance by Question Type</h2>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>across all {sessions.filter(s => s.typeBreakdowns).length} scored tests</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {aggregateTypes.map((t) => <TypeBarRow key={t.type} {...t} />)}
                </div>
              </div>
            )}

            {/* Sessions list */}
            {sessions.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden" }}>
                <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid var(--color-border)" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Test Sessions</h2>
                </div>
                {reversedSessions.map((s, i) => {
                  const isExpanded = expandedIdx === i;
                  const sorted = (s.typeBreakdowns ?? []).slice().sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
                  const weakest = sorted.slice(0, 5);

                  return (
                    <div key={i} style={{ borderBottom: i < reversedSessions.length - 1 ? "1px solid var(--color-surface)" : "none" }}>
                      {/* Row */}
                      <button
                        onClick={() => setExpandedIdx(isExpanded ? null : i)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 0,
                          padding: "14px 28px",
                          background: isExpanded ? "var(--color-accent-light)" : "#fff",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "var(--font-sans)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; }}
                        onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                      >
                        <span style={{ flex: "0 0 130px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                          {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span style={{ flex: "0 0 120px", fontSize: 13, textTransform: "capitalize", color: "var(--color-text-secondary)" }}>
                          {s.mode.replace(/_/g, " ")}
                        </span>
                        <span style={{ flex: "0 0 80px", fontSize: 18, fontWeight: 700, color: getScoreColor(s.scaledScore) }}>
                          {s.scaledScore}
                        </span>
                        <span style={{ flex: "0 0 80px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                          {s.accuracy}%
                        </span>
                        <span style={{ flex: "0 0 100px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                          {s.rawCorrect}/{s.rawTotal} correct
                        </span>

                        {/* Result dots */}
                        {s.questionResults && (
                          <div style={{ flex: 1, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", maxWidth: 200 }}>
                            {s.questionResults.map((q, qi) => (
                              <div
                                key={qi}
                                style={{
                                  width: 8, height: 8, borderRadius: "50%",
                                  background: !q.answered ? "var(--color-border)" : q.correct ? "var(--color-correct)" : "var(--color-incorrect)",
                                  flexShrink: 0,
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <span style={{ marginLeft: "auto", fontSize: 14, color: isExpanded ? "var(--color-accent)" : "var(--color-text-muted)", fontWeight: 600 }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ padding: "0 28px 24px", background: "var(--color-accent-light)", borderTop: "1px solid rgba(27,79,216,0.1)" }}>
                          {sorted.length > 0 ? (
                            <>
                              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", margin: "20px 0 14px" }}>
                                Question Type Breakdown
                              </p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#fff", borderRadius: 10, padding: "16px 20px", border: "1px solid var(--color-border)" }}>
                                {sorted.map((t) => <TypeBarRow key={t.type} {...t} />)}
                              </div>
                              {weakest.length > 0 && (
                                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", alignSelf: "center" }}>Drill weakest:</span>
                                  {weakest.map((t) => (
                                    <Link
                                      key={t.type}
                                      href={`/study/drills?type=${encodeURIComponent(t.type)}`}
                                      style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent)", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 6, padding: "4px 10px", textDecoration: "none" }}
                                    >
                                      {TYPE_LABELS[t.type] ?? t.type} ({Math.round((t.correct / t.total) * 100)}%)
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <p style={{ fontSize: 13, color: "var(--color-text-muted)", paddingTop: 16 }}>
                              No breakdown available for this session — retake a test to see per-type analysis.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
