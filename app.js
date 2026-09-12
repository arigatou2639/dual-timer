class DualTimer {
  constructor(name, displayId, previousId, startId, resetId, lockId) {
    this.name = name;
    this.display = document.getElementById(displayId);
    this.previousEl = document.getElementById(previousId);
    this.startBtn = document.getElementById(startId);
    this.resetBtn = document.getElementById(resetId);
    this.lockBtn = document.getElementById(lockId);

    this.elapsed = 0;
    this.running = false;
    this.startedAt = 0;
    this.accumulated = 0;
    this.raf = null;

    this.previous = Number(localStorage.getItem(`${name}.previous`) || 0);
    this.locked = localStorage.getItem(`${name}.locked`) === "true";

    this.render();
    this.startBtn.addEventListener("click", () => this.toggle());
    this.resetBtn.addEventListener("click", () => this.reset());
    this.lockBtn.addEventListener("click", () => this.toggleLock());

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.running) this.tick();
    });
  }

  format(seconds) {
    const hundredths = Math.floor(seconds * 100 + 1e-7);
    const sec = Math.floor(hundredths / 100);
    const fraction = hundredths % 100;
    return `${String(sec).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`;
  }

  toggle() {
    if (this.running) this.stop();
    else this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startedAt = performance.now();
    this.startBtn.textContent = "❚❚  開始 / 停止";
    this.tick();
  }

  stop() {
    if (!this.running) return;
    this.tick();
    this.running = false;
    this.accumulated = this.elapsed;
    this.startBtn.textContent = "▶  開始 / 停止";

    if (!this.locked) {
      this.previous = this.elapsed;
      localStorage.setItem(`${this.name}.previous`, String(this.previous));
    }
    this.render();
  }

  tick = () => {
    if (!this.running) return;
    this.elapsed = this.accumulated + (performance.now() - this.startedAt) / 1000;
    this.display.textContent = this.format(this.elapsed);
    this.raf = requestAnimationFrame(this.tick);
  };

  reset() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.startedAt = 0;
    this.accumulated = 0;
    this.elapsed = 0;
    this.startBtn.textContent = "▶  開始 / 停止";
    this.display.textContent = "00.00";
  }

  toggleLock() {
    this.locked = !this.locked;
    localStorage.setItem(`${this.name}.locked`, String(this.locked));
    this.render();
  }

  render() {
    this.display.textContent = this.format(this.elapsed);
    this.previousEl.textContent = this.format(this.previous);
    this.lockBtn.textContent = this.locked ? "🔒" : "🔓";
    this.lockBtn.setAttribute("aria-label", this.locked ? "前回の時間のロックを解除" : "前回の時間をロック");
  }
}

new DualTimer("horizontal", "horizontalDisplay", "horizontalPrevious", "horizontalStart", "horizontalReset", "horizontalLock");
new DualTimer("depth", "depthDisplay", "depthPrevious", "depthStart", "depthReset", "depthLock");
