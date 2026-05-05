"use client";
import { useEffect, useState } from "react";
import flashcardsData from "@/lib/data/flashcards.json";

interface Card {
  id: string;
  front: string;
  back: string;
  tip?: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}

const DECK_COLORS: Record<string, string> = {
  lr_question_types: "#1B4FD8",
  rc_question_types: "#059669",
  logical_fallacies: "#D97706",
  lsat_vocab: "#7C3AED",
};

export default function FlashcardsPage() {
  const decks: Deck[] = (flashcardsData as any).decks;
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const cards = activeDeck?.cards ?? [];
  const card = cards[cardIndex];
  const progress = cards.length > 0 ? Math.round(((known.size + review.size) / cards.length) * 100) : 0;

  useEffect(() => {
    setFlipped(false);
  }, [cardIndex, activeDeckId]);

  const saveFlashcardStats = (knownSet: Set<string>, totalCards: number) => {
    try {
      localStorage.setItem("kylaw_flashcard_stats", JSON.stringify({ known: knownSet.size, total: totalCards }));
    } catch {}
  };

  const handleGotIt = () => {
    const next = new Set([...known, card.id]);
    setKnown(next);
    saveFlashcardStats(next, cards.length);
    advance();
  };

  const handleReviewAgain = () => {
    setReview((prev) => new Set([...prev, card.id]));
    advance();
  };

  const advance = () => {
    if (cardIndex < cards.length - 1) {
      setCardIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  };

  const startDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setCardIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setReview(new Set());
    setDone(false);
  };

  const restartReview = () => {
    const reviewCards = cards.filter((c) => review.has(c.id));
    if (reviewCards.length === 0) return;
    setKnown(new Set());
    setReview(new Set());
    setCardIndex(0);
    setDone(false);
  };

  const accentColor = activeDeckId ? DECK_COLORS[activeDeckId] ?? "#1B4FD8" : "#1B4FD8";

  // Done screen
  if (done && activeDeck) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--color-border)", padding: "48px 40px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontSize: "28px", fontWeight: "400", marginBottom: "8px" }}>Deck complete!</h2>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "32px" }}>
            <strong style={{ color: "var(--color-correct)" }}>{known.size} got it</strong> &nbsp;·&nbsp;
            <strong style={{ color: "var(--color-timer-warning)" }}>{review.size} to review</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {review.size > 0 && (
              <button
                onClick={restartReview}
                style={{ padding: "13px", background: accentColor, color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-sans)" }}
              >
                Review {review.size} missed cards
              </button>
            )}
            <button
              onClick={() => startDeck(activeDeckId!)}
              style={{ padding: "13px", background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              Restart deck
            </button>
            <button
              onClick={() => setActiveDeckId(null)}
              style={{ padding: "13px", background: "none", color: "var(--color-text-muted)", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              ← All decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active deck
  if (activeDeck && card) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <button
              onClick={() => setActiveDeckId(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--color-accent)", fontWeight: "600", fontFamily: "var(--font-sans)" }}
            >
              ← Decks
            </button>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              {cardIndex + 1} / {cards.length}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: "6px", background: "var(--color-border)", borderRadius: "3px", overflow: "hidden", marginBottom: "32px" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: accentColor, borderRadius: "3px", transition: "width 0.3s ease" }} />
          </div>

          {/* Card */}
          <div
            className="card-flip-container"
            style={{ width: "100%", height: "260px", cursor: "pointer", marginBottom: "24px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`card-inner${flipped ? " flipped" : ""}`}>
              {/* Front */}
              <div className="card-front" style={{
                background: "#fff",
                borderRadius: "16px",
                border: `2px solid ${accentColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: "700", color: accentColor, marginBottom: "16px" }}>
                  {activeDeck.title}
                </p>
                <p style={{ fontFamily: "var(--font-serif-display)", fontSize: "22px", fontWeight: "400", color: "var(--color-text-primary)", lineHeight: "1.35" }}>
                  {card.front}
                </p>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "20px" }}>tap to flip</p>
              </div>

              {/* Back */}
              <div className="card-back" style={{
                background: accentColor,
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: "1.6", marginBottom: card.tip ? "20px" : "0" }}>
                  {card.back}
                </p>
                {card.tip && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.25)", paddingTop: "16px", marginTop: "4px" }}>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                      💡 {card.tip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions — only show after flip */}
          {flipped ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={handleReviewAgain}
                style={{
                  padding: "14px",
                  background: "#fff",
                  color: "var(--color-timer-warning)",
                  border: "2px solid var(--color-timer-warning)",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Review Again
              </button>
              <button
                onClick={handleGotIt}
                style={{
                  padding: "14px",
                  background: "var(--color-correct)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Got It ✓
              </button>
            </div>
          ) : (
            <div style={{ height: "52px" }} />
          )}

          {/* Mini stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "28px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-correct)", fontWeight: "600" }}>✓ {known.size} known</span>
            <span style={{ fontSize: "13px", color: "var(--color-timer-warning)", fontWeight: "600" }}>↺ {review.size} to review</span>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{cards.length - known.size - review.size} remaining</span>
          </div>
        </div>
      </div>
    );
  }

  // Deck picker
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", fontFamily: "var(--font-sans)", padding: "64px 24px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: "700", color: "var(--color-accent)", marginBottom: "8px" }}>
            Flashcards
          </p>
          <h1 style={{ fontFamily: "var(--font-serif-display)", fontSize: "36px", fontWeight: "400", marginBottom: "10px" }}>
            Choose a deck
          </h1>
          <p style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>Tap a card to flip it. Mark what you know and what needs review.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {decks.map((deck) => {
            const color = DECK_COLORS[deck.id] ?? "#1B4FD8";
            return (
              <button
                key={deck.id}
                onClick={() => startDeck(deck.id)}
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-primary)" }}>{deck.title}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginLeft: "20px" }}>{deck.description}</p>
                </div>
                <span style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color,
                  background: `${color}18`,
                  padding: "4px 12px",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  marginLeft: "16px",
                }}>
                  {deck.cards.length} cards
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
