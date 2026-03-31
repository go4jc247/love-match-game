// Love Match - UI Overlay Manager
// Manages all HTML-based UI overlays on top of the canvas game.

// ============================================================
// UIManager
// ============================================================

export class UIManager {
  constructor(container) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.screens = new Map();
    this.activeScreens = new Set();
    this.actionCallback = null;
    this.toastQueue = [];
    this.toastActive = false;

    this._injectBaseStyles();
    this._createOverlayRoot();
  }

  // ----------------------------------------------------------
  // Internals
  // ----------------------------------------------------------

  _createOverlayRoot() {
    this.root = document.createElement('div');
    this.root.className = 'lm-ui-root';
    this.container.appendChild(this.root);

    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'lm-toast-container';
    this.container.appendChild(this.toastContainer);
  }

  _injectBaseStyles() {
    if (document.getElementById('lm-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'lm-ui-styles';
    style.textContent = BASE_STYLES;
    document.head.appendChild(style);
  }

  _emit(action, data = {}) {
    if (this.actionCallback) {
      this.actionCallback({ action, ...data });
    }
  }

  _el(tag, className, attrs = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') {
        el.textContent = v;
      } else if (k === 'html') {
        el.innerHTML = v;
      } else {
        el.setAttribute(k, v);
      }
    });
    return el;
  }

  _append(parent, ...children) {
    children.forEach(c => {
      if (c) parent.appendChild(c);
    });
    return parent;
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  onScreenAction(callback) {
    this.actionCallback = callback;
  }

  showScreen(screenName, data = {}) {
    const builder = this._screenBuilders[screenName];
    if (!builder) {
      console.warn(`UIManager: unknown screen "${screenName}"`);
      return;
    }

    // Hide all other screens first (one screen at a time, like Royal Match)
    this.hideAllScreens();

    const panel = builder.call(this, data);
    panel.classList.add('lm-screen', `lm-screen--${screenName}`);
    panel.dataset.screen = screenName;

    this.root.appendChild(panel);
    this.screens.set(screenName, panel);
    this.activeScreens.add(screenName);

    // Show immediately — transition animations were unreliable
    panel.classList.add('lm-screen--visible');

    return panel;
  }

  hideScreen(screenName, immediate = false) {
    const panel = this.screens.get(screenName);
    if (!panel) return;

    if (immediate) {
      panel.remove();
      this.screens.delete(screenName);
      this.activeScreens.delete(screenName);
      return;
    }

    panel.classList.remove('lm-screen--visible');
    panel.classList.add('lm-screen--exiting');

    const onEnd = () => {
      panel.removeEventListener('transitionend', onEnd);
      panel.remove();
      this.screens.delete(screenName);
      this.activeScreens.delete(screenName);
    };

    panel.addEventListener('transitionend', onEnd);

    // Fallback removal if transition doesn't fire
    setTimeout(onEnd, 600);
  }

  hideAllScreens(immediate = true) {
    for (const name of [...this.activeScreens]) {
      this.hideScreen(name, immediate);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const toast = this._el('div', `lm-toast lm-toast--${type}`);
    const icon = type === 'love' ? '\u2764\ufe0f'
      : type === 'success' ? '\u2705'
      : type === 'gift' ? '\ud83c\udf81'
      : type === 'verse' ? '\ud83d\udcd6'
      : '\ud83d\udd14';
    toast.innerHTML = `<span class="lm-toast__icon">${icon}</span><span class="lm-toast__msg">${message}</span>`;
    this.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('lm-toast--visible'));
    });

    setTimeout(() => {
      toast.classList.remove('lm-toast--visible');
      toast.classList.add('lm-toast--exiting');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  showConfirmDialog(title, message, onConfirm) {
    const overlay = this._el('div', 'lm-screen lm-confirm-overlay');

    const box = this._el('div', 'lm-confirm-box');
    const h = this._el('h2', 'lm-confirm-title', { text: title });
    const p = this._el('p', 'lm-confirm-msg', { text: message });
    const btnRow = this._el('div', 'lm-confirm-btns');

    const btnCancel = this._el('button', 'lm-btn lm-btn--secondary', { text: 'Cancel' });
    btnCancel.onclick = () => {
      this._removeOverlay(overlay);
      this._emit('confirmCancel');
    };

    const btnOk = this._el('button', 'lm-btn lm-btn--primary', { text: 'Confirm' });
    btnOk.onclick = () => {
      this._removeOverlay(overlay);
      if (onConfirm) onConfirm();
      this._emit('confirmOk');
    };

    this._append(btnRow, btnCancel, btnOk);
    this._append(box, h, p, btnRow);
    this._append(overlay, box);
    this.root.appendChild(overlay);

    overlay.classList.add('lm-screen--visible');
  }

  _removeOverlay(el) {
    el.classList.remove('lm-screen--visible');
    el.classList.add('lm-screen--exiting');
    setTimeout(() => el.remove(), 500);
  }

  // ----------------------------------------------------------
  // HUD Updates
  // ----------------------------------------------------------

  updateHUD(gameState) {
    const hud = this.screens.get('hud');
    if (!hud) return;

    const level = hud.querySelector('.lm-hud__level');
    const score = hud.querySelector('.lm-hud__score-val');
    const moves = hud.querySelector('.lm-hud__moves-val');
    const starBar = hud.querySelector('.lm-hud__star-fill');
    const combo = hud.querySelector('.lm-hud__combo');

    if (level) level.textContent = `Level ${gameState.level || 1}`;
    if (score) score.textContent = gameState.score || 0;
    if (moves) moves.textContent = gameState.movesRemaining || 0;
    if (starBar) {
      const pct = Math.min(100, ((gameState.score || 0) / (gameState.starThresholds?.[2] || 1)) * 100);
      starBar.style.width = `${pct}%`;
    }
    if (combo) {
      if (gameState.combo > 1) {
        combo.textContent = `${gameState.combo}x Combo!`;
        combo.classList.add('lm-hud__combo--active');
      } else {
        combo.classList.remove('lm-hud__combo--active');
      }
    }
  }

  updateGoalProgress(goals) {
    const goalContainer = this.root.querySelector('.lm-hud__goals');
    if (!goalContainer) return;

    goalContainer.innerHTML = '';
    goals.forEach(goal => {
      const item = this._el('div', 'lm-hud__goal-item');
      item.innerHTML = `
        <span class="lm-hud__goal-icon">${goal.icon || '\ud83c\udfaf'}</span>
        <span class="lm-hud__goal-count">${goal.current}/${goal.target}</span>
      `;
      if (goal.current >= goal.target) item.classList.add('lm-hud__goal-item--done');
      goalContainer.appendChild(item);
    });
  }

  showLevelComplete(stars, score, verse) {
    this.showScreen('levelComplete', { stars, score, verse });
  }

  showGameOver(options = {}) {
    this.showScreen('gameOver', options);
  }

  createLevelMap(levels, progress) {
    this.showScreen('levelMap', { levels, progress });
  }

  // ----------------------------------------------------------
  // Screen Builders
  // ----------------------------------------------------------

  get _screenBuilders() {
    return {
      welcome: (data) => this._buildWelcome(data),
      mainMenu: (data) => this._buildMainMenu(data),
      levelMap: (data) => this._buildLevelMap(data),
      hud: (data) => this._buildHUD(data),
      levelComplete: (data) => this._buildLevelComplete(data),
      gameOver: (data) => this._buildGameOver(data),
      settings: (data) => this._buildSettings(data),
      loveNotes: (data) => this._buildLoveNotes(data),
      spouseDashboard: (data) => this._buildSpouseDashboard(data),
    };
  }

  // -------- 1. Welcome / Profile Screen --------

  _buildWelcome(data) {
    const screen = this._el('div', 'lm-welcome');

    // Animated background
    const bg = this._el('div', 'lm-welcome__bg');
    for (let i = 0; i < 20; i++) {
      const heart = this._el('span', 'lm-welcome__floating-heart');
      heart.textContent = '\u2764';
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 6}s`;
      heart.style.animationDuration = `${4 + Math.random() * 4}s`;
      heart.style.fontSize = `${12 + Math.random() * 24}px`;
      bg.appendChild(heart);
    }
    screen.appendChild(bg);

    const content = this._el('div', 'lm-welcome__content');

    const logo = this._el('h1', 'lm-welcome__title', { html: '\u2764\ufe0f Love Match \u2764\ufe0f' });
    const subtitle = this._el('p', 'lm-welcome__subtitle', { text: 'A Match-3 Journey for Two' });

    // Role picker
    const roleSection = this._el('div', 'lm-welcome__roles');
    const roleTitle = this._el('p', 'lm-welcome__role-label', { text: 'I am the...' });

    const wifeBtn = this._el('button', 'lm-welcome__role-btn lm-welcome__role-btn--wife');
    wifeBtn.innerHTML = `<span class="lm-welcome__role-icon">\ud83d\udc69</span><span>Wife</span>`;
    wifeBtn.onclick = () => this._selectRole(screen, 'wife');

    const husbandBtn = this._el('button', 'lm-welcome__role-btn lm-welcome__role-btn--husband');
    husbandBtn.innerHTML = `<span class="lm-welcome__role-icon">\ud83d\udc68</span><span>Husband</span>`;
    husbandBtn.onclick = () => this._selectRole(screen, 'husband');

    this._append(roleSection, roleTitle, wifeBtn, husbandBtn);

    // Name input (hidden until role chosen)
    const nameSection = this._el('div', 'lm-welcome__name-section lm-hidden');
    const nameLabel = this._el('label', 'lm-welcome__label', { text: 'Your Name' });
    const nameInput = this._el('input', 'lm-input', { type: 'text', placeholder: 'Enter your name...' });
    nameInput.dataset.field = 'name';
    this._append(nameSection, nameLabel, nameInput);

    // Pair code (hidden until role chosen)
    const codeSection = this._el('div', 'lm-welcome__code-section lm-hidden');
    const codeLabel = this._el('label', 'lm-welcome__label', { text: 'Pair Code' });
    const codeRow = this._el('div', 'lm-welcome__code-row');
    const codeInput = this._el('input', 'lm-input', { type: 'text', placeholder: 'Enter or generate code...' });
    codeInput.value = 'peace-peace-664'; // default during development
    codeInput.dataset.field = 'pairCode';
    const codeGenBtn = this._el('button', 'lm-btn lm-btn--small', { text: 'Generate' });
    codeGenBtn.onclick = () => {
      const code = this._generatePairCode();
      codeInput.value = code;
    };
    this._append(codeRow, codeInput, codeGenBtn);
    this._append(codeSection, codeLabel, codeRow);

    // Start button (hidden)
    const startBtn = this._el('button', 'lm-btn lm-btn--primary lm-btn--large lm-welcome__start lm-hidden', { text: 'Begin Your Journey' });
    startBtn.onclick = () => {
      const role = screen.dataset.selectedRole;
      const name = nameInput.value.trim();
      const pairCode = codeInput.value.trim();
      if (!name) { nameInput.classList.add('lm-input--error'); return; }
      this._emit('welcome:start', { role, name, pairCode });
    };

    this._append(content, logo, subtitle, roleSection, nameSection, codeSection, startBtn);
    screen.appendChild(content);
    return screen;
  }

  _selectRole(screen, role) {
    screen.dataset.selectedRole = role;
    const btns = screen.querySelectorAll('.lm-welcome__role-btn');
    btns.forEach(b => b.classList.remove('lm-welcome__role-btn--selected'));
    const selected = screen.querySelector(`.lm-welcome__role-btn--${role}`);
    if (selected) selected.classList.add('lm-welcome__role-btn--selected');

    // Reveal name/code/start
    screen.querySelector('.lm-welcome__name-section')?.classList.remove('lm-hidden');
    screen.querySelector('.lm-welcome__code-section')?.classList.remove('lm-hidden');
    screen.querySelector('.lm-welcome__start')?.classList.remove('lm-hidden');

    // Update theme hint
    screen.classList.toggle('lm-welcome--wife', role === 'wife');
    screen.classList.toggle('lm-welcome--husband', role === 'husband');
  }

  _generatePairCode() {
    const words = ['love', 'grace', 'hope', 'faith', 'joy', 'peace', 'light', 'dove', 'bloom', 'star'];
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    return `${w1}-${w2}-${num}`;
  }

  // -------- 2. Main Menu --------

  _buildMainMenu(data = {}) {
    const screen = this._el('div', 'lm-main-menu');

    const header = this._el('div', 'lm-main-menu__header');
    const title = this._el('h1', 'lm-main-menu__title', { html: '\u2764\ufe0f Love Match' });
    const settingsBtn = this._el('button', 'lm-icon-btn lm-main-menu__settings', { html: '\u2699\ufe0f' });
    settingsBtn.onclick = () => this._emit('menu:settings');
    this._append(header, title, settingsBtn);

    // Spouse progress bar
    const spouseBar = this._el('div', 'lm-main-menu__spouse-bar');
    const spouseLabel = this._el('span', 'lm-main-menu__spouse-label', {
      text: data.spouseName ? `${data.spouseName}'s progress` : 'Spouse progress'
    });
    const spouseProgress = this._el('div', 'lm-main-menu__spouse-track');
    const spouseFill = this._el('div', 'lm-main-menu__spouse-fill');
    spouseFill.style.width = `${data.spouseProgress || 0}%`;
    this._append(spouseProgress, spouseFill);
    this._append(spouseBar, spouseLabel, spouseProgress);

    // Play button
    const playBtn = this._el('button', 'lm-btn lm-btn--primary lm-btn--large lm-main-menu__play');
    playBtn.innerHTML = `<span class="lm-btn__icon">\u25b6</span> Play`;
    playBtn.onclick = () => this._emit('menu:play');

    // Feature grid
    const grid = this._el('div', 'lm-main-menu__grid');

    const bibleBtn = this._buildMenuTile('\ud83d\udcd6', 'Bible Reading', data.bibleStreak ? `${data.bibleStreak} day streak` : null);
    bibleBtn.onclick = () => this._emit('menu:bible');

    const notesBtn = this._buildMenuTile('\ud83d\udc8c', 'Love Notes', data.unreadNotes ? `${data.unreadNotes}` : null);
    notesBtn.onclick = () => this._emit('menu:loveNotes');

    const quizBtn = this._buildMenuTile('\u2753', 'Quizzes', null);
    quizBtn.onclick = () => this._emit('menu:quizzes');

    const dashBtn = this._buildMenuTile('\ud83d\udc91', 'Us', null);
    dashBtn.onclick = () => this._emit('menu:spouseDashboard');

    this._append(grid, bibleBtn, notesBtn, quizBtn, dashBtn);

    // Daily suggestion card
    const daily = this._el('div', 'lm-main-menu__daily');
    daily.innerHTML = `
      <div class="lm-main-menu__daily-label">\ud83c\udf39 Today's Suggestion</div>
      <p class="lm-main-menu__daily-text">${data.dailySuggestion || 'Write a short love note and leave it somewhere your spouse will find.'}</p>
    `;

    this._append(screen, header, spouseBar, playBtn, grid, daily);
    return screen;
  }

  _buildMenuTile(icon, label, badge) {
    const tile = this._el('button', 'lm-menu-tile');
    tile.innerHTML = `<span class="lm-menu-tile__icon">${icon}</span><span class="lm-menu-tile__label">${label}</span>`;
    if (badge) {
      const b = this._el('span', 'lm-badge', { text: badge });
      tile.appendChild(b);
    }
    return tile;
  }

  // -------- 3. Level Select Map --------

  _buildLevelMap(data = {}) {
    const screen = this._el('div', 'lm-level-map');

    const header = this._el('div', 'lm-level-map__header');
    const backBtn = this._el('button', 'lm-icon-btn', { html: '\u2190' });
    backBtn.onclick = () => this._emit('levelMap:back');
    const title = this._el('h2', 'lm-level-map__title', { text: 'Level Map' });
    this._append(header, backBtn, title);

    const scrollArea = this._el('div', 'lm-level-map__scroll');
    const path = this._el('div', 'lm-level-map__path');

    const levels = data.levels || [];
    const progress = data.progress || {};

    const chapters = [
      { name: 'The Beginning', from: 1, to: 10 },
      { name: 'Growing Together', from: 11, to: 20 },
      { name: 'Through the Storm', from: 21, to: 30 },
      { name: 'Stronger in Love', from: 31, to: 40 },
      { name: 'Eternal Bond', from: 41, to: 50 },
    ];

    let chapterIdx = 0;

    levels.forEach((level, i) => {
      const num = level.id || level.number || (i + 1);

      // Insert chapter banner if needed
      if (chapterIdx < chapters.length && num >= chapters[chapterIdx].from) {
        const banner = this._el('div', 'lm-level-map__chapter', { text: chapters[chapterIdx].name });
        path.appendChild(banner);
        chapterIdx++;
      }

      const node = this._el('div', 'lm-level-map__node');
      const stars = progress[num]?.stars || 0;
      const unlocked = progress[num]?.unlocked !== false;
      const isCurrent = num === (data.currentLevel || 1);

      if (!unlocked) node.classList.add('lm-level-map__node--locked');
      if (isCurrent) node.classList.add('lm-level-map__node--current');
      if (stars === 3) node.classList.add('lm-level-map__node--perfect');

      node.innerHTML = `
        <div class="lm-level-map__node-circle">${unlocked ? num : '\ud83d\udd12'}</div>
        <div class="lm-level-map__node-stars">${this._starDisplay(stars)}</div>
      `;

      if (unlocked) {
        node.onclick = () => this._emit('levelMap:select', { level: num });
      }

      // Zigzag offset for visual path
      node.style.marginLeft = (i % 2 === 0) ? '20%' : '50%';

      path.appendChild(node);
    });

    scrollArea.appendChild(path);
    this._append(screen, header, scrollArea);

    // Auto-scroll to current level
    requestAnimationFrame(() => {
      const current = scrollArea.querySelector('.lm-level-map__node--current');
      if (current) current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    return screen;
  }

  _starDisplay(count) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += i < count ? '\u2b50' : '\u2606';
    }
    return s;
  }

  // -------- 4. Game HUD --------

  _buildHUD(data = {}) {
    const screen = this._el('div', 'lm-hud');
    screen.classList.add('lm-hud--transparent');

    // Top bar
    const topBar = this._el('div', 'lm-hud__top');
    const levelLabel = this._el('span', 'lm-hud__level', { text: `Level ${data.level || 1}` });

    const scoreBox = this._el('div', 'lm-hud__score');
    scoreBox.innerHTML = `<span class="lm-hud__score-label">Score</span><span class="lm-hud__score-val">${data.score || 0}</span>`;

    const movesBox = this._el('div', 'lm-hud__moves');
    movesBox.innerHTML = `<span class="lm-hud__moves-label">Moves</span><span class="lm-hud__moves-val">${data.movesRemaining || 0}</span>`;

    const pauseBtn = this._el('button', 'lm-icon-btn lm-hud__pause', { html: '\u23f8' });
    pauseBtn.onclick = () => this._emit('hud:pause');

    // Star progress
    const starTrack = this._el('div', 'lm-hud__star-track');
    starTrack.innerHTML = `
      <span class="lm-hud__star-marker" style="left:0%">\u2606</span>
      <span class="lm-hud__star-marker" style="left:33%">\u2b50</span>
      <span class="lm-hud__star-marker" style="left:66%">\u2b50\u2b50</span>
      <span class="lm-hud__star-marker" style="left:95%">\u2b50\u2b50\u2b50</span>
      <div class="lm-hud__star-fill"></div>
    `;

    this._append(topBar, levelLabel, scoreBox, movesBox, pauseBtn);

    // Goals
    const goals = this._el('div', 'lm-hud__goals');

    // Combo counter
    const combo = this._el('div', 'lm-hud__combo');

    // Bottom powerup bar
    const powerupBar = this._el('div', 'lm-hud__powerups');
    const powerups = data.powerups || [
      { id: 'hammer', icon: '\ud83d\udd28', count: 3 },
      { id: 'shuffle', icon: '\ud83d\udd00', count: 2 },
      { id: 'extraMoves', icon: '\u2795', count: 1 },
    ];
    powerups.forEach(pu => {
      const btn = this._el('button', 'lm-hud__pu-btn');
      btn.innerHTML = `<span class="lm-hud__pu-icon">${pu.icon}</span><span class="lm-hud__pu-count">${pu.count}</span>`;
      btn.onclick = () => this._emit('hud:usePowerup', { powerup: pu.id });
      if (pu.count <= 0) btn.classList.add('lm-hud__pu-btn--empty');
      powerupBar.appendChild(btn);
    });

    this._append(screen, topBar, starTrack, goals, combo, powerupBar);
    return screen;
  }

  // -------- 5. Level Complete Overlay --------

  _buildLevelComplete(data = {}) {
    const screen = this._el('div', 'lm-level-complete');

    const box = this._el('div', 'lm-level-complete__box');
    const title = this._el('h2', 'lm-level-complete__title', { text: 'Level Complete!' });

    // Stars
    const starsRow = this._el('div', 'lm-level-complete__stars');
    for (let i = 1; i <= 3; i++) {
      const star = this._el('span', 'lm-level-complete__star');
      star.textContent = i <= (data.stars || 0) ? '\u2b50' : '\u2606';
      star.style.animationDelay = `${i * 0.3}s`;
      if (i <= (data.stars || 0)) star.classList.add('lm-level-complete__star--earned');
      starsRow.appendChild(star);
    }

    // Score
    const scoreBox = this._el('div', 'lm-level-complete__score');
    scoreBox.innerHTML = `<span>Score</span><strong>${data.score || 0}</strong>`;

    // Verse unlocked
    let verseBanner = null;
    if (data.verse) {
      verseBanner = this._el('div', 'lm-level-complete__verse');
      verseBanner.innerHTML = `
        <div class="lm-level-complete__verse-badge">\ud83d\udcd6 Bible Verse Unlocked!</div>
        <p class="lm-level-complete__verse-text">"${data.verse.text}"</p>
        <p class="lm-level-complete__verse-ref">\u2014 ${data.verse.reference}</p>
      `;
    }

    // Buttons
    const btnRow = this._el('div', 'lm-level-complete__btns');
    const menuBtn = this._el('button', 'lm-btn lm-btn--secondary', { text: 'Menu' });
    menuBtn.onclick = () => this._emit('levelComplete:menu');
    const nextBtn = this._el('button', 'lm-btn lm-btn--primary', { text: 'Next Level' });
    nextBtn.onclick = () => this._emit('levelComplete:next');
    const shareBtn = this._el('button', 'lm-btn lm-btn--love', { html: '\ud83d\udc8c Share with Spouse' });
    shareBtn.onclick = () => this._emit('levelComplete:share', { score: data.score, stars: data.stars });

    this._append(btnRow, menuBtn, nextBtn);
    this._append(box, title, starsRow, scoreBox, verseBanner, btnRow, shareBtn);
    screen.appendChild(box);
    return screen;
  }

  // -------- 6. Game Over Overlay --------

  _buildGameOver(data = {}) {
    const screen = this._el('div', 'lm-game-over');

    const box = this._el('div', 'lm-game-over__box');
    const title = this._el('h2', 'lm-game-over__title', { text: 'Out of Moves!' });
    const subtitle = this._el('p', 'lm-game-over__sub', { text: "Don't give up \u2014 love perseveres!" });

    // Extra moves option
    const extraBtn = this._el('button', 'lm-btn lm-btn--primary lm-btn--large lm-game-over__extra');
    const extraCount = data.extraMovesAvailable || 0;
    extraBtn.innerHTML = `\u2795 Use Extra Moves (${extraCount} left)`;
    extraBtn.onclick = () => this._emit('gameOver:extraMoves');
    if (extraCount <= 0) extraBtn.disabled = true;

    // Retry / menu
    const btnRow = this._el('div', 'lm-game-over__btns');
    const retryBtn = this._el('button', 'lm-btn lm-btn--secondary', { text: 'Retry' });
    retryBtn.onclick = () => this._emit('gameOver:retry');
    const menuBtn = this._el('button', 'lm-btn lm-btn--secondary', { text: 'Menu' });
    menuBtn.onclick = () => this._emit('gameOver:menu');
    this._append(btnRow, retryBtn, menuBtn);

    // Ask spouse
    const askBtn = this._el('button', 'lm-btn lm-btn--love', { html: '\ud83d\udc8c Ask Spouse for Help' });
    askBtn.onclick = () => this._emit('gameOver:askSpouse');

    this._append(box, title, subtitle, extraBtn, btnRow, askBtn);
    screen.appendChild(box);
    return screen;
  }

  // -------- 7. Settings --------

  _buildSettings(data = {}) {
    const screen = this._el('div', 'lm-settings');

    const header = this._el('div', 'lm-settings__header');
    const backBtn = this._el('button', 'lm-icon-btn', { html: '\u2190' });
    backBtn.onclick = () => this._emit('settings:back');
    const title = this._el('h2', 'lm-settings__title', { text: 'Settings' });
    this._append(header, backBtn, title);

    const list = this._el('div', 'lm-settings__list');

    const soundRow = this._buildToggle('Sound Effects', data.soundOn !== false, (v) => this._emit('settings:sound', { enabled: v }));
    const musicRow = this._buildToggle('Music', data.musicOn !== false, (v) => this._emit('settings:music', { enabled: v }));

    // Theme selector
    const themeRow = this._el('div', 'lm-settings__row');
    themeRow.innerHTML = `<span class="lm-settings__label">Theme</span>`;
    const themeSelect = this._el('select', 'lm-select');
    ['Classic', 'Rose Garden', 'Starlight', 'Ocean Breeze'].forEach(t => {
      const opt = this._el('option', null, { text: t, value: t.toLowerCase().replace(/\s/g, '_') });
      themeSelect.appendChild(opt);
    });
    if (data.theme) themeSelect.value = data.theme;
    themeSelect.onchange = () => this._emit('settings:theme', { theme: themeSelect.value });
    themeRow.appendChild(themeSelect);

    // Action buttons
    const resetBtn = this._el('button', 'lm-btn lm-btn--danger lm-settings__action', { text: 'Reset Progress' });
    resetBtn.onclick = () => {
      this.showConfirmDialog('Reset Progress', 'Are you sure? This cannot be undone.', () => {
        this._emit('settings:resetProgress');
      });
    };

    const exportBtn = this._el('button', 'lm-btn lm-btn--secondary lm-settings__action', { text: 'Export Data' });
    exportBtn.onclick = () => this._emit('settings:export');

    const importBtn = this._el('button', 'lm-btn lm-btn--secondary lm-settings__action', { text: 'Import Data' });
    importBtn.onclick = () => this._emit('settings:import');

    const aboutBtn = this._el('button', 'lm-btn lm-btn--secondary lm-settings__action', { text: 'About Love Match' });
    aboutBtn.onclick = () => this._emit('settings:about');

    this._append(list, soundRow, musicRow, themeRow);

    // Music Track Assignment section
    if (data.musicTracks && data.screenNames) {
      const musicSection = this._el('div', 'lm-settings__music-section');
      const musicTitle = this._el('h3', 'lm-settings__section-title', { text: '\ud83c\udfb5 Screen Music' });
      musicSection.appendChild(musicTitle);

      const screenLabels = {
        mainMenu: 'Main Menu',
        levelMap: 'Level Map',
        gameplay: 'Gameplay',
        bible: 'Bible Reading',
        loveNotes: 'Love Notes',
        quizzes: 'Quizzes',
        us: 'Us / Spouse',
        settings: 'Settings',
      };

      for (const screenName of data.screenNames) {
        const row = this._el('div', 'lm-settings__music-row');
        const label = this._el('span', 'lm-settings__music-label', {
          text: screenLabels[screenName] || screenName
        });

        const select = this._el('select', 'lm-select lm-select--small');
        const noneOpt = this._el('option', null, { text: 'None', value: 'none' });
        select.appendChild(noneOpt);

        for (const track of data.musicTracks) {
          const opt = this._el('option', null, { text: track.label, value: track.id });
          select.appendChild(opt);
        }

        const currentTrack = data.screenMusicMap[screenName] || 'none';
        select.value = currentTrack;

        select.onchange = () => {
          this._emit('settings:musicMap', { screen: screenName, trackId: select.value });
        };

        this._append(row, label, select);
        musicSection.appendChild(row);
      }

      list.appendChild(musicSection);
    }

    this._append(list, resetBtn, exportBtn, importBtn, aboutBtn);
    this._append(screen, header, list);
    return screen;
  }

  _buildToggle(label, initialValue, onChange) {
    const row = this._el('div', 'lm-settings__row');
    const labelEl = this._el('span', 'lm-settings__label', { text: label });
    const toggle = this._el('button', `lm-toggle ${initialValue ? 'lm-toggle--on' : ''}`);
    toggle.innerHTML = `<span class="lm-toggle__knob"></span>`;
    toggle.onclick = () => {
      const isOn = toggle.classList.toggle('lm-toggle--on');
      onChange(isOn);
    };
    this._append(row, labelEl, toggle);
    return row;
  }

  // -------- 8. Love Notes Inbox --------

  _buildLoveNotes(data = {}) {
    const screen = this._el('div', 'lm-love-notes');

    const header = this._el('div', 'lm-love-notes__header');
    const backBtn = this._el('button', 'lm-icon-btn', { html: '\u2190' });
    backBtn.onclick = () => this._emit('loveNotes:back');
    const title = this._el('h2', 'lm-love-notes__title', { html: '\ud83d\udc8c Love Notes' });
    this._append(header, backBtn, title);

    // Tabs
    const tabs = this._el('div', 'lm-love-notes__tabs');
    const inboxTab = this._el('button', 'lm-tab lm-tab--active', { text: 'Inbox' });
    const sentTab = this._el('button', 'lm-tab', { text: 'Sent' });
    const composeBtn = this._el('button', 'lm-btn lm-btn--primary lm-btn--small', { html: '\u270f\ufe0f Compose' });
    composeBtn.onclick = () => this._showComposeNote(screen);

    inboxTab.onclick = () => {
      inboxTab.classList.add('lm-tab--active');
      sentTab.classList.remove('lm-tab--active');
      this._showNoteList(listArea, data.inbox || [], 'inbox');
    };
    sentTab.onclick = () => {
      sentTab.classList.add('lm-tab--active');
      inboxTab.classList.remove('lm-tab--active');
      this._showNoteList(listArea, data.sent || [], 'sent');
    };

    this._append(tabs, inboxTab, sentTab, composeBtn);

    // Note list area
    const listArea = this._el('div', 'lm-love-notes__list');
    this._showNoteList(listArea, data.inbox || [], 'inbox');

    this._append(screen, header, tabs, listArea);
    return screen;
  }

  _showNoteList(container, notes, type) {
    container.innerHTML = '';
    if (notes.length === 0) {
      const empty = this._el('div', 'lm-love-notes__empty');
      empty.textContent = type === 'inbox' ? 'No love notes yet. Ask your spouse to send one!' : 'You haven\'t sent any notes yet.';
      container.appendChild(empty);
      return;
    }
    notes.forEach(note => {
      const item = this._el('div', `lm-love-notes__item ${note.read ? '' : 'lm-love-notes__item--unread'}`);
      item.innerHTML = `
        <span class="lm-love-notes__envelope">${note.read ? '\ud83d\udce8' : '\ud83d\udc8c'}</span>
        <div class="lm-love-notes__preview">
          <strong>${note.from || 'Your Spouse'}</strong>
          <p>${note.preview || note.text?.substring(0, 60) || ''}</p>
        </div>
        <span class="lm-love-notes__time">${note.time || ''}</span>
      `;
      item.onclick = () => this._emit('loveNotes:open', { noteId: note.id });
      container.appendChild(item);
    });
  }

  _showComposeNote(screen) {
    let composer = screen.querySelector('.lm-love-notes__composer');
    if (composer) { composer.remove(); return; }

    composer = this._el('div', 'lm-love-notes__composer');

    const textarea = this._el('textarea', 'lm-textarea', { placeholder: 'Write something sweet...' });
    textarea.rows = 4;

    // Decoration picker
    const decoRow = this._el('div', 'lm-love-notes__decos');
    const decos = ['\u2764\ufe0f', '\ud83c\udf39', '\ud83e\udee7', '\ud83d\udc8b', '\u2728', '\ud83c\udf3b', '\ud83e\udd70', '\ud83d\udc95'];
    decos.forEach(d => {
      const btn = this._el('button', 'lm-love-notes__deco-btn', { text: d });
      btn.onclick = () => { textarea.value += ` ${d}`; };
      decoRow.appendChild(btn);
    });

    const sendBtn = this._el('button', 'lm-btn lm-btn--primary', { text: 'Send Note' });
    sendBtn.onclick = () => {
      const text = textarea.value.trim();
      if (!text) return;
      this._emit('loveNotes:send', { text });
      composer.remove();
    };

    this._append(composer, textarea, decoRow, sendBtn);
    screen.appendChild(composer);
  }

  // -------- 9. Spouse Dashboard --------

  _buildSpouseDashboard(data = {}) {
    const screen = this._el('div', 'lm-spouse-dash');

    const header = this._el('div', 'lm-spouse-dash__header');
    const backBtn = this._el('button', 'lm-icon-btn', { html: '\u2190' });
    backBtn.onclick = () => this._emit('spouseDash:back');
    const title = this._el('h2', 'lm-spouse-dash__title', { html: '\ud83d\udc91 Us' });
    this._append(header, backBtn, title);

    // ── Connection Setup Section ──
    const syncStatus = data.syncStatus || {}; // { configured, gistId, role, hasToken, polling }
    const connSection = this._el('div', 'lm-spouse-dash__connect');

    if (syncStatus.configured) {
      // Connected state
      connSection.innerHTML = `
        <div class="lm-spouse-dash__conn-status lm-spouse-dash__conn-status--ok">
          <span class="lm-spouse-dash__conn-dot"></span>
          <span>Connected as <strong>${syncStatus.role}</strong></span>
        </div>
        <p class="lm-spouse-dash__conn-code">Channel: <code>${(syncStatus.gistId || '').slice(0, 8)}...</code></p>
      `;
      const disconnectBtn = this._el('button', 'lm-btn lm-btn--small lm-btn--outline', { text: 'Disconnect' });
      disconnectBtn.onclick = () => this._emit('spouseDash:disconnect');
      connSection.appendChild(disconnectBtn);
    } else {
      // Not connected — show setup
      connSection.innerHTML = `
        <h3 class="lm-spouse-dash__section-title">\ud83d\udd17 Connect to Spouse</h3>
        <p class="lm-spouse-dash__conn-info">Connect your phones to share progress, send love notes, and gift powerups!</p>
        <div class="lm-spouse-dash__conn-form">
          <label class="lm-spouse-dash__label">GitHub Token <span style="font-size:0.75em;color:#999">(gist scope)</span></label>
          <input class="lm-input" type="password" placeholder="ghp_xxxxxxxxxxxx" id="sync-token-input" autocomplete="off" />
          <p class="lm-spouse-dash__token-help">
            <a href="https://github.com/settings/tokens/new?scopes=gist&description=LoveMatch" target="_blank" rel="noopener">Get a token here</a> (check "gist" only)
          </p>
        </div>
      `;

      const btnRow = this._el('div', 'lm-spouse-dash__conn-btns');

      const createBtn = this._el('button', 'lm-btn lm-btn--primary', { html: '\ud83d\udce1 Create Channel' });
      createBtn.onclick = () => {
        const token = document.getElementById('sync-token-input')?.value?.trim();
        if (!token) { alert('Please enter your GitHub token first'); return; }
        this._emit('spouseDash:createChannel', { token });
      };

      const joinSection = this._el('div', 'lm-spouse-dash__join-section');
      joinSection.innerHTML = `
        <label class="lm-spouse-dash__label">Or join with Channel Code</label>
        <input class="lm-input" type="text" placeholder="Paste channel code..." id="sync-channel-input" autocomplete="off" />
      `;
      const joinBtn = this._el('button', 'lm-btn lm-btn--love', { html: '\ud83d\udc9e Join Channel' });
      joinBtn.onclick = () => {
        const token = document.getElementById('sync-token-input')?.value?.trim();
        const code = document.getElementById('sync-channel-input')?.value?.trim();
        if (!token) { alert('Please enter your GitHub token first'); return; }
        if (!code) { alert('Please enter the channel code from your spouse'); return; }
        this._emit('spouseDash:joinChannel', { token, channelCode: code });
      };

      this._append(btnRow, createBtn);
      this._append(joinSection, joinBtn);
      connSection.appendChild(btnRow);
      connSection.appendChild(joinSection);
    }

    // Side-by-side progress
    const compare = this._el('div', 'lm-spouse-dash__compare');
    const me = data.me || { name: 'You', level: 1, stars: 0 };
    const spouse = data.spouse || { name: 'Spouse', level: 1, stars: 0 };

    compare.innerHTML = `
      <div class="lm-spouse-dash__player">
        <div class="lm-spouse-dash__avatar">${me.gender === 'husband' ? '\ud83d\udc68' : '\ud83d\udc69'}</div>
        <strong>${me.name}</strong>
        <p>Level ${me.level}</p>
        <p>${me.stars} \u2b50</p>
      </div>
      <div class="lm-spouse-dash__heart">\u2764\ufe0f</div>
      <div class="lm-spouse-dash__player">
        <div class="lm-spouse-dash__avatar">${spouse.gender === 'husband' ? '\ud83d\udc68' : '\ud83d\udc69'}</div>
        <strong>${spouse.name}</strong>
        <p>Level ${spouse.level}</p>
        <p>${spouse.stars} \u2b50</p>
      </div>
    `;

    // Recent activity
    const activity = this._el('div', 'lm-spouse-dash__activity');
    const actTitle = this._el('h3', 'lm-spouse-dash__section-title', { text: 'Recent Activity' });
    const actList = this._el('div', 'lm-spouse-dash__act-list');
    const activities = data.activity || [
      { text: 'No recent activity yet.', time: '' }
    ];
    activities.forEach(a => {
      const row = this._el('div', 'lm-spouse-dash__act-item');
      row.innerHTML = `<span>${a.text}</span><span class="lm-spouse-dash__act-time">${a.time}</span>`;
      actList.appendChild(row);
    });
    this._append(activity, actTitle, actList);

    // Action buttons (only show when connected)
    const actions = this._el('div', 'lm-spouse-dash__actions');
    if (syncStatus.configured) {
      const noteBtn = this._el('button', 'lm-btn lm-btn--love lm-btn--large', { html: '\ud83d\udc8c Send Love Note' });
      noteBtn.onclick = () => this._emit('spouseDash:sendNote');
      const giftBtn = this._el('button', 'lm-btn lm-btn--love lm-btn--large', { html: '\ud83c\udf81 Send Gift' });
      giftBtn.onclick = () => this._emit('spouseDash:sendGift');
      this._append(actions, noteBtn, giftBtn);
    }

    // Pending help requests
    const helpSection = this._el('div', 'lm-spouse-dash__help');
    const helpTitle = this._el('h3', 'lm-spouse-dash__section-title', { text: 'Help Requests' });
    const helpList = this._el('div', 'lm-spouse-dash__help-list');
    const requests = data.helpRequests || [];
    if (requests.length === 0) {
      helpList.innerHTML = '<p class="lm-spouse-dash__empty">No pending requests</p>';
    } else {
      requests.forEach(req => {
        const item = this._el('div', 'lm-spouse-dash__help-item');
        item.innerHTML = `<span>${req.message}</span>`;
        const helpBtn = this._el('button', 'lm-btn lm-btn--small lm-btn--primary', { text: 'Help!' });
        helpBtn.onclick = () => this._emit('spouseDash:help', { requestId: req.id });
        item.appendChild(helpBtn);
        helpList.appendChild(item);
      });
    }
    this._append(helpSection, helpTitle, helpList);

    this._append(screen, header, connSection, compare, activity, actions, helpSection);
    return screen;
  }
}

// ============================================================
// Base Styles (injected once)
// ============================================================

const BASE_STYLES = `
/* ---- Root & Shared ---- */
.lm-ui-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.lm-ui-root * {
  box-sizing: border-box;
}

.lm-hidden {
  display: none !important;
}

/* ---- Screen transitions ---- */
.lm-screen {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
}

.lm-screen--visible {
  opacity: 1;
}

.lm-screen--exiting {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* ---- Buttons ---- */
.lm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 22px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
  user-select: none;
}

.lm-btn:active {
  transform: scale(0.95);
}

.lm-btn--primary {
  background: linear-gradient(135deg, #e8457c, #f06292);
  color: #fff;
  box-shadow: 0 4px 14px rgba(228,69,124,0.35);
}

.lm-btn--primary:hover {
  box-shadow: 0 6px 20px rgba(228,69,124,0.5);
}

.lm-btn--secondary {
  background: #f0f0f0;
  color: #444;
}

.lm-btn--love {
  background: linear-gradient(135deg, #ff6b9d, #c767dc);
  color: #fff;
  box-shadow: 0 4px 14px rgba(199,103,220,0.35);
}

.lm-btn--danger {
  background: #ef5350;
  color: #fff;
}

.lm-btn--small {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 8px;
}

.lm-btn--large {
  padding: 14px 36px;
  font-size: 18px;
  border-radius: 16px;
}

.lm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.lm-icon-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s;
}

.lm-icon-btn:hover {
  background: rgba(0,0,0,0.06);
}

/* ---- Inputs ---- */
.lm-input, .lm-textarea, .lm-select {
  padding: 10px 14px;
  border: 2px solid #e0d4e8;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.lm-input:focus, .lm-textarea:focus, .lm-select:focus {
  border-color: #e8457c;
}

.lm-input--error {
  border-color: #ef5350;
  animation: lm-shake 0.3s;
}

@keyframes lm-shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

/* ---- Badge ---- */
.lm-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef5350;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ---- Toggle ---- */
.lm-toggle {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: #ccc;
  cursor: pointer;
  transition: background 0.25s;
  padding: 0;
  flex-shrink: 0;
}

.lm-toggle--on {
  background: #e8457c;
}

.lm-toggle__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.lm-toggle--on .lm-toggle__knob {
  transform: translateX(22px);
}

/* ---- Tabs ---- */
.lm-tab {
  padding: 8px 18px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.lm-tab--active {
  color: #e8457c;
  border-bottom-color: #e8457c;
}

/* ---- Toast ---- */
.lm-toast-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  pointer-events: none;
  z-index: 200;
}

.lm-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  pointer-events: auto;
  transform: translateY(-30px);
  opacity: 0;
  transition: transform 0.35s ease, opacity 0.35s ease;
  font-size: 14px;
  font-weight: 500;
  max-width: 90%;
}

.lm-toast--visible {
  transform: translateY(0);
  opacity: 1;
}

.lm-toast--exiting {
  transform: translateY(-20px);
  opacity: 0;
}

.lm-toast--love { border-left: 4px solid #e8457c; }
.lm-toast--success { border-left: 4px solid #4caf50; }
.lm-toast--gift { border-left: 4px solid #ff9800; }
.lm-toast--verse { border-left: 4px solid #7c4dff; }
.lm-toast--info { border-left: 4px solid #2196f3; }

.lm-toast__icon { font-size: 18px; }
.lm-toast__msg { flex: 1; }

/* ---- Confirm Dialog ---- */
.lm-confirm-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
}

.lm-confirm-box {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  max-width: 340px;
  width: 90%;
  text-align: center;
}

.lm-confirm-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.lm-confirm-msg {
  margin: 0 0 20px;
  font-size: 14px;
  color: #666;
}

.lm-confirm-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* ---- Welcome Screen ---- */
.lm-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #fce4ec, #f3e5f5, #e8eaf6);
  overflow: hidden;
}

.lm-welcome--wife { background: linear-gradient(160deg, #fce4ec, #f8bbd0, #f3e5f5); }
.lm-welcome--husband { background: linear-gradient(160deg, #e3f2fd, #bbdefb, #e8eaf6); }

.lm-welcome__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.lm-welcome__floating-heart {
  position: absolute;
  bottom: -30px;
  opacity: 0.2;
  animation: lm-float-up linear infinite;
}

@keyframes lm-float-up {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
  50% { opacity: 0.35; }
  100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
}

.lm-welcome__content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.lm-welcome__title {
  font-size: 32px;
  margin: 0 0 4px;
  color: #c2185b;
}

.lm-welcome__subtitle {
  font-size: 14px;
  color: #777;
  margin: 0 0 28px;
}

.lm-welcome__roles {
  margin-bottom: 20px;
}

.lm-welcome__role-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #555;
}

.lm-welcome__role-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 28px;
  margin: 0 8px;
  border: 3px solid #e0d4e8;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  transition: border-color 0.25s, transform 0.15s, box-shadow 0.25s;
}

.lm-welcome__role-btn:hover {
  transform: translateY(-2px);
}

.lm-welcome__role-btn--selected {
  border-color: #e8457c;
  box-shadow: 0 4px 16px rgba(228,69,124,0.2);
}

.lm-welcome__role-icon {
  font-size: 36px;
}

.lm-welcome__label {
  display: block;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #777;
  margin-bottom: 6px;
}

.lm-welcome__name-section,
.lm-welcome__code-section {
  margin-bottom: 16px;
  animation: lm-fade-in 0.3s ease;
}

@keyframes lm-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.lm-welcome__code-row {
  display: flex;
  gap: 8px;
}

.lm-welcome__code-row .lm-input {
  flex: 1;
}

.lm-welcome__start {
  margin-top: 8px;
  animation: lm-fade-in 0.3s ease;
}

/* ---- Main Menu ---- */
.lm-main-menu {
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lm-main-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lm-main-menu__title {
  font-size: 24px;
  margin: 0;
  color: #c2185b;
}

.lm-main-menu__spouse-bar {
  background: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.lm-main-menu__spouse-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  display: block;
  margin-bottom: 6px;
}

.lm-main-menu__spouse-track {
  height: 8px;
  background: #f0e6f3;
  border-radius: 4px;
  overflow: hidden;
}

.lm-main-menu__spouse-fill {
  height: 100%;
  background: linear-gradient(90deg, #e8457c, #c767dc);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.lm-main-menu__play {
  width: 100%;
  font-size: 22px;
  padding: 16px;
}

.lm-main-menu__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.lm-menu-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 10px;
  background: #fff;
  border: 2px solid #f0e6f3;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  transition: transform 0.15s, box-shadow 0.15s;
}

.lm-menu-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.lm-menu-tile__icon {
  font-size: 28px;
}

.lm-main-menu__daily {
  background: linear-gradient(135deg, #fff5f7, #fef3ff);
  border: 1px solid #f3d4e0;
  border-radius: 14px;
  padding: 14px;
}

.lm-main-menu__daily-label {
  font-size: 13px;
  font-weight: 700;
  color: #c2185b;
  margin-bottom: 4px;
}

.lm-main-menu__daily-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* ---- Level Map ---- */
.lm-level-map {
  background: linear-gradient(180deg, #e3f2fd, #f3e5f5, #fce4ec);
  display: flex;
  flex-direction: column;
}

.lm-level-map__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 2;
}

.lm-level-map__title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.lm-level-map__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.lm-level-map__path {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 40px;
}

.lm-level-map__chapter {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #7b1fa2;
  padding: 10px;
  background: rgba(255,255,255,0.7);
  border-radius: 12px;
  margin: 8px 0;
}

.lm-level-map__node {
  width: 80px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.lm-level-map__node:hover {
  transform: scale(1.1);
}

.lm-level-map__node-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8457c, #f06292);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px;
  box-shadow: 0 3px 10px rgba(228,69,124,0.3);
}

.lm-level-map__node--locked .lm-level-map__node-circle {
  background: #bbb;
  box-shadow: none;
  cursor: default;
}

.lm-level-map__node--locked {
  opacity: 0.5;
  cursor: default;
}

.lm-level-map__node--current .lm-level-map__node-circle {
  box-shadow: 0 0 0 4px rgba(228,69,124,0.3), 0 3px 10px rgba(228,69,124,0.3);
  animation: lm-pulse 1.5s ease-in-out infinite;
}

@keyframes lm-pulse {
  0%,100% { box-shadow: 0 0 0 4px rgba(228,69,124,0.3), 0 3px 10px rgba(228,69,124,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(228,69,124,0.1), 0 3px 10px rgba(228,69,124,0.3); }
}

.lm-level-map__node--perfect .lm-level-map__node-circle {
  background: linear-gradient(135deg, #ffd54f, #ffb300);
}

.lm-level-map__node-stars {
  font-size: 12px;
  letter-spacing: 1px;
}

/* ---- HUD ---- */
.lm-hud {
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lm-hud--transparent {
  background: none !important;
}

.lm-hud__top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.92);
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  pointer-events: auto;
}

.lm-hud__level {
  font-weight: 700;
  font-size: 15px;
  color: #c2185b;
  margin-right: auto;
}

.lm-hud__score, .lm-hud__moves {
  text-align: center;
}

.lm-hud__score-label, .lm-hud__moves-label {
  display: block;
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
}

.lm-hud__score-val, .lm-hud__moves-val {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.lm-hud__pause {
  pointer-events: auto;
}

.lm-hud__star-track {
  position: relative;
  height: 6px;
  background: rgba(255,255,255,0.8);
  margin: 4px 12px 0;
  border-radius: 3px;
  overflow: visible;
}

.lm-hud__star-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #ffd54f, #ffb300);
  border-radius: 3px;
  transition: width 0.4s ease;
  width: 0%;
}

.lm-hud__star-marker {
  position: absolute;
  top: -10px;
  font-size: 12px;
  transform: translateX(-50%);
}

.lm-hud__goals {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 6px 12px;
  pointer-events: none;
}

.lm-hud__goal-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.85);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.lm-hud__goal-item--done {
  opacity: 0.5;
  text-decoration: line-through;
}

.lm-hud__combo {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #ff6f00;
  text-shadow: 0 2px 6px rgba(255,111,0,0.3);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
}

.lm-hud__combo--active {
  opacity: 1;
  transform: scale(1);
  animation: lm-combo-pop 0.35s ease;
}

@keyframes lm-combo-pop {
  0% { transform: scale(0.5); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.lm-hud__powerups {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  pointer-events: auto;
}

.lm-hud__pu-btn {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  border: 2px solid #e0d4e8;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  transition: transform 0.15s;
}

.lm-hud__pu-btn:active {
  transform: scale(0.9);
}

.lm-hud__pu-btn--empty {
  opacity: 0.35;
  cursor: default;
}

.lm-hud__pu-count {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #e8457c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lm-hud__pu-icon {
  font-size: 22px;
}

/* ---- Level Complete ---- */
.lm-level-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
}

.lm-level-complete__box {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  max-width: 360px;
  width: 90%;
  animation: lm-slide-up 0.4s ease;
}

@keyframes lm-slide-up {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.lm-level-complete__title {
  font-size: 24px;
  color: #c2185b;
  margin: 0 0 14px;
}

.lm-level-complete__stars {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.lm-level-complete__star {
  font-size: 40px;
  opacity: 0.3;
  transform: scale(0.5);
  transition: opacity 0.4s, transform 0.4s;
}

.lm-level-complete__star--earned {
  opacity: 1;
  transform: scale(1);
  animation: lm-star-in 0.5s ease backwards;
}

@keyframes lm-star-in {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.3) rotate(10deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.lm-level-complete__score {
  font-size: 16px;
  color: #555;
  margin-bottom: 16px;
}

.lm-level-complete__score strong {
  display: block;
  font-size: 28px;
  color: #333;
}

.lm-level-complete__verse {
  background: linear-gradient(135deg, #f3e5f5, #ede7f6);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  animation: lm-fade-in 0.5s ease 0.8s backwards;
}

.lm-level-complete__verse-badge {
  font-size: 13px;
  font-weight: 700;
  color: #7b1fa2;
  margin-bottom: 6px;
}

.lm-level-complete__verse-text {
  font-size: 14px;
  font-style: italic;
  color: #555;
  margin: 0 0 4px;
  line-height: 1.4;
}

.lm-level-complete__verse-ref {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.lm-level-complete__btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

/* ---- Game Over ---- */
.lm-game-over {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.55);
}

.lm-game-over__box {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  max-width: 340px;
  width: 90%;
  animation: lm-slide-up 0.4s ease;
}

.lm-game-over__title {
  font-size: 22px;
  color: #c62828;
  margin: 0 0 6px;
}

.lm-game-over__sub {
  font-size: 14px;
  color: #777;
  margin: 0 0 18px;
}

.lm-game-over__extra {
  width: 100%;
  margin-bottom: 12px;
}

.lm-game-over__btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
}

/* ---- Settings ---- */
.lm-settings {
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.lm-settings__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 2;
}

.lm-settings__title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.lm-settings__list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lm-settings__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.lm-settings__label {
  font-size: 15px;
  font-weight: 500;
  color: #444;
}

.lm-settings__action {
  width: 100%;
}

.lm-settings__music-section {
  margin-top: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.lm-settings__section-title {
  font-size: 15px;
  font-weight: 700;
  color: #c2185b;
  margin: 0 0 10px 0;
}

.lm-settings__music-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.lm-settings__music-row:last-child {
  border-bottom: none;
}

.lm-settings__music-label {
  font-size: 13px;
  color: #555;
  flex-shrink: 0;
}

.lm-select--small {
  font-size: 12px;
  padding: 4px 8px;
  max-width: 140px;
}

/* ---- Love Notes ---- */
.lm-love-notes {
  background: #fff;
  display: flex;
  flex-direction: column;
}

.lm-love-notes__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  position: sticky;
  top: 0;
  z-index: 2;
}

.lm-love-notes__title {
  margin: 0;
  font-size: 18px;
  color: #c2185b;
}

.lm-love-notes__tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px;
  border-bottom: 1px solid #f0e6f3;
}

.lm-love-notes__tabs .lm-btn {
  margin-left: auto;
}

.lm-love-notes__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.lm-love-notes__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.lm-love-notes__item:hover {
  background: #fef3ff;
}

.lm-love-notes__item--unread {
  background: #fff5f7;
  font-weight: 600;
}

.lm-love-notes__envelope {
  font-size: 24px;
  animation: lm-envelope-wobble 2s ease infinite;
}

.lm-love-notes__item--unread .lm-love-notes__envelope {
  animation-duration: 1s;
}

@keyframes lm-envelope-wobble {
  0%,100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.lm-love-notes__preview {
  flex: 1;
  min-width: 0;
}

.lm-love-notes__preview p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lm-love-notes__time {
  font-size: 11px;
  color: #bbb;
  white-space: nowrap;
}

.lm-love-notes__empty {
  text-align: center;
  padding: 40px 20px;
  color: #aaa;
  font-size: 14px;
}

.lm-love-notes__composer {
  padding: 14px;
  border-top: 1px solid #f0e6f3;
  animation: lm-slide-up 0.3s ease;
}

.lm-love-notes__decos {
  display: flex;
  gap: 4px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.lm-love-notes__deco-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.15s;
}

.lm-love-notes__deco-btn:hover {
  transform: scale(1.15);
}

/* ---- Spouse Dashboard ---- */
.lm-spouse-dash {
  background: linear-gradient(180deg, #fce4ec, #fff);
  display: flex;
  flex-direction: column;
}

.lm-spouse-dash__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 2;
}

.lm-spouse-dash__title {
  margin: 0;
  font-size: 18px;
  color: #c2185b;
}

.lm-spouse-dash__compare {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.lm-spouse-dash__player {
  text-align: center;
  flex: 1;
}

.lm-spouse-dash__avatar {
  font-size: 40px;
  margin-bottom: 4px;
}

.lm-spouse-dash__player strong {
  display: block;
  font-size: 15px;
  color: #333;
}

.lm-spouse-dash__player p {
  margin: 2px 0;
  font-size: 13px;
  color: #777;
}

.lm-spouse-dash__heart {
  font-size: 32px;
  animation: lm-pulse-heart 1.2s ease infinite;
}

@keyframes lm-pulse-heart {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.lm-spouse-dash__activity,
.lm-spouse-dash__help {
  padding: 0 16px 12px;
}

.lm-spouse-dash__section-title {
  font-size: 15px;
  color: #555;
  margin: 12px 0 8px;
}

.lm-spouse-dash__act-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
}

.lm-spouse-dash__act-time {
  font-size: 11px;
  color: #bbb;
}

.lm-spouse-dash__actions {
  padding: 0 16px 12px;
  text-align: center;
}

.lm-spouse-dash__help-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 6px;
  font-size: 13px;
}

.lm-spouse-dash__empty {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  padding: 10px;
}

/* ── Connection Setup ── */
.lm-spouse-dash__connect {
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fce4ec, #fff);
  border-radius: 16px;
  border: 1px solid #f8bbd0;
}
.lm-spouse-dash__conn-status {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; padding: 8px 0;
}
.lm-spouse-dash__conn-status--ok {
  color: #2e7d32;
}
.lm-spouse-dash__conn-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #4caf50; display: inline-block;
  animation: connPulse 2s ease-in-out infinite;
}
@keyframes connPulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
}
.lm-spouse-dash__conn-code {
  font-size: 12px; color: #777; margin: 4px 0 8px;
}
.lm-spouse-dash__conn-code code {
  background: #f5f5f5; padding: 2px 6px; border-radius: 4px;
  font-family: monospace; font-size: 11px;
}
.lm-spouse-dash__conn-info {
  font-size: 13px; color: #666; margin: 0 0 12px; line-height: 1.4;
}
.lm-spouse-dash__conn-form {
  margin-bottom: 12px;
}
.lm-spouse-dash__label {
  display: block; font-size: 13px; font-weight: 600;
  color: #555; margin-bottom: 6px;
}
.lm-input {
  width: 100%; padding: 10px 12px;
  border: 1.5px solid #ddd; border-radius: 10px;
  font-size: 14px; background: #fff;
  outline: none; transition: border-color 0.2s;
}
.lm-input:focus { border-color: #e91e63; }
.lm-spouse-dash__token-help {
  font-size: 11px; color: #999; margin: 6px 0 0;
}
.lm-spouse-dash__token-help a {
  color: #e91e63; text-decoration: underline;
}
.lm-spouse-dash__conn-btns {
  display: flex; gap: 8px; margin-bottom: 14px;
}
.lm-spouse-dash__join-section {
  margin-top: 8px; padding-top: 12px;
  border-top: 1px solid #f0d0dc;
}
.lm-spouse-dash__join-section .lm-input {
  margin-bottom: 8px;
}
.lm-btn--outline {
  background: transparent; border: 1.5px solid #e91e63;
  color: #e91e63;
}
`;

export default UIManager;
