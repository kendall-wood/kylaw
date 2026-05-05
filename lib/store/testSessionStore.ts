"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SessionMode = "full_test" | "section" | "question_bank";
export type SessionStatus = "idle" | "active" | "break" | "review" | "complete";

export interface Annotation {
  start: number;
  end: number;
  type: "yellow" | "pink" | "blue" | "underline";
}

export interface Question {
  id: string;
  section_type: "LR" | "RC";
  question_type: string;
  difficulty: "easy" | "medium" | "hard";
  stimulus: string;
  question_stem: string;
  choices: { A: string; B: string; C: string; D: string; E: string };
  correct_answer: "A" | "B" | "C" | "D" | "E";
  explanation: { correct: string; A: string; B: string; C?: string; D?: string; E?: string };
  tags?: string[];
  passage_id?: string;
  passage_title?: string;
  passage_number?: number;
}

export interface Section {
  id: string;
  type: "LR" | "RC" | "experimental";
  questions: Question[];
  scored: boolean;
}

export type FontSize = "default" | "large" | "xlarge";
export type LineSpacing = "normal" | "wide";

interface TestSessionState {
  mode: SessionMode | null;
  sections: Section[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  eliminations: Record<string, string[]>;
  flags: Record<string, boolean>;
  annotations: Record<string, Annotation[]>;
  timeRemaining: number;
  timerRunning: boolean;        // not persisted — restarted on mount
  sessionStartedAt: Date | null; // not persisted
  status: SessionStatus;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  highContrast: boolean;
  studyMode: boolean;
  breakStartedAt: number | null; // unix ms — lets break timer resume after refresh

  startSession: (mode: SessionMode, sections: Section[], studyMode?: boolean) => void;
  selectAnswer: (questionId: string, choice: string) => void;
  toggleElimination: (questionId: string, choice: string) => void;
  toggleFlag: (questionId: string) => void;
  addAnnotation: (questionId: string, annotation: Annotation) => void;
  clearAnnotation: (questionId: string, start: number, end: number) => void;
  navigateToQuestion: (index: number) => void;
  navigateToSection: (sectionIndex: number, questionIndex?: number) => void;
  submitSection: () => void;
  tickTimer: () => void;
  startBreak: () => void;
  endBreak: () => void;
  completeTest: () => void;
  setFontSize: (size: FontSize) => void;
  cycleFontSize: () => void;
  cycleLineSpacing: () => void;
  toggleHighContrast: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetSession: () => void;
}

const FONT_CYCLE: FontSize[] = ["default", "large", "xlarge"];
const SPACING_CYCLE: LineSpacing[] = ["normal", "wide"];

export const useTestSessionStore = create<TestSessionState>()(
  persist(
    (set, get) => ({
      mode: null,
      sections: [],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      eliminations: {},
      flags: {},
      annotations: {},
      timeRemaining: 35 * 60,
      timerRunning: false,
      sessionStartedAt: null,
      status: "idle",
      fontSize: "default",
      lineSpacing: "normal",
      highContrast: false,
      studyMode: false,
      breakStartedAt: null,

      startSession: (mode, sections, studyMode = false) =>
        set({
          mode,
          sections,
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          answers: {},
          eliminations: {},
          flags: {},
          annotations: {},
          timeRemaining: 35 * 60,
          timerRunning: mode !== "question_bank",
          sessionStartedAt: new Date(),
          status: "active",
          studyMode,
          breakStartedAt: null,
        }),

      selectAnswer: (questionId, choice) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: choice } })),

      toggleElimination: (questionId, choice) =>
        set((s) => {
          const current = s.eliminations[questionId] ?? [];
          const next = current.includes(choice)
            ? current.filter((c) => c !== choice)
            : [...current, choice];
          return { eliminations: { ...s.eliminations, [questionId]: next } };
        }),

      toggleFlag: (questionId) =>
        set((s) => ({ flags: { ...s.flags, [questionId]: !s.flags[questionId] } })),

      addAnnotation: (questionId, annotation) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [questionId]: [...(s.annotations[questionId] ?? []), annotation],
          },
        })),

      clearAnnotation: (questionId, start, end) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [questionId]: (s.annotations[questionId] ?? []).filter(
              (a) => !(a.start === start && a.end === end)
            ),
          },
        })),

      navigateToQuestion: (index) => set({ currentQuestionIndex: index }),

      navigateToSection: (sectionIndex, questionIndex = 0) =>
        set({
          currentSectionIndex: sectionIndex,
          currentQuestionIndex: questionIndex,
          timeRemaining: 35 * 60,
          timerRunning: true,
        }),

      submitSection: () => {
        const { currentSectionIndex, sections, mode } = get();
        const isLastSection = currentSectionIndex >= sections.length - 1;

        if (isLastSection) {
          set({ status: "complete", timerRunning: false });
          return;
        }

        const nextIndex = currentSectionIndex + 1;
        const isBreak = currentSectionIndex === 1;

        if (isBreak && mode === "full_test") {
          set({ status: "break", timerRunning: false, breakStartedAt: Date.now() });
        } else {
          set({
            currentSectionIndex: nextIndex,
            currentQuestionIndex: 0,
            timeRemaining: 35 * 60,
            timerRunning: true,
            status: "active",
          });
        }
      },

      tickTimer: () =>
        set((s) => {
          if (!s.timerRunning) return s;
          const next = s.timeRemaining - 1;
          if (next <= 0) {
            const { currentSectionIndex, sections } = s;
            const isLast = currentSectionIndex >= sections.length - 1;
            if (isLast) return { timeRemaining: 0, timerRunning: false, status: "complete" };
            const nextIndex = currentSectionIndex + 1;
            const isBreak = currentSectionIndex === 1;
            if (isBreak) return { timeRemaining: 0, timerRunning: false, status: "break", breakStartedAt: Date.now() };
            return {
              timeRemaining: 35 * 60,
              timerRunning: true,
              currentSectionIndex: nextIndex,
              currentQuestionIndex: 0,
              status: "active",
            };
          }
          return { timeRemaining: next };
        }),

      startBreak: () => set({ status: "break", timerRunning: false, breakStartedAt: Date.now() }),

      endBreak: () => {
        const { currentSectionIndex } = get();
        set({
          status: "active",
          currentSectionIndex: currentSectionIndex + 1,
          currentQuestionIndex: 0,
          timeRemaining: 35 * 60,
          timerRunning: true,
          breakStartedAt: null,
        });
      },

      completeTest: () => set({ status: "complete", timerRunning: false }),

      setFontSize: (size) => set({ fontSize: size }),

      cycleFontSize: () =>
        set((s) => {
          const idx = FONT_CYCLE.indexOf(s.fontSize);
          return { fontSize: FONT_CYCLE[(idx + 1) % FONT_CYCLE.length] };
        }),

      cycleLineSpacing: () =>
        set((s) => {
          const idx = SPACING_CYCLE.indexOf(s.lineSpacing);
          return { lineSpacing: SPACING_CYCLE[(idx + 1) % SPACING_CYCLE.length] };
        }),

      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),

      pauseTimer: () => set({ timerRunning: false }),

      resumeTimer: () => set({ timerRunning: true }),

      resetSession: () =>
        set({
          mode: null,
          sections: [],
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
          answers: {},
          eliminations: {},
          flags: {},
          annotations: {},
          timeRemaining: 35 * 60,
          timerRunning: false,
          sessionStartedAt: null,
          status: "idle",
          breakStartedAt: null,
        }),
    }),
    {
      name: "kylaw-session-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        mode: state.mode,
        sections: state.sections,
        currentSectionIndex: state.currentSectionIndex,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        eliminations: state.eliminations,
        flags: state.flags,
        annotations: state.annotations,
        timeRemaining: state.timeRemaining,
        status: state.status,
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
        highContrast: state.highContrast,
        studyMode: state.studyMode,
        breakStartedAt: state.breakStartedAt,
      }),
    }
  )
);
