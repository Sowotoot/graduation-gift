// =====================================================
// main.js — entry point
// =====================================================
const DEBUG_HOTSPOTS = false;
let lampOn = false;
let giftFrame = null;

// ── INTRO OVERLAY ─────────────────────────────────
function setupIntro() {
  const overlay = document.createElement('div');
  overlay.id = 'introOverlay';
  overlay.innerHTML = `
    <p class="intro-message" id="introMsg">I made something for you 🌸</p>
    <p class="pull-hint" id="pullHint">pull the string</p>
    <div class="string-wrap" id="stringWrap">
      <div class="string-line" id="stringLine"></div>
      <div class="string-knob" id="stringKnob">
        <div class="knob-inner"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.getElementById('introMsg').classList.add('visible');
    document.getElementById('pullHint').classList.add('visible');
    document.getElementById('stringWrap').classList.add('visible');
  }, 400);

  let pulled = false;
  const onPull = (e) => {
    if (pulled) return;
    pulled = true;

    const knob = document.getElementById('stringKnob');
    const line = document.getElementById('stringLine');
    knob.classList.add('active');
    line.classList.add('pulled');

    const rect = knob.getBoundingClientRect();
    Room.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Light up the room immediately
    lampOn = true;
    AudioManager.playSFX('lampSound');
    Room.lightUp();
    setTimeout(() => AudioManager._tryPlay(), 800);

    // Fade out overlay
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 1300);
    }, 280);
  };

  const knob = document.getElementById('stringKnob');
  knob.addEventListener('touchstart', onPull, { passive: true });
  knob.addEventListener('click', onPull);
}

function init() {
  if (DEBUG_HOTSPOTS) document.body.classList.add('debug-hotspots');
  AudioManager.init();
  Progress.init();
  Room.init();
  setupIntro();
  setupGiftObjects();
  setupNavigation();
}

// ── GIFT OBJECTS ──────────────────────────────────
function setupGiftObjects() {
  document.querySelectorAll('.gift-hotspot').forEach(obj => {
    const handler = (e) => {
      if (!lampOn) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      Room.spawnSparkles(touch.clientX, touch.clientY);
      const page = obj.dataset.page;
      const gift = obj.dataset.gift;
      Progress.mark(gift);
      AudioManager.playSFX('unlockSound');
      gsap.timeline()
        .to(obj, { scale: 0.92, duration: 0.1 })
        .to(obj, { scale: 1.05, duration: 0.2, ease: 'back.out(2)' })
        .to(obj, { scale: 1, duration: 0.15 });
      setTimeout(() => navigateTo(page), 350);
    };
    obj.addEventListener('touchstart', handler, { passive: false });
    obj.addEventListener('click', handler);
  });
}

// ── NAVIGATION ────────────────────────────────────
function setupNavigation() {
  giftFrame = document.createElement('iframe');
  giftFrame.className = 'gift-frame';
  giftFrame.id = 'giftFrame';
  document.body.appendChild(giftFrame);
  window.addEventListener('message', (e) => {
    if (e.data === 'close-gift') closeGift();
    if (e.data && e.data.type === 'gift-opened') Progress.mark(e.data.gift);
  });
}

function navigateTo(page) {
  if (!giftFrame) return;
  giftFrame.src = page;
  requestAnimationFrame(() => { giftFrame.classList.add('active'); });
}

function closeGift() {
  if (!giftFrame) return;
  giftFrame.classList.remove('active');
  setTimeout(() => { giftFrame.src = ''; }, 500);
}

window.navigateTo = navigateTo;
window.closeGift = closeGift;
document.addEventListener('DOMContentLoaded', init);
