/**
 * Exam session manager
 */
import { put, get, getAll, STORES } from '../storage/db.js';
import { DEMO_QUESTIONS, DEMO_EXAM } from '../storage/seed.js';
import { calculateScore } from '../scoring/scoring.js';

export function createSession(participant) {
  const session = {
    id: `sess-${Date.now()}`,
    nisn: participant.nisn,
    name: participant.name,
    examId: DEMO_EXAM.id,
    startedAt: Date.now(),
    deadline: Date.now() + DEMO_EXAM.durationMinutes * 60 * 1000,
    currentIndex: 0,
    answers: {},      // questionId -> selected key
    flags: {},        // questionId -> true
    status: 'active', // active | finished
    finishedAt: null
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
  sessionStorage.setItem('cbt_exam_session', JSON.stringify(session));
}

export function getQuestions() {
  return DEMO_QUESTIONS;
}

export function setAnswer(session, questionId, key) {
  session.answers[questionId] = key;
  saveSession(session);
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

  const result = calculateScore(session.answers);
  const resultRecord = {
    id: `res-${session.id}`,
    sessionId: session.id,
    nisn: session.nisn,
    name: session.name,
    examId: session.examId,
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    empty: result.empty,
    details: result.details,
    finishedAt: session.finishedAt
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
