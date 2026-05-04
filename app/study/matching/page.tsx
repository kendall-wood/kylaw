"use client";
import { useState, useEffect, useRef } from "react";
import { Shuffle, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

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

type Phase = "landing" | "playing" | "done";

export default function MatchingPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [terms, setTerms] = useState<Pair[]>([]);
  const [defs, setDefs] = useState<Pair[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ term: string; def: string } | null>(null);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initGame = () => {
    const subset = shuffle(PAIRS).slice(0, 8);
    setTerms(shuffle(subset));
    setDefs(shuffle(subset));
    setSelectedTerm(null);
    setSelectedDef(null);
    setMatched(new Set());
    setWrong(null);
    setErrors(0);
    setElapsed(0);
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)),
      1000
    );
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!selectedTerm || !selectedDef) return;
    if (selectedTerm === selectedDef) {
      const next = new Set([...matched, selectedTerm]);
      setMatched(next);
      setSelectedTerm(null);
      setSelectedDef(null);
      if (next.size === terms.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase("done");
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

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  /* ── Landing ─────────────────────────────────────── */
  if (phase === "landing") {
    return (
      <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>
        <section style={{ padding: "48px 56px 44px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
            Study · Matching
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 38, lineHeight: 1.1, marginBottom: 10, color: "var(--color-text-primary)" }}>
            Matching
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 500 }}>
            Match 8 LR question types to their definitions as fast as you can. A quick way to make type identification automatic.
          </p>
        </section>

        <div style={{ padding: "40px 56px", maxWidth: 680 }}>
          {/* Rules */}
          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14, padding: "28px 32px", marginBottom: 16, boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 20, color: "var(--color-text-primary)" }}>How it works</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { Icon: Shuffle, text: "8 pairs are randomly drawn from the 12 LR question types each round." },
                { Icon: CheckCircle2, text: "Click a term on the left, then its matching definition on the right." },
                { Icon: AlertCircle, text: "Wrong matches flash red — no penalty beyond the error count. Keep going." },
                { Icon: Clock, text: "The timer runs until all 8 pairs are matched. Beat your best time." },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--color-accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon size={14} color="var(--color-accent)" strokeWidth={1.8} />
                  </div>
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { initGame(); setPhase("playing"); }}
            style={{
              width: "100%", padding: "14px", borderRadius: 10,
              background: "var(--color-accent)", color: "#fff", border: "none",
              fontWeight: 600, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background var(--t), box-shadow var(--t)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-blue)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <Shuffle size={16} strokeWidth={2} />
            Start Matching
          </button>
        </div>
      </div>
    );
  }

  /* ── Done ────────────────────────────────────────── */
  if (phase === "done") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--color-border)", padding: "48px 44px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "var(--shadow-md)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-correct-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={26} color="var(--color-correct)" strokeWidth={1.6} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 28, marginBottom: 24 }}>All matched!</h2>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 32 }}>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 400, color: "var(--color-accent)", lineHeight: 1 }}>
                {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>time</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 400, color: errors === 0 ? "var(--color-correct)" : "var(--color-incorrect)", lineHeight: 1 }}>
                {errors}
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>errors</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => { initGame(); setPhase("playing"); }}
              style={{ padding: "12px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-accent)"; }}
            >
              Play again
            </button>
            <button
              onClick={() => setPhase("landing")}
              style={{ padding: "12px", background: "#fff", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
            >
              Back to Study
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Playing ─────────────────────────────────────── */
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

  const cellStyle = (state: string): React.CSSProperties => ({
    padding: "13px 16px",
    borderRadius: 10,
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
    fontSize: 14,
    fontWeight: state === "selected" || state === "matched" ? 600 : 400,
    color:
      state === "matched" ? "var(--color-correct)" :
      state === "wrong" ? "var(--color-incorrect)" :
      state === "selected" ? "var(--color-accent)" :
      "var(--color-text-primary)",
    fontFamily: "var(--font-sans)",
    lineHeight: 1.4,
    textAlign: "left",
    width: "100%",
    boxShadow: state === "idle" ? "var(--shadow-xs)" : "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-sans)" }}>
      {/* Header bar */}
      <div style={{ borderBottom: "1px solid var(--color-border)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <div>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--color-text-primary)" }}>Matching</span>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 10 }}>
            {matched.size}/{terms.length} matched
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "0.04em" }}>
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </span>
          {errors > 0 && (
            <span style={{ fontSize: 13, color: "var(--color-incorrect)", fontWeight: 600 }}>
              {errors} error{errors !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Terms */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Question Types
            </p>
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

          {/* Definitions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Definitions
            </p>
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
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--color-accent)", fontWeight: 600 }}>
            "{terms.find((t) => t.id === selectedTerm)?.term}" selected — now click its definition
          </p>
        )}
      </div>
    </div>
  );
}
