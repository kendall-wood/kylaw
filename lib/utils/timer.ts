export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getTimerColor(seconds: number): string {
  if (seconds <= 60) return "var(--color-timer-critical)";
  if (seconds <= 300) return "var(--color-timer-warning)";
  return "var(--color-timer-normal)";
}
