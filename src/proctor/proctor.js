/**
 * Proctoring / Browser Lockdown (Demo level)
 * - Deteksi fokus hilang, tab switch, Alt+Tab
 * - Blokir Ctrl+C/V/X/A/P/S, klik kanan
 * - Deteksi keluar fullscreen
 * - Callback peringatan ke UI
 *
 * Catatan: Browser biasa tidak bisa benar-benar mengunci OS.
 * Sistem ini mendeteksi & memperingatkan, lalu mencatat pelanggaran.
 */

let warnCallback = null;
let logCallback = null;
let active = false;
let violationCount = 0;
let lastWarnAt = 0;
const WARN_COOLDOWN_MS = 1500;

const VIOLATION_LABELS = {
  focus_lost: 'Fokus jendela hilang (kemungkinan Alt+Tab / pindah aplikasi)',
  tab_hidden: 'Tab disembunyikan / berpindah ke tab lain',
  fullscreen_exit: 'Keluar dari mode layar penuh',
  shortcut_copy: 'Mencoba menyalin (Ctrl+C)',
  shortcut_paste: 'Mencoba menempel (Ctrl+V)',
  shortcut_cut: 'Mencoba memotong (Ctrl+X)',
  shortcut_select: 'Mencoba select-all (Ctrl+A)',
  shortcut_print: 'Mencoba print (Ctrl+P)',
  shortcut_save: 'Mencoba save (Ctrl+S)',
  contextmenu: 'Mencoba membuka menu klik kanan',
  new_window: 'Mencoba membuka jendela/tab baru',
  blur: 'Jendela kehilangan fokus'
};

function emitLog(event, detail = '') {
  const entry = {
    time: new Date().toISOString(),
    event,
    detail,
    count: violationCount
  };
  console.warn('[Proctor]', event, detail);
  logCallback?.(entry);
}

function emitWarn(type, detail = '') {
  if (!active) return;

  const now = Date.now();
  if (now - lastWarnAt < WARN_COOLDOWN_MS) return;
  lastWarnAt = now;

  violationCount += 1;
  const message = VIOLATION_LABELS[type] || type;
  emitLog(type, detail);

  warnCallback?.({
    type,
    message,
    detail,
    count: violationCount
  });
}

export function setWarnCallback(fn) {
  warnCallback = fn;
}

export function setLogCallback(fn) {
  logCallback = fn;
}

export function getViolationCount() {
  return violationCount;
}

export function resetViolations() {
  violationCount = 0;
}

export function setViolationCount(n) {
  violationCount = Math.max(0, Number(n) || 0);
}

export function setProctorActive(value) {
  active = !!value;
  if (active) {
    violationCount = 0;
  }
}

export function isProctorActive() {
  return active;
}

function onKeyDown(e) {
  if (!active) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

  const key = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;

  // Blokir shortcut berbahaya
  if (ctrl) {
    if (key === 'c') {
      e.preventDefault();
      emitWarn('shortcut_copy');
      return;
    }
    if (key === 'v') {
      e.preventDefault();
      emitWarn('shortcut_paste');
      return;
    }
    if (key === 'x') {
      e.preventDefault();
      emitWarn('shortcut_cut');
      return;
    }
    if (key === 'a') {
      e.preventDefault();
      emitWarn('shortcut_select');
      return;
    }
    if (key === 'p') {
      e.preventDefault();
      emitWarn('shortcut_print');
      return;
    }
    if (key === 's') {
      e.preventDefault();
      emitWarn('shortcut_save');
      return;
    }
    // Ctrl+T / Ctrl+N / Ctrl+W — coba blokir (browser sering tetap izinkan)
    if (key === 't' || key === 'n' || key === 'w') {
      e.preventDefault();
      emitWarn('new_window', key);
      return;
    }
  }

  // Alt+Tab tidak bisa dicegah di browser, tapi blur akan menangkapnya
}

function onContextMenu(e) {
  if (!active) return;
  e.preventDefault();
  emitWarn('contextmenu');
}

function onVisibilityChange() {
  if (!active) return;
  if (document.hidden) {
    emitWarn('tab_hidden');
  }
}

function onBlur() {
  if (!active) return;
  // Delay sedikit agar tidak bentrok dengan fullscreen request
  setTimeout(() => {
    if (!active) return;
    if (document.hidden || !document.hasFocus()) {
      emitWarn('focus_lost');
    }
  }, 100);
}

function onFullscreenChange() {
  if (!active) return;
  if (!document.fullscreenElement) {
    emitWarn('fullscreen_exit');
  }
}

function onCopy(e) {
  if (!active) return;
  e.preventDefault();
  emitWarn('shortcut_copy', 'copy event');
}

function onPaste(e) {
  if (!active) return;
  e.preventDefault();
  emitWarn('shortcut_paste', 'paste event');
}

function onCut(e) {
  if (!active) return;
  e.preventDefault();
  emitWarn('shortcut_cut', 'cut event');
}

/** Pasang listener sekali (aman dipanggil berulang) */
let listenersAttached = false;

export function enableProctoring() {
  if (listenersAttached) return;
  listenersAttached = true;

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onBlur);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('copy', onCopy);
  document.addEventListener('paste', onPaste);
  document.addEventListener('cut', onCut);
}

export async function requestFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return true;
    }
  } catch (err) {
    emitLog('fullscreen_failed', err.message);
  }
  return false;
}

export function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}
