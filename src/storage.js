/**
 * Love Match - Storage & Persistence Layer
 * Handles all data persistence using localStorage with spouse sync support.
 */

const SCHEMA_VERSION = 1;

const DEFAULTS = {
  profile: null,
  progress: { currentLevel: 1, levelStars: {}, totalScore: 0 },
  inventory: { loveArrow: 3, heartBomb: 2, rainbowStar: 1 },
  bible: { readVerses: [], notes: {}, streak: 0, lastReadDate: null },
  settings: { music: true, sfx: true, volume: 0.8 },
};

class StorageManager {
  /**
   * @param {string} playerId - 'player1' or 'player2' (for same-device demo)
   */
  constructor(playerId) {
    this.playerId = playerId;
    this.prefix = `lovematch_${playerId}_`;
    this.sharedPrefix = 'lovematch_shared_';
    this.mailboxPrefix = 'lovematch_mailbox_';
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  _key(key) {
    return `${this.prefix}${key}`;
  }

  _sharedKey(key) {
    return `${this.sharedPrefix}${key}`;
  }

  _mailboxKey(partnerCode) {
    return `${this.mailboxPrefix}${partnerCode}`;
  }

  _write(fullKey, data) {
    try {
      localStorage.setItem(fullKey, JSON.stringify(data));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.error('[StorageManager] localStorage quota exceeded');
      } else {
        console.error('[StorageManager] write error:', err);
      }
      return false;
    }
  }

  _read(fullKey) {
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('[StorageManager] read/parse error:', err);
      return null;
    }
  }

  _delete(fullKey) {
    try {
      localStorage.removeItem(fullKey);
    } catch (err) {
      console.error('[StorageManager] remove error:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  /** Save data under a namespaced key. */
  save(key, data) {
    return this._write(this._key(key), data);
  }

  /** Load data by key. Returns null if not found. */
  load(key) {
    return this._read(this._key(key));
  }

  /** Remove a single namespaced key. */
  remove(key) {
    this._delete(this._key(key));
  }

  /** Clear ALL game data for this player (use with care). */
  clear() {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }

  // ---------------------------------------------------------------------------
  // Game State
  // ---------------------------------------------------------------------------

  /** Save the full game state object. */
  saveGameState(state) {
    return this.save('gameState', state);
  }

  /** Load the full game state, or return defaults. */
  loadGameState() {
    const state = this.load('gameState');
    if (state) return state;
    return {
      profile: DEFAULTS.profile,
      progress: { ...DEFAULTS.progress, levelStars: {} },
      inventory: { ...DEFAULTS.inventory },
      bible: { ...DEFAULTS.bible, readVerses: [], notes: {} },
      settings: { ...DEFAULTS.settings },
    };
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  /** Save player profile. */
  saveProfile(profile) {
    return this.save('profile', profile);
  }

  /** Load player profile (null forces welcome screen). */
  loadProfile() {
    return this.load('profile') ?? DEFAULTS.profile;
  }

  // ---------------------------------------------------------------------------
  // Level Progress
  // ---------------------------------------------------------------------------

  /**
   * Save progress for a specific level.
   * Only overwrites if the new score/stars are higher.
   */
  saveLevelProgress(levelId, stars, score) {
    const progress = this.loadLevelProgress();
    const existing = progress[levelId];

    if (!existing || score > existing.score) {
      progress[levelId] = {
        stars: existing ? Math.max(existing.stars, stars) : stars,
        score,
        completed: true,
      };
    } else if (stars > existing.stars) {
      progress[levelId].stars = stars;
    }

    return this.save('levelProgress', progress);
  }

  /** Load all level progress. Returns { levelId: { stars, score, completed } }. */
  loadLevelProgress() {
    return this.load('levelProgress') ?? {};
  }

  /** Return the highest completed level number. */
  getHighestLevel() {
    const progress = this.loadLevelProgress();
    const levels = Object.keys(progress)
      .map(Number)
      .filter((n) => !isNaN(n) && progress[n]?.completed);
    return levels.length > 0 ? Math.max(...levels) : 0;
  }

  /** Return total stars earned across all levels. */
  getTotalStars() {
    const progress = this.loadLevelProgress();
    return Object.values(progress).reduce((sum, p) => sum + (p.stars || 0), 0);
  }

  // ---------------------------------------------------------------------------
  // Inventory
  // ---------------------------------------------------------------------------

  /** Save entire inventory object. */
  saveInventory(inventory) {
    return this.save('inventory', inventory);
  }

  /** Load inventory with starter defaults. */
  loadInventory() {
    return this.load('inventory') ?? { ...DEFAULTS.inventory };
  }

  /** Add or subtract from a powerup count (clamped to 0). */
  updateInventory(powerupType, delta) {
    const inv = this.loadInventory();
    inv[powerupType] = Math.max(0, (inv[powerupType] || 0) + delta);
    return this.saveInventory(inv);
  }

  // ---------------------------------------------------------------------------
  // Bible Progress
  // ---------------------------------------------------------------------------

  /** Save full bible progress object. */
  saveBibleProgress(progress) {
    return this.save('bibleProgress', progress);
  }

  /** Load bible progress with defaults. */
  loadBibleProgress() {
    return this.load('bibleProgress') ?? {
      ...DEFAULTS.bible,
      readVerses: [],
      notes: {},
    };
  }

  /** Mark a verse reference as read and update streak. */
  markVerseRead(reference) {
    const progress = this.loadBibleProgress();

    if (!progress.readVerses.includes(reference)) {
      progress.readVerses.push(reference);
    }

    const today = new Date().toISOString().slice(0, 10);
    if (progress.lastReadDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      progress.streak = progress.lastReadDate === yesterday ? progress.streak + 1 : 1;
      progress.lastReadDate = today;
    }

    return this.saveBibleProgress(progress);
  }

  /** Save a note for a verse. If shared is true it will be sent to spouse. */
  saveVerseNote(reference, note, shared = false) {
    const progress = this.loadBibleProgress();
    progress.notes[reference] = { note, shared, updatedAt: Date.now() };
    this.saveBibleProgress(progress);

    if (shared) {
      this.sendToSpouse('note', { reference, note });
    }
  }

  /** Load all verse notes. */
  loadVerseNotes() {
    const progress = this.loadBibleProgress();
    return progress.notes ?? {};
  }

  // ---------------------------------------------------------------------------
  // Spouse Data (Shared Storage / Mailbox)
  // ---------------------------------------------------------------------------

  /**
   * Send an item to the connected spouse's mailbox.
   * @param {'note'|'gift'|'help'|'progress'|'quiz'|'dreamAnswer'} type
   * @param {*} data
   */
  sendToSpouse(type, data) {
    const profile = this.loadProfile();
    if (!profile?.connectedSpouseCode) {
      console.warn('[StorageManager] No connected spouse code; cannot send.');
      return false;
    }

    const mailboxKey = this._mailboxKey(profile.connectedSpouseCode);
    const mailbox = this._read(mailboxKey) ?? { items: [] };

    mailbox.items.push({
      type,
      data,
      timestamp: Date.now(),
      read: false,
      from: this.playerId,
    });

    return this._write(mailboxKey, mailbox);
  }

  /** Get all pending items from this player's own mailbox. */
  getFromSpouse() {
    const profile = this.loadProfile();
    if (!profile?.partnerCode) return [];

    const mailboxKey = this._mailboxKey(profile.partnerCode);
    const mailbox = this._read(mailboxKey) ?? { items: [] };
    return mailbox.items;
  }

  /** Clear this player's own mailbox (mark all read / remove). */
  clearSpouseInbox() {
    const profile = this.loadProfile();
    if (!profile?.partnerCode) return;

    const mailboxKey = this._mailboxKey(profile.partnerCode);
    this._write(mailboxKey, { items: [] });
  }

  // ---------------------------------------------------------------------------
  // Quiz Results
  // ---------------------------------------------------------------------------

  /** Save a quiz result by quizId. */
  saveQuizResult(quizId, result) {
    const results = this.loadQuizResults();
    results[quizId] = { ...result, completedAt: Date.now() };
    return this.save('quizResults', results);
  }

  /** Load all quiz results. */
  loadQuizResults() {
    return this.load('quizResults') ?? {};
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  /** Save user settings. */
  saveSettings(settings) {
    return this.save('settings', settings);
  }

  /** Load settings with defaults. */
  loadSettings() {
    return this.load('settings') ?? { ...DEFAULTS.settings };
  }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  /** Export ALL player data as a JSON string. */
  exportAllData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        const shortKey = k.slice(this.prefix.length);
        data[shortKey] = this._read(k);
      }
    }
    data._exportedAt = Date.now();
    data._version = this.getVersion();
    data._playerId = this.playerId;
    return JSON.stringify(data);
  }

  /** Import player data from a JSON string. Overwrites existing data. */
  importAllData(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (err) {
      console.error('[StorageManager] Import parse error:', err);
      return false;
    }

    // Write each key back into namespaced storage
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_')) continue; // skip meta keys
      this.save(key, value);
    }

    return true;
  }

  /** Approximate size in bytes of all data for this player. */
  getDataSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        const val = localStorage.getItem(k) || '';
        total += k.length + val.length;
      }
    }
    // localStorage stores UTF-16, so multiply by 2 for byte estimate
    return total * 2;
  }

  // ---------------------------------------------------------------------------
  // Migration
  // ---------------------------------------------------------------------------

  /** Run any needed schema migrations. */
  migrateIfNeeded() {
    const current = this.getVersion();

    if (current < SCHEMA_VERSION) {
      // Future migrations go here as chained if-blocks:
      // if (current < 2) { ... migrate to v2 ... }

      this.setVersion(SCHEMA_VERSION);
      console.log(
        `[StorageManager] Migrated from v${current} to v${SCHEMA_VERSION}`
      );
    }
  }

  /** Get current schema version (0 if never set). */
  getVersion() {
    return this.load('schemaVersion') ?? 0;
  }

  /** Set schema version. */
  setVersion(v) {
    this.save('schemaVersion', v);
  }
}

export { StorageManager, DEFAULTS, SCHEMA_VERSION };
