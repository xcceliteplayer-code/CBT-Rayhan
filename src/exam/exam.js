/**
 * Exam session manager — multi subject
 */
import { put, STORES } from '../storage/db.js';
import { getExamById, getQuestionsForExam } from '../storage/seed.js';
import { calculateScore } from '../scoring/scoring.js';

export function createSession(participant, examId) {
  const exam = getExamById(examId);
  const session = {
    id: `sess-${Date.now()}`,
    nisn: participant.nisn,
    name: participant.name,
    examId: exam.id,
    subject: exam.subject,
    totalQuestions: exam.totalQuestions,
    durationMinutes: exam.durationMinutes,
    startedAt: Date.now(),
    deadline: Date.now() + exam.durationMinutes * 60 * 1000,
    currentIndex: 0,
    answers: {},
    flags: {},
    status: 'active',
    finishedAt: null,
    violations: []
  };

  sessionStorage.setItem('cbt_exam_session', JSON.stringify(session));
  return session;
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem('cbt_exam_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    sessionStorage.setItem('cbt_exam_session', JSON.stringify(session));
    return true;
  } catch (err) {
    console.error('[CBT] Gagal menyimpan sesi', err);
    return false;
  }
}

export function getQuestions(examId) {
  return getQuestionsForExam(examId);
}

export function setAnswer(session, questionId, key) {
  session.answers[questionId] = key;
  return saveSession(session);
}

export function toggleFlag(session, questionId) {
  if (session.flags[questionId]) {
    delete session.flags[questionId];
  } else {
    session.flags[questionId] = true;
  }
  saveSession(session);
}

export function countAnswered(session) {
  return Object.keys(session.answers).length;
}

export async function finishExam(session) {
  session.status = 'finished';
  session.finishedAt = Date.now();
  saveSession(session);

  const questions = getQuestionsForExam(session.examId);
  const result = calculateScore(session.answers, questions);
  const resultRecord = {
    id: `res-${session.id}`,
    sessionId: session.id,
    nisn: session.nisn,
    name: session.name,
    examId: session.examId,
    subject: session.subject,
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    empty: result.empty,
    details: result.details,
    finishedAt: session.finishedAt,
    violations: session.violations || []
  };

  try {
    await put(STORES.results, resultRecord);
    await put(STORES.sessions, session);
  } catch (e) {
    console.warn('Failed to persist result', e);
  }

  return resultRecord;
}

export function clearExamSession() {
  sessionStorage.removeItem('cbt_exam_session');
}
