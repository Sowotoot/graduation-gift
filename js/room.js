// =====================================================
// room.js — scene reveal + ambient animations
// The room is now room.png; this file handles:
//   • darkness lift
//   • revealing gift hotspot buttons
//   • sparkle particles on tap
// =====================================================

const Room = {
  isLit: false,

  init() {
    // nothing to pre-animate in image mode
  },

  lightUp() {
    if (this.isLit) return;
    this.isLit = true;

    const tl = gsap.timeline();

    // 1. Lift darkness overlay
    tl.to('#darkness', { opacity: 0, duration: 2.2, ease: 'power2.inOut' })

    // 2. Reveal gift hotspot buttons with stagger
    tl.add(() => {
      const gifts = document.querySelectorAll('.gift-hotspot');
      gifts.forEach((el, i) => {
        gsap.to(el, {
          delay: i * 0.18,
          duration: 0.5,
          onStart: () => el.classList.add('revealed')
        });
      });
    }, '-=0.8')

    // 3. Progress bar slides up
    tl.add(() => {
      document.getElementById('progressWrap')?.classList.add('show');
    }, '-=0.4')

    // 4. Touch hint
    tl.add(() => {
      const hint = document.getElementById('touchHint');
      if (hint) {
        hint.classList.add('show');
        setTimeout(() => hint.classList.remove('show'), 3000);
      }
    }, '+=0.3')

    // 5. Re-render progress (in case gifts were already opened)
    tl.add(() => Progress._render(), '+=0.1');
  },

  // Sparkle burst at tap coordinates
  spawnSparkles(x, y) {
    const colors = ['#f5c842', '#f4a7b9', '#e8729a', '#ffffff'];
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${4 + Math.random() * 4}px;
        height: ${4 + Math.random() * 4}px;
        border-radius: 50%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 999;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(el);
      gsap.to(el, {
        x: (Math.random() - 0.5) * 80,
        y: -40 - Math.random() * 60,
        opacity: 0,
        scale: 0,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => el.remove()
      });
    }
  }
};
