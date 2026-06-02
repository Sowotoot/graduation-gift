// progress.js - track opened gifts and progress bar

const Progress = {
  gifts: ['flowers', 'letter', 'photos', 'voicemail'],
  opened: new Set(),

  init() {
    // Load from localStorage
    const saved = localStorage.getItem('grad_opened');
    if (saved) {
      JSON.parse(saved).forEach(g => this.opened.add(g));
    }
    this._render();
  },

  mark(giftName) {
    if (this.opened.has(giftName)) return;
    this.opened.add(giftName);
    localStorage.setItem('grad_opened', JSON.stringify([...this.opened]));
    this._render();
    this._checkComplete();
  },

  isOpened(giftName) {
    return this.opened.has(giftName);
  },

  _render() {
    const count = this.opened.size;
    const total = this.gifts.length;
    const pct = (count / total) * 80; // 80% = 4 steps, last step is lock

    const fill = document.getElementById('progFill');
    if (fill) fill.style.width = pct + '%';

    this.gifts.forEach(g => {
      const step = document.getElementById('step-' + g);
      if (step) {
        step.classList.toggle('done', this.opened.has(g));
      }
      // Mark opened gift objects
      const obj = document.querySelector(`[data-gift="${g}"]`);
      if (obj) obj.classList.toggle('opened', this.opened.has(g));
    });
  },

  _checkComplete() {
    if (this.opened.size === this.gifts.length) {
      setTimeout(() => this._unlockFinal(), 600);
    }
  },

  _unlockFinal() {
    const finalStep = document.getElementById('step-final');
    if (finalStep) {
      finalStep.classList.add('done', 'unlocked');
      const dot = finalStep.querySelector('.lock-dot');
      if (dot) dot.innerHTML = '🎓';
    }
    // Show final unlock toast
    showToast('🎓 All gifts opened! Tap the cap to unlock the surprise!');
    // Make final step clickable
    const finalStepEl = document.getElementById('step-final');
    if (finalStepEl) {
      finalStepEl.style.cursor = 'pointer';
      finalStepEl.addEventListener('click', () => {
        navigateTo('pages/ending.html');
      });
    }
  },

  reset() {
    this.opened.clear();
    localStorage.removeItem('grad_opened');
    this._render();
  }
};

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
