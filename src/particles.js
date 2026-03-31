// particles.js - High-performance particle system for Love Match
// Uses object pooling and lookup tables for smooth 60fps effects

// --- Easing Functions ---
export function easeOutQuad(t) { return t * (2 - t); }
export function easeOutCubic(t) { return 1 - (1 - t) ** 3; }
export function easeOutBounce(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
}
export function easeInOutSine(t) { return 0.5 * (1 - Math.cos(Math.PI * t)); }

// --- Lookup Tables ---
const SIN_TABLE_SIZE = 360;
const sinTable = new Float32Array(SIN_TABLE_SIZE);
const cosTable = new Float32Array(SIN_TABLE_SIZE);
for (let i = 0; i < SIN_TABLE_SIZE; i++) {
  const rad = (i / SIN_TABLE_SIZE) * Math.PI * 2;
  sinTable[i] = Math.sin(rad);
  cosTable[i] = Math.cos(rad);
}
function fastSin(angleDeg) {
  const idx = ((angleDeg % 360) + 360) % 360 | 0;
  return sinTable[idx];
}
function fastCos(angleDeg) {
  const idx = ((angleDeg % 360) + 360) % 360 | 0;
  return cosTable[idx];
}

// --- Random Helpers ---
function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return (min + Math.random() * (max - min)) | 0; }
function pick(arr) { return arr[randInt(0, arr.length)]; }

// --- Color Palettes ---
const HEART_COLORS = ['#ff4d6d', '#ff758f', '#e63946', '#d4a0a7', '#c9184a'];
const SPARKLE_COLORS = ['#ffd700', '#c0c0c0', '#ffffff', '#ffe066', '#f0e68c'];
const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb', '#845ef7'];
const PETAL_COLORS = ['#ffb3c1', '#ff8fab', '#fb6f92', '#ffc2d1', '#fff0f3'];
const SAWDUST_COLORS = ['#d4a574', '#c4956a', '#b8860b', '#deb887', '#d2b48c'];
const SPARK_COLORS = ['#ff8c00', '#ffa500', '#ffd700', '#ffffff', '#ffcc33'];
const BUTTERFLY_COLORS = ['#e0aaff', '#c77dff', '#ff85a1', '#ffc8dd', '#bde0fe'];

// --- Particle Pool ---
const MAX_PARTICLES = 500;

const TYPES = {
  HEART: 0, SPARKLE: 1, CONFETTI: 2, EXPLOSION: 3,
  PETAL: 4, SAWDUST: 5, SPARK: 6, BUTTERFLY: 7,
  STAR: 8, FIREWORK: 9, BEAM: 10, SHOCKWAVE: 11,
  RAINBOW: 12, TEXT: 13, TRAIL: 14
};

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.active = false;
    this.type = 0;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.ax = 0; this.ay = 0;
    this.size = 10;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.opacity = 1;
    this.life = 0;
    this.maxLife = 1;
    this.color = '#fff';
    this.scaleX = 1; this.scaleY = 1;
    // type-specific
    this.text = '';
    this.fontSize = 16;
    this.twinkleSpeed = 0;
    this.twinklePhase = 0;
    this.driftAmplitude = 0;
    this.driftFreq = 0;
    this.driftPhase = 0;
    this.tailLength = 0;
    this.prevX = 0; this.prevY = 0;
    // shockwave / beam
    this.radius = 0;
    this.maxRadius = 0;
    this.x2 = 0; this.y2 = 0;
    this.width = 2;
    // rainbow
    this.arcProgress = 0;
    // flutter (butterfly)
    this.wingPhase = 0;
    this.wingSpeed = 0;
  }
}

export class ParticleSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.pool = [];
    this.active = [];
    this.ambientTimer = null;
    this.ambientType = null;

    // Pre-allocate pool
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push(new Particle());
    }
  }

  // --- Pool management ---
  _acquire() {
    if (this.pool.length > 0) {
      const p = this.pool.pop();
      p.reset();
      p.active = true;
      this.active.push(p);
      return p;
    }
    // If pool empty, steal oldest active particle
    if (this.active.length > 0) {
      const p = this.active.shift();
      p.reset();
      p.active = true;
      this.active.push(p);
      return p;
    }
    return null;
  }

  _release(p) {
    p.active = false;
    this.pool.push(p);
  }

  // ==========================================
  //  EMITTERS
  // ==========================================

  emitHearts(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.HEART;
      p.x = x + rand(-20, 20);
      p.y = y + rand(-10, 10);
      p.vx = rand(-30, 30);
      p.vy = rand(-120, -50);
      p.ay = -10; // gentle upward drift
      p.size = rand(8, 20);
      p.rotation = rand(0, 360);
      p.rotationSpeed = rand(-90, 90);
      p.color = pick(HEART_COLORS);
      p.maxLife = rand(0.8, 1.6);
      p.driftAmplitude = rand(15, 40);
      p.driftFreq = rand(2, 4);
      p.driftPhase = rand(0, 360);
    }
  }

  emitSparkles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.SPARKLE;
      const angle = rand(0, 360);
      const speed = rand(40, 150);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.size = rand(3, 8);
      p.color = pick(SPARKLE_COLORS);
      p.maxLife = rand(0.4, 1.0);
      p.twinkleSpeed = rand(8, 16);
      p.twinklePhase = rand(0, 360);
      p.rotation = rand(0, 45);
    }
  }

  emitConfetti(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.CONFETTI;
      p.x = x + rand(-30, 30);
      p.y = y + rand(-20, 10);
      p.vx = rand(-80, 80);
      p.vy = rand(-180, -40);
      p.ay = 300; // gravity
      p.size = rand(4, 8);
      p.scaleX = rand(0.5, 1);
      p.scaleY = rand(0.3, 0.7);
      p.rotation = rand(0, 360);
      p.rotationSpeed = rand(-360, 360);
      p.color = pick(CONFETTI_COLORS);
      p.maxLife = rand(1.2, 2.5);
    }
  }

  emitExplosion(x, y, count = 16, color = '#ff6b6b') {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.EXPLOSION;
      const angle = (360 / count) * i + rand(-10, 10);
      const speed = rand(100, 280);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.ax = -p.vx * 1.5; // deceleration
      p.ay = -p.vy * 1.5;
      p.size = rand(3, 7);
      p.color = color;
      p.maxLife = rand(0.3, 0.8);
    }
  }

  emitPetals(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.PETAL;
      p.x = x + rand(-25, 25);
      p.y = y + rand(-15, 15);
      p.vx = rand(-20, 20);
      p.vy = rand(20, 80);
      p.ay = 15; // gentle gravity
      p.size = rand(6, 14);
      p.rotation = rand(0, 360);
      p.rotationSpeed = rand(-60, 60);
      p.color = pick(PETAL_COLORS);
      p.maxLife = rand(1.5, 3.0);
      p.driftAmplitude = rand(20, 50);
      p.driftFreq = rand(1.5, 3);
      p.driftPhase = rand(0, 360);
    }
  }

  emitSawdust(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.SAWDUST;
      const angle = rand(0, 360);
      const speed = rand(20, 80);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.ay = 40; // slight gravity
      p.size = rand(2, 5);
      p.color = pick(SAWDUST_COLORS);
      p.maxLife = rand(0.8, 2.0);
    }
  }

  emitSparks(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.SPARK;
      const angle = rand(0, 360);
      const speed = rand(150, 350);
      p.x = x; p.y = y;
      p.prevX = x; p.prevY = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.ay = 200; // gravity pulls sparks down
      p.size = rand(1.5, 3);
      p.color = pick(SPARK_COLORS);
      p.maxLife = rand(0.2, 0.6);
      p.tailLength = rand(8, 20);
    }
  }

  emitButterflies(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.BUTTERFLY;
      p.x = x + rand(-30, 30);
      p.y = y + rand(-20, 20);
      p.vx = rand(-40, 40);
      p.vy = rand(-60, -20);
      p.size = rand(8, 16);
      p.color = pick(BUTTERFLY_COLORS);
      p.maxLife = rand(2.0, 4.0);
      p.wingPhase = rand(0, 360);
      p.wingSpeed = rand(8, 14);
      p.driftAmplitude = rand(30, 60);
      p.driftFreq = rand(1, 2.5);
      p.driftPhase = rand(0, 360);
      p.rotation = rand(-15, 15);
    }
  }

  emitStarBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.STAR;
      const angle = (360 / count) * i;
      const speed = rand(80, 200);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.ax = -p.vx * 2;
      p.ay = -p.vy * 2;
      p.size = rand(5, 12);
      p.rotation = rand(0, 360);
      p.rotationSpeed = rand(-120, 120);
      p.color = pick(SPARKLE_COLORS);
      p.maxLife = rand(0.5, 1.2);
    }
  }

  emitFireworks(x, y, colors = null) {
    const palette = colors || [pick(CONFETTI_COLORS), pick(CONFETTI_COLORS), pick(SPARKLE_COLORS)];
    // Primary burst
    for (let i = 0; i < 24; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.FIREWORK;
      const angle = (360 / 24) * i + rand(-5, 5);
      const speed = rand(120, 250);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.ay = 80; // gravity drags trails down
      p.size = rand(2, 4);
      p.color = pick(palette);
      p.maxLife = rand(0.6, 1.3);
      p.tailLength = rand(4, 12);
      p.prevX = x; p.prevY = y;
    }
    // Inner sparkle ring
    for (let i = 0; i < 8; i++) {
      const p = this._acquire();
      if (!p) return;
      p.type = TYPES.SPARKLE;
      const angle = rand(0, 360);
      const speed = rand(30, 80);
      p.x = x; p.y = y;
      p.vx = fastCos(angle) * speed;
      p.vy = fastSin(angle) * speed;
      p.size = rand(2, 5);
      p.color = '#ffffff';
      p.maxLife = rand(0.3, 0.7);
      p.twinkleSpeed = rand(10, 20);
      p.twinklePhase = rand(0, 360);
    }
  }

  emitBeam(x1, y1, x2, y2, color = '#ffcc00') {
    const p = this._acquire();
    if (!p) return;
    p.type = TYPES.BEAM;
    p.x = x1; p.y = y1;
    p.x2 = x2; p.y2 = y2;
    p.color = color;
    p.maxLife = 0.4;
    p.width = 6;
    p.opacity = 1;
    // Emit sparkles along the beam
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.min(8, Math.max(3, (len / 40) | 0));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      this.emitSparkles(x1 + dx * t, y1 + dy * t, 2);
    }
  }

  emitShockwave(x, y, radius = 100) {
    const p = this._acquire();
    if (!p) return;
    p.type = TYPES.SHOCKWAVE;
    p.x = x; p.y = y;
    p.radius = 0;
    p.maxRadius = radius;
    p.maxLife = 0.5;
    p.color = '#ffffff';
    p.width = 4;
  }

  emitRainbow(x, y) {
    const p = this._acquire();
    if (!p) return;
    p.type = TYPES.RAINBOW;
    p.x = x; p.y = y;
    p.maxLife = 1.5;
    p.size = 80; // arc radius
    p.arcProgress = 0;
    p.opacity = 0;
    // Also emit sparkles at base
    this.emitSparkles(x - 60, y, 4);
    this.emitSparkles(x + 60, y, 4);
  }

  emitFloatingText(x, y, text, color = '#ffffff', size = 20) {
    const p = this._acquire();
    if (!p) return;
    p.type = TYPES.TEXT;
    p.x = x; p.y = y;
    p.vy = -60;
    p.text = text;
    p.color = color;
    p.fontSize = size;
    p.maxLife = 1.2;
    p.scaleX = 0.5; // will scale up
  }

  emitTrail(x, y, color = '#ffcc00') {
    const p = this._acquire();
    if (!p) return;
    p.type = TYPES.TRAIL;
    p.x = x + rand(-3, 3);
    p.y = y + rand(-3, 3);
    p.size = rand(2, 5);
    p.color = color;
    p.maxLife = rand(0.3, 0.6);
    p.vy = rand(-10, 10);
    p.vx = rand(-10, 10);
  }

  // ==========================================
  //  AMBIENT (Continuous) EFFECTS
  // ==========================================

  startAmbientHearts() {
    this.stopAmbient();
    this.ambientType = 'hearts';
    this._runAmbient();
  }

  startAmbientSparkles() {
    this.stopAmbient();
    this.ambientType = 'sparkles';
    this._runAmbient();
  }

  startAmbientPetals() {
    this.stopAmbient();
    this.ambientType = 'petals';
    this._runAmbient();
  }

  startAmbientSawdust() {
    this.stopAmbient();
    this.ambientType = 'sawdust';
    this._runAmbient();
  }

  stopAmbient() {
    this.ambientType = null;
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  _runAmbient() {
    const canvas = this.ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    const spawn = () => {
      if (!this.ambientType) return;
      const x = rand(0, w);
      switch (this.ambientType) {
        case 'hearts': {
          const p = this._acquire();
          if (!p) return;
          p.type = TYPES.HEART;
          p.x = x; p.y = h + 10;
          p.vy = rand(-40, -20);
          p.vx = rand(-10, 10);
          p.size = rand(6, 12);
          p.rotation = rand(0, 360);
          p.rotationSpeed = rand(-30, 30);
          p.color = pick(HEART_COLORS);
          p.maxLife = rand(4, 8);
          p.driftAmplitude = rand(10, 25);
          p.driftFreq = rand(1, 2);
          p.driftPhase = rand(0, 360);
          break;
        }
        case 'sparkles': {
          const p = this._acquire();
          if (!p) return;
          p.type = TYPES.SPARKLE;
          p.x = x; p.y = rand(0, h);
          p.size = rand(2, 5);
          p.color = pick(SPARKLE_COLORS);
          p.maxLife = rand(0.8, 2.0);
          p.twinkleSpeed = rand(6, 12);
          p.twinklePhase = rand(0, 360);
          break;
        }
        case 'petals': {
          const p = this._acquire();
          if (!p) return;
          p.type = TYPES.PETAL;
          p.x = x; p.y = -10;
          p.vy = rand(15, 40);
          p.vx = rand(-5, 5);
          p.ay = 5;
          p.size = rand(5, 10);
          p.rotation = rand(0, 360);
          p.rotationSpeed = rand(-30, 30);
          p.color = pick(PETAL_COLORS);
          p.maxLife = rand(5, 10);
          p.driftAmplitude = rand(15, 35);
          p.driftFreq = rand(0.8, 1.5);
          p.driftPhase = rand(0, 360);
          break;
        }
        case 'sawdust': {
          const p = this._acquire();
          if (!p) return;
          p.type = TYPES.SAWDUST;
          p.x = x; p.y = -5;
          p.vy = rand(10, 30);
          p.vx = rand(-8, 8);
          p.ay = 10;
          p.size = rand(1.5, 3.5);
          p.color = pick(SAWDUST_COLORS);
          p.maxLife = rand(4, 8);
          break;
        }
      }
    };

    this.ambientTimer = setInterval(spawn, 300);
  }

  // ==========================================
  //  UPDATE
  // ==========================================

  update(deltaTime) {
    const dt = Math.min(deltaTime, 0.05); // clamp to prevent spiral
    const canvas = this.ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;
    const margin = 50;

    let i = this.active.length;
    while (i--) {
      const p = this.active[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.active.splice(i, 1);
        this._release(p);
        continue;
      }

      const t = p.life / p.maxLife; // normalized 0..1

      // Store previous position for trails
      if (p.type === TYPES.SPARK || p.type === TYPES.FIREWORK) {
        p.prevX = p.x;
        p.prevY = p.y;
      }

      // Physics
      p.vx += p.ax * dt;
      p.vy += p.ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;

      // Type-specific updates
      switch (p.type) {
        case TYPES.HEART:
          p.opacity = 1 - easeOutCubic(t);
          // Sine-wave horizontal drift
          p.x += p.driftAmplitude * fastSin(p.driftPhase + p.life * p.driftFreq * 360) * dt;
          break;

        case TYPES.SPARKLE:
          p.opacity = (1 - t) * (0.5 + 0.5 * fastSin(p.twinklePhase + p.life * p.twinkleSpeed * 360));
          p.size *= (1 - 0.3 * dt); // shrink
          break;

        case TYPES.CONFETTI:
          p.opacity = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2;
          // Tumble effect via oscillating scaleX
          p.scaleX = 0.3 + 0.7 * Math.abs(fastSin(p.life * 200));
          break;

        case TYPES.EXPLOSION:
          p.opacity = 1 - easeOutQuad(t);
          break;

        case TYPES.PETAL:
          p.opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
          p.x += p.driftAmplitude * fastSin(p.driftPhase + p.life * p.driftFreq * 360) * dt;
          break;

        case TYPES.SAWDUST:
          p.opacity = 1 - easeOutQuad(t);
          break;

        case TYPES.SPARK:
          p.opacity = 1 - t;
          break;

        case TYPES.BUTTERFLY:
          p.opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
          p.wingPhase += p.wingSpeed * dt * 360;
          p.x += p.driftAmplitude * fastSin(p.driftPhase + p.life * p.driftFreq * 360) * dt;
          p.vy += fastSin(p.life * 120) * 20 * dt; // flutter vertical
          break;

        case TYPES.STAR:
          p.opacity = 1 - easeOutCubic(t);
          break;

        case TYPES.FIREWORK:
          p.opacity = 1 - easeOutCubic(t);
          // Slow down
          p.vx *= (1 - 1.5 * dt);
          p.vy *= (1 - 1.5 * dt);
          break;

        case TYPES.BEAM:
          p.opacity = 1 - easeOutQuad(t);
          p.width = 6 * (1 - t);
          break;

        case TYPES.SHOCKWAVE:
          p.radius = p.maxRadius * easeOutCubic(t);
          p.opacity = 1 - easeOutQuad(t);
          p.width = 4 * (1 - t * 0.5);
          break;

        case TYPES.RAINBOW:
          p.arcProgress = easeOutCubic(Math.min(t * 2, 1));
          p.opacity = t < 0.6 ? easeOutQuad(Math.min(t * 3, 1)) : 1 - easeOutQuad((t - 0.6) / 0.4);
          break;

        case TYPES.TEXT:
          p.opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
          p.scaleX = 0.5 + 0.5 * easeOutBounce(Math.min(t * 3, 1));
          break;

        case TYPES.TRAIL:
          p.opacity = 1 - easeOutQuad(t);
          p.size *= (1 - 2 * dt);
          break;
      }

      // Cull off-screen particles (with margin)
      if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) {
        // Exception: ambient particles that haven't entered yet
        if (p.life > 0.5) {
          this.active.splice(i, 1);
          this._release(p);
        }
      }
    }
  }

  // ==========================================
  //  RENDER
  // ==========================================

  render() {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0, len = this.active.length; i < len; i++) {
      const p = this.active[i];
      if (p.opacity <= 0.01) continue;

      // Quick off-screen check
      if (p.type !== TYPES.BEAM && p.type !== TYPES.SHOCKWAVE && p.type !== TYPES.RAINBOW) {
        if (p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) continue;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

      switch (p.type) {
        case TYPES.HEART:
          this._drawHeart(ctx, p);
          break;
        case TYPES.SPARKLE:
          this._drawSparkle(ctx, p);
          break;
        case TYPES.CONFETTI:
          this._drawConfetti(ctx, p);
          break;
        case TYPES.EXPLOSION:
          this._drawCircle(ctx, p);
          break;
        case TYPES.PETAL:
          this._drawPetal(ctx, p);
          break;
        case TYPES.SAWDUST:
          this._drawCircle(ctx, p);
          break;
        case TYPES.SPARK:
          this._drawSpark(ctx, p);
          break;
        case TYPES.BUTTERFLY:
          this._drawButterfly(ctx, p);
          break;
        case TYPES.STAR:
          this._drawStar(ctx, p);
          break;
        case TYPES.FIREWORK:
          this._drawSpark(ctx, p); // same as spark with tail
          break;
        case TYPES.BEAM:
          this._drawBeam(ctx, p);
          break;
        case TYPES.SHOCKWAVE:
          this._drawShockwave(ctx, p);
          break;
        case TYPES.RAINBOW:
          this._drawRainbow(ctx, p);
          break;
        case TYPES.TEXT:
          this._drawText(ctx, p);
          break;
        case TYPES.TRAIL:
          this._drawCircle(ctx, p);
          break;
      }
    }

    ctx.globalAlpha = 1;
  }

  // ==========================================
  //  DRAW HELPERS
  // ==========================================

  _drawHeart(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    const s = p.size / 2;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.bezierCurveTo(0, -s * 0.2, -s, -s * 0.6, -s, s * 0.05);
    ctx.bezierCurveTo(-s, s * 0.6, 0, s * 0.9, 0, s * 1.2);
    ctx.bezierCurveTo(0, s * 0.9, s, s * 0.6, s, s * 0.05);
    ctx.bezierCurveTo(s, -s * 0.6, 0, -s * 0.2, 0, s * 0.4);
    ctx.fill();
    ctx.restore();
  }

  _drawSparkle(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    const s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    // 4-point star
    for (let i = 0; i < 4; i++) {
      const outerAngle = (Math.PI / 2) * i - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 4;
      const ox = Math.cos(outerAngle) * s;
      const oy = Math.sin(outerAngle) * s;
      const ix = Math.cos(innerAngle) * s * 0.3;
      const iy = Math.sin(innerAngle) * s * 0.3;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawConfetti(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.scale(p.scaleX, p.scaleY);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
    ctx.restore();
  }

  _drawCircle(ctx, p) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
    ctx.fill();
  }

  _drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawSpark(ctx, p) {
    // Bright dot with tail line
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(0.5, p.size);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.prevX, p.prevY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    // Bright head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawButterfly(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    const s = p.size;
    const wingAngle = Math.sin(p.wingPhase * Math.PI / 180) * 0.6;
    ctx.fillStyle = p.color;
    // Left wing
    ctx.save();
    ctx.scale(Math.cos(wingAngle), 1);
    ctx.beginPath();
    ctx.ellipse(-s * 0.3, 0, s * 0.5, s * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Right wing
    ctx.save();
    ctx.scale(Math.cos(wingAngle + 0.5), 1);
    ctx.beginPath();
    ctx.ellipse(s * 0.3, 0, s * 0.5, s * 0.35, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Body
    ctx.fillStyle = '#333';
    ctx.fillRect(-1, -s * 0.3, 2, s * 0.6);
    ctx.restore();
  }

  _drawStar(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    const s = p.size;
    const points = 5;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? s : s * 0.4;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawBeam(ctx, p) {
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.width;
    ctx.lineCap = 'round';
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.width * 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x2, p.y2);
    ctx.stroke();
    // Inner bright line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = p.width * 0.4;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x2, p.y2);
    ctx.stroke();
    ctx.restore();
  }

  _drawShockwave(ctx, p) {
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.width;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0, p.radius), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawRainbow(ctx, p) {
    const RAINBOW_COLORS = [
      '#ff0000', '#ff7700', '#ffff00', '#00cc00', '#0077ff', '#8800ff'
    ];
    ctx.save();
    ctx.translate(p.x, p.y);
    const baseR = p.size;
    const bandWidth = 4;
    const endAngle = Math.PI * p.arcProgress;
    for (let i = 0; i < RAINBOW_COLORS.length; i++) {
      ctx.strokeStyle = RAINBOW_COLORS[i];
      ctx.lineWidth = bandWidth;
      ctx.beginPath();
      ctx.arc(0, 0, baseR - i * bandWidth, Math.PI, Math.PI + endAngle);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawText(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const scale = p.scaleX;
    ctx.scale(scale, scale);
    ctx.font = `bold ${p.fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(p.text, 0, 0);
    // Fill
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
  }

  // ==========================================
  //  UTILITY
  // ==========================================

  clear() {
    while (this.active.length > 0) {
      this._release(this.active.pop());
    }
  }

  getActiveCount() {
    return this.active.length;
  }
}
