/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality scale:
 *   0 – complete blackout / wrong answer
 *   1 – incorrect, but answer remembered after seeing it
 *   2 – incorrect, seemed easy after seeing it
 *   3 – correct but with serious difficulty (Hard)
 *   4 – correct after a hesitation (Good)
 *   5 – perfect, instant recall (Easy)
 *
 * quality < 3 → failed, reset repetitions
 * quality >= 3 → passed, advance interval
 */

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * @param {object} progress - current word progress
 * @param {number} quality  - 0–5
 * @returns {{ easeFactor, interval, repetitions, nextReview }}
 */
exports.calculate = (progress, quality) => {
  let { easeFactor, interval, repetitions } = progress;

  if (quality < 3) {
    // Failed: reset to beginning
    return {
      easeFactor,          // ease factor unchanged on failure
      interval: 1,
      repetitions: 0,
      nextReview: addDays(new Date(), 1),
    };
  }

  // Passed: advance
  let newInterval;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  // Ease factor adjustment (SM-2 formula)
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: repetitions + 1,
    nextReview: addDays(new Date(), newInterval),
  };
};

/**
 * Convert user action to quality score.
 *
 * Flashcard ratings: 1=Again, 3=Hard, 4=Good, 5=Easy
 * Other modes:       correct=4, wrong=1
 */
exports.qualityFromAction = (action) => {
  const map = { again: 1, hard: 3, good: 4, easy: 5, correct: 4, wrong: 1 };
  return map[action] ?? 1;
};
