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

    <!-- Three-layer spotlight: wide outer, mid, tight streak -->
    <div class="spotlight"></div>
    <div class="spotlight-inner"></div>
    <div class="spotlight-streak"></div>

    <!-- Top content block: title, cap, pull text, chevron -->
    <div class="intro-content">

      <p class="intro-message" id="introMsg">I made something for you</p>

      <!-- Gold heart divider (matches reference) -->
      <div class="heart-divider" id="heartDivider">
        <div class="heart-divider-line"></div>
        <span class="heart-divider-icon">♡</span>
        <div class="heart-divider-line right"></div>
      </div>

      <!-- Graduation cap with purple glow + sparkle dots -->
      <div class="blossom-wrap" id="blossomWrap">
        <div class="blossom-glow"></div>
        <!-- Sparkle dots scattered around cap -->
        <div class="cap-sparkle" style="top:18%;left:18%;animation-duration:1.8s;animation-delay:0s;"></div>
        <div class="cap-sparkle" style="top:12%;right:20%;animation-duration:2.2s;animation-delay:0.4s;"></div>
        <div class="cap-sparkle" style="bottom:22%;left:14%;animation-duration:1.6s;animation-delay:0.8s;"></div>
        <div class="cap-sparkle" style="bottom:18%;right:16%;animation-duration:2.0s;animation-delay:0.2s;width:3px;height:3px;"></div>
        <div class="cap-sparkle" style="top:38%;left:8%;animation-duration:2.4s;animation-delay:1.1s;width:3px;height:3px;"></div>
        <div class="cap-sparkle" style="top:35%;right:6%;animation-duration:1.9s;animation-delay:0.6s;"></div>
        <span class="blossom-emoji">🎓</span>
      </div>

      <!-- Pull text sits right below the cap -->
      <p class="pull-hint" id="pullHint">
        Pull the string<br>and see what happens 🎓
      </p>

      <!-- Chevron arrow pointing down toward the string -->
      <div class="chevron-wrap" id="chevronWrap">
        <span class="chevron">&#8964;</span>
      </div>

    </div><!-- /.intro-content -->

    <!-- String + knob: flex-grow fills remaining space, knob at bottom -->
    <div class="string-wrap" id="stringWrap">
      <div class="string-line" id="stringLine"></div>
      <div class="string-knob" id="stringKnob">
        <div class="knob-inner"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Spawn bokeh dots ──
  const bokehEl = overlay.querySelector('#bokehContainer');
  for (let i = 0; i < 20; i++) {
    const d = document.createElement('div');
    const size = 5 + Math.random() * 12;
    d.className = 'bokeh-dot';
    d.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${15 + Math.random() * 75}%`,
      `width:${size}px`,
      `height:${size}px`,
      `animation-duration:${3.5 + Math.random() * 4}s`,
      `animation-delay:${Math.random() * 4}s`,
      `opacity:${0.3 + Math.random() * 0.5}`,
    ].join(';');
    bokehEl.appendChild(d);
  }

  // ── Spawn petals ──
  const petalEl = overlay.querySelector('#petalContainer');
  const petalColors = [
    '#c084fc', '#a855f7', '#e9d5ff',
    '#7c3aed', '#ddd6fe', '#d8b4fe',
  ];
  const petalShapes = [
    '50% 0 50% 0',
    '30% 70% 30% 70%',
    '60% 0 60% 0',
    '0 50% 0 50%',
  ];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    const size = 7 + Math.random() * 9;
    p.className = 'petal';
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size * (0.8 + Math.random() * 0.6)}px`,
      `background:${petalColors[Math.floor(Math.random() * petalColors.length)]}`,
      `animation-duration:${5.5 + Math.random() * 7}s`,
      `animation-delay:${Math.random() * 7}s`,
      `border-radius:${petalShapes[Math.floor(Math.random() * petalShapes.length)]}`,
      `opacity:${0.65 + Math.random() * 0.3}`,
    ].join(';');
    petalEl.appendChild(p);
  }

  // ── Sequenced fade-ins ──
  setTimeout(() => document.getElementById('introMsg')?.classList.add('visible'),    300);
  setTimeout(() => document.getElementById('heartDivider')?.classList.add('visible'), 600);
  setTimeout(() => document.getElementById('blossomWrap')?.classList.add('visible'),  800);
  setTimeout(() => document.getElementById('pullHint')?.classList.add('visible'),    1300);
  setTimeout(() => document.getElementById('chevronWrap')?.classList.add('visible'), 1600);
  setTimeout(() => document.getElementById('stringWrap')?.classList.add('visible'),  1900);

  // ── Pull interaction ──
  let pulled = false;

  const onPull = (e) => {
    if (pulled) return;
    pulled = true;

    const knob = document.getElementById('stringKnob');
    const line = document.getElementById('stringLine');

    knob.classList.add('active');
    line.classList.add('pulled');

    const rect = knob.getBoundingClientRect();
    Room.spawnSparkles(
      rect.left + rect.width  / 2,
      rect.top  + rect.height / 2
    );

    lampOn = true;
    AudioManager.playSFX('lampSound');
    Room.lightUp();

    setTimeout(() => AudioManager._tryPlay(), 800);
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 1300);
    }, 300);
  };

  const knob = document.getElementById('stringKnob');
  knob.addEventListener('touchstart', onPull, { passive: true });
  knob.addEventListener('click', onPull);
}

// ── INIT ──────────────────────────────────────────
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
        .to(obj, { scale: 1,    duration: 0.15 });
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
window.closeGift  = closeGift;
document.addEventListener('DOMContentLoaded', init);
