/**
 * Scoring engine — works with any question set
 */
export function calculateScore(answers, questions) {
  let correct = 0;
  let wrong = 0;
  let empty = 0;
  const details = [];
  const total = questions.length || 1;

  for (const q of questions) {
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

  const score = Math.round((correct / total) * 100);

  return {
    score,
    correct,
    wrong,
    empty,
    total,
    details
  };
}
