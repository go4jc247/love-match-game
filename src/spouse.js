/**
 * Love Match - Spouse Connection & Love Notes System
 *
 * Allows two spouses to connect, exchange love notes, share powerups,
 * track progress, and receive daily romantic prompts.
 *
 * Uses localStorage with "player1"/"player2" keys for same-device demo.
 */

// ─── Romantic Prompts ────────────────────────────────────────────────

const HUSBAND_PROMPTS = [
  "Surprise your wife with flowers today",
  "Write 3 things you appreciate about her",
  "Plan a date night this week",
  "Send her a random text telling her she's beautiful",
  "Make her morning coffee or tea before she wakes up",
  "Put a sticky note with a compliment on the bathroom mirror",
  "Take over one of her daily chores without being asked",
  "Hold her hand the next time you walk together",
  "Tell her about a moment she made you proud",
  "Cook her favorite meal tonight",
  "Give her a 10-minute shoulder massage",
  "Write her a short love letter and leave it on her pillow",
  "Ask about her day and really listen without multitasking",
  "Compliment her in front of someone else",
  "Plan a surprise picnic, even if it's in the living room",
  "Reminisce about your first date together",
  "Take a photo together and set it as your phone wallpaper",
  "Say 'I love you' in a new way today",
  "Bring her dessert from her favorite bakery",
  "Watch her favorite movie without complaining",
  "Create a playlist of songs that remind you of her",
  "Tell her one thing she does that makes your life easier",
  "Offer to watch the kids so she can have alone time",
  "Leave a voicemail just to say you're thinking of her",
  "Learn one of her love languages and practice it today",
  "Tell her what first attracted you to her",
  "Frame a photo of you two and place it somewhere she'll see",
  "Run her a warm bath with candles after a long day",
  "Share a dream you have for your future together",
  "Write a thank-you note for something she did this week",
  "Pray together or share a moment of gratitude",
  "Ask her what would make today great, then help make it happen",
];

const WIFE_PROMPTS = [
  "Leave an encouraging note in his lunch",
  "Plan his favorite meal tonight",
  "Tell him one way he makes you feel safe",
  "Send him a text thanking him for something specific",
  "Brag about him to a friend (and let him overhear)",
  "Initiate a hug that lasts longer than usual",
  "Ask about his current project and show genuine interest",
  "Surprise him with his favorite snack",
  "Tell him you believe in him and why",
  "Write down 3 qualities you admire about him",
  "Give him uninterrupted time for his hobby today",
  "Wear something he once complimented you in",
  "Express appreciation for how hard he works",
  "Suggest doing one of his favorite activities together",
  "Greet him at the door with a smile and a kiss",
  "Share a memory that still makes you laugh together",
  "Ask for his advice on something, he loves being your hero",
  "Plan a low-key evening with just the two of you",
  "Tell him what he does better than anyone else you know",
  "Make a small gesture that shows you know his preferences",
  "Reminisce about a challenge you overcame together",
  "Publicly acknowledge something he did well",
  "Create a short video montage of your favorite moments",
  "Take interest in something new he's been learning about",
  "Put your phone away and give him your full attention tonight",
  "Tell him how he's grown since you first met",
  "Surprise him with tickets to something he'd enjoy",
  "Write him a short poem, even a silly one",
  "Tell him he's a great father (if applicable) and why",
  "Share one reason you'd choose him all over again",
  "Slow dance with him in the kitchen, no music needed",
  "Ask him what his ideal weekend looks like, then plan it",
];

const DREAM_QUESTIONS = [
  "What's one place you'd love to visit together?",
  "What hobby would you like to try as a couple?",
  "What's your favorite memory together?",
  "If we could live anywhere for a year, where would it be?",
  "What's a skill you'd love to learn side by side?",
  "What does your perfect lazy Sunday together look like?",
  "What song reminds you most of us?",
  "If we wrote a book about our love story, what would the title be?",
  "What's one adventure you want us to have before we're old?",
  "What tradition would you love to start together?",
  "What's the bravest thing you've seen me do?",
  "If we could relive one day together, which would it be?",
  "What do you think makes our relationship unique?",
  "What's something small I do that means a lot to you?",
  "Where do you see us in 10 years?",
  "What's a goal you'd like us to work toward together?",
  "What meal reminds you of a special moment we shared?",
  "If we had a whole week with no responsibilities, what would we do?",
  "What's one thing you want to make sure we never stop doing?",
  "What quality in me surprised you the most after we got married?",
  "What's your dream retirement life with me?",
  "What couple do you admire, and what do you admire about them?",
  "What's one fear you'd like us to conquer together?",
  "What would our dream home look like?",
];

const DECORATIONS = ["hearts", "roses", "stars", "butterflies", "fireworks"];

const POWERUP_TYPES = [
  "rainbow-bomb",
  "row-clear",
  "column-clear",
  "color-burst",
  "extra-moves",
  "score-boost",
  "shuffle",
  "time-freeze",
];

// ─── Utilities ───────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generatePairCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function now() {
  return Date.now();
}

// ─── Storage Layer ───────────────────────────────────────────────────

class SpouseStorage {
  constructor(playerSlot = "player1") {
    this.prefix = `lovematch_${playerSlot}_`;
  }

  _key(name) {
    return this.prefix + name;
  }

  get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(name));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  set(name, value) {
    localStorage.setItem(this._key(name), JSON.stringify(value));
  }

  remove(name) {
    localStorage.removeItem(this._key(name));
  }
}

// ─── SpouseConnection Class ──────────────────────────────────────────

export class SpouseConnection {
  /**
   * @param {string} playerSlot - "player1" or "player2" for same-device demo
   */
  constructor(playerSlot = "player1") {
    this.playerSlot = playerSlot;
    this.partnerSlot = playerSlot === "player1" ? "player2" : "player1";
    this.storage = new SpouseStorage(playerSlot);
    this.partnerStorage = new SpouseStorage(this.partnerSlot);
  }

  // ── Profile Setup ────────────────────────────────────────────────

  /**
   * Create a player profile.
   * @param {string} name
   * @param {"husband"|"wife"} gender
   * @param {string} [partnerCode] - Optional code to connect immediately
   * @returns {object} The created profile
   */
  createProfile(name, gender, partnerCode = null) {
    const profile = {
      id: generateId(),
      name,
      gender,
      pairCode: generatePairCode(),
      connectedTo: null,
      createdAt: now(),
    };

    this.storage.set("profile", profile);
    this.storage.set("loveNotes", []);
    this.storage.set("gifts", []);
    this.storage.set("helpRequests", []);
    this.storage.set("dreamAnswers", []);
    this.storage.set("progress", {
      level: 1,
      score: 0,
      streak: 0,
      gamesPlayed: 0,
      highestCombo: 0,
    });

    if (partnerCode) {
      this.connectWithSpouse(partnerCode);
    }

    return profile;
  }

  /**
   * Generate (or retrieve) the pair code for this player.
   * @returns {string} 6-character pair code
   */
  generatePairCode() {
    const profile = this.storage.get("profile");
    if (!profile) throw new Error("Create a profile first");
    if (!profile.pairCode) {
      profile.pairCode = generatePairCode();
      this.storage.set("profile", profile);
    }
    return profile.pairCode;
  }

  /**
   * Connect with a spouse using their pair code.
   * @param {string} code
   * @returns {boolean} True if connection succeeded
   */
  connectWithSpouse(code) {
    const myProfile = this.storage.get("profile");
    if (!myProfile) throw new Error("Create a profile first");

    const partnerProfile = this.partnerStorage.get("profile");
    if (!partnerProfile) {
      throw new Error("No partner found with that code");
    }
    if (partnerProfile.pairCode !== code) {
      throw new Error("Invalid pair code");
    }

    // Link both profiles
    myProfile.connectedTo = partnerProfile.id;
    this.storage.set("profile", myProfile);

    partnerProfile.connectedTo = myProfile.id;
    this.partnerStorage.set("profile", partnerProfile);

    return true;
  }

  /**
   * @returns {object|null} This player's profile
   */
  getProfile() {
    return this.storage.get("profile");
  }

  /**
   * @returns {object|null} Connected spouse's profile
   */
  getSpouseProfile() {
    const myProfile = this.storage.get("profile");
    if (!myProfile || !myProfile.connectedTo) return null;
    return this.partnerStorage.get("profile");
  }

  _ensureConnected() {
    const profile = this.storage.get("profile");
    if (!profile) throw new Error("Create a profile first");
    if (!profile.connectedTo) throw new Error("Not connected to a spouse");
    return profile;
  }

  // ── Love Notes System ────────────────────────────────────────────

  /**
   * Send a love note to your spouse.
   * @param {string} message
   * @param {string} [decoration] - One of: hearts, roses, stars, butterflies, fireworks
   * @returns {object} The sent note
   */
  sendLoveNote(message, decoration = "hearts") {
    this._ensureConnected();

    if (!DECORATIONS.includes(decoration)) {
      decoration = "hearts";
    }

    const note = {
      id: generateId(),
      from: this.playerSlot,
      message,
      decoration,
      read: false,
      bonusClaimed: false,
      sentAt: now(),
    };

    // Add to partner's received notes
    const partnerNotes = this.partnerStorage.get("loveNotes", []);
    partnerNotes.push(note);
    this.partnerStorage.set("loveNotes", partnerNotes);

    return note;
  }

  /**
   * Get all received love notes, unread first.
   * @returns {object[]}
   */
  getLoveNotes() {
    const notes = this.storage.get("loveNotes", []);
    return notes.sort((a, b) => {
      if (a.read === b.read) return b.sentAt - a.sentAt;
      return a.read ? 1 : -1;
    });
  }

  /**
   * Mark a love note as read and claim the 100 bonus points.
   * @param {string} noteId
   * @returns {{ note: object, bonusPoints: number }}
   */
  markNoteRead(noteId) {
    const notes = this.storage.get("loveNotes", []);
    const note = notes.find((n) => n.id === noteId);
    if (!note) throw new Error("Note not found");

    let bonusPoints = 0;
    if (!note.read) {
      note.read = true;
      note.readAt = now();
    }
    if (!note.bonusClaimed) {
      note.bonusClaimed = true;
      bonusPoints = 100;

      // Apply bonus to progress
      const progress = this.storage.get("progress", { score: 0 });
      progress.score = (progress.score || 0) + bonusPoints;
      this.storage.set("progress", progress);
    }

    this.storage.set("loveNotes", notes);
    return { note, bonusPoints };
  }

  /**
   * @returns {number} Count of unread love notes
   */
  getUnreadCount() {
    const notes = this.storage.get("loveNotes", []);
    return notes.filter((n) => !n.read).length;
  }

  // ── Tool / Powerup Gifting ───────────────────────────────────────

  /**
   * Send a powerup gift to your spouse.
   * @param {string} powerupType
   * @returns {object} The sent gift
   */
  sendGift(powerupType) {
    this._ensureConnected();

    if (!POWERUP_TYPES.includes(powerupType)) {
      throw new Error(
        `Invalid powerup type. Valid types: ${POWERUP_TYPES.join(", ")}`
      );
    }

    const gift = {
      id: generateId(),
      from: this.playerSlot,
      powerupType,
      claimed: false,
      sentAt: now(),
    };

    const partnerGifts = this.partnerStorage.get("gifts", []);
    partnerGifts.push(gift);
    this.partnerStorage.set("gifts", partnerGifts);

    return gift;
  }

  /**
   * Get all received gifts.
   * @returns {object[]}
   */
  getGifts() {
    return this.storage.get("gifts", []);
  }

  /**
   * Claim a gift into your inventory.
   * @param {string} giftId
   * @returns {object} The claimed gift
   */
  claimGift(giftId) {
    const gifts = this.storage.get("gifts", []);
    const gift = gifts.find((g) => g.id === giftId);
    if (!gift) throw new Error("Gift not found");
    if (gift.claimed) throw new Error("Gift already claimed");

    gift.claimed = true;
    gift.claimedAt = now();
    this.storage.set("gifts", gifts);

    return gift;
  }

  // ── Progress Sharing ─────────────────────────────────────────────

  /**
   * Share current game progress (writes to own storage for partner to read).
   * @param {object} [progressData] - Override data; otherwise uses stored progress
   * @returns {object} The shared progress
   */
  shareProgress(progressData = null) {
    const progress = progressData || this.storage.get("progress", {});
    progress.sharedAt = now();
    this.storage.set("progress", progress);
    return progress;
  }

  /**
   * Get spouse's last shared progress.
   * @returns {object|null}
   */
  getSpouseProgress() {
    this._ensureConnected();
    return this.partnerStorage.get("progress", null);
  }

  /**
   * Get side-by-side comparison stats.
   * @returns {object}
   */
  getComparisonStats() {
    const myProfile = this.getProfile();
    const spouseProfile = this.getSpouseProfile();
    const myProgress = this.storage.get("progress", {});
    const spouseProgress = this.partnerStorage.get("progress", {});

    return {
      player: {
        name: myProfile?.name || "You",
        level: myProgress.level || 1,
        score: myProgress.score || 0,
        streak: myProgress.streak || 0,
        gamesPlayed: myProgress.gamesPlayed || 0,
        highestCombo: myProgress.highestCombo || 0,
      },
      spouse: {
        name: spouseProfile?.name || "Spouse",
        level: spouseProgress.level || 1,
        score: spouseProgress.score || 0,
        streak: spouseProgress.streak || 0,
        gamesPlayed: spouseProgress.gamesPlayed || 0,
        highestCombo: spouseProgress.highestCombo || 0,
      },
    };
  }

  // ── Help System ──────────────────────────────────────────────────

  /**
   * Request help from your spouse (sends a notification).
   * @returns {object} The help request
   */
  requestHelp() {
    this._ensureConnected();

    const request = {
      id: generateId(),
      from: this.playerSlot,
      status: "pending",
      requestedAt: now(),
    };

    const partnerRequests = this.partnerStorage.get("helpRequests", []);
    partnerRequests.push(request);
    this.partnerStorage.set("helpRequests", partnerRequests);

    return request;
  }

  /**
   * Respond to a help request by sending a powerup.
   * @param {string} powerupType
   * @returns {object} The gift sent as help
   */
  sendHelp(powerupType) {
    // Mark the most recent pending request from partner as fulfilled
    const myRequests = this.storage.get("helpRequests", []);
    const pending = myRequests.find(
      (r) => r.from === this.partnerSlot && r.status === "pending"
    );
    if (pending) {
      pending.status = "fulfilled";
      pending.fulfilledAt = now();
      this.storage.set("helpRequests", myRequests);
    }

    // Send the powerup as a gift
    return this.sendGift(powerupType);
  }

  /**
   * Get help requests from your spouse (pending ones).
   * @returns {object[]}
   */
  getHelpRequests() {
    const requests = this.storage.get("helpRequests", []);
    return requests.filter(
      (r) => r.from === this.partnerSlot && r.status === "pending"
    );
  }

  // ── Romantic Prompts ─────────────────────────────────────────────

  /**
   * Get a daily romantic prompt based on gender.
   * Uses the day-of-year to cycle through prompts deterministically.
   * @param {"husband"|"wife"} [gender] - Defaults to profile gender
   * @returns {string}
   */
  getDailyPrompt(gender = null) {
    if (!gender) {
      const profile = this.storage.get("profile");
      gender = profile?.gender || "husband";
    }

    const prompts = gender === "wife" ? WIFE_PROMPTS : HUSBAND_PROMPTS;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    return prompts[dayOfYear % prompts.length];
  }

  /**
   * Get a dream/passion question to share with your spouse.
   * Cycles through questions based on day-of-year.
   * @returns {{ id: number, question: string }}
   */
  getDreamQuestion() {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const index = dayOfYear % DREAM_QUESTIONS.length;
    return { id: index, question: DREAM_QUESTIONS[index] };
  }

  /**
   * Answer a dream question and share with spouse.
   * @param {number} questionId
   * @param {string} answer
   * @returns {object} The stored answer
   */
  answerDreamQuestion(questionId, answer) {
    const profile = this.storage.get("profile");
    const entry = {
      id: generateId(),
      questionId,
      question: DREAM_QUESTIONS[questionId] || "Unknown question",
      answer,
      answeredBy: profile?.name || this.playerSlot,
      answeredAt: now(),
    };

    const answers = this.storage.get("dreamAnswers", []);
    answers.push(entry);
    this.storage.set("dreamAnswers", answers);

    return entry;
  }

  /**
   * Get your spouse's dream question answers.
   * @returns {object[]}
   */
  getSpouseAnswers() {
    this._ensureConnected();
    return this.partnerStorage.get("dreamAnswers", []);
  }

  // ── Data Sync ────────────────────────────────────────────────────

  /**
   * Export all spouse data as a JSON string.
   * @returns {string}
   */
  exportData() {
    const data = {
      profile: this.storage.get("profile"),
      loveNotes: this.storage.get("loveNotes", []),
      gifts: this.storage.get("gifts", []),
      helpRequests: this.storage.get("helpRequests", []),
      dreamAnswers: this.storage.get("dreamAnswers", []),
      progress: this.storage.get("progress", {}),
      exportedAt: now(),
    };
    return JSON.stringify(data);
  }

  /**
   * Import spouse data from a JSON string.
   * @param {string} jsonString
   */
  importData(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error("Invalid JSON data");
    }

    if (data.profile) this.storage.set("profile", data.profile);
    if (data.loveNotes) this.storage.set("loveNotes", data.loveNotes);
    if (data.gifts) this.storage.set("gifts", data.gifts);
    if (data.helpRequests) this.storage.set("helpRequests", data.helpRequests);
    if (data.dreamAnswers) this.storage.set("dreamAnswers", data.dreamAnswers);
    if (data.progress) this.storage.set("progress", data.progress);
  }

  /**
   * Generate a sync payload containing only data the spouse needs:
   * notes sent to them, gifts sent, help requests, dream answers, and progress.
   * @returns {string} JSON string
   */
  generateSyncPayload() {
    const profile = this.storage.get("profile");
    const payload = {
      type: "lovematch_sync",
      version: 1,
      fromPlayer: this.playerSlot,
      profile: {
        id: profile?.id,
        name: profile?.name,
        gender: profile?.gender,
        pairCode: profile?.pairCode,
      },
      // Notes this player has sent (stored in partner's notes array locally,
      // but for cross-device sync we include them explicitly)
      sentNotes: this.partnerStorage
        .get("loveNotes", [])
        .filter((n) => n.from === this.playerSlot),
      sentGifts: this.partnerStorage
        .get("gifts", [])
        .filter((g) => g.from === this.playerSlot),
      helpRequests: this.partnerStorage
        .get("helpRequests", [])
        .filter((r) => r.from === this.playerSlot),
      dreamAnswers: this.storage.get("dreamAnswers", []),
      progress: this.storage.get("progress", {}),
      generatedAt: now(),
    };
    return JSON.stringify(payload);
  }

  /**
   * Apply a sync payload received from your spouse.
   * Merges incoming notes, gifts, help requests, and dream answers
   * without duplicating existing entries.
   * @param {string} payloadString
   */
  applySyncPayload(payloadString) {
    let payload;
    try {
      payload = JSON.parse(payloadString);
    } catch {
      throw new Error("Invalid sync payload");
    }

    if (payload.type !== "lovematch_sync") {
      throw new Error("Not a valid Love Match sync payload");
    }

    // Merge love notes
    const myNotes = this.storage.get("loveNotes", []);
    const existingNoteIds = new Set(myNotes.map((n) => n.id));
    for (const note of payload.sentNotes || []) {
      if (!existingNoteIds.has(note.id)) {
        myNotes.push(note);
      }
    }
    this.storage.set("loveNotes", myNotes);

    // Merge gifts
    const myGifts = this.storage.get("gifts", []);
    const existingGiftIds = new Set(myGifts.map((g) => g.id));
    for (const gift of payload.sentGifts || []) {
      if (!existingGiftIds.has(gift.id)) {
        myGifts.push(gift);
      }
    }
    this.storage.set("gifts", myGifts);

    // Merge help requests
    const myRequests = this.storage.get("helpRequests", []);
    const existingRequestIds = new Set(myRequests.map((r) => r.id));
    for (const req of payload.helpRequests || []) {
      if (!existingRequestIds.has(req.id)) {
        myRequests.push(req);
      }
    }
    this.storage.set("helpRequests", myRequests);

    // Store partner's dream answers for viewing
    if (payload.dreamAnswers) {
      this.partnerStorage.set("dreamAnswers", payload.dreamAnswers);
    }

    // Store partner's progress for viewing
    if (payload.progress) {
      this.partnerStorage.set("progress", payload.progress);
    }

    // Update partner profile info
    if (payload.profile) {
      const partnerProfile = this.partnerStorage.get("profile") || {};
      Object.assign(partnerProfile, payload.profile);
      this.partnerStorage.set("profile", partnerProfile);
    }
  }
}

// ─── Exported Constants ──────────────────────────────────────────────

export { DECORATIONS, POWERUP_TYPES, HUSBAND_PROMPTS, WIFE_PROMPTS, DREAM_QUESTIONS };

export default SpouseConnection;
