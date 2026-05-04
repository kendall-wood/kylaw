"use client";
import { useMemo, useRef, useCallback } from "react";
import type { Annotation } from "@/lib/store/testSessionStore";

interface Props {
  text: string;
  annotations: Annotation[];
  onAnnotate?: (annotation: Annotation) => void;
  fontSize?: string;
  lineSpacing?: string;
}

export default function AnnotatedText({ text, annotations, onAnnotate, fontSize = "16px", lineSpacing = "1.6" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => {
    if (!annotations.length) return [{ text, types: [] as string[] }];

    // Build per-character annotation map
    const charMap: string[][] = Array.from({ length: text.length }, () => []);
    for (const a of annotations) {
      for (let i = a.start; i < Math.min(a.end, text.length); i++) {
        charMap[i].push(a.type);
      }
    }

    // Collapse into segments
    const segs: { text: string; types: string[] }[] = [];
    let i = 0;
    while (i < text.length) {
      const types = charMap[i];
      let j = i + 1;
      while (j < text.length && JSON.stringify(charMap[j]) === JSON.stringify(types)) j++;
      segs.push({ text: text.slice(i, j), types });
      i = j;
    }
    return segs;
  }, [text, annotations]);

  const handleMouseUp = useCallback(() => {
    if (!onAnnotate || !containerRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    // Calculate character offsets relative to the container text
    const preRange = range.cloneRange();
    preRange.selectNodeContents(containerRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + range.toString().length;

    if (start < end) {
      // This will be called by parent with the active annotation type
      onAnnotate({ start, end, type: "yellow" });
    }
    sel.removeAllRanges();
  }, [onAnnotate]);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily: "var(--font-serif)",
        fontSize,
        lineHeight: lineSpacing,
        color: "var(--color-text-primary)",
        userSelect: "text",
        cursor: "text",
      }}
    >
      {segments.map((seg, i) => {
        const classNames = seg.types
          .map((t) => {
            if (t === "yellow") return "annotation-yellow";
            if (t === "pink") return "annotation-pink";
            if (t === "blue") return "annotation-blue";
            if (t === "underline") return "annotation-underline";
            return "";
          })
          .join(" ");

        return (
          <span key={i} className={classNames}>
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}
