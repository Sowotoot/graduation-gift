// progress.js — track opened gifts and update progress bar
const Progress = {
  gifts: ['flowers', 'letter', 'photos'],
  opened: new Set(),
  _finalUnlocked: false,

  init() {
    try {
      const saved = localStorage.getItem('grad_opened');
      if (saved) {
        JSON.parse(saved).forEach(g => this.opened.add(g));
      }
    } catch (e) {}

    this._render();

    // ✅ FIX 1: On reload with full progress, unlock without the guard blocking it
    if (this.opened.size === this.gifts.length) {
      setTimeout(() => this._unlockFinal(true), 800); // pass force=true
    }
  },

  mark(giftName) {
    if (!this.gifts.includes(giftName)) return;
    if (this.opened.has(giftName)) return;

    this.opened.add(giftName);

    try {
      localStorage.setItem('grad_opened', JSON.stringify([...this.opened]));
    } catch (e) {}

    this._render();
    this._checkComplete();
  },

  isOpened(giftName) {
    return this.opened.has(giftName);
  },

  _render() {
    const count = this.opened.size;
    const total = this.gifts.length;
    const pct = count === total ? 100 : (count / total) * 80;

    const fill = document.getElementById('progFill');
    if (fill) fill.style.width = pct + '%';

    this.gifts.forEach(g => {
      const step = document.getElementById('step-' + g);
      if (step) step.classList.toggle('done', this.opened.has(g));

      const obj = document.querySelector(`[data-gift="${g}"]`);
      if (obj) obj.classList.toggle('opened', this.opened.has(g));
    });
  },

  _checkComplete() {
    if (this.opened.size === this.gifts.length) {
      setTimeout(() => this._unlockFinal(), 600);
    }
  },

  // ✅ FIX 2: force param bypasses the guard for reload case
  _unlockFinal(force = false) {
    if (this._finalUnlocked && !force) return;
    this._finalUnlocked = true;

    const finalStep = document.getElementById('step-final');
    if (finalStep) {
      finalStep.classList.add('done', 'unlocked');
      finalStep.style.cursor = 'pointer';

      const dot = finalStep.querySelector('.lock-dot');
      if (dot) dot.innerHTML = '🎓';

      // ✅ FIX 3: Remove old listener before adding new one, so it never stacks
      //    but also never disappears after one click
      const handler = () => {
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('pages/ending.html');
        } else {
          window.location.href = 'pages/ending.html';
        }
      };

      // Clone the node to wipe any old listeners, then re-attach
      const fresh = finalStep.cloneNode(true);
      finalStep.parentNode.replaceChild(fresh, finalStep);
      fresh.addEventListener('click', handler); // ← no 'once', stays forever
    }

    showToast('🎓 All gifts opened! Tap the cap to see your surprise!');
  },

  reset() {
    this.opened.clear();
    this._finalUnlocked = false;
    try { localStorage.removeItem('grad_opened'); } catch (e) {}
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
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}
