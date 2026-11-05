/**
 * Timer engine using deadline timestamp for accuracy
 */
export class ExamTimer {
  constructor({ durationMinutes, onTick, onExpire }) {
    this.durationMs = durationMinutes * 60 * 1000;
    this.deadline = null;
    this.intervalId = null;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.running = false;
  }

  start(fromDeadline = null) {
    if (fromDeadline) {
      this.deadline = fromDeadline;
    } else {
      this.deadline = Date.now() + this.durationMs;
    }
    this.running = true;
    this._tick();
    this.intervalId = setInterval(() => this._tick(), 250);
  }

  _tick() {
    if (!this.running) return;

    const remaining = Math.max(0, this.deadline - Date.now());
    const totalSec = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    this.onTick?.({
      remainingMs: remaining,
      minutes,
      seconds,
      display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      percent: (remaining / this.durationMs) * 100
    });

    if (remaining <= 0) {
      this.stop();
      this.onExpire?.();
    }
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getDeadline() {
    return this.deadline;
  }

  getRemainingMs() {
    if (!this.deadline) return this.durationMs;
    return Math.max(0, this.deadline - Date.now());
  }
}
