"use client";
import { useState, useEffect, useRef } from "react";

interface Pair {
  id: string;
  term: string;
  definition: string;
}

const PAIRS: Pair[] = [
  { id: "flaw", term: "Flaw", definition: "Identify the error in reasoning that undermines the argument" },
  { id: "mbt", term: "Must Be True", definition: "Select what must follow given that all premises are true" },
  { id: "strengthen", term: "Strengthen", definition: "Find the answer that most supports the conclusion" },
  { id: "weaken", term: "Weaken", definition: "Find the answer that most undermines the conclusion" },
  { id: "na", term: "Necessary Assumption", definition: "Find the premise the argument requires to hold — fails negation test if absent" },
  { id: "sa", term: "Sufficient Assumption", definition: "Find the premise that, if true, guarantees the conclusion follows" },
  { id: "mc", term: "Main Conclusion", definition: "Identify the claim all other statements are designed to support" },
  { id: "mor", term: "Method of Reasoning", definition: "Describe how the argument makes its case" },
  { id: "principle", term: "Principle", definition: "Apply or identify a general rule that justifies the argument" },
  { id: "rp", term: "Resolve Paradox", definition: "Explain how two apparently contradictory facts can both be true" },
  { id: "pr", term: "Parallel Reasoning", definition: "Find an argument with the same logical structure as the original" },
  { id: "pai", term: "Point at Issue", definition: "Identify the specific claim two speakers directly disagree about" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingPage() {
  const [terms, setTerms] = useState<Pair[]>([]);
  const [defs, setDefs] = useState<Pair[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ term: string; def: string } | null>(null);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const subset = shuffle(PAIRS).slice(0, 8);
    setTerms(shuffle(subset));
    setDefs(shuffle(subset));
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime]);

  useEffect(() => {
    if (!selectedTerm || !selectedDef) return;

    if (selectedTerm === selectedDef) {
      const next = new Set([...matched, selectedTerm]);
      setMatched(next);
      setSelectedTerm(null);
      setSelectedDef(null);
      if (next.size === terms.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDone(true);
      }
    } else {
      setWrong({ term: selectedTerm, def: selectedDef });
      setErrors((e) => e + 1);
      setTimeout(() => {
        setWrong(null);
        setSelectedTerm(null);
        setSelectedDef(null);
      }, 800);
    }
  }, [selectedTerm, selectedDef, matched, terms.length]);

  const restart = () => {
    const subset = shuffle(PAIRS).slice(0, 8);
    setTerms(shuffle(subset));
    setDefs(shuffle(subset));
    setSelectedTerm(null);
    setSelectedDef(null);
    setMatched(new Set());
    setWrong(null);
    setErrors(0);
    setElapsed(0);
    setDone(false);
  };

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  const termState = (id: string) => {
    if (matched.has(id)) return "matched";
    if (wrong?.term === id) return "wrong";
    if (selectedTerm === id) return "selected";
    return "idle";
  };

  const defState = (id: string) => {
    if (matched.has(id)) return "matched";
    if (wrong?.def === id) return "wrong";
    if (selectedDef === id) return "selected";
    return "idle";
  };

  const cellStyle = (state: string) => ({
    padding: "14px 18px",
    borderRadius: "10px",
    border: `1.5px solid ${
      state === "matched" ? "var(--color-correct)" :
      state === "wrong" ? "var(--color-incorrect)" :
      state === "selected" ? "var(--color-accent)" :
      "var(--color-border)"
    }`,
    background:
      state === "matched" ? "var(--color-correct-bg)" :
      state === "wrong" ? "var(--color-incorrect-bg)" :
      state === "selected" ? "var(--color-accent-light)" :
      "#fff",
    cursor: state === "matched" ? "default" : "pointer",
    transition: "all 0.12s",
    fontSize: "14px",
    fontWeight: state === "selected" || state === "matched" ? "600" : "400",
    color:
      state === "matched" ? "var(--color-correct)" :
      state === "wrong" ? "var(--color-incorrect)" :
      state === "selected" ? "var(--color-accent)" :
      "var(--color-text-primary)",
    fontFamily: "var(--font-sans)",
    lineHeight: "1.4",
    textAlign: "left" as const,
    width: "100%",
  });

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "48px 40px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏁</div>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "28px", fontWeight: "700", marginBottom: "16px" }}>All matched!</h2>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "32px" }}>
            <div>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-accent)" }}>{mm}:{String(ss).padStart(2,"0")}</p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>time</p>
            </div>
            <div>
              <p style={{ fontSize: "28px", fontWeight: "700", color: errors === 0 ? "var(--color-correct)" : "var(--color-incorrect)" }}>{errors}</p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>errors</p>
            </div>
          </div>
          <button
            onClick={restart}
            style={{ padding: "13px 32px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-sans)" }}
          >
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "28px", fontWeight: "700", marginBottom: "4px" }}>Matching</h1>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Match each question type to its definition</p>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: "700" }}>
              {String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}
            </span>
            <span style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {matched.size}/{terms.length} matched · {errors} errors
            </span>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700", color: "var(--color-text-muted)", marginBottom: "4px" }}>Question Types</p>
            {terms.map((t) => (
              <button
                key={t.id}
                onClick={() => !matched.has(t.id) && setSelectedTerm(t.id)}
                style={cellStyle(termState(t.id))}
              >
                {t.term}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "700", color: "var(--color-text-muted)", marginBottom: "4px" }}>Definitions</p>
            {defs.map((d) => (
              <button
                key={d.id}
                onClick={() => !matched.has(d.id) && setSelectedDef(d.id)}
                style={cellStyle(defState(d.id))}
              >
                {d.definition}
              </button>
            ))}
          </div>
        </div>

        {selectedTerm && (
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--color-accent)", fontWeight: "600" }}>
            "{terms.find(t => t.id === selectedTerm)?.term}" selected — now click its definition
          </p>
        )}
      </div>
    </div>
  );
}
