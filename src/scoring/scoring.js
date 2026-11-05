/**
 * Scoring engine
 */
import { DEMO_QUESTIONS, DEMO_EXAM } from '../storage/seed.js';

/**
 * Calculate score from answers map
 * @param {Record<string, string>} answers - { questionId: selectedKey }
 */
export function calculateScore(answers) {
  let correct = 0;
  let wrong = 0;
  let empty = 0;
  const details = [];

  for (const q of DEMO_QUESTIONS) {
    const selected = answers[q.id];
    let status = 'empty';

    if (!selected) {
      empty += 1;
      status = 'empty';
    } else if (selected === q.correct) {
      correct += 1;
      status = 'correct';
    } else {
      wrong += 1;
      status = 'wrong';
    }

    details.push({
      number: q.number,
      questionId: q.id,
      selected: selected || null,
      correct: q.correct,
      status
    });
  }

  const score = Math.round((correct / DEMO_EXAM.totalQuestions) * DEMO_EXAM.maxScore);

  return {
    score,
    correct,
    wrong,
    empty,
    total: DEMO_EXAM.totalQuestions,
    details
  };
}
