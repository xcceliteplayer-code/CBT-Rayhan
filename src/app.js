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
  getViolationCount,
  setViolationCount
} from './proctor/proctor.js';
import { DEMO_EXAMS, getExamById } from './storage/seed.js';


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

// ========== USER-AGENT GATE ==========
const REQUIRED_UA = 'mtsn2';

function checkUserAgent() {
  const ua = navigator.userAgent || '';
  const ok = ua.toLowerCase().includes(REQUIRED_UA.toLowerCase());
  if (!ok) {
    const block = document.getElementById('ua-block');
    const app = document.getElementById('app');
    if (block) block.hidden = false;
    if (app) app.hidden = true;
    document.body.style.overflow = 'hidden';
    return false;
  }
  return true;
}


let examFontSize = 17; // px

function changeExamFont(delta) {
  examFontSize = Math.min(24, Math.max(14, examFontSize + delta * 2));
  document.documentElement.style.setProperty('--exam-font-size', examFontSize + 'px');
  try { localStorage.setItem('cbt_font_size', String(examFontSize)); } catch (_) {}
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if (next === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  try { localStorage.setItem('cbt_theme', next); } catch (_) {}
}

function restorePrefs() {
  try {
    const fs = parseInt(localStorage.getItem('cbt_font_size'), 10);
    if (fs >= 14 && fs <= 24) {
      examFontSize = fs;
      document.documentElement.style.setProperty('--exam-font-size', fs + 'px');
    }
    if (localStorage.getItem('cbt_theme') === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}
}

// ========== INIT ==========
async function init() {
  if (!checkUserAgent()) return;
  restorePrefs();

  await seedDatabase();
  enableProctoring();
  setWarnCallback(onProctorWarning);

  const session = getSession();
  const examSess = loadSession();

  if (session && examSess && examSess.status === 'active') {
    // Resume exam
    examSession = examSess;
    questions = getQuestions(examSession.examId);
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

  // > 3 pelanggaran → sesi ujian diakhiri tanpa kompromi
  if (count > 3) {
    forceEndForViolations(count, message);
    return;
  }

  const overlay = $('#proctor-warning');
  const msgEl = $('#proctor-message');
  const countEl = $('#proctor-count');
  if (!overlay) return;

  if (msgEl) msgEl.textContent = message;
  if (countEl) countEl.textContent = String(count);
  const titleEl = $('#proctor-title');
  if (titleEl) titleEl.textContent = `Peringatan ${Math.min(count, 3)}/3`;
  overlay.hidden = false;
}

async function forceEndForViolations(count, message) {
  const warn = $('#proctor-warning');
  if (warn) warn.hidden = true;

  setProctorActive(false);
  if (timer) timer.stop();

  if (examSession && examSession.status === 'active') {
    alert(
      'SESI UJIAN DIAKHIRI\n\n' +
      'Pelanggaran pengawasan mencapai batas (4 kali).\n' +
      'Ujian diakhiri otomatis. Jawaban yang sudah diisi tetap dikumpulkan.\n\n' +
      'Pelanggaran terakhir: ' + (message || '-') + '\n' +
      'Total pelanggaran: ' + count
    );
    await doFinish();
  }
}

function closeProctorWarning() {
  const overlay = $('#proctor-warning');
  if (overlay) overlay.hidden = true;
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
  const total = questions.length;
  const answered = Object.keys(examSession.answers).length;
  const flagged = Object.keys(examSession.flags).length;
  const pending = total - answered;
  el.innerHTML =
    `<strong>${answered}</strong> dari ${total} terjawab · ` +
    `<strong>${pending}</strong> belum` +
    (flagged ? ` · <strong>${flagged}</strong> ragu` : '');
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
    const kw = $('#finish-keyword');
    if (kw) kw.value = '';
    const btn = $('#btn-final-finish');
    if (btn) btn.disabled = true;
    openModal('modal-finish-2');
  });
  $('#btn-cancel-finish-2')?.addEventListener('click', () => closeModal('modal-finish-2'));
  $('#btn-final-finish')?.addEventListener('click', onFinalFinish);
  $('#btn-fullscreen')?.addEventListener('click', () => requestFullscreen());
  $('#btn-back-home')?.addEventListener('click', onBackHome);
  $('#btn-proctor-ok')?.addEventListener('click', closeProctorWarning);
  $('#btn-toggle-pw')?.addEventListener('click', () => {
    const inp = $('#password');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  $('#btn-font-inc')?.addEventListener('click', () => changeExamFont(1));
  $('#btn-font-dec')?.addEventListener('click', () => changeExamFont(-1));
  $('#btn-theme')?.addEventListener('click', toggleTheme);
  $('#finish-keyword')?.addEventListener('input', onFinishKeywordInput);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal('modal-finish');
    closeModal('modal-finish-2');
  });

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

  const select = $('#exam-select');
  if (select) {
    select.innerHTML = DEMO_EXAMS.map(
      (e) => `<option value="${e.id}">${e.subject}</option>`
    ).join('');
    select.onchange = () => updateConfirmExamInfo();
    updateConfirmExamInfo();
  }

  $('#agree-terms').checked = false;
  $('#btn-start-exam').disabled = true;
  showPage('page-confirm');
}

function updateConfirmExamInfo() {
  const select = $('#exam-select');
  const exam = getExamById(select?.value);
  $('#conf-total').textContent = exam.totalQuestions;
  $('#conf-duration').textContent = `${exam.durationMinutes} menit`;
  const desc = $('#exam-select-desc');
  if (desc) desc.textContent = exam.description || '';
}

function onLogout() {
  setProctorActive(false);
  closeProctorWarning();
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

  const examId = $('#exam-select')?.value || DEMO_EXAMS[0].id;
  examSession = createSession(session, examId);
  questions = getQuestions(examId);
  currentIndex = 0;
  startExamUI(false);
}

function startExamUI(isResume) {
  showPage('page-exam');
  document.title = `Ujian ${examSession.subject || ''} · CBT Demo`;
  $('#exam-participant-name').textContent = examSession.name;
  const av = $('#exam-avatar');
  if (av) {
    const sess = getSession();
    av.textContent = (sess && sess.avatar) || examSession.name.slice(0, 2).toUpperCase() || 'PD';
  }
  const titleEl = document.querySelector('.exam-title');
  if (titleEl) titleEl.textContent = `Ujian ${examSession.subject || ''}`;

  renderNav();
  renderQuestion();

  setViolationCount((examSession.violations || []).length);

  if (isResume && examSession.deadline && examSession.deadline <= Date.now()) {
    doFinish();
    return;
  }

  if (timer) timer.stop();
  timer = new ExamTimer({
    durationMinutes: examSession.durationMinutes || 60,
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

  setProctorActive(true);
  setViolationCount((examSession.violations || []).length);
  requestFullscreen().catch(() => {});
}


function updateTimerDisplay({ display, remainingMs }) {
  const el = $('#timer-display');
  const box = $('#timer-box');
  if (el) el.textContent = display;

  if (box) {
    box.classList.remove('ok', 'warning', 'danger');
    if (remainingMs <= 5 * 60 * 1000) box.classList.add('danger');
    else if (remainingMs <= 15 * 60 * 1000) box.classList.add('warning');
    else box.classList.add('ok');
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
    const isAnswered = !!examSession.answers[q.id];
    const isFlagged = !!examSession.flags[q.id];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item';
    btn.textContent = q.number;
    btn.setAttribute(
      'aria-label',
      `Soal ${q.number}` +
        (isAnswered ? ', sudah dijawab' : ', belum dijawab') +
        (isFlagged ? ', ditandai ragu' : '')
    );

    if (idx === currentIndex) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    }
    if (isAnswered) btn.classList.add('answered');
    if (isFlagged) btn.classList.add('flagged');

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
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', 'question-text');

  const selected = examSession.answers[q.id] || null;

  const choose = (key) => {
    const ok = setAnswer(examSession, q.id, key);
    setSaveStatus(ok ? 'saved' : 'error');
    renderNav();
    renderQuestion();
    $('#options-list').querySelector(`[data-key="${key}"]`)?.focus();
  };

  q.options.forEach((opt, i) => {
    const isSelected = selected === opt.key;
    const item = document.createElement('div');
    item.className = 'option-item' + (isSelected ? ' selected' : '');
    item.dataset.key = opt.key;
    item.setAttribute('role', 'radio');
    item.setAttribute('aria-checked', String(isSelected));
    item.setAttribute('aria-label', `${opt.key}. ${opt.text}`);
    item.tabIndex = isSelected || (!selected && i === 0) ? 0 : -1;

    const keyEl = document.createElement('span');
    keyEl.className = 'option-key';
    keyEl.setAttribute('aria-hidden', 'true');
    keyEl.textContent = opt.key;

    const textEl = document.createElement('span');
    textEl.className = 'option-text';
    textEl.textContent = opt.text;

    item.append(keyEl, textEl);

    item.addEventListener('click', () => choose(opt.key));
    item.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('.option-item')];
      const idx = items.indexOf(item);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        choose(opt.key);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      }
    });

    list.appendChild(item);
  });

  const flagged = !!examSession.flags[q.id];
  const flagBtn = $('#btn-flag');
  flagBtn.classList.toggle('active', flagged);
  flagBtn.setAttribute('aria-pressed', String(flagged));
  $('#flag-text').textContent = flagged ? 'Hapus ragu' : 'Tandai ragu';

  $('#btn-prev').disabled = currentIndex === 0;
  $('#btn-next').textContent =
    currentIndex === questions.length - 1 ? 'Selesai →' : 'Selanjutnya →';

  document.querySelector('.nav-item.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
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
  const ok = saveSession(examSession);
  setSaveStatus(ok ? 'saved' : 'error');
  renderNav();
  renderQuestion();
}

function onToggleFlag() {
  const q = questions[currentIndex];
  if (!q) return;
  toggleFlag(examSession, q.id);
  const ok = saveSession(examSession);
  setSaveStatus(ok ? 'saved' : 'error');
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
  const unanswered = questions.length - answered;
  let summary = `Anda telah menjawab ${answered} dari ${questions.length} soal.`;
  if (unanswered > 0) {
    summary += ` Masih ada ${unanswered} soal belum dijawab.`;
  }
  $('#finish-summary').textContent = summary;
  openModal('modal-finish');
}

function onFinishKeywordInput() {
  const val = ($('#finish-keyword')?.value || '').trim().toUpperCase();
  const btn = $('#btn-final-finish');
  if (btn) btn.disabled = val !== 'SELESAI';
}

async function onFinalFinish() {
  closeModal('modal-finish-2');
  await doFinish();
}

let finishing = false;

async function doFinish() {
  if (finishing) return;
  if (!examSession || examSession.status === 'finished') return;
  finishing = true;

  if (timer) timer.stop();
  setProctorActive(false);
  closeProctorWarning();
  exitFullscreen();

  try {
    const result = await finishExam(examSession);
    result.violations = getViolationCount();
    showResult(result);
  } finally {
    finishing = false;
  }
}


function showResult(result) {
  $('#score-value').textContent = result.score;
  $('#stat-correct').textContent = result.correct;
  $('#stat-wrong').textContent = result.wrong;
  $('#stat-empty').textContent = result.empty;
  $('#stat-total').textContent = result.details.length;
  $('#result-subject').textContent = result.subject || examSession?.subject || '';

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
  clearExamSession();
  logout();
  showPage('page-login');
  $('#login-form')?.reset();
}


// Start
init().catch(console.error);
