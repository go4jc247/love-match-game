// renderer.js — Love Match: Match-3 Rendering & Animation Engine
// Vanilla JS + HTML5 Canvas, ES6 module

// ── Tile Definitions ────────────────────────────────────────────────

const THEMES = {
  wife: [
    { name: 'kitten',  emoji: '\u{1F431}', colors: ['#FFB6C1', '#FF69B4'] },
    { name: 'heart',   emoji: '\u{2764}\u{FE0F}',  colors: ['#FF4D6D', '#C9184A'] },
    { name: 'rose',    emoji: '\u{1F339}', colors: ['#E63946', '#9D0208'] },
    { name: 'ring',    emoji: '\u{1F48D}', colors: ['#FFD700', '#DAA520'] },
    { name: 'dove',    emoji: '\u{1F54A}\u{FE0F}',  colors: ['#E0FBFC', '#98C1D9'] },
    { name: 'cake',    emoji: '\u{1F382}', colors: ['#FFCCD5', '#FF8FA3'] },
    { name: 'bouquet', emoji: '\u{1F490}', colors: ['#FF85A1', '#F9844A'] },
    { name: 'gift',    emoji: '\u{1F381}', colors: ['#C77DFF', '#9D4EDD'] },
  ],
  husband: [
    { name: 'hammer',  emoji: '\u{1F528}', colors: ['#6C757D', '#495057'] },
    { name: 'saw',     emoji: '\u{1FA9A}', colors: ['#ADB5BD', '#6C757D'] },
    { name: 'drill',   emoji: '\u{1F527}', colors: ['#457B9D', '#1D3557'] },
    { name: 'wrench',  emoji: '\u{1F529}', colors: ['#A8DADC', '#457B9D'] },
    { name: 'log',     emoji: '\u{1FAB5}', colors: ['#8B5E3C', '#5C3D2E'] },
    { name: 'axe',     emoji: '\u{1FA93}', colors: ['#BC4749', '#A7333F'] },
    { name: 'bolt',    emoji: '\u{26A1}',  colors: ['#FFD60A', '#FFC300'] },
    { name: 'plank',   emoji: '\u{1FAB5}', colors: ['#D4A373', '#A67C52'] },
  ],
};

// ── Easing Functions ────────────────────────────────────────────────

const ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => t * (2 - t),
  inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  outCubic: t => (--t) * t * t + 1,
  outBack: t => { const s = 1.70158; return (--t) * t * ((s + 1) * t + s) + 1; },
  outBounce: t => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  outElastic: t => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },
};

// ── Particle System ─────────────────────────────────────────────────

class Particle {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.vx = opts.vx ?? (Math.random() - 0.5) * 4;
    this.vy = opts.vy ?? (Math.random() - 0.5) * 4;
    this.gravity = opts.gravity ?? 0.05;
    this.life = opts.life ?? 1.0;
    this.decay = opts.decay ?? (0.01 + Math.random() * 0.02);
    this.size = opts.size ?? (2 + Math.random() * 4);
    this.color = opts.color ?? `hsl(${Math.random() * 360}, 80%, 60%)`;
    this.shape = opts.shape ?? 'circle'; // circle, star, heart, square
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
    this.alpha = Math.max(0, this.life);
    this.rotation += this.rotationSpeed;
    this.size *= 0.995;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'star':
        this._drawStar(ctx, this.size);
        break;
      case 'heart':
        this._drawHeart(ctx, this.size);
        break;
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }

  _drawStar(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.3);
    ctx.fill();
  }
}

class ParticleEmitter {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, opts = {}) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, {
        ...opts,
        vx: opts.vx !== undefined ? opts.vx + (Math.random() - 0.5) * (opts.spread ?? 2)
          : (Math.random() - 0.5) * (opts.spread ?? 4),
        vy: opts.vy !== undefined ? opts.vy + (Math.random() - 0.5) * (opts.spread ?? 2)
          : (Math.random() - 0.5) * (opts.spread ?? 4),
        color: opts.colors
          ? opts.colors[Math.floor(Math.random() * opts.colors.length)]
          : opts.color,
        shape: opts.shapes
          ? opts.shapes[Math.floor(Math.random() * opts.shapes.length)]
          : opts.shape,
      }));
    }
  }

  /** Burst radially outward */
  burst(x, y, count, opts = {}) {
    const speed = opts.speed ?? 5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const v = speed * (0.5 + Math.random() * 0.5);
      this.particles.push(new Particle(x, y, {
        ...opts,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        color: opts.colors
          ? opts.colors[Math.floor(Math.random() * opts.colors.length)]
          : opts.color,
        shape: opts.shapes
          ? opts.shapes[Math.floor(Math.random() * opts.shapes.length)]
          : opts.shape,
      }));
    }
  }

  update() {
    this.particles = this.particles.filter(p => p.update());
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  get active() {
    return this.particles.length > 0;
  }

  clear() {
    this.particles.length = 0;
  }
}

// ── Animation Helpers ───────────────────────────────────────────────

function animate(duration, tick, easeFn = ease.outQuad) {
  return new Promise(resolve => {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      const t = easeFn(raw);
      tick(t, raw);
      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

// ── Score / Combo Popups ────────────────────────────────────────────

class FloatingText {
  constructor(text, x, y, opts = {}) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.startY = y;
    this.life = 1.0;
    this.decay = opts.decay ?? 0.015;
    this.fontSize = opts.fontSize ?? 24;
    this.color = opts.color ?? '#FFD700';
    this.stroke = opts.stroke ?? '#000';
    this.rise = opts.rise ?? 60;
    this.scale = 0;
    this.maxScale = opts.maxScale ?? 1.0;
  }

  update() {
    this.life -= this.decay;
    const progress = 1 - this.life;
    this.y = this.startY - this.rise * progress;
    // Pop in then shrink out
    if (progress < 0.2) {
      this.scale = ease.outBack(progress / 0.2) * this.maxScale;
    } else {
      this.scale = this.maxScale * this.life;
    }
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.font = `bold ${this.fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = this.stroke;
    ctx.strokeText(this.text, 0, 0);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

// ── Main Renderer Class ─────────────────────────────────────────────

const GRID_SIZE = 8;
const TILE_GAP = 4;
const CORNER_RADIUS = 10;
const BG_COLORS_WIFE = ['#FFF0F5', '#FFE4E1'];
const BG_COLORS_HUSBAND = ['#2B2D42', '#1B1B2F'];

export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {'wife'|'husband'} theme
   */
  constructor(canvas, theme = 'wife') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.theme = theme;
    this.tiles = THEMES[theme];
    this.state = null; // { board: number[][], score, level, ... }

    // Layout (recomputed on resize)
    this._computeLayout();

    // Systems
    this.particles = new ParticleEmitter();
    this.floatingTexts = [];
    this.animOverrides = new Map(); // key `r,c` → { x, y, scale, alpha }
    this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };

    // Selection / hints
    this.selectedTile = null;  // { row, col }
    this.hintTiles = [];
    this.lastInteraction = performance.now();
    this.hintActive = false;

    // Background animation state
    this._bgPhase = 0;
    this._bgHearts = this._initBgHearts(20);

    // Special tile animation counters
    this._frame = 0;

    // Input
    this._clickCb = null;
    this._swipeCb = null;
    this._setupInput();

    // Render loop
    this._running = true;
    this._boundLoop = this._loop.bind(this);
    requestAnimationFrame(this._boundLoop);
  }

  // ── Public API ──────────────────────────────────────────────────

  setGameState(state) {
    this.state = state;
    this.lastInteraction = performance.now();
    this.hintActive = false;
  }

  setTheme(theme) {
    this.theme = theme;
    this.tiles = THEMES[theme];
  }

  onClick(callback) {
    this._clickCb = callback;
  }

  onSwipe(callback) {
    this._swipeCb = callback;
  }

  // ── Animations (return Promises) ────────────────────────────────

  /** Smooth swap of two tiles */
  animateSwap(from, to) {
    const keyA = `${from.row},${from.col}`;
    const keyB = `${to.row},${to.col}`;
    const posA = this._tileCenter(from.row, from.col);
    const posB = this._tileCenter(to.row, to.col);

    return animate(300, t => {
      this.animOverrides.set(keyA, {
        x: posA.x + (posB.x - posA.x) * t,
        y: posA.y + (posB.y - posA.y) * t,
      });
      this.animOverrides.set(keyB, {
        x: posB.x + (posA.x - posB.x) * t,
        y: posB.y + (posA.y - posB.y) * t,
      });
    }, ease.inOutQuad).then(() => {
      this.animOverrides.delete(keyA);
      this.animOverrides.delete(keyB);
    });
  }

  /** Match tiles: scale up, flash, dissolve + particles */
  animateMatch(tiles) {
    const keys = tiles.map(t => `${t.row},${t.col}`);

    // Emit particles at each tile
    for (const t of tiles) {
      const pos = this._tileCenter(t.row, t.col);
      const tileDef = this.tiles[t.type ?? 0];
      this.particles.burst(pos.x, pos.y, 12, {
        colors: tileDef ? tileDef.colors : ['#FFF', '#FFD700'],
        speed: 3,
        size: 3,
        decay: 0.02,
        shapes: ['circle', 'star'],
      });
    }

    return animate(400, t => {
      for (const key of keys) {
        if (t < 0.3) {
          // Scale up + flash
          const s = 1 + 0.3 * ease.outQuad(t / 0.3);
          this.animOverrides.set(key, { scale: s, alpha: 1 });
        } else {
          // Dissolve
          const dissolve = (t - 0.3) / 0.7;
          this.animOverrides.set(key, { scale: 1 + 0.3 - dissolve * 0.5, alpha: 1 - dissolve });
        }
      }
    }, ease.linear).then(() => {
      for (const key of keys) this.animOverrides.delete(key);
    });
  }

  /** Cascade: tiles fall to new positions with bounce */
  animateCascade(movements) {
    // movements: [{ row, col, fromRow, fromCol }]
    const data = movements.map(m => ({
      key: `${m.row},${m.col}`,
      from: this._tileCenter(m.fromRow, m.fromCol),
      to: this._tileCenter(m.row, m.col),
    }));

    return animate(450, t => {
      for (const d of data) {
        this.animOverrides.set(d.key, {
          x: d.from.x + (d.to.x - d.from.x) * t,
          y: d.from.y + (d.to.y - d.from.y) * t,
        });
      }
    }, ease.outBounce).then(() => {
      for (const d of data) this.animOverrides.delete(d.key);
    });
  }

  /** New tiles dropping in from above */
  animateNewTiles(tiles) {
    const data = tiles.map(t => {
      const to = this._tileCenter(t.row, t.col);
      return {
        key: `${t.row},${t.col}`,
        fromY: this.boardY - this.tileSize,
        toY: to.y,
        x: to.x,
      };
    });

    return animate(500, t => {
      for (const d of data) {
        this.animOverrides.set(d.key, {
          x: d.x,
          y: d.fromY + (d.toY - d.fromY) * t,
          scale: 0.5 + 0.5 * t,
        });
      }
    }, ease.outBounce).then(() => {
      for (const d of data) this.animOverrides.delete(d.key);
    });
  }

  /** Powerup creation: flash + particle burst */
  animatePowerup(type, row, col) {
    const pos = this._tileCenter(row, col);
    const key = `${row},${col}`;

    // Big particle burst
    this.particles.burst(pos.x, pos.y, 30, {
      colors: ['#FFD700', '#FFF', '#FF6B6B', '#4ECDC4'],
      speed: 6,
      size: 4,
      decay: 0.015,
      shapes: ['star', 'circle'],
    });

    return animate(500, t => {
      if (t < 0.3) {
        // White flash expanding
        const s = 1 + 2 * ease.outQuad(t / 0.3);
        this.animOverrides.set(key, { scale: s, flash: true });
      } else {
        // Settle
        const settle = (t - 0.3) / 0.7;
        const s = 3 - 2 * ease.outElastic(settle);
        this.animOverrides.set(key, { scale: Math.max(1, s), flash: false });
      }
    }, ease.linear).then(() => {
      this.animOverrides.delete(key);
    });
  }

  /** Powerup activation animations */
  animatePowerupActivation(type, row, col) {
    const pos = this._tileCenter(row, col);
    const key = `${row},${col}`;

    switch (type) {
      case 'rocket_h':
      case 'rocket_v':
        return this._animateRocketBeam(type, pos, key);
      case 'bomb':
        return this._animateBombExplosion(pos, key);
      case 'star':
        return this._animateStarRays(pos, key);
      default:
        return this.animatePowerup(type, row, col);
    }
  }

  /** Level complete: confetti shower */
  animateLevelComplete() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    let elapsed = 0;

    return new Promise(resolve => {
      const interval = setInterval(() => {
        for (let i = 0; i < 8; i++) {
          this.particles.emit(Math.random() * w, -10, 1, {
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 3,
            gravity: 0.02,
            life: 1.5,
            decay: 0.005,
            size: 4 + Math.random() * 6,
            colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#9B5DE5', '#F15BB5'],
            shapes: ['square', 'circle', 'heart', 'star'],
          });
        }
        elapsed += 50;
        if (elapsed > 3000) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  /** Combo text popup */
  showComboText(combo) {
    const texts = ['Nice!', 'Great!', 'AMAZING!', 'SPECTACULAR!', 'LEGENDARY!'];
    const idx = Math.min(combo - 2, texts.length - 1);
    if (idx < 0) return;

    const cx = this.boardX + (this.tileSize * GRID_SIZE) / 2;
    const cy = this.boardY + (this.tileSize * GRID_SIZE) / 2;

    this.floatingTexts.push(new FloatingText(texts[idx], cx, cy, {
      fontSize: 36 + combo * 4,
      color: '#FFD700',
      stroke: '#8B0000',
      decay: 0.008,
      rise: 80,
      maxScale: 1.2 + combo * 0.1,
    }));

    // Screen shake scales with combo
    if (combo >= 3) {
      this.screenShake.intensity = Math.min(8, combo * 2);
    }
  }

  /** Score popup at board coordinates */
  showScorePopup(score, x, y) {
    const canvasPos = this._tileCenter(y, x); // x = col, y = row
    this.floatingTexts.push(new FloatingText(`+${score}`, canvasPos.x, canvasPos.y, {
      fontSize: 20 + Math.min(score / 50, 16),
      color: '#FFFFFF',
      stroke: '#333',
      decay: 0.012,
      rise: 50,
    }));
  }

  /** Main render — called internally by rAF loop */
  render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    this._frame++;

    // Recompute layout if canvas resized
    if (this._lastW !== w || this._lastH !== h) {
      this._computeLayout();
    }

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Screen shake offset
    this._updateShake();
    ctx.translate(this.screenShake.x, this.screenShake.y);

    this._drawBackground(ctx, w, h);
    this._drawBoard(ctx);
    this._drawSelectionHighlight(ctx);
    this._drawHint(ctx);

    // Particles & floating text
    this.particles.update();
    this.particles.draw(ctx);
    this.floatingTexts = this.floatingTexts.filter(ft => ft.update());
    for (const ft of this.floatingTexts) ft.draw(ctx);

    ctx.restore();
  }

  destroy() {
    this._running = false;
    this._removeInput();
  }

  // ── Private: Layout ─────────────────────────────────────────────

  _computeLayout() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this._lastW = w;
    this._lastH = h;

    const maxBoardSize = Math.min(w, h) * 0.85;
    this.tileSize = Math.floor(maxBoardSize / GRID_SIZE);
    const boardPx = this.tileSize * GRID_SIZE;
    this.boardX = Math.floor((w - boardPx) / 2);
    this.boardY = Math.floor((h - boardPx) / 2) + 20; // slight offset for score area
  }

  _tileCenter(row, col) {
    return {
      x: this.boardX + col * this.tileSize + this.tileSize / 2,
      y: this.boardY + row * this.tileSize + this.tileSize / 2,
    };
  }

  _tileFromPixel(px, py) {
    const col = Math.floor((px - this.boardX) / this.tileSize);
    const row = Math.floor((py - this.boardY) / this.tileSize);
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  }

  // ── Private: Background ─────────────────────────────────────────

  _initBgHearts(count) {
    const hearts = [];
    for (let i = 0; i < count; i++) {
      hearts.push({
        x: Math.random(),
        y: Math.random(),
        size: 6 + Math.random() * 14,
        speed: 0.0002 + Math.random() * 0.0005,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.05 + Math.random() * 0.1,
      });
    }
    return hearts;
  }

  _drawBackground(ctx, w, h) {
    this._bgPhase += 0.005;
    const bgCols = this.theme === 'wife' ? BG_COLORS_WIFE : BG_COLORS_HUSBAND;

    // Animated gradient
    const shift = Math.sin(this._bgPhase) * 0.2;
    const grad = ctx.createLinearGradient(0, 0, w * (0.5 + shift), h);
    grad.addColorStop(0, bgCols[0]);
    grad.addColorStop(1, bgCols[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating hearts / sparkles
    const now = performance.now() / 1000;
    ctx.save();
    for (const heart of this._bgHearts) {
      const x = heart.x * w + Math.sin(now * 0.5 + heart.phase) * 30;
      const y = ((heart.y + now * heart.speed) % 1.2 - 0.1) * h;
      ctx.globalAlpha = heart.alpha;
      ctx.font = `${heart.size}px serif`;
      ctx.fillText(this.theme === 'wife' ? '\u{2764}\u{FE0F}' : '\u{2B50}', x, y);
    }
    ctx.restore();
  }

  // ── Private: Board & Tiles ──────────────────────────────────────

  _drawBoard(ctx) {
    if (!this.state || !this.state.board) return;
    const { board } = this.state;

    // Board shadow / backing
    const boardPx = this.tileSize * GRID_SIZE;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this._roundRect(ctx, this.boardX - 6, this.boardY - 6, boardPx + 12, boardPx + 12, 16);
    ctx.fill();
    ctx.restore();

    // Draw each tile
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = board[r][c];
        if (val === null || val === undefined || val < 0) continue;

        const key = `${r},${c}`;
        const override = this.animOverrides.get(key);

        const center = this._tileCenter(r, c);
        const drawX = override?.x ?? center.x;
        const drawY = override?.y ?? center.y;
        const scale = override?.scale ?? 1;
        const alpha = override?.alpha ?? 1;
        const flash = override?.flash ?? false;

        this._drawTile(ctx, drawX, drawY, val, scale, alpha, flash);
      }
    }
  }

  _drawTile(ctx, cx, cy, tileValue, scale = 1, alpha = 1, flash = false) {
    const half = (this.tileSize - TILE_GAP) / 2;
    const tileDef = this.tiles[tileValue % this.tiles.length];
    if (!tileDef) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Rounded background with gradient
    const grad = ctx.createLinearGradient(-half, -half, half, half);
    grad.addColorStop(0, tileDef.colors[0]);
    grad.addColorStop(1, tileDef.colors[1]);
    ctx.fillStyle = flash ? '#FFF' : grad;
    this._roundRect(ctx, -half, -half, half * 2, half * 2, CORNER_RADIUS);
    ctx.fill();

    // Subtle inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this._roundRect(ctx, -half + 2, -half + 2, half * 2 - 4, half * 0.8, CORNER_RADIUS - 2);
    ctx.fill();

    // Special tile effects
    if (tileValue >= 100) {
      this._drawSpecialEffect(ctx, tileValue, half);
    }

    // Emoji
    const emojiSize = Math.floor(this.tileSize * 0.5);
    ctx.font = `${emojiSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tileDef.emoji, 0, 2);

    ctx.restore();
  }

  _drawSpecialEffect(ctx, tileValue, half) {
    const t = this._frame / 60;

    if (tileValue >= 100 && tileValue < 200) {
      // Rocket: animated arrows
      const isHorizontal = tileValue < 150;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      const offset = (Math.sin(t * 4) + 1) * 5;
      if (isHorizontal) {
        this._drawArrow(ctx, -half + offset, 0, -half + offset + 10, 0);
        this._drawArrow(ctx, half - offset, 0, half - offset - 10, 0);
      } else {
        this._drawArrow(ctx, 0, -half + offset, 0, -half + offset + 10);
        this._drawArrow(ctx, 0, half - offset, 0, half - offset - 10);
      }
    } else if (tileValue >= 200 && tileValue < 300) {
      // Rainbow star: pulsing rainbow border
      const hue = (t * 120) % 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 8 + Math.sin(t * 3) * 4;
      this._roundRect(ctx, -half, -half, half * 2, half * 2, CORNER_RADIUS);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (tileValue >= 300) {
      // Bomb: pulsing glow
      const glowSize = 4 + Math.sin(t * 5) * 3;
      ctx.shadowColor = 'rgba(255,100,0,0.8)';
      ctx.shadowBlur = glowSize + 6;
      ctx.strokeStyle = 'rgba(255,150,0,0.5)';
      ctx.lineWidth = 2;
      this._roundRect(ctx, -half, -half, half * 2, half * 2, CORNER_RADIUS);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  _drawArrow(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.lineTo(x2 - 5 * Math.cos(angle - 0.5), y2 - 5 * Math.sin(angle - 0.5));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 5 * Math.cos(angle + 0.5), y2 - 5 * Math.sin(angle + 0.5));
    ctx.stroke();
  }

  // ── Private: Selection & Hints ──────────────────────────────────

  _drawSelectionHighlight(ctx) {
    if (!this.selectedTile) return;
    const { row, col } = this.selectedTile;
    const center = this._tileCenter(row, col);
    const half = (this.tileSize - TILE_GAP) / 2 + 3;
    const pulse = Math.sin(this._frame * 0.1) * 2;

    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10 + pulse;
    this._roundRect(ctx, center.x - half, center.y - half, half * 2, half * 2, CORNER_RADIUS + 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawHint(ctx) {
    // Activate hint after 5 seconds of inactivity
    const idle = performance.now() - this.lastInteraction;
    if (idle < 5000 || this.hintTiles.length === 0) {
      this.hintActive = false;
      return;
    }
    this.hintActive = true;

    const pulse = 0.85 + Math.sin(this._frame * 0.08) * 0.15;
    ctx.save();
    for (const { row, col } of this.hintTiles) {
      const center = this._tileCenter(row, col);
      const half = (this.tileSize - TILE_GAP) / 2;
      ctx.globalAlpha = 0.3 + Math.sin(this._frame * 0.08) * 0.15;
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.translate(center.x, center.y);
      ctx.scale(pulse, pulse);
      this._roundRect(ctx, -half, -half, half * 2, half * 2, CORNER_RADIUS);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    }
    ctx.restore();
  }

  // ── Private: Powerup Activation Animations ──────────────────────

  _animateRocketBeam(type, pos, key) {
    const isH = type === 'rocket_h';
    const boardPx = this.tileSize * GRID_SIZE;

    return animate(600, t => {
      const beamLen = t * (isH ? boardPx : boardPx);
      // Draw beam via particles
      if (t < 0.8 && this._frame % 2 === 0) {
        const spread = isH
          ? { vx: (Math.random() - 0.5) * beamLen * 0.1, vy: (Math.random() - 0.5) * 2 }
          : { vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * beamLen * 0.1 };
        this.particles.emit(pos.x, pos.y, 3, {
          ...spread,
          colors: ['#FFD700', '#FFF', '#FF6B6B'],
          size: 2 + Math.random() * 3,
          decay: 0.03,
          life: 0.8,
          gravity: 0,
        });
      }
      this.animOverrides.set(key, { scale: 1 + 0.2 * (1 - t) });
    }, ease.outCubic).then(() => {
      this.animOverrides.delete(key);
    });
  }

  _animateBombExplosion(pos, key) {
    // Shockwave ring drawn via particles + screen shake
    this.screenShake.intensity = 6;

    this.particles.burst(pos.x, pos.y, 40, {
      colors: ['#FF6B00', '#FF0', '#FFF', '#FF3300'],
      speed: 8,
      size: 5,
      decay: 0.015,
      gravity: 0.05,
      shapes: ['circle', 'star'],
    });

    return animate(600, t => {
      this.animOverrides.set(key, { scale: 1 + 3 * t, alpha: 1 - t });
      // Shockwave ring particles
      if (t < 0.5 && this._frame % 3 === 0) {
        const radius = t * this.tileSize * 3;
        const count = 8;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          this.particles.emit(
            pos.x + Math.cos(angle) * radius,
            pos.y + Math.sin(angle) * radius,
            1,
            { size: 2, decay: 0.04, gravity: 0, life: 0.5, color: '#FF8800' }
          );
        }
      }
    }, ease.outCubic).then(() => {
      this.animOverrides.delete(key);
    });
  }

  _animateStarRays(pos, key) {
    const rayCount = 8;

    return animate(800, t => {
      this.animOverrides.set(key, {
        scale: 1 + 0.5 * Math.sin(t * Math.PI),
        flash: t < 0.3,
      });

      // Rays shoot outward
      if (t < 0.6 && this._frame % 2 === 0) {
        for (let i = 0; i < rayCount; i++) {
          const angle = (Math.PI * 2 * i) / rayCount;
          const dist = t * this.tileSize * 4;
          this.particles.emit(
            pos.x + Math.cos(angle) * dist,
            pos.y + Math.sin(angle) * dist,
            1,
            {
              vx: Math.cos(angle) * 2,
              vy: Math.sin(angle) * 2,
              color: `hsl(${(i * 45 + this._frame * 5) % 360}, 100%, 60%)`,
              size: 3,
              decay: 0.025,
              gravity: 0,
            }
          );
        }
      }
    }, ease.outCubic).then(() => {
      this.animOverrides.delete(key);
    });
  }

  // ── Private: Screen Shake ───────────────────────────────────────

  _updateShake() {
    if (this.screenShake.intensity > 0.1) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.intensity *= this.screenShake.decay;
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
      this.screenShake.intensity = 0;
    }
  }

  // ── Private: Canvas Utilities ───────────────────────────────────

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Private: Input Handling ─────────────────────────────────────

  _setupInput() {
    this._pointerStart = null;
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);

    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.style.touchAction = 'none'; // prevent scroll on touch
  }

  _removeInput() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
  }

  _getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _handlePointerDown(e) {
    this._pointerStart = { ...this._getPointerPos(e), time: performance.now() };
    this.lastInteraction = performance.now();
  }

  _handlePointerMove(e) {
    if (!this._pointerStart) return;

    const pos = this._getPointerPos(e);
    const dx = pos.x - this._pointerStart.x;
    const dy = pos.y - this._pointerStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Swipe threshold
    if (dist > this.tileSize * 0.4) {
      const tile = this._tileFromPixel(this._pointerStart.x, this._pointerStart.y);
      if (tile && this._swipeCb) {
        let direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        this._swipeCb({ row: tile.row, col: tile.col, direction });
        this.lastInteraction = performance.now();
      }
      this._pointerStart = null; // consume the gesture
    }
  }

  _handlePointerUp(e) {
    if (!this._pointerStart) return;

    const pos = this._getPointerPos(e);
    const dx = pos.x - this._pointerStart.x;
    const dy = pos.y - this._pointerStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tap (not swipe)
    if (dist < this.tileSize * 0.3) {
      const tile = this._tileFromPixel(pos.x, pos.y);
      if (tile) {
        if (this._clickCb) {
          this._clickCb(tile);
        }
        this.selectedTile = tile;
        this.lastInteraction = performance.now();
      }
    }

    this._pointerStart = null;
  }

  // ── Private: Render Loop ────────────────────────────────────────

  _loop(timestamp) {
    if (!this._running) return;
    this.render();
    requestAnimationFrame(this._boundLoop);
  }
}

export default Renderer;
