// app.js — Love Match: Main Application Controller
// Ties together all game systems: engine, renderer, levels, powerups,
// Bible reading, spouse connection, quizzes, themes, UI, and audio.

import { GameEngine, Tile, EventEmitter, THEMES, SPECIAL, SCORES, GRID_SIZE } from './game-engine.js';
import { Renderer } from './renderer.js';
import { PowerupManager } from './powerups.js';
import { SpouseConnection } from './spouse.js';
import { ThemeManager } from './themes.js';
import { LevelManager, LEVELS, CHAPTERS } from './levels.js';
import { BibleReader } from './bible.js';
import { QuizManager } from './quiz.js';
import { UIManager } from './ui.js';
import { AudioManager } from './audio.js';
import { GistSync, decryptToken } from './gist-sync.js';

// ── Storage Key ─────────────────────────────────────────────────────

const SAVE_KEY = 'lovematch_save';

// ── Default Game State ──────────────────────────────────────────────

function createDefaultState() {
  return {
    profile: { name: '', gender: 'wife', theme: 'wife', partnerCode: '' },
    progress: { currentLevel: 1, levelStars: {}, totalScore: 0 },
    inventory: { powerups: {} },
    bible: { readVerses: [], notes: {}, streak: 0 },
    spouse: { notes: [], gifts: [], connected: false },
    quizzes: { completed: {}, results: {} },
    settings: { music: false, sfx: true, musicVolume: 0.8, sfxVolume: 0.8 },
  };
}

// ── Canvas sizing for mobile portrait ──────────────────────────────

function sizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  // Use the #app container width (max 480px) instead of full viewport
  const container = document.getElementById('app');
  const vw = container ? container.clientWidth : Math.min(window.innerWidth, 480);
  const vh = container ? container.clientHeight : window.innerHeight;

  canvas.style.width = `${vw}px`;
  canvas.style.height = `${vh}px`;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
}

// =====================================================================
// App Class
// =====================================================================

class App {

  constructor() {
    // Managers (initialized in init())
    this.engine = null;
    this.renderer = null;
    this.levelManager = null;
    this.powerupManager = new PowerupManager();
    this.themeManager = null;
    this.bibleReader = new BibleReader();
    this.quizManager = new QuizManager();
    this.spouseConnection = null;
    this.gistSync = new GistSync();
    this.ui = null;
    this.audio = new AudioManager();

    // State
    this.state = createDefaultState();
    this.currentLevelConfig = null;
    this.selectedTile = null;     // { row, col } or null
    this.isPaused = false;
    this.isAnimating = false;
    this._pendingPowerup = null;

    // Timers
    this._hintTimer = null;
    this._spousePollTimer = null;
  }

  // ================================================================
  // Lifecycle
  // ================================================================

  async init() {
    // Load saved state
    this.loadGame();

    // Set up level manager from saved progress
    this.levelManager = new LevelManager(this.state.progress);

    // Set up theme
    const themeId = this.state.profile.theme || 'wife';
    this.themeManager = new ThemeManager(themeId);
    this._applyThemeCSS();

    // Set up spouse connection (same-device demo defaults to player1)
    this.spouseConnection = new SpouseConnection('player1');

    // Restore inventory from save
    for (const [type, count] of Object.entries(this.state.inventory.powerups)) {
      for (let i = 0; i < count; i++) {
        try { this.powerupManager.addToInventory(type); } catch { /* skip unknown */ }
      }
    }

    // Audio — must be called after a user interaction, but we set it up early
    // and trust the first tap on the welcome screen to unlock it
    this.audio.init();
    if (this.audio.setGender) this.audio.setGender(this.state.profile.gender || 'wife');
    if (this.state.settings.musicVolume != null) {
      this.audio.setMusicVolume(this.state.settings.musicVolume);
    }
    if (this.state.settings.sfxVolume != null) {
      this.audio.setSFXVolume(this.state.settings.sfxVolume);
    }
    if (!this.state.settings.music) this.audio.mute();

    // Size the canvas for portrait mobile
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      sizeCanvas(canvas);
      window.addEventListener('resize', () => sizeCanvas(canvas));
    }

    // Initialize UI — takes the container element directly
    const container = document.getElementById('ui-container') || document.body;
    this.ui = new UIManager(container);

    // Bind unified UI action handler
    this.ui.onScreenAction((event) => this._handleUIAction(event));

    // Bind global events
    this._bindGlobalEvents();

    // Start spouse polling (local demo)
    this._startSpousePolling();

    // Start Gist sync polling if already configured
    if (this.gistSync.isConfigured()) {
      this._startGistPolling();
    }

    // Dismiss loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 700);
    }

    // Show menu (or welcome screen for first launch)
    if (this.state.profile.name) {
      this.showMenu();
    } else {
      this._showWelcome();
    }
  }

  // ================================================================
  // Theme CSS Application (manual — ThemeManager has no applyCSS)
  // ================================================================

  _applyThemeCSS() {
    const vars = this.themeManager.getThemeCSSVariables();
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }
    // Set data-theme attribute for styles.css theme switching
    const gender = this.state.profile.gender || 'wife';
    document.documentElement.setAttribute('data-theme', gender);
  }

  // ================================================================
  // Global Event Binding
  // ================================================================

  _bindGlobalEvents() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.engine && !this.engine.gameOver && !this.engine.levelComplete) {
          this.isPaused ? this.resumeGame() : this.pauseGame();
        }
      }
    });

    // Visibility change — auto-pause
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine && !this.engine.gameOver && !this.engine.levelComplete) {
        this.pauseGame();
      }
    });
  }

  // ================================================================
  // Unified UI Action Handler
  // ================================================================

  _handleUIAction(event) {
    const { action } = event;
    console.log('[App] UI action:', action, event);

    try { this._dispatchAction(action, event); }
    catch (err) { console.error('[App] Action error:', action, err); }
  }

  _dispatchAction(action, event) {
    switch (action) {
      // -- Welcome --
      case 'welcome:start':
        this._onWelcomeSubmit(event);
        break;

      // -- Main Menu --
      case 'menu:play':
        this.showLevelMap();
        break;
      case 'menu:bible':
        this.showBibleReading();
        break;
      case 'menu:loveNotes':
        this.showLoveNotes();
        break;
      case 'menu:quizzes':
        this.showQuizList();
        break;
      case 'menu:spouseDashboard':
        this.showSpouseDashboard();
        break;
      case 'menu:settings':
        this.showSettings();
        break;

      // -- Level Map --
      case 'levelMap:select':
        this.startLevel(event.level);
        break;
      case 'levelMap:back':
        this.showMenu();
        break;

      // -- HUD --
      case 'hud:pause':
        this.pauseGame();
        break;
      case 'hud:usePowerup':
        this.usePowerup(event.powerup);
        break;

      // -- Level Complete --
      case 'levelComplete:next':
        this._onLevelCompleteNext();
        break;
      case 'levelComplete:menu':
        this.ui.hideScreen('levelComplete');
        this.showMenu();
        break;
      case 'levelComplete:share':
        this._shareLevelWithSpouse(event.score, event.stars);
        break;

      // -- Game Over --
      case 'gameOver:retry':
        this.ui.hideScreen('gameOver');
        if (this.currentLevelConfig) {
          this.startLevel(this.currentLevelConfig.id);
        }
        break;
      case 'gameOver:menu':
        this.ui.hideScreen('gameOver');
        this.showMenu();
        break;
      case 'gameOver:extraMoves':
        this._useExtraMoves();
        break;
      case 'gameOver:askSpouse':
        this._askSpouseForHelp();
        break;

      // -- Settings --
      case 'settings:sound':
        this._onToggleSFX(event.enabled);
        break;
      case 'settings:music':
        this._onToggleMusic(event.enabled);
        break;
      case 'settings:theme':
        this._onChangeTheme(event.theme);
        break;
      case 'settings:resetProgress':
        this._onResetProgress();
        break;
      case 'settings:musicMap':
        this.audio.mp3Player.setScreenTrack(event.screen, event.trackId);
        break;
      case 'settings:back':
        this.showMenu();
        break;

      // -- Love Notes --
      case 'loveNotes:send':
        this._onSendLoveNote(event.text);
        break;
      case 'loveNotes:open':
        this._onOpenLoveNote(event.noteId);
        break;
      case 'loveNotes:back':
        this.showMenu();
        break;

      // -- Spouse Dashboard --
      case 'spouseDash:createChannel':
        this._onCreateChannel(event.token);
        break;
      case 'spouseDash:joinChannel':
        this._onJoinChannel(event.token, event.channelCode);
        break;
      case 'spouseDash:quickConnect':
        this._onQuickConnect(event.password, event.channelCode);
        break;
      case 'spouseDash:refresh':
        this._onRefreshSync();
        break;
      case 'spouseDash:disconnect':
        this._onDisconnectSync();
        break;
      case 'spouseDash:sendNote':
        this._onSendLoveNote();
        break;
      case 'spouseDash:sendGift':
        this._onSendGift();
        break;
      case 'spouseDash:help':
        this._onRespondToHelp(event.requestId);
        break;
      case 'spouseDash:back':
        this.showMenu();
        break;

      // -- Confirm dialogs --
      case 'confirmOk':
      case 'confirmCancel':
        // handled inline by showConfirmDialog callbacks
        break;

      default:
        console.log('Unhandled UI action:', action, event);
    }
  }

  // ================================================================
  // Welcome / Profile Setup
  // ================================================================

  _showWelcome() {
    this.ui.showScreen('welcome');
  }

  _onWelcomeSubmit({ role, name, pairCode }) {
    this.state.profile.name = name || 'Player';
    this.state.profile.gender = role || 'wife';
    this.state.profile.theme = role || 'wife';

    this.themeManager.setTheme(this.state.profile.theme);
    this._applyThemeCSS();
    if (this.audio.setGender) this.audio.setGender(this.state.profile.gender);

    // Create spouse profile
    try {
      this.spouseConnection.createProfile(name, role);
    } catch { /* may already exist */ }

    if (pairCode) {
      this.state.profile.partnerCode = pairCode;
      try {
        this.spouseConnection.connectWithSpouse(pairCode);
        this.state.spouse.connected = true;
      } catch (err) {
        this.ui.showToast('Could not connect with partner: ' + err.message, 'error');
      }
    }

    this.saveGame();
    this.showMenu();
  }

  // ================================================================
  // Screen Navigation
  // ================================================================

  showMenu() {
    this._clearHintTimer();
    this._destroyRenderer();
    this.engine = null;
    this.selectedTile = null;

    this.audio.playMusicForScreen('mainMenu');

    const unreadNotes = this.spouseConnection
      ? this.spouseConnection.getUnreadCount()
      : 0;

    this.ui.showScreen('mainMenu', {
      profile: this.state.profile,
      progress: this.state.progress,
      unreadNotes,
    });
  }

  showLevelMap() {
    this.audio.playMusicForScreen('levelMap');

    // Sync progress from match game localStorage
    try {
      const matchHighLevel = parseInt(localStorage.getItem('lovematch_highLevel') || '1');
      const matchStars = JSON.parse(localStorage.getItem('lovematch_stars') || '{}');
      // Update app state with match game progress
      if (matchHighLevel > (this.state.progress.currentLevel || 1)) {
        this.state.progress.currentLevel = matchHighLevel;
      }
      for (const [lvl, stars] of Object.entries(matchStars)) {
        const num = parseInt(lvl);
        if (stars > (this.state.progress.levelStars[num] || 0)) {
          this.state.progress.levelStars[num] = stars;
        }
      }
      this.saveGame();
    } catch (e) { /* ignore sync errors */ }

    // Use 20 levels (matching the match game's LEVEL_PROGRESSION)
    const totalLevels = 20;
    const allLevels = [];
    for (let i = 1; i <= totalLevels; i++) {
      allLevels.push({ id: i, number: i });
    }

    const currentLevel = this.state.progress.currentLevel || 1;
    const progressMap = {};
    for (const level of allLevels) {
      const num = level.id;
      const stars = this.state.progress.levelStars[num] || 0;
      progressMap[num] = { stars, unlocked: num <= currentLevel };
    }
    this.ui.showScreen('levelMap', {
      levels: allLevels,
      progress: progressMap,
      currentLevel,
    });
  }

  showBibleReading() {
    this.audio.playMusicForScreen('bible');
    const verse = this.bibleReader.getDailyVerse();
    const progress = this.bibleReader.getReadingProgress();
    const streak = this.bibleReader.getStreak();

    this.ui.showScreen('bible', {
      verse,
      progress,
      streak,
    });

    // Mark as read and award bonus
    if (verse && verse.reference) {
      this.bibleReader.markAsRead(verse.reference);
      const bonus = this.bibleReader.getBonusPoints();
      if (bonus > 0) {
        this.state.progress.totalScore += bonus;
        this.ui.showToast(`+${bonus} bonus for Bible reading!`, 'success');
      }
      this.saveGame();
    }
  }

  showLoveNotes() {
    this.audio.playMusicForScreen('loveNotes');
    if (!this.spouseConnection) {
      this.ui.showToast('Spouse connection not set up.', 'info');
      return;
    }

    const notes = this.spouseConnection.getLoveNotes();
    const gender = this.state.profile.gender || 'wife';
    const prompt = this.spouseConnection.getDailyPrompt(gender);

    this.ui.showScreen('loveNotes', {
      notes,
      dailyPrompt: prompt,
    });
  }

  showQuizList() {
    this.audio.playMusicForScreen('quizzes');
    const quizzes = this.quizManager.getAvailableQuizzes();
    this.ui.showScreen('quizList', {
      quizzes,
      completed: this.state.quizzes.completed,
    });
  }

  showSpouseDashboard() {
    this.audio.playMusicForScreen('us');

    const syncStatus = this.gistSync.getStatus();
    const myName = this.state.profile.name || 'You';
    const myGender = this.state.profile.gender || 'wife';
    const myLevel = this.state.progress.currentLevel || 1;
    const myStars = Object.values(this.state.progress.levelStars || {}).reduce((a, b) => a + b, 0);

    // Default spouse data
    let spouseName = 'Spouse';
    let spouseLevel = 1;
    let spouseStars = 0;
    let spouseGender = myGender === 'wife' ? 'husband' : 'wife';
    let helpRequests = [];
    let activity = [{ text: 'No recent activity yet.', time: '' }];

    // If we have cached spouse data from polling, use it
    if (this._cachedSpouseData) {
      const sd = this._cachedSpouseData;
      spouseName = sd.name || sd.profile?.name || 'Spouse';
      spouseGender = sd.role || spouseGender;
      spouseLevel = sd.gameProgress?.level || 1;
      spouseStars = sd.gameProgress?.score || 0;
      helpRequests = (sd.helpRequests || []).filter(r => r.status === 'pending');
      activity = (sd.loveNotes || []).slice(-5).map(n => ({
        text: `${n.from === myGender ? 'You' : spouseName}: ${n.message}`,
        time: new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      if (activity.length === 0) activity = [{ text: 'No recent activity yet.', time: '' }];
    }

    this.ui.showScreen('spouseDashboard', {
      syncStatus,
      me: { name: myName, gender: myGender, level: myLevel, stars: myStars },
      spouse: { name: spouseName, gender: spouseGender, level: spouseLevel, stars: spouseStars },
      helpRequests,
      activity,
      connected: syncStatus.configured,
    });
  }

  showSettings() {
    this.audio.playMusicForScreen('settings');
    this.ui.showScreen('settings', {
      soundOn: this.state.settings.sfx,
      musicOn: this.state.settings.music,
      theme: this.state.profile.theme,
      musicTracks: this.audio.mp3Player.getTracks(),
      screenMusicMap: this.audio.mp3Player.getScreenMap(),
      screenNames: this.audio.mp3Player.getScreenNames(),
    });
  }

  // ================================================================
  // Game Flow
  // ================================================================

  startLevel(levelId) {
    // Navigate to the match game with the selected level
    // The match game reads ?level=N and shares localStorage for progress
    const theme = this.state.profile.theme || 'wife';
    window.location.href = `match.html?level=${levelId}&theme=${theme}`;
  }

  // ================================================================
  // Engine Event Wiring
  // ================================================================

  _bindEngineEvents() {
    if (!this.engine) return;

    this.engine.on('scoreUpdate', (data) => {
      this.ui.updateHUD({
        score: this.engine.score,
        movesRemaining: this.engine.movesRemaining,
      });
    });

    this.engine.on('match', (data) => {
      this.audio.playSound('match');
      if (data.combo > 1) {
        this.audio.playSound('combo');
        if (this.renderer) {
          this.renderer.showComboText(data.combo);
        }
      }
    });

    this.engine.on('cascade', (data) => {
      this.audio.playCascadeSound(data.level || 1);
    });

    this.engine.on('powerupCreated', (data) => {
      this.audio.playSound('powerup-create');
      if (this.renderer && data.type && data.row != null && data.col != null) {
        this.renderer.animatePowerup(data.type, data.row, data.col);
      }
    });

    this.engine.on('powerupActivated', (data) => {
      this.audio.playSound('powerup-activate');
      if (this.renderer && data.type && data.row != null && data.col != null) {
        this.renderer.animatePowerupActivation(data.type, data.row, data.col);
      }
    });

    this.engine.on('goalProgress', (data) => {
      this.ui.updateGoalProgress(data);
    });

    this.engine.on('levelComplete', () => {
      this._onLevelComplete();
    });

    this.engine.on('gameOver', () => {
      this._onGameOver();
    });

    this.engine.on('noMoves', () => {
      this.ui.showToast('No moves! Shuffling...', 'info');
      this.audio.playSound('shuffle');
    });
  }

  // ================================================================
  // Tile Interaction — via Renderer callbacks
  // ================================================================

  _onTileClick(row, col) {
    if (!this.engine || this.isPaused || this.isAnimating) return;
    if (this.engine.gameOver || this.engine.levelComplete) return;

    // Handle pending powerup targeting
    if (this._pendingPowerup) {
      this._executePowerup(this._pendingPowerup, row, col);
      return;
    }

    this._resetHintTimer();

    if (this.selectedTile === null) {
      // First selection
      this.selectedTile = { row, col };
      this.audio.playSound('select');
      return;
    }

    const { row: sRow, col: sCol } = this.selectedTile;

    // Clicking the same tile — deselect
    if (sRow === row && sCol === col) {
      this.selectedTile = null;
      return;
    }

    // Check adjacency
    const dr = Math.abs(sRow - row);
    const dc = Math.abs(sCol - col);
    if (dr + dc === 1) {
      // Adjacent — attempt swap
      this._attemptSwap(sRow, sCol, row, col);
    } else {
      // Not adjacent — select new tile instead
      this.selectedTile = { row, col };
      this.audio.playSound('select');
    }
  }

  _onSwipe(fromRow, fromCol, toRow, toCol) {
    if (!this.engine || this.isPaused || this.isAnimating) return;
    if (this.engine.gameOver || this.engine.levelComplete) return;

    this._resetHintTimer();
    this.selectedTile = null;
    this._pendingPowerup = null;

    this._attemptSwap(fromRow, fromCol, toRow, toCol);
  }

  async _attemptSwap(row1, col1, row2, col2) {
    this.isAnimating = true;
    this.selectedTile = null;

    // Animate the visual swap first
    if (this.renderer) {
      await this.renderer.animateSwap(
        { row: row1, col: col1 },
        { row: row2, col: col2 }
      );
    }

    const result = this.engine.swap(row1, col1, row2, col2);

    if (result === null) {
      // Invalid swap — animate back
      this.audio.playSound('invalid');
      if (this.renderer) {
        await this.renderer.animateSwap(
          { row: row2, col: col2 },
          { row: row1, col: col1 }
        );
      }
      this.isAnimating = false;
      return;
    }

    // Process the animation sequence returned by engine
    await this._processAnimationSequence(result);

    // Update renderer with final state
    if (this.renderer && this.engine) {
      this._syncRenderer();
    }

    // Update HUD
    if (this.engine) {
      this.ui.updateHUD({
        score: this.engine.score,
        movesRemaining: this.engine.movesRemaining,
      });
    }

    this.isAnimating = false;
  }

  // ================================================================
  // Animation Sequence Processing
  // ================================================================

  async _processAnimationSequence(animSequence) {
    if (!animSequence || animSequence.length === 0) return;

    for (const step of animSequence) {
      switch (step.type) {
        case 'swap':
          if (this.renderer) {
            await this.renderer.animateSwap(
              { row: step.from[0], col: step.from[1] },
              { row: step.to[0], col: step.to[1] }
            );
          }
          break;

        case 'match':
          if (this.renderer && step.tiles) {
            // step.tiles may be array of {row,col} or [[row,col]]
            const matchTiles = step.tiles.map(t =>
              Array.isArray(t) ? { row: t[0], col: t[1] } : t
            );
            await this.renderer.animateMatch(matchTiles);
          }
          if (step.score > 0 && this.renderer) {
            this.renderer.showScorePopup(step.score, 0, 0);
          }
          break;

        case 'fall':
        case 'cascade':
          if (this.renderer && step.movements) {
            await this.renderer.animateCascade(step.movements);
          } else if (this.renderer && step.moves) {
            // Normalize: some engines use 'moves' instead of 'movements'
            const movements = step.moves.map(m => ({
              row: m.toRow ?? m.row,
              col: m.toCol ?? m.col,
              fromRow: m.fromRow,
              fromCol: m.fromCol,
            }));
            await this.renderer.animateCascade(movements);
          }
          break;

        case 'fill':
          if (this.renderer && step.tiles) {
            const newTiles = step.tiles.map(t =>
              Array.isArray(t) ? { row: t[0], col: t[1] } : t
            );
            await this.renderer.animateNewTiles(newTiles);
          }
          break;

        case 'powerupCreated':
          if (this.renderer && step.row != null && step.col != null) {
            await this.renderer.animatePowerup(step.powerupType || step.special, step.row, step.col);
          }
          break;

        case 'powerupActivated':
          if (this.renderer && step.row != null && step.col != null) {
            await this.renderer.animatePowerupActivation(step.powerupType || step.special, step.row, step.col);
          }
          break;

        case 'remove':
          if (this.renderer && step.cells) {
            const removeTiles = step.cells.map(c =>
              Array.isArray(c) ? { row: c[0], col: c[1] } : c
            );
            await this.renderer.animateMatch(removeTiles);
          }
          break;

        case 'shuffle':
          this.audio.playSound('shuffle');
          // Update state after shuffle
          if (this.renderer && this.engine) {
            this._syncRenderer();
          }
          break;

        case 'levelComplete':
          // Handled by engine event
          break;

        case 'gameOver':
          // Handled by engine event
          break;

        default:
          // Unknown step type, update board state
          if (this.renderer && this.engine) {
            this._syncRenderer();
          }
          break;
      }

      // Keep renderer in sync after each step
      if (this.renderer && this.engine) {
        this._syncRenderer();
      }
    }
  }

  // ================================================================
  // Powerup Usage (Inventory)
  // ================================================================

  usePowerup(powerupType) {
    if (!this.engine || this.isPaused || this.isAnimating) return;
    if (this.engine.gameOver || this.engine.levelComplete) return;

    const inventory = this.powerupManager.getInventory();
    if (!inventory[powerupType] || inventory[powerupType] <= 0) {
      this.ui.showToast('No more of that powerup!', 'info');
      return;
    }

    // Description check — some powerups need a target
    const desc = this.powerupManager.getEffectDescription(powerupType, this.state.profile.theme || 'wife');

    this.ui.showToast('Tap a tile to use the powerup.', 'info');
    this._pendingPowerup = powerupType;
  }

  async _executePowerup(powerupType, targetRow, targetCol) {
    this.isAnimating = true;
    this._pendingPowerup = null;

    try {
      const used = this.powerupManager.useFromInventory(powerupType);
      if (!used) {
        this.ui.showToast('No more of that powerup!', 'info');
        this.isAnimating = false;
        return;
      }

      const result = this.powerupManager.activate(
        powerupType, targetRow, targetCol, this.engine.grid
      );

      this._syncInventoryToState();

      // Animate activation
      if (this.renderer) {
        await this.renderer.animatePowerupActivation(powerupType, targetRow, targetCol);
      }

      // Clear tiles from result
      if (result && result.tilesToClear && result.tilesToClear.length > 0) {
        this.audio.playSound('powerup-activate');

        // Remove tiles from engine grid
        for (const { row, col } of result.tilesToClear) {
          if (this.engine.grid[row] && this.engine.grid[row][col]) {
            this.engine._trackCollection(this.engine.grid[row][col].type);
            this.engine.grid[row][col] = null;
          }
        }

        // Animate removal
        if (this.renderer) {
          await this.renderer.animateMatch(result.tilesToClear);
        }

        // Apply gravity and fill
        this.engine._applyGravity();
        this.engine._fillFromTop();

        // Process any cascades
        const cascadeAnims = this.engine._processCascade();
        if (cascadeAnims && cascadeAnims.length > 0) {
          await this._processAnimationSequence(cascadeAnims);
        }
      }

      // Update renderer state
      if (this.renderer && this.engine) {
        this._syncRenderer();
      }

      // Update HUD
      this.ui.updateHUD({
        score: this.engine.score,
        movesRemaining: this.engine.movesRemaining,
      });

      this.saveGame();
    } catch (err) {
      this.ui.showToast(err.message, 'error');
    }

    this.isAnimating = false;
  }

  // ================================================================
  // Level Complete / Game Over
  // ================================================================

  async _onLevelComplete() {
    const levelId = this.currentLevelConfig.id;
    const score = this.engine.score;
    const movesLeft = this.engine.movesRemaining;

    // Celebration animation
    if (this.renderer) {
      await this.renderer.animateLevelComplete();
    }

    // Calculate stars based on thresholds
    let stars = 1;
    const thresholds = this.currentLevelConfig.starThresholds;
    if (thresholds) {
      if (score >= thresholds[2]) stars = 3;
      else if (score >= thresholds[1]) stars = 2;
      else if (score >= thresholds[0]) stars = 1;
      else stars = 0;
    } else {
      // Fallback: moves-based
      if (movesLeft >= 10) stars = 3;
      else if (movesLeft >= 5) stars = 2;
    }
    if (stars < 1) stars = 1; // Always at least 1 star for completion

    // Update progress via LevelManager
    this.levelManager.completeLevel(stars, score);

    // Update local state
    const prevStars = this.state.progress.levelStars[levelId] || 0;
    if (stars > prevStars) {
      this.state.progress.levelStars[levelId] = stars;
    }
    this.state.progress.totalScore += score;

    // Unlock next level
    const maxLevel = this.levelManager.getMaxLevel();
    if (levelId >= this.state.progress.currentLevel && levelId < maxLevel) {
      this.state.progress.currentLevel = levelId + 1;
    }

    // Bible verse reward
    const verse = this.bibleReader.getVerseForLevel(levelId);

    // Share progress with spouse
    if (this.state.spouse.connected) {
      try {
        this.spouseConnection.shareProgress({
          level: this.state.progress.currentLevel,
          score: this.state.progress.totalScore,
          streak: this.bibleReader.getStreak(),
        });
      } catch { /* ignore */ }
    }

    this.saveGame();

    // Celebration audio
    this.audio.playSound('level-complete');

    // Show level complete screen
    this.ui.showScreen('levelComplete', {
      stars,
      score,
      verse,
    });
  }

  _onLevelCompleteNext() {
    this.ui.hideScreen('levelComplete');

    // Mark verse as read if it exists
    if (this.currentLevelConfig) {
      const verse = this.bibleReader.getVerseForLevel(this.currentLevelConfig.id);
      if (verse && verse.reference) {
        this.bibleReader.markAsRead(verse.reference);
        this.state.progress.totalScore += 50;
        this.saveGame();
      }
    }

    // Go to next level or back to map
    const nextId = this.currentLevelConfig ? this.currentLevelConfig.id + 1 : null;
    const nextLevel = nextId ? this.levelManager.getLevel(nextId) : null;
    if (nextLevel) {
      this.startLevel(nextId);
    } else {
      this.showLevelMap();
    }
  }

  _shareLevelWithSpouse(score, stars) {
    if (!this.spouseConnection || !this.state.spouse.connected) {
      this.ui.showToast('Not connected to spouse.', 'info');
      return;
    }
    try {
      this.spouseConnection.sendLoveNote(
        `I just completed a level with ${stars} stars and scored ${score} points!`,
        'celebration'
      );
      this.ui.showToast('Shared with your spouse!', 'success');
    } catch (err) {
      this.ui.showToast(err.message, 'error');
    }
  }

  _onGameOver() {
    this.audio.playSound('game-over');
    this.audio.stopMusic();

    const score = this.engine.score;
    const goalsResult = this.engine.checkGoals();

    // Check how many extra moves powerups the player has
    const inv = this.powerupManager.getInventory();
    const extraMovesAvailable = inv.extraMoves || 0;

    this.ui.showScreen('gameOver', {
      score,
      goals: goalsResult,
      extraMovesAvailable: typeof extraMovesAvailable === 'object'
        ? extraMovesAvailable.count || 0
        : extraMovesAvailable,
    });
  }

  _useExtraMoves() {
    if (!this.engine) return;

    const used = this.powerupManager.useFromInventory('extraMoves');
    if (!used) {
      this.ui.showToast('No extra moves left!', 'info');
      return;
    }

    this._syncInventoryToState();

    // Grant extra moves to engine
    this.engine.movesRemaining += 5;
    this.engine.gameOver = false;

    this.ui.hideScreen('gameOver');
    this.ui.updateHUD({
      score: this.engine.score,
      movesRemaining: this.engine.movesRemaining,
    });
    this.ui.showToast('+5 moves!', 'success');
    this.audio.playSound('bonus');
    this.audio.playMusicForScreen('gameplay');

    this.saveGame();
  }

  _askSpouseForHelp() {
    if (!this.spouseConnection || !this.state.spouse.connected) {
      this.ui.showToast('Not connected to spouse.', 'info');
      return;
    }
    try {
      this.spouseConnection.requestHelp();
      this.ui.showToast('Help requested from your spouse!', 'love');
    } catch (err) {
      this.ui.showToast(err.message, 'error');
    }
  }

  // ================================================================
  // Pause / Resume
  // ================================================================

  pauseGame() {
    if (!this.engine || this.isPaused) return;
    this.isPaused = true;
    this._clearHintTimer();

    this.ui.showConfirmDialog('Paused', 'Resume or quit to the level map?', () => {
      // On confirm = resume
      this.resumeGame();
    });
    // On cancel handled by confirmCancel event — quit to map
    this._pauseQuitHandler = true;
  }

  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this._pauseQuitHandler = false;
    this._resetHintTimer();
  }

  // ================================================================
  // Hints
  // ================================================================

  _resetHintTimer() {
    this._clearHintTimer();
    this._hintTimer = setTimeout(() => {
      this._showHint();
    }, 8000);
  }

  _clearHintTimer() {
    if (this._hintTimer) {
      clearTimeout(this._hintTimer);
      this._hintTimer = null;
    }
  }

  _showHint() {
    if (!this.engine || this.isPaused || this.isAnimating) return;
    if (this.engine.gameOver || this.engine.levelComplete) return;

    const hint = this.engine.getHint();
    if (hint && this.renderer) {
      // The renderer can show hints via score popup or combo text
      // We'll animate a gentle swap preview
      this.renderer.animateSwap(hint.from, hint.to).then(() => {
        if (this.renderer && this.engine) {
          this.renderer.animateSwap(hint.to, hint.from).then(() => {
            if (this.renderer && this.engine) {
              this._syncRenderer();
            }
          });
        }
      });
    }
  }

  // ================================================================
  // Settings Handlers
  // ================================================================

  _onToggleSFX(enabled) {
    this.state.settings.sfx = enabled;
    this.audio.setSFXVolume(enabled ? this.state.settings.sfxVolume : 0);
    this.saveGame();
  }

  _onToggleMusic(enabled) {
    this.state.settings.music = enabled;
    if (enabled) {
      this.audio.unmute();
    } else {
      this.audio.mute();
    }
    this.saveGame();
  }

  _onChangeTheme(themeId) {
    this.state.profile.theme = themeId;
    this.themeManager.setTheme(themeId);
    this._applyThemeCSS();
    if (this.renderer) {
      this.renderer.setTheme(themeId);
    }
    this.saveGame();
  }

  _onResetProgress() {
    this.state = createDefaultState();
    this.state.profile.name = 'Player';
    this.levelManager = new LevelManager();
    this.saveGame();
    this.ui.showToast('Progress reset.', 'info');
    this.showMenu();
  }

  // ================================================================
  // Love Notes Handlers
  // ================================================================

  _onSendLoveNote(text) {
    if (!this.spouseConnection) return;
    try {
      this.spouseConnection.sendLoveNote(text, 'default');
      this.ui.showToast('Love note sent!', 'success');
      this.audio.playSound('send');
    } catch (err) {
      this.ui.showToast(err.message, 'error');
    }
  }

  _onOpenLoveNote(noteId) {
    if (!this.spouseConnection) return;
    try {
      const result = this.spouseConnection.markNoteRead(noteId);
      if (result && result.bonusPoints > 0) {
        this.state.progress.totalScore += result.bonusPoints;
        this.ui.showToast(`+${result.bonusPoints} love note bonus!`, 'success');
        this.saveGame();
      }
    } catch (err) {
      console.warn('Error marking note read:', err);
    }
  }

  // ================================================================
  // Spouse Dashboard Handlers
  // ================================================================

  // ── Gist Sync Handlers ──

  async _onQuickConnect(password, channelCode) {
    try {
      this.ui.showToast('Decrypting...', 'info');
      const token = await decryptToken(password);
      if (!token || !token.startsWith('ghp_')) {
        this.ui.showToast('Wrong password', 'error');
        return;
      }

      if (channelCode) {
        // Join existing channel
        await this._onJoinChannel(token, channelCode);
      } else {
        // Create new channel
        await this._onCreateChannel(token);
      }
    } catch (err) {
      this.ui.showToast('Wrong password or decryption failed', 'error');
    }
  }

  async _onCreateChannel(token) {
    try {
      this.ui.showToast('Creating channel...', 'info');
      const role = this.state.profile.gender || 'wife';
      const name = this.state.profile.name || '';
      const channelCode = await this.gistSync.createChannel(token, role, name);

      // Show channel code in a persistent overlay so it can be copied
      this._showChannelCodeOverlay(channelCode);

      this.ui.showToast('Channel created!', 'success');
      this._startGistPolling();
    } catch (err) {
      this.ui.showToast('Failed: ' + err.message, 'error');
    }
  }

  _showChannelCodeOverlay(code) {
    // Remove any existing overlay
    document.getElementById('channel-code-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'channel-code-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:24px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <h2 style="margin:0 0 8px;font-size:20px;color:#333;">Channel Created!</h2>
        <p style="font-size:14px;color:#666;margin:0 0 16px;">Send this code to your spouse. They enter it on their phone to connect.</p>
        <div id="channel-code-text" style="background:#f5f5f5;border:2px dashed #ccc;border-radius:10px;padding:14px;font-family:monospace;font-size:13px;word-break:break-all;color:#333;margin:0 0 12px;">${code}</div>
        <button id="channel-code-copy" style="background:linear-gradient(135deg,var(--primary,#e84393),var(--primary-dark,#c2185b));color:#fff;border:none;border-radius:25px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;margin:0 0 8px;">Copy Code</button>
        <br/>
        <button id="channel-code-done" style="background:none;border:none;color:#999;font-size:14px;cursor:pointer;padding:8px;">Done</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('channel-code-copy').onclick = () => {
      navigator.clipboard.writeText(code).then(() => {
        document.getElementById('channel-code-copy').textContent = 'Copied!';
        this.ui.showToast('Code copied to clipboard!', 'success');
      }).catch(() => {
        // Fallback: select the text
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('channel-code-text'));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        this.ui.showToast('Select and copy the code above', 'info');
      });
    };

    document.getElementById('channel-code-done').onclick = () => {
      overlay.remove();
      this.showSpouseDashboard();
    };
  }

  async _onJoinChannel(token, channelCode) {
    try {
      this.ui.showToast('Joining channel...', 'info');
      const role = this.state.profile.gender || 'wife';
      const name = this.state.profile.name || '';
      console.log('[Sync] Joining as', role, 'with channel', channelCode.slice(0, 8) + '...');
      await this.gistSync.joinChannel(token, channelCode, role, name);
      console.log('[Sync] Joined successfully!');

      this.ui.showToast('Connected to your spouse!', 'success');
      this._startGistPolling();
      this.showSpouseDashboard(); // Refresh the UI
    } catch (err) {
      this.ui.showToast('Failed: ' + err.message, 'error');
    }
  }

  async _onRefreshSync() {
    try {
      this.ui.showToast('Checking for spouse...', 'info');
      const spouseData = await this.gistSync.pullSpouseData();
      if (spouseData) {
        this._cachedSpouseData = spouseData;
        this.ui.showToast(`Found: ${spouseData.name || spouseData.role || 'Spouse connected!'}`, 'success');
      } else {
        this.ui.showToast('Spouse hasn\'t joined yet. Make sure they use the same token and channel code.', 'info');
      }
      this.showSpouseDashboard();
    } catch (err) {
      this.ui.showToast('Sync error: ' + err.message, 'error');
    }
  }

  _onDisconnectSync() {
    this.gistSync.disconnect();
    this._cachedSpouseData = null;
    this.ui.showToast('Disconnected.', 'info');
    this.showSpouseDashboard();
  }

  async _onSendLoveNote() {
    if (!this.gistSync.isConfigured()) {
      this.ui.showToast('Connect to your spouse first!', 'info');
      return;
    }
    const message = prompt('Write a love note to your spouse:');
    if (!message) return;
    try {
      await this.gistSync.sendLoveNote(message);
      this.ui.showToast('Love note sent!', 'success');
    } catch (err) {
      this.ui.showToast('Failed to send: ' + err.message, 'error');
    }
  }

  _onSendGift() {
    if (!this.gistSync.isConfigured()) {
      this.ui.showToast('Connect to your spouse first!', 'info');
      return;
    }
    (async () => {
      try {
        await this.gistSync.sendGift('loveLetter', 'A gift from your spouse!');
        this.ui.showToast('Gift sent!', 'success');
        this.audio.playSound('gift');
      } catch (err) {
        this.ui.showToast('Failed: ' + err.message, 'error');
      }
    })();
  }

  _onRespondToHelp(requestId) {
    if (!this.gistSync.isConfigured()) return;
    (async () => {
      try {
        await this.gistSync.sendGift('extraMoves', 'Your spouse sent you extra moves!');
        this.ui.showToast('Help sent!', 'success');
      } catch (err) {
        this.ui.showToast(err.message, 'error');
      }
    })();
  }

  _startGistPolling() {
    if (!this.gistSync.isConfigured()) return;
    this.gistSync.startPolling(
      (spouseData) => {
        this._cachedSpouseData = spouseData;
        // Check for new love notes
        const unread = (spouseData.loveNotes || []).filter(n => !n.read);
        if (unread.length > 0) {
          const latest = unread[unread.length - 1];
          this.ui.showToast(`Love note: "${latest.message}"`, 'love');
        }
        // Check for gifts
        const unclaimed = (spouseData.gifts || []).filter(g => !g.claimed);
        if (unclaimed.length > 0) {
          this.ui.showToast(`You received a gift from your spouse!`, 'success');
        }
      },
      (status) => {
        // Optional: show connection status indicator
      }
    );
  }

  // ================================================================
  // Spouse Polling
  // ================================================================

  _startSpousePolling() {
    if (this._spousePollTimer) clearInterval(this._spousePollTimer);
    this._spousePollTimer = setInterval(() => {
      this._checkForSpouseUpdates();
    }, 30000);
  }

  _checkForSpouseUpdates() {
    if (!this.spouseConnection || !this.state.spouse.connected) return;

    // Check for unread notes
    const unread = this.spouseConnection.getUnreadCount();
    if (unread > 0) {
      this.ui.showToast(`You have ${unread} new love note${unread > 1 ? 's' : ''}!`, 'love');
    }

    // Check for unclaimed gifts
    const gifts = this.spouseConnection.getGifts().filter(g => !g.claimed);
    if (gifts.length > 0) {
      this.ui.showToast(`You received ${gifts.length} gift${gifts.length > 1 ? 's' : ''}!`, 'gift');
    }

    // Check for help requests
    const helpRequests = this.spouseConnection.getHelpRequests();
    if (helpRequests.length > 0) {
      this.ui.showToast('Your spouse needs help!', 'info');
    }
  }

  // ================================================================
  // Save / Load
  // ================================================================

  saveGame() {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(SAVE_KEY, serialized);
    } catch (err) {
      console.warn('Failed to save game:', err);
    }
  }

  loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        // Merge with defaults so new keys are always present
        this.state = {
          ...createDefaultState(),
          ...loaded,
          profile: { ...createDefaultState().profile, ...loaded.profile },
          progress: { ...createDefaultState().progress, ...loaded.progress },
          inventory: { ...createDefaultState().inventory, ...loaded.inventory },
          bible: { ...createDefaultState().bible, ...loaded.bible },
          spouse: { ...createDefaultState().spouse, ...loaded.spouse },
          quizzes: { ...createDefaultState().quizzes, ...loaded.quizzes },
          settings: { ...createDefaultState().settings, ...loaded.settings },
        };
      }
    } catch (err) {
      console.warn('Failed to load save:', err);
      this.state = createDefaultState();
    }
  }

  // ================================================================
  // Internal Helpers
  // ================================================================

  _syncInventoryToState() {
    const inv = this.powerupManager.getInventory();
    const mapped = {};
    for (const [type, info] of Object.entries(inv)) {
      // Inventory may return count directly or as object
      mapped[type] = typeof info === 'object' ? (info.count || 0) : (info || 0);
    }
    this.state.inventory.powerups = mapped;
  }

  _getInventoryForHUD() {
    const inv = this.powerupManager.getInventory();
    const powerups = [];
    const iconMap = {
      hammer: '\uD83D\uDD28',
      shuffle: '\uD83D\uDD00',
      extraMoves: '\u2795',
      loveLetter: '\uD83D\uDC8C',
      bomb: '\uD83D\uDCA3',
      rainbow: '\uD83C\uDF08',
    };
    for (const [id, info] of Object.entries(inv)) {
      const count = typeof info === 'object' ? (info.count || 0) : (info || 0);
      powerups.push({
        id,
        icon: iconMap[id] || '\u2B50',
        count,
      });
    }
    return powerups;
  }

  _destroyRenderer() {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }

  /**
   * Convert engine state to renderer state format.
   * Engine grid has {type, special} objects; renderer expects numeric tile indices in a "board" property.
   */
  _engineStateToRendererState() {
    const engineState = this.engine.getState();
    const tileTypes = engineState.tileTypes; // array of type strings like ["kitten", "heart", ...]

    const board = engineState.grid.map(row =>
      row.map(tile => {
        if (!tile) return -1;
        const idx = tileTypes.indexOf(tile.type);
        return idx >= 0 ? idx : 0;
      })
    );

    return {
      board,
      score: engineState.score,
      movesRemaining: engineState.movesRemaining,
      combo: engineState.comboLevel,
      goals: engineState.goals,
      gameOver: engineState.gameOver,
      levelComplete: engineState.levelComplete,
    };
  }

  /** Push current engine state to the renderer. */
  _syncRenderer() {
    if (this.renderer && this.engine) {
      this.renderer.setGameState(this._engineStateToRendererState());
    }
  }
}

// =====================================================================
// Auto-initialize
// =====================================================================

const app = new App();
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export default app;
export { App };
