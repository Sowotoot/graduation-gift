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
    <div class="petal-container" id="petalContainer"></div>
    <div class="bokeh-container" id="bokehContainer"></div>
    <div class="spotlight"></div>
    <div class="intro-content">
      <p class="intro-message" id="introMsg">I made something for you</p>
      <div class="blossom-wrap" id="blossomWrap">
        <div class="blossom-glow"></div>
        <span class="blossom-emoji">🎓</span>
      </div>
      <p class="pull-hint" id="pullHint">Pull the string<br>and see what happens <span class="hint-heart">🎓</span></p>
      <div class="chevron-wrap" id="chevronWrap"><span class="chevron">&#8964;</span></div>
    </div>
    <div class="string-wrap" id="stringWrap">
      <div class="string-line" id="stringLine"></div>
      <div class="string-knob" id="stringKnob"><div class="knob-inner"></div></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Spawn bokeh dots
  const bokehEl = overlay.querySelector('#bokehContainer');
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('div');
    const size = 4 + Math.random() * 10;
    d.className = 'bokeh-dot';
    d.style.cssText = `left:${Math.random()*100}%;top:${20+Math.random()*70}%;width:${size}px;height:${size}px;animation-duration:${3+Math.random()*4}s;animation-delay:${Math.random()*4}s;opacity:${0.3+Math.random()*0.5};`;
    bokehEl.appendChild(d);
  }

  // Spawn petals
  const petalEl = overlay.querySelector('#petalContainer');
  const petalColors = ['#c084fc','#a855f7','#e9d5ff','#7c3aed','#ddd6fe'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 8;
    p.className = 'petal';
    p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;background:${petalColors[Math.floor(Math.random()*petalColors.length)]};animation-duration:${5+Math.random()*7}s;animation-delay:${Math.random()*6}s;border-radius:${Math.random()>0.5?'50% 0 50% 0':'30% 70% 30% 70%'};`;
    petalEl.appendChild(p);
  }

  // Sequence fade-ins
  setTimeout(() => document.getElementById('introMsg')?.classList.add('visible'), 300);
  setTimeout(() => document.getElementById('blossomWrap')?.classList.add('visible'), 700);
  setTimeout(() => document.getElementById('pullHint')?.classList.add('visible'), 1200);
  setTimeout(() => document.getElementById('chevronWrap')?.classList.add('visible'), 1500);
  setTimeout(() => document.getElementById('stringWrap')?.classList.add('visible'), 1700);

  // Pull interaction
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
    lampOn = true;
    AudioManager.playSFX('lampSound');
    Room.lightUp();
    setTimeout(() => AudioManager._tryPlay(), 800);
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
