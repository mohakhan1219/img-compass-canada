export type QuestionBlock = {
  catalogId: string;
  attempted: number;
  correct: number;
  incorrect: number;
  omitted: number;
};

export type AccountingResult = {
  attempted: number;
  correct: number;
  incorrect: number;
  omitted: number;
  accuracy: number | null;
  valid: boolean;
  error?: string;
};

export function accountQuestions(blocks: QuestionBlock[]): AccountingResult {
  const attempted = blocks.reduce((s, b) => s + b.attempted, 0);
  const correct = blocks.reduce((s, b) => s + b.correct, 0);
  const incorrect = blocks.reduce((s, b) => s + b.incorrect, 0);
  const omitted = blocks.reduce((s, b) => s + b.omitted, 0);
  const parts = correct + incorrect + omitted;
  if (attempted < 0 || correct < 0 || incorrect < 0 || omitted < 0) {
    return { attempted, correct, incorrect, omitted, accuracy: null, valid: false, error: "Counts cannot be negative." };
  }
  if (parts !== attempted) {
    return {
      attempted,
      correct,
      incorrect,
      omitted,
      accuracy: null,
      valid: false,
      error: "Correct + incorrect + omitted must equal attempted.",
    };
  }
  const graded = correct + incorrect;
  const accuracy = graded === 0 ? null : Math.round((correct / graded) * 1000) / 10;
  return { attempted, correct, incorrect, omitted, accuracy, valid: true };
}

export function remainingUnused(catalogSize: number, used: number): number {
  return Math.max(0, catalogSize - used);
}
