/**
 * Love Match - GitHub Gist Sync Engine
 *
 * Uses a shared GitHub Gist as a real-time communication channel
 * between spouses. Each spouse writes to their own file in the gist
 * (husband.json / wife.json) and reads the other's file.
 *
 * Setup flow:
 * 1. One spouse creates the sync channel (creates a gist)
 * 2. They share the Channel Code (gist ID) with their spouse
 * 3. Both spouses enter the code — now they're synced
 *
 * The gist contains:
 *   - husband.json: husband's outgoing data (notes, gifts, progress, etc.)
 *   - wife.json: wife's outgoing data
 *   - channel.json: shared channel metadata
 */

const GIST_API = 'https://api.github.com/gists';
const STORAGE_PREFIX = 'lovematch_gist_';
const POLL_INTERVAL = 30000; // 30 seconds
const ACTIVE_POLL_INTERVAL = 5000; // 5 seconds when recently active

// Encrypted token blob (AES-256-GCM, password-protected)
const _ENC_BLOB = 'Wnv/UxfUm/np4KX8ikuMVfinBKY6P1cPGUj2aQjjhnUMrV6nFrz9jCHkzwpRyUV8Ucukw7I9mt7ztpAZKAYg2SlEDkCRuL+cKTLSzPt6+yFIqFGL';

/**
 * Decrypt the stored token using a password.
 * Uses Web Crypto API with PBKDF2 + AES-256-GCM.
 */
async function decryptToken(password) {
  const raw = Uint8Array.from(atob(_ENC_BLOB), c => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const tag = raw.slice(28, 44);
  const ciphertext = raw.slice(44);

  // Combine ciphertext + tag for WebCrypto (it expects them concatenated)
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    combined
  );
  return new TextDecoder().decode(decrypted);
}

export { decryptToken };

export class GistSync {

  constructor() {
    this.token = null;
    this.gistId = null;
    this.role = null; // 'husband' or 'wife'
    this.pollTimer = null;
    this.lastPollEtag = null;
    this.onDataReceived = null; // callback(data) when spouse data arrives
    this.onStatusChange = null; // callback(status) for connection status updates
    this._lastActivity = 0;
    this._loadConfig();
  }

  // ── Configuration ─────────────────────────────────────────────

  _loadConfig() {
    try {
      this.token = localStorage.getItem(STORAGE_PREFIX + 'token');
      this.gistId = localStorage.getItem(STORAGE_PREFIX + 'gist_id');
      this.role = localStorage.getItem(STORAGE_PREFIX + 'role');
    } catch (e) { /* ignore */ }
  }

  _saveConfig() {
    try {
      if (this.token) localStorage.setItem(STORAGE_PREFIX + 'token', this.token);
      if (this.gistId) localStorage.setItem(STORAGE_PREFIX + 'gist_id', this.gistId);
      if (this.role) localStorage.setItem(STORAGE_PREFIX + 'role', this.role);
    } catch (e) { /* ignore */ }
  }

  /**
   * Check if sync is configured and ready
   */
  isConfigured() {
    return !!(this.token && this.gistId && this.role);
  }

  /**
   * Get current configuration status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      gistId: this.gistId,
      role: this.role,
      hasToken: !!this.token,
      polling: !!this.pollTimer,
    };
  }

  // ── Channel Setup ─────────────────────────────────────────────

  /**
   * Create a new sync channel (creates a GitHub Gist).
   * Call this from the first spouse to set up.
   * @param {string} token - GitHub Personal Access Token (gist scope)
   * @param {'husband'|'wife'} role - This player's role
   * @param {string} [name] - Display name
   * @returns {Promise<string>} The channel code (gist ID) to share
   */
  async createChannel(token, role, name = '') {
    this.token = token;
    this.role = role;

    const channelMeta = {
      app: 'love-match',
      version: 1,
      createdAt: new Date().toISOString(),
      createdBy: role,
    };

    const myData = {
      type: 'lovematch_sync',
      version: 1,
      role: role,
      name: name,
      profile: { name, gender: role },
      loveNotes: [],
      gifts: [],
      helpRequests: [],
      dreamAnswers: [],
      bibleProgress: { readVerses: [], streak: 0 },
      gameProgress: { level: 1, score: 0 },
      messages: [],
      updatedAt: new Date().toISOString(),
    };

    const files = {
      'channel.json': { content: JSON.stringify(channelMeta, null, 2) },
    };
    files[`${role}.json`] = { content: JSON.stringify(myData, null, 2) };

    const res = await fetch(GIST_API, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        description: 'Love Match - Spouse Sync Channel',
        public: false,  // Private gist — both phones must use the same GitHub token
        files,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to create channel: ${err.message || res.status}`);
    }

    const gist = await res.json();
    this.gistId = gist.id;
    this._saveConfig();

    return this.gistId;
  }

  /**
   * Join an existing sync channel.
   * Call this from the second spouse.
   * @param {string} token - GitHub Personal Access Token (gist scope)
   * @param {string} channelCode - The gist ID shared by the first spouse
   * @param {'husband'|'wife'} role - This player's role
   * @param {string} [name] - Display name
   */
  async joinChannel(token, channelCode, role, name = '') {
    this.token = token;
    this.gistId = channelCode;
    this.role = role;

    // Verify the gist exists and is a love match channel
    const gist = await this._fetchGist();
    if (!gist.files['channel.json']) {
      throw new Error('Invalid channel code — not a Love Match sync channel');
    }

    // Add this player's file
    const myData = {
      type: 'lovematch_sync',
      version: 1,
      role: role,
      name: name,
      profile: { name, gender: role },
      loveNotes: [],
      gifts: [],
      helpRequests: [],
      dreamAnswers: [],
      bibleProgress: { readVerses: [], streak: 0 },
      gameProgress: { level: 1, score: 0 },
      messages: [],
      updatedAt: new Date().toISOString(),
    };

    await this._updateGist({
      [`${role}.json`]: { content: JSON.stringify(myData, null, 2) },
    });

    this._saveConfig();
  }

  // ── Data Push (write your data to gist) ───────────────────────

  /**
   * Push local data to the gist (your file only).
   * @param {object} data - The full sync payload for this player
   */
  async pushData(data) {
    if (!this.isConfigured()) throw new Error('Sync not configured');

    data.updatedAt = new Date().toISOString();
    data.role = this.role;

    await this._updateGist({
      [`${this.role}.json`]: { content: JSON.stringify(data, null, 2) },
    });

    this._lastActivity = Date.now();
  }

  /**
   * Send a love note through the gist.
   * Reads current data, appends note, pushes back.
   */
  async sendLoveNote(message, decoration = 'hearts') {
    const myData = await this._readMyData();
    const note = {
      id: this._generateId(),
      from: this.role,
      message,
      decoration,
      read: false,
      sentAt: new Date().toISOString(),
    };
    myData.loveNotes = myData.loveNotes || [];
    myData.loveNotes.push(note);
    await this.pushData(myData);
    return note;
  }

  /**
   * Send a tool/powerup gift to your spouse.
   */
  async sendGift(toolName, message = '') {
    const myData = await this._readMyData();
    const gift = {
      id: this._generateId(),
      from: this.role,
      tool: toolName,
      message: message || `Your ${this.role} sent you a ${toolName}!`,
      claimed: false,
      sentAt: new Date().toISOString(),
    };
    myData.gifts = myData.gifts || [];
    myData.gifts.push(gift);
    await this.pushData(myData);
    return gift;
  }

  /**
   * Send a help request to your spouse.
   */
  async requestHelp(levelNum, message = '') {
    const myData = await this._readMyData();
    const req = {
      id: this._generateId(),
      from: this.role,
      level: levelNum,
      message: message || `Help! I'm stuck on level ${levelNum}!`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    myData.helpRequests = myData.helpRequests || [];
    myData.helpRequests.push(req);
    await this.pushData(myData);
    return req;
  }

  /**
   * Send a chat message to your spouse.
   */
  async sendMessage(text) {
    const myData = await this._readMyData();
    const msg = {
      id: this._generateId(),
      from: this.role,
      text,
      sentAt: new Date().toISOString(),
    };
    myData.messages = myData.messages || [];
    myData.messages.push(msg);
    // Keep last 100 messages to avoid gist bloat
    if (myData.messages.length > 100) {
      myData.messages = myData.messages.slice(-100);
    }
    await this.pushData(myData);
    return msg;
  }

  /**
   * Update game progress in the gist.
   */
  async syncProgress(progressData) {
    const myData = await this._readMyData();
    myData.gameProgress = { ...myData.gameProgress, ...progressData };
    await this.pushData(myData);
  }

  /**
   * Update Bible reading progress in the gist.
   */
  async syncBibleProgress(bibleData) {
    const myData = await this._readMyData();
    myData.bibleProgress = { ...myData.bibleProgress, ...bibleData };
    await this.pushData(myData);
  }

  // ── Data Pull (read spouse's data from gist) ─────────────────

  /**
   * Pull spouse's latest data from the gist.
   * @returns {object|null} Spouse's sync data, or null if not found
   */
  async pullSpouseData() {
    if (!this.isConfigured()) return null;

    const spouseRole = this.role === 'husband' ? 'wife' : 'husband';
    const gist = await this._fetchGist();
    const file = gist.files[`${spouseRole}.json`];
    if (!file) return null;

    try {
      // If file is truncated, fetch raw URL
      let content = file.content;
      if (file.truncated && file.raw_url) {
        const raw = await fetch(file.raw_url);
        content = await raw.text();
      }
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Get unclaimed gifts from spouse.
   */
  async getUnclaimedGifts() {
    const spouseData = await this.pullSpouseData();
    if (!spouseData) return [];
    return (spouseData.gifts || []).filter(g => g.from !== this.role && !g.claimed);
  }

  /**
   * Get unread love notes from spouse.
   */
  async getUnreadNotes() {
    const spouseData = await this.pullSpouseData();
    if (!spouseData) return [];
    return (spouseData.loveNotes || []).filter(n => n.from !== this.role && !n.read);
  }

  /**
   * Get pending help requests from spouse.
   */
  async getPendingHelpRequests() {
    const spouseData = await this.pullSpouseData();
    if (!spouseData) return [];
    return (spouseData.helpRequests || []).filter(r => r.from !== this.role && r.status === 'pending');
  }

  /**
   * Get chat messages (combined from both files, sorted by time).
   */
  async getMessages() {
    const [myData, spouseData] = await Promise.all([
      this._readMyData(),
      this.pullSpouseData(),
    ]);
    const myMsgs = (myData?.messages || []);
    const spouseMsgs = (spouseData?.messages || []);
    const all = [...myMsgs, ...spouseMsgs];
    all.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    return all;
  }

  /**
   * Mark a gift as claimed (updates spouse's file by writing to your own claim log).
   */
  async claimGift(giftId) {
    const myData = await this._readMyData();
    myData.claimedGifts = myData.claimedGifts || [];
    if (!myData.claimedGifts.includes(giftId)) {
      myData.claimedGifts.push(giftId);
    }
    await this.pushData(myData);
  }

  /**
   * Mark a love note as read.
   */
  async markNoteRead(noteId) {
    const myData = await this._readMyData();
    myData.readNotes = myData.readNotes || [];
    if (!myData.readNotes.includes(noteId)) {
      myData.readNotes.push(noteId);
    }
    await this.pushData(myData);
  }

  // ── Polling ───────────────────────────────────────────────────

  /**
   * Start polling for spouse updates.
   * @param {function} onData - Callback when new spouse data arrives: onData(spouseData)
   * @param {function} [onStatus] - Callback for status changes: onStatus('connected'|'error'|'polling')
   */
  startPolling(onData, onStatus = null) {
    if (!this.isConfigured()) return;

    this.onDataReceived = onData;
    this.onStatusChange = onStatus;
    this._lastSpouseData = null;

    const poll = async () => {
      try {
        const data = await this.pullSpouseData();
        if (data && JSON.stringify(data) !== JSON.stringify(this._lastSpouseData)) {
          this._lastSpouseData = data;
          if (this.onDataReceived) this.onDataReceived(data);
          if (this.onStatusChange) this.onStatusChange('connected');
        }
      } catch (e) {
        if (this.onStatusChange) this.onStatusChange('error');
      }

      // Adaptive polling: faster when recently active
      const interval = (Date.now() - this._lastActivity < 60000)
        ? ACTIVE_POLL_INTERVAL
        : POLL_INTERVAL;
      this.pollTimer = setTimeout(poll, interval);
    };

    poll(); // First poll immediately
  }

  /**
   * Stop polling.
   */
  stopPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // ── Disconnect / Reset ────────────────────────────────────────

  /**
   * Disconnect from the sync channel (local only, doesn't delete the gist).
   */
  disconnect() {
    this.stopPolling();
    this.token = null;
    this.gistId = null;
    this.role = null;
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'token');
      localStorage.removeItem(STORAGE_PREFIX + 'gist_id');
      localStorage.removeItem(STORAGE_PREFIX + 'role');
    } catch (e) { /* ignore */ }
  }

  // ── Internal Helpers ──────────────────────────────────────────

  _headers() {
    const h = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    if (this.token) h['Authorization'] = `token ${this.token}`;
    return h;
  }

  async _fetchGist() {
    const res = await fetch(`${GIST_API}/${this.gistId}`, {
      headers: this._headers(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch gist: ${res.status}`);
    }
    return res.json();
  }

  async _updateGist(files) {
    const res = await fetch(`${GIST_API}/${this.gistId}`, {
      method: 'PATCH',
      headers: this._headers(),
      body: JSON.stringify({ files }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update gist: ${err.message || res.status}`);
    }
    return res.json();
  }

  async _readMyData() {
    const gist = await this._fetchGist();
    const file = gist.files[`${this.role}.json`];
    if (!file) return this._defaultData();
    try {
      let content = file.content;
      if (file.truncated && file.raw_url) {
        const raw = await fetch(file.raw_url);
        content = await raw.text();
      }
      return JSON.parse(content);
    } catch {
      return this._defaultData();
    }
  }

  _defaultData() {
    return {
      type: 'lovematch_sync',
      version: 1,
      role: this.role,
      name: '',
      profile: { gender: this.role },
      loveNotes: [],
      gifts: [],
      helpRequests: [],
      dreamAnswers: [],
      bibleProgress: { readVerses: [], streak: 0 },
      gameProgress: { level: 1, score: 0 },
      messages: [],
      claimedGifts: [],
      readNotes: [],
      updatedAt: new Date().toISOString(),
    };
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}

export default GistSync;
