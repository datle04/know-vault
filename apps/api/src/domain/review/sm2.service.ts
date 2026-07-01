/**
 * SM-2 spaced repetition algorithm (SuperMemo 2, Woźniak 1987).
 *
 * Pure function: no Date, no IO, no mutation. Given the current review state
 * and the quality of the latest recall, it returns the next review state.
 * Turning `interval` (days) into a concrete `nextReviewAt` timestamp is the
 * caller's job — the domain layer stays free of time and IO concerns.
 */

/** Minimum easiness factor. Stops hard items from stalling at tiny intervals. */
const MIN_EASINESS_FACTOR = 1.3;

/** A recall with quality >= this threshold counts as successful. */
const PASS_QUALITY_THRESHOLD = 3;

export interface SM2Input {
  // Quality of the recall, integer 0-5 (0 = blackout, 5 = perfect)
  quality: number;
  // Current easiness factor(>= 1.3)
  easinessFactor: number;
  // Current interval indays(>= 1)
  interval: number;
  // Consecutive successful recalls so far.
  repetitions: number;
}

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
}

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easinessFactor, interval, repetitions } = input;

  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new RangeError(
      `SM-2 quality must be an integer in [0, 5], received ${quality}`,
    );
  }

  let nextInterval: number;
  let nextRepetitions: number;

  if (quality >= PASS_QUALITY_THRESHOLD) {
    // Successful recal: grow the interval.
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      // Uses the OLD easiness factor - before the update below.
      nextInterval = Math.round(interval * easinessFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    // Failed recall: restart the schedule from scratch
    nextInterval = 1;
    nextRepetitions = 0;
  }

  // Easiness factor is recomputed on every review, even on failure.
  const updatedEasiness =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const nextEasinessFactor = Math.max(MIN_EASINESS_FACTOR, updatedEasiness);

  return {
    easinessFactor: nextEasinessFactor,
    interval: nextInterval,
    repetitions: nextRepetitions,
  };
}
