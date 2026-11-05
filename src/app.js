/**
 * CBT Smart Exam · Demo Edition
 * Main application entry
 */
import { seedDatabase } from './storage/seed.js';
import { login, getSession, logout, requireAuth } from './auth/auth.js';
import {
  createSession,
  loadSession,
  saveSession,
  getQuestions,
  setAnswer,
  toggleFlag,
  countAnswered,
  finishExam,
  clearExamSession
} from './exam/exam.js';
import { ExamTimer } from './timer/timer.js';
import {
  enableProctoring,
  requestFullscreen,
  exitFullscreen,
  setProctorActive,
  setWarnCallback,
  getViolationCount
} from './proctor/proctor.js';
import { DEMO_EXAM } from './storage/seed.js';


// DOM helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showPage(id) {
  $$('.page').forEach((p) => p.classList.remove('active'));
  const page = $(`#${id}`);
  if (page) page.classList.add('active');
}

// State
let examSession = null;
let questions = [];
let currentIndex = 0;
let timer = null;

// ========== INIT ==========
async function init() {
  await seedDatabase();
  enableProctoring();
  setWarnCallback(onProctorWarning);

  const session = getSession();
  const examSess = loadSession();

  if (session && examSess && examSess.status === 'active') {
    // Resume exam
    examSession = examSess;
    questions = getQuestions();
    currentIndex = examSession.currentIndex || 0;
    startExamUI(true);
  } else if (session) {
    showConfirmPage(session);
  } else {
    showPage('page-login');
  }

  bindEvents();
}

// ========== PROCTOR WARNING ==========
function onProctorWarning({ message, count }) {
  // Simpan ke session
  if (examSession) {
    if (!examSession.violations) examSession.violations = [];
    examSession.violations.push({
      time: Date.now(),
      message,
      count
    });
    saveSession(examSession);
  }

  // > 3 pelanggaran → layar glitch / "hacked"
  if (count > 3) {
    showGlitchOverlay(count, message);
    return;
  }

  const overlay = $('#proctor-warning');
  const msgEl = $('#proctor-message');
  const countEl = $('#proctor-count');
  if (!overlay) return;

  if (msgEl) msgEl.textContent = message;
  if (countEl) countEl.textContent = String(count);
  overlay.hidden = false;
}

function showGlitchOverlay(count, message) {
  // Tutup warning biasa
  const warn = $('#proctor-warning');
  if (warn) warn.hidden = true;

  const overlay = $('#proctor-glitch');
  const countEl = $('#glitch-count');
  const codeEl = $('#glitch-code');
  if (!overlay) return;

  if (countEl) countEl.textContent = String(count);

  if (codeEl) {
    const ts = new Date().toISOString();
    codeEl.innerHTML =
      `ERR_PROCTOR_LOCK<br/>` +
      `VIOLATION_THRESHOLD_EXCEEDED<br/>` +
      `COUNT=${count} // ${ts}<br/>` +
      `FLAG: ${escapeHtml(message || 'UNKNOWN')}<br/>` +
      `SESSION_FLAGGED // AUDIT_LOG_WRITTEN`;
  }

  overlay.hidden = false;
  document.body.classList.add('glitch-active');

  // Shake ulang sesekali
  setTimeout(() => document.body.classList.remove('glitch-active'), 500);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function closeProctorWarning() {
  const overlay = $('#proctor-warning');
  if (overlay) overlay.hidden = true;
  requestFullscreen().catch(() => {});
}

function closeGlitchOverlay() {
  const overlay = $('#proctor-glitch');
  if (overlay) overlay.hidden = true;
  document.body.classList.remove('glitch-active');
  requestFullscreen().catch(() => {});
}

function setSaveStatus(state) {
  // state: 'saved' | 'saving' | 'error'
  const el = $('#save-status');
  const text = $('#save-status-text');
  if (!el || !text) return;
  el.classList.remove('saved', 'saving', 'error');
  el.classList.add(state);
  text.textContent =
    state === 'saving' ? 'Menyimpan…' :
    state === 'error' ? 'Gagal menyimpan' :
    'Tersimpan';
}

function updateNavSummary() {
  const el = $('#nav-summary');
  if (!el || !examSession || !questions.length) return;
  const answered = Object.keys(examSession.answers).length;
  const total = questions.length;
  const pending = total - answered;
  el.innerHTML = `<strong>${answered}</strong> terjawab · <strong>1</strong> aktif · <strong>${pending}</strong> belum`;
}


// ========== LOGIN ==========
function bindEvents() {
  $('#login-form')?.addEventListener('submit', onLogin);
  $('#agree-terms')?.addEventListener('change', (e) => {
    $('#btn-start-exam').disabled = !e.target.checked;
  });
  $('#btn-start-exam')?.addEventListener('click', onStartExam);
  $('#btn-logout')?.addEventListener('click', onLogout);
  $('#btn-prev')?.addEventListener('click', () => navigate(-1));
  $('#btn-next')?.addEventListener('click', () => navigate(1));
  $('#btn-flag')?.addEventListener('click', onToggleFlag);
  $('#btn-finish')?.addEventListener('click', onFinishClick);
  $('#btn-cancel-finish')?.addEventListener('click', () => closeModal('modal-finish'));
  $('#btn-confirm-finish')?.addEventListener('click', () => {
    closeModal('modal-finish');
    openModal('modal-finish-2');
  });
  $('#btn-cancel-finish-2')?.addEventListener('click', () => closeModal('modal-finish-2'));
  $('#btn-final-finish')?.addEventListener('click', onFinalFinish);
  $('#btn-fullscreen')?.addEventListener('click', () => requestFullscreen());
  $('#btn-back-home')?.addEventListener('click', onBackHome);
  $('#btn-proctor-ok')?.addEventListener('click', closeProctorWarning);
  $('#btn-glitch-ok')?.addEventListener('click', closeGlitchOverlay);
}


async function onLogin(e) {
  e.preventDefault();
  const nisn = $('#nisn').value.trim();
  const password = $('#password').value;
  const errorEl = $('#login-error');

  const result = await login(nisn, password);
  if (!result.ok) {
    errorEl.textContent = result.message;
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  showConfirmPage(result.participant);
}

function showConfirmPage(participant) {
  $('#conf-name').textContent = participant.name;
  $('#conf-nisn').textContent = participant.nisn;
  $('#participant-avatar').textContent = participant.avatar || 'PD';
  $('#conf-subject').textContent = DEMO_EXAM.subject;
  $('#conf-total').textContent = DEMO_EXAM.totalQuestions;
  $('#conf-duration').textContent = `${DEMO_EXAM.durationMinutes} menit`;
  $('#agree-terms').checked = false;
  $('#btn-start-exam').disabled = true;
  showPage('page-confirm');
}

function onLogout() {
  setProctorActive(false);
  closeProctorWarning();
  closeGlitchOverlay();
  logout();
  clearExamSession();
  if (timer) timer.stop();
  exitFullscreen();
  showPage('page-login');
  $('#login-form')?.reset();
  $('#login-error').hidden = true;
}


// ========== START EXAM ==========
function onStartExam() {
  const session = getSession();
  if (!session) return;

  examSession = createSession(session);
  questions = getQuestions();
  currentIndex = 0;
  startExamUI(false);
}

function startExamUI(isResume) {
  showPage('page-exam');
  $('#exam-participant-name').textContent = examSession.name;

  renderNav();
  renderQuestion();

  // Timer
  if (timer) timer.stop();
  timer = new ExamTimer({
    durationMinutes: DEMO_EXAM.durationMinutes,
    onTick: updateTimerDisplay,
    onExpire: onTimeUp
  });

  if (isResume && examSession.deadline) {
    timer.start(examSession.deadline);
  } else {
    timer.start();
    examSession.deadline = timer.getDeadline();
    saveSession(examSession);
  }

  // Aktifkan proctoring selama ujian
  setProctorActive(true);
  requestFullscreen().catch(() => {});
}


function updateTimerDisplay({ display, remainingMs }) {
  const el = $('#timer-display');
  const box = $('#timer-box');
  if (el) el.textContent = display;

  if (box) {
    box.classList.remove('warning', 'danger');
    if (remainingMs <= 5 * 60 * 1000) box.classList.add('danger');
    else if (remainingMs <= 15 * 60 * 1000) box.classList.add('warning');
  }
}

async function onTimeUp() {
  await doFinish();
}

// ========== QUESTION RENDER ==========
function renderNav() {
  const grid = $('#nav-grid');
  if (!grid) return;
  grid.innerHTML = '';

  questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item';
    btn.textContent = q.number;

    if (idx === currentIndex) btn.classList.add('active');
    if (examSession.answers[q.id]) btn.classList.add('answered');
    if (examSession.flags[q.id]) btn.classList.add('flagged');

    btn.addEventListener('click', () => {
      currentIndex = idx;
      examSession.currentIndex = idx;
      saveSession(examSession);
      renderNav();
      renderQuestion();
    });

    grid.appendChild(btn);
  });
  updateNavSummary();
}

function renderQuestion() {
  const q = questions[currentIndex];
  if (!q) return;

  $('#q-number').textContent = `Soal ${q.number} dari ${questions.length}`;
  $('#question-text').textContent = q.text;

  const list = $('#options-list');
  list.innerHTML = '';

  const selected = examSession.answers[q.id] || null;

  q.options.forEach((opt) => {
    const item = document.createElement('div');
    item.className = 'option-item' + (selected === opt.key ? ' selected' : '');
    item.innerHTML = `
      <span class="option-key">${opt.key}</span>
      <span class="option-text">${opt.text}</span>
    `;
    item.addEventListener('click', () => {
      setSaveStatus('saving');
      setAnswer(examSession, q.id, opt.key);
      setTimeout(() => setSaveStatus('saved'), 200);
      renderNav();
      renderQuestion();
      updateNavSummary();
    });
    list.appendChild(item);
  });

  // Flag button
  const flagged = !!examSession.flags[q.id];
  const flagBtn = $('#btn-flag');
  flagBtn.classList.toggle('active', flagged);
  $('#flag-text').textContent = flagged ? 'Hapus ragu' : 'Tandai ragu';

  // Nav buttons
  $('#btn-prev').disabled = currentIndex === 0;
  $('#btn-next').textContent = currentIndex === questions.length - 1 ? 'Selesai →' : 'Selanjutnya →';
}

function navigate(delta) {
  const next = currentIndex + delta;
  if (next < 0) return;

  if (next >= questions.length) {
    onFinishClick();
    return;
  }

  currentIndex = next;
  examSession.currentIndex = next;
  setSaveStatus('saving');
  saveSession(examSession);
  setTimeout(() => setSaveStatus('saved'), 150);
  renderNav();
  renderQuestion();
}

function onToggleFlag() {
  const q = questions[currentIndex];
  if (!q) return;
  setSaveStatus('saving');
  toggleFlag(examSession, q.id);
  setTimeout(() => setSaveStatus('saved'), 150);
  renderNav();
  renderQuestion();
}

// ========== FINISH ==========
function openModal(id) {
  $(`#${id}`).hidden = false;
}

function closeModal(id) {
  $(`#${id}`).hidden = true;
}

function onFinishClick() {
  const answered = countAnswered(examSession);
  $('#finish-summary').textContent =
    `Anda telah menjawab ${answered} dari ${questions.length} soal.`;
  openModal('modal-finish');
}

async function onFinalFinish() {
  closeModal('modal-finish-2');
  await doFinish();
}

async function doFinish() {
  if (timer) timer.stop();
  setProctorActive(false);
  closeProctorWarning();
  closeGlitchOverlay();
  exitFullscreen();

  const result = await finishExam(examSession);
  // Sertakan jumlah pelanggaran di hasil (opsional tampil)
  result.violations = getViolationCount();
  showResult(result);
}


function showResult(result) {
  $('#score-value').textContent = result.score;
  $('#stat-correct').textContent = result.correct;
  $('#stat-wrong').textContent = result.wrong;
  $('#stat-empty').textContent = result.empty;
  $('#stat-total').textContent = result.details.length;
  $('#result-subject').textContent = DEMO_EXAM.subject;

  const detail = $('#result-detail');
  const violationNote =
    result.violations > 0
      ? `<div class="detail-row wrong" style="margin-bottom:0.5rem;font-weight:600">
           ⚠ Pelanggaran proctor: ${result.violations} kali
         </div>`
      : '';

  detail.innerHTML =
    violationNote +
    result.details
      .map(
        (d) => `
      <div class="detail-row ${d.status}">
        <span>Soal ${d.number}</span>
        <span>${
          d.status === 'correct'
            ? '✓ Benar'
            : d.status === 'wrong'
            ? `✗ Salah (Kunci: ${d.correct})`
            : '— Kosong'
        }</span>
      </div>`
      )
      .join('');

  showPage('page-result');
}


function onBackHome() {
  setProctorActive(false);
  closeProctorWarning();
  closeGlitchOverlay();
  clearExamSession();
  logout();
  showPage('page-login');
  $('#login-form')?.reset();
}


// Start
init().catch(console.error);
