// audio.js - shared audio management

const AudioManager = {
  bgMusic: null,
  isMuted: false,
  isStarted: false,

  init() {
    this.bgMusic = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');

    // Load mute preference
    this.isMuted = localStorage.getItem('grad_muted') === 'true';
    this._applyMute();

    if (btn) {
      btn.addEventListener('click', () => this.toggleMute());
    }

    // Try to play on first touch (mobile requires user gesture)
    document.addEventListener('touchstart', () => this._tryPlay(), { once: true });
    document.addEventListener('click', () => this._tryPlay(), { once: true });
  },

  _tryPlay() {
    if (!this.bgMusic || this.isStarted) return;
    this.isStarted = true;
    if (!this.isMuted) {
      this.bgMusic.volume = 0.3;
      this.bgMusic.play().catch(() => {});
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('grad_muted', this.isMuted);
    this._applyMute();
  },

  _applyMute() {
    const btn = document.getElementById('musicBtn');
    if (this.bgMusic) {
      if (this.isMuted) {
        this.bgMusic.pause();
      } else if (this.isStarted) {
        this.bgMusic.play().catch(() => {});
      }
    }
    if (btn) btn.classList.toggle('muted', this.isMuted);
  },

  playSFX(id) {
    if (this.isMuted) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.currentTime = 0;
    el.volume = 0.6;
    el.play().catch(() => {});
  }
};
