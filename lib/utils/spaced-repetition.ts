export interface SRRecord {
  question_type: string;
  ease_factor: number;
  next_review: string; // ISO date
  accuracy: number;
}

export function updateSRRecord(
  record: SRRecord,
  accuracy: number // 0.0 to 1.0
): SRRecord {
  const now = new Date();
  let daysUntilReview: number;
  let newEase = record.ease_factor;

  if (accuracy >= 0.9) {
    daysUntilReview = 7;
    newEase = Math.min(3.0, newEase + 0.1);
  } else if (accuracy >= 0.7) {
    daysUntilReview = 3;
  } else {
    daysUntilReview = 1;
    newEase = Math.max(1.3, newEase - 0.2);
  }

  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + daysUntilReview);

  return {
    ...record,
    ease_factor: newEase,
    next_review: nextReview.toISOString(),
    accuracy,
  };
}

export function isDueForReview(record: SRRecord): boolean {
  return new Date(record.next_review) <= new Date();
}
