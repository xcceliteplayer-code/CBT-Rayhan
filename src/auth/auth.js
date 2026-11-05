/**
 * Authentication module
 */
import { get, STORES } from '../storage/db.js';
import { DEMO_PARTICIPANT } from '../storage/seed.js';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60_000;

let attempts = 0;
let lockUntil = 0;

export function isLocked() {
  return Date.now() < lockUntil;
}

export function remainingLockSeconds() {
  return Math.ceil((lockUntil - Date.now()) / 1000);
}

/**
 * Validate NISN + password
 * @returns {{ ok: boolean, participant?: object, message?: string }}
 */
export async function login(nisn, password) {
  if (isLocked()) {
    return {
      ok: false,
      message: `Terlalu banyak percobaan. Coba lagi dalam ${remainingLockSeconds()} detik.`
    };
  }

  const participant = await get(STORES.participants, nisn.trim());

  if (!participant || participant.password !== password) {
    attempts += 1;
    if (attempts >= MAX_ATTEMPTS) {
      lockUntil = Date.now() + LOCK_DURATION_MS;
      attempts = 0;
      return {
        ok: false,
        message: `Login gagal ${MAX_ATTEMPTS} kali. Akun terkunci sementara 60 detik.`
      };
    }
    return {
      ok: false,
      message: `NISN atau password salah. Sisa percobaan: ${MAX_ATTEMPTS - attempts}`
    };
  }

  attempts = 0;
  // Store session in sessionStorage
  sessionStorage.setItem('cbt_session', JSON.stringify({
    nisn: participant.nisn,
    name: participant.name,
    avatar: participant.avatar,
    loginAt: Date.now()
  }));

  return { ok: true, participant };
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem('cbt_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem('cbt_session');
  sessionStorage.removeItem('cbt_exam_session');
}

export function requireAuth() {
  const session = getSession();
  if (!session) {
    return false;
  }
  return true;
}
