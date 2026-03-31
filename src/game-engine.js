// Love Match - Match-3 Game Engine
// Romance/Bible themed match-3 with power-ups, cascading, and goals

// ============================================================
// Constants
// ============================================================

const GRID_SIZE = 8;

const THEMES = {
  wife: ['kitten', 'heart', 'rose', 'ring', 'dove', 'cake', 'bouquet', 'gift'],
  husband: ['hammer', 'saw', 'drill', 'wrench', 'log', 'axe', 'bolt', 'plank'],
};

const SPECIAL = {
  NONE: null,
  ROCKET_H: 'rocket_h',
  ROCKET_V: 'rocket_v',
  BOMB: 'bomb',
  RAINBOW: 'rainbow',
};

const SCORES = {
  MATCH_3: 50,
  MATCH_4: 120,
  MATCH_5: 300,
  BOMB_CLEAR: 20,
  ROCKET_CLEAR: 15,
  RAINBOW_CLEAR: 25,
};

const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

// ============================================================
// Event Emitter
// ============================================================

class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(fn);
    return this;
  }

  off(event, fn) {
    const fns = this._listeners.get(event);
    if (fns) {
      this._listeners.set(event, fns.filter(f => f !== fn));
    }
    return this;
  }

  emit(event, data) {
    const fns = this._listeners.get(event);
    if (fns) {
      for (const fn of fns) {
        fn(data);
      }
    }
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }
}

// ============================================================
// Tile
// ============================================================

class Tile {
  constructor(type, special = SPECIAL.NONE) {
    this.type = type;
    this.special = special;
  }

  clone() {
    return new Tile(this.type, this.special);
  }

  isSpecial() {
    return this.special !== SPECIAL.NONE;
  }
}

// ============================================================
// GameEngine
// ============================================================

class GameEngine extends EventEmitter {

  /**
   * @param {object} levelConfig
   * @param {string} levelConfig.theme - 'wife' | 'husband'
   * @param {number} levelConfig.moves - total moves allowed
   * @param {object[]} [levelConfig.goals] - e.g. [{type:'collect', tile:'heart', count:20}]
   * @param {number} [levelConfig.targetScore] - optional score goal
   * @param {number} [levelConfig.seed] - optional RNG seed
   */
  constructor(levelConfig = {}) {
    super();
    this.config = {
      theme: levelConfig.theme || 'wife',
      moves: levelConfig.moves || 30,
      goals: levelConfig.goals || [],
      targetScore: levelConfig.targetScore || 0,
      seed: levelConfig.seed ?? null,
    };

    this.tileTypes = THEMES[this.config.theme] || THEMES.wife;
    this.grid = [];
    this.score = 0;
    this.movesRemaining = this.config.moves;
    this.goalProgress = {};
    this.comboLevel = 0;
    this.isProcessing = false;
    this.gameOver = false;
    this.levelComplete = false;

    // Seeded RNG (xorshift32) for reproducibility
    this._rngState = this.config.seed ?? (Date.now() ^ 0xDEADBEEF);
  }

  // ----------------------------------------------------------
  // RNG
  // ----------------------------------------------------------

  _rand() {
    let s = this._rngState;
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    this._rngState = s;
    return (s >>> 0) / 0xFFFFFFFF;
  }

  _randInt(max) {
    return Math.floor(this._rand() * max);
  }

  _randomType() {
    return this.tileTypes[this._randInt(this.tileTypes.length)];
  }

  // ----------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------

  init() {
    this.score = 0;
    this.movesRemaining = this.config.moves;
    this.comboLevel = 0;
    this.isProcessing = false;
    this.gameOver = false;
    this.levelComplete = false;

    // Initialize goal progress
    this.goalProgress = {};
    for (const goal of this.config.goals) {
      const key = this._goalKey(goal);
      this.goalProgress[key] = { ...goal, current: 0 };
    }

    this._generateBoard();
    return this.getState();
  }

  _generateBoard() {
    // Fill the grid while avoiding initial matches
    this.grid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => null)
    );

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const forbidden = new Set();

        // Check two to the left
        if (c >= 2
          && this.grid[r][c - 1].type === this.grid[r][c - 2].type) {
          forbidden.add(this.grid[r][c - 1].type);
        }
        // Check two above
        if (r >= 2
          && this.grid[r - 1][c].type === this.grid[r - 2][c].type) {
          forbidden.add(this.grid[r - 1][c].type);
        }

        const candidates = this.tileTypes.filter(t => !forbidden.has(t));
        const type = candidates[this._randInt(candidates.length)];
        this.grid[r][c] = new Tile(type);
      }
    }

    // Guarantee at least one valid move exists
    if (!this._hasValidMove()) {
      this._shuffleBoard();
    }
  }

  // ----------------------------------------------------------
  // Matching
  // ----------------------------------------------------------

  /**
   * Find all matches on the current board.
   * Returns an array of match descriptors:
   *   { cells: [[r,c],...], direction: 'h'|'v', length: n }
   */
  findMatches() {
    const matches = [];

    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      let c = 0;
      while (c < GRID_SIZE) {
        const tile = this.grid[r][c];
        if (!tile) { c++; continue; }
        let end = c + 1;
        while (end < GRID_SIZE && this.grid[r][end] && this.grid[r][end].type === tile.type) {
          end++;
        }
        const len = end - c;
        if (len >= 3) {
          const cells = [];
          for (let i = c; i < end; i++) cells.push([r, i]);
          matches.push({ cells, direction: 'h', length: len });
        }
        c = end;
      }
    }

    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      let r = 0;
      while (r < GRID_SIZE) {
        const tile = this.grid[r][c];
        if (!tile) { r++; continue; }
        let end = r + 1;
        while (end < GRID_SIZE && this.grid[end][c] && this.grid[end][c].type === tile.type) {
          end++;
        }
        const len = end - r;
        if (len >= 3) {
          const cells = [];
          for (let i = r; i < end; i++) cells.push([i, c]);
          matches.push({ cells, direction: 'v', length: len });
        }
        r = end;
      }
    }

    return matches;
  }

  /**
   * Detect L-shape and T-shape patterns by finding intersecting matches.
   * Returns sets of cells that form these patterns (used for bomb creation).
   */
  _detectShapeMatches(matches) {
    const shapes = [];
    // Build a cell-to-match index
    const cellIndex = new Map();
    for (let i = 0; i < matches.length; i++) {
      for (const [r, c] of matches[i].cells) {
        const key = `${r},${c}`;
        if (!cellIndex.has(key)) cellIndex.set(key, []);
        cellIndex.get(key).push(i);
      }
    }

    // Any cell belonging to both an H and V match indicates an L or T shape
    const processed = new Set();
    for (const [key, indices] of cellIndex) {
      const hasH = indices.some(i => matches[i].direction === 'h');
      const hasV = indices.some(i => matches[i].direction === 'v');
      if (hasH && hasV) {
        // Merge all cells from involved matches
        const merged = new Set();
        const involvedIndices = new Set();
        for (const i of indices) {
          if (processed.has(i)) continue;
          involvedIndices.add(i);
          for (const cell of matches[i].cells) merged.add(`${cell[0]},${cell[1]}`);
        }
        if (merged.size > 0) {
          const cells = [...merged].map(k => k.split(',').map(Number));
          shapes.push({ cells, intersection: key.split(',').map(Number), matchIndices: involvedIndices });
          for (const i of involvedIndices) processed.add(i);
        }
      }
    }
    return shapes;
  }

  // ----------------------------------------------------------
  // Swap
  // ----------------------------------------------------------

  /**
   * Attempt to swap two adjacent tiles.
   * Returns an animation sequence array describing everything that happened,
   * or null if the swap is invalid.
   */
  swap(row1, col1, row2, col2) {
    if (this.isProcessing || this.gameOver || this.levelComplete) return null;

    // Validate adjacency
    const dr = Math.abs(row1 - row2);
    const dc = Math.abs(col1 - col2);
    if (dr + dc !== 1) return null;

    // Validate bounds
    if (!this._inBounds(row1, col1) || !this._inBounds(row2, col2)) return null;

    const tileA = this.grid[row1][col1];
    const tileB = this.grid[row2][col2];
    if (!tileA || !tileB) return null;

    // Special case: rainbow activation via swap
    if (tileA.special === SPECIAL.RAINBOW || tileB.special === SPECIAL.RAINBOW) {
      return this._executeSwap(row1, col1, row2, col2);
    }

    // Perform tentative swap
    this.grid[row1][col1] = tileB;
    this.grid[row2][col2] = tileA;

    const matches = this.findMatches();
    if (matches.length === 0) {
      // Revert
      this.grid[row1][col1] = tileA;
      this.grid[row2][col2] = tileB;
      return null;
    }

    // Revert, then execute properly (the execute path re-swaps)
    this.grid[row1][col1] = tileA;
    this.grid[row2][col2] = tileB;

    return this._executeSwap(row1, col1, row2, col2);
  }

  _executeSwap(row1, col1, row2, col2) {
    this.isProcessing = true;
    const animationSequence = [];

    // Perform swap
    const tileA = this.grid[row1][col1];
    const tileB = this.grid[row2][col2];
    this.grid[row1][col1] = tileB;
    this.grid[row2][col2] = tileA;

    animationSequence.push({
      type: 'swap',
      from: [row1, col1],
      to: [row2, col2],
    });

    // Consume a move
    this.movesRemaining--;

    // Handle rainbow + tile swap
    if (tileA.special === SPECIAL.RAINBOW) {
      const targetType = tileB.type;
      const clearAnim = this._activateRainbow(row1, col1, targetType, row2, col2);
      animationSequence.push(...clearAnim);
    } else if (tileB.special === SPECIAL.RAINBOW) {
      const targetType = tileA.type;
      const clearAnim = this._activateRainbow(row2, col2, targetType, row1, col1);
      animationSequence.push(...clearAnim);
    }

    // Process all cascading matches
    this.comboLevel = 0;
    const cascadeAnims = this._processCascade();
    animationSequence.push(...cascadeAnims);

    // Check end conditions
    this._checkEndConditions(animationSequence);

    this.isProcessing = false;
    this.emit('scoreUpdate', { score: this.score, movesRemaining: this.movesRemaining });

    return animationSequence;
  }

  // ----------------------------------------------------------
  // Cascade Processing
  // ----------------------------------------------------------

  _processCascade() {
    const allAnims = [];
    let iterations = 0;
    const MAX_CASCADE = 50; // safety limit

    while (iterations < MAX_CASCADE) {
      const matches = this.findMatches();
      if (matches.length === 0) break;

      this.comboLevel++;
      const multiplier = this.comboLevel;

      if (this.comboLevel > 1) {
        this.emit('cascade', { level: this.comboLevel });
      }

      // Determine special tiles to create
      const { removals, specials } = this._resolveMatches(matches);

      // Calculate score
      const matchScore = this._scoreMatches(matches, multiplier);
      this.score += matchScore;

      // Track goal progress for collected tiles
      for (const [r, c] of removals) {
        const tile = this.grid[r][c];
        if (tile) {
          this._trackCollection(tile.type);
          if (tile.isSpecial()) {
            this._trackCollection(tile.special);
          }
        }
      }

      // Build animation frame
      const matchAnim = {
        type: 'match',
        matches: matches.map(m => ({ cells: [...m.cells], length: m.length, direction: m.direction })),
        removals: [...removals.map(([r, c]) => [r, c])],
        specials: specials.map(s => ({ ...s })),
        score: matchScore,
        combo: this.comboLevel,
      };
      allAnims.push(matchAnim);
      this.emit('match', matchAnim);

      // Remove matched tiles (but place specials first)
      for (const [r, c] of removals) {
        this.grid[r][c] = null;
      }

      // Place special tiles
      for (const { row, col, type, tileType } of specials) {
        this.grid[row][col] = new Tile(tileType, type);
        this.emit('powerupCreated', { row, col, type, tileType });
      }

      // Activate any special tiles caught in the removal that weren't just created
      // (this happens when a special tile is part of a match)
      // Already handled: specials in the removal set have been re-placed above

      // Gravity: tiles fall down
      const fallAnim = this._applyGravity();
      allAnims.push({ type: 'fall', moves: fallAnim });

      // Fill from top
      const fillAnim = this._fillFromTop();
      allAnims.push({ type: 'fill', tiles: fillAnim });

      iterations++;
    }

    return allAnims;
  }

  /**
   * Determine which cells to remove and which specials to create.
   */
  _resolveMatches(matches) {
    const removalSet = new Set();
    const specials = [];

    // Detect L/T shapes first (these create bombs)
    const shapes = this._detectShapeMatches(matches);
    const shapeMatchIndices = new Set();

    for (const shape of shapes) {
      for (const i of shape.matchIndices) shapeMatchIndices.add(i);
      for (const [r, c] of shape.cells) removalSet.add(`${r},${c}`);
      const [ir, ic] = shape.intersection;
      const tileType = this.grid[ir][ic]?.type || this._randomType();
      specials.push({ row: ir, col: ic, type: SPECIAL.BOMB, tileType });
    }

    // Process remaining matches (not part of shapes)
    for (let i = 0; i < matches.length; i++) {
      if (shapeMatchIndices.has(i)) continue;
      const match = matches[i];
      for (const [r, c] of match.cells) removalSet.add(`${r},${c}`);

      if (match.length === 5) {
        // Rainbow star
        const mid = Math.floor(match.cells.length / 2);
        const [mr, mc] = match.cells[mid];
        const tileType = this.grid[mr][mc]?.type || this._randomType();
        specials.push({ row: mr, col: mc, type: SPECIAL.RAINBOW, tileType });
      } else if (match.length === 4) {
        // Rocket
        const mid = Math.floor(match.cells.length / 2);
        const [mr, mc] = match.cells[mid];
        const rocketType = match.direction === 'h' ? SPECIAL.ROCKET_V : SPECIAL.ROCKET_H;
        const tileType = this.grid[mr][mc]?.type || this._randomType();
        specials.push({ row: mr, col: mc, type: rocketType, tileType });
      }
    }

    // Remove special-placement cells from the removal set so they persist
    for (const s of specials) {
      removalSet.delete(`${s.row},${s.col}`);
    }

    const removals = [...removalSet].map(k => k.split(',').map(Number));
    return { removals, specials };
  }

  // ----------------------------------------------------------
  // Gravity & Fill
  // ----------------------------------------------------------

  _applyGravity() {
    const moves = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let writeRow = GRID_SIZE - 1;
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (r !== writeRow) {
            this.grid[writeRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            moves.push({ from: [r, c], to: [writeRow, c] });
          }
          writeRow--;
        }
      }
    }
    return moves;
  }

  _fillFromTop() {
    const filled = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (this.grid[r][c] === null) {
          const type = this._randomType();
          this.grid[r][c] = new Tile(type);
          filled.push({ row: r, col: c, type });
        }
      }
    }
    return filled;
  }

  // ----------------------------------------------------------
  // Scoring
  // ----------------------------------------------------------

  _scoreMatches(matches, multiplier) {
    let total = 0;
    for (const match of matches) {
      if (match.length === 3) total += SCORES.MATCH_3;
      else if (match.length === 4) total += SCORES.MATCH_4;
      else if (match.length >= 5) total += SCORES.MATCH_5;
      else total += SCORES.MATCH_3; // fallback
    }
    return total * multiplier;
  }

  // ----------------------------------------------------------
  // Power-up Activation
  // ----------------------------------------------------------

  /**
   * Manually activate a special tile at (row, col).
   * Returns animation sequence or null if no special tile there.
   */
  activatePowerup(row, col) {
    if (this.isProcessing || this.gameOver || this.levelComplete) return null;
    const tile = this.grid[row]?.[col];
    if (!tile || !tile.isSpecial()) return null;

    this.isProcessing = true;
    const anims = [];

    const clearAnims = this._triggerSpecial(row, col);
    anims.push(...clearAnims);

    // Cascade after activation
    const cascadeAnims = this._processCascade();
    anims.push(...cascadeAnims);

    this._checkEndConditions(anims);
    this.isProcessing = false;
    this.emit('scoreUpdate', { score: this.score, movesRemaining: this.movesRemaining });

    return anims;
  }

  _triggerSpecial(row, col) {
    const tile = this.grid[row][col];
    if (!tile) return [];

    const special = tile.special;
    if (special === SPECIAL.NONE) return [];

    const anims = [];
    const cleared = [];

    this.emit('powerupActivated', { row, col, type: special });

    switch (special) {
      case SPECIAL.ROCKET_H:
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.grid[row][c]) {
            this._trackCollection(this.grid[row][c].type);
            // Chain: if we hit another special, trigger it
            if (this.grid[row][c].isSpecial() && !(row === row && c === col)) {
              // Will be handled via cascade
            }
            cleared.push([row, c]);
            this.score += SCORES.ROCKET_CLEAR;
          }
        }
        anims.push({ type: 'rocket_h', row, cleared: cleared.map(c => [...c]) });
        for (const [r, c] of cleared) this.grid[r][c] = null;
        break;

      case SPECIAL.ROCKET_V:
        for (let r = 0; r < GRID_SIZE; r++) {
          if (this.grid[r][col]) {
            this._trackCollection(this.grid[r][col].type);
            cleared.push([r, col]);
            this.score += SCORES.ROCKET_CLEAR;
          }
        }
        anims.push({ type: 'rocket_v', col, cleared: cleared.map(c => [...c]) });
        for (const [r, c] of cleared) this.grid[r][c] = null;
        break;

      case SPECIAL.BOMB: {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (this._inBounds(nr, nc) && this.grid[nr][nc]) {
              this._trackCollection(this.grid[nr][nc].type);
              cleared.push([nr, nc]);
              this.score += SCORES.BOMB_CLEAR;
            }
          }
        }
        anims.push({ type: 'bomb', row, col, cleared: cleared.map(c => [...c]) });
        for (const [r, c] of cleared) this.grid[r][c] = null;
        break;
      }

      case SPECIAL.RAINBOW: {
        // Clear all tiles of the most common type
        const targetType = this._mostCommonType();
        const rainbowAnims = this._activateRainbow(row, col, targetType);
        anims.push(...rainbowAnims);
        break;
      }
    }

    // Apply gravity and fill after special
    const fallAnim = this._applyGravity();
    anims.push({ type: 'fall', moves: fallAnim });
    const fillAnim = this._fillFromTop();
    anims.push({ type: 'fill', tiles: fillAnim });

    return anims;
  }

  _activateRainbow(row, col, targetType, swapRow, swapCol) {
    const cleared = [];

    // Remove the rainbow tile itself
    if (this.grid[row][col]) {
      cleared.push([row, col]);
    }

    // Remove all tiles of the target type
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] && this.grid[r][c].type === targetType) {
          this._trackCollection(this.grid[r][c].type);
          cleared.push([r, c]);
          this.score += SCORES.RAINBOW_CLEAR;
        }
      }
    }

    const anim = { type: 'rainbow', row, col, targetType, cleared: cleared.map(c => [...c]) };
    this.emit('powerupActivated', { row, col, type: SPECIAL.RAINBOW, targetType });

    for (const [r, c] of cleared) this.grid[r][c] = null;

    return [anim];
  }

  _mostCommonType() {
    const counts = {};
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = this.grid[r][c];
        if (tile && !tile.isSpecial()) {
          counts[tile.type] = (counts[tile.type] || 0) + 1;
        }
      }
    }
    let best = null;
    let bestCount = 0;
    for (const [type, count] of Object.entries(counts)) {
      if (count > bestCount) {
        best = type;
        bestCount = count;
      }
    }
    return best || this.tileTypes[0];
  }

  // ----------------------------------------------------------
  // Goals
  // ----------------------------------------------------------

  _goalKey(goal) {
    return `${goal.type}_${goal.tile || 'any'}`;
  }

  _trackCollection(tileType) {
    for (const key of Object.keys(this.goalProgress)) {
      const goal = this.goalProgress[key];
      if (goal.type === 'collect' && goal.tile === tileType && goal.current < goal.count) {
        goal.current++;
        this.emit('goalProgress', { goal: key, current: goal.current, target: goal.count });
      }
    }
  }

  checkGoals() {
    const results = {};
    let allMet = true;

    for (const [key, goal] of Object.entries(this.goalProgress)) {
      const met = goal.current >= goal.count;
      results[key] = { ...goal, met };
      if (!met) allMet = false;
    }

    if (this.config.targetScore > 0 && this.score < this.config.targetScore) {
      allMet = false;
      results._score = { type: 'score', current: this.score, count: this.config.targetScore, met: false };
    } else if (this.config.targetScore > 0) {
      results._score = { type: 'score', current: this.score, count: this.config.targetScore, met: true };
    }

    return { allMet, goals: results };
  }

  _checkEndConditions(animationSequence) {
    const { allMet } = this.checkGoals();

    if (allMet && (this.config.goals.length > 0 || this.config.targetScore > 0)) {
      this.levelComplete = true;
      this.emit('levelComplete', { score: this.score, movesRemaining: this.movesRemaining });
      animationSequence.push({ type: 'levelComplete' });
      return;
    }

    if (this.movesRemaining <= 0) {
      this.gameOver = true;
      this.emit('gameOver', { score: this.score, goalsResult: this.checkGoals() });
      animationSequence.push({ type: 'gameOver' });
      return;
    }

    // Check for available moves
    if (!this._hasValidMove()) {
      this.emit('noMoves', {});
      this._shuffleBoard();
      animationSequence.push({ type: 'shuffle' });
    }
  }

  // ----------------------------------------------------------
  // Move Detection & Hints
  // ----------------------------------------------------------

  _hasValidMove() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Try swap right
        if (c + 1 < GRID_SIZE && this._wouldMatch(r, c, r, c + 1)) return true;
        // Try swap down
        if (r + 1 < GRID_SIZE && this._wouldMatch(r, c, r + 1, c)) return true;
      }
    }
    return false;
  }

  _wouldMatch(r1, c1, r2, c2) {
    // Rainbow tiles always produce a valid match
    if (this.grid[r1][c1]?.special === SPECIAL.RAINBOW
      || this.grid[r2][c2]?.special === SPECIAL.RAINBOW) {
      return true;
    }

    // Tentative swap
    const a = this.grid[r1][c1];
    const b = this.grid[r2][c2];
    this.grid[r1][c1] = b;
    this.grid[r2][c2] = a;

    const hasMatch = this._quickMatchCheck(r1, c1) || this._quickMatchCheck(r2, c2);

    // Revert
    this.grid[r1][c1] = a;
    this.grid[r2][c2] = b;

    return hasMatch;
  }

  /**
   * Quick check if position (r,c) is part of a match of 3+.
   * More efficient than scanning the whole board.
   */
  _quickMatchCheck(r, c) {
    const tile = this.grid[r][c];
    if (!tile) return false;
    const type = tile.type;

    // Horizontal
    let left = c;
    while (left > 0 && this.grid[r][left - 1]?.type === type) left--;
    let right = c;
    while (right < GRID_SIZE - 1 && this.grid[r][right + 1]?.type === type) right++;
    if (right - left + 1 >= 3) return true;

    // Vertical
    let top = r;
    while (top > 0 && this.grid[top - 1][c]?.type === type) top--;
    let bottom = r;
    while (bottom < GRID_SIZE - 1 && this.grid[bottom + 1][c]?.type === type) bottom++;
    if (bottom - top + 1 >= 3) return true;

    return false;
  }

  /**
   * Find a valid move to suggest as a hint.
   * Returns { from: [r,c], to: [r,c] } or null.
   */
  getHint() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c + 1 < GRID_SIZE && this._wouldMatch(r, c, r, c + 1)) {
          return { from: [r, c], to: [r, c + 1] };
        }
        if (r + 1 < GRID_SIZE && this._wouldMatch(r, c, r + 1, c)) {
          return { from: [r, c], to: [r + 1, c] };
        }
      }
    }
    return null;
  }

  // ----------------------------------------------------------
  // Shuffle
  // ----------------------------------------------------------

  _shuffleBoard() {
    // Collect all non-special tiles
    const tiles = [];
    const specialPositions = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c]?.isSpecial()) {
          specialPositions.push({ r, c, tile: this.grid[r][c] });
        } else if (this.grid[r][c]) {
          tiles.push(this.grid[r][c]);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = this._randInt(i + 1);
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Place back
    let idx = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Skip special tile positions
        if (specialPositions.some(sp => sp.r === r && sp.c === c)) continue;
        this.grid[r][c] = tiles[idx++];
      }
    }

    // Restore specials
    for (const { r, c, tile } of specialPositions) {
      this.grid[r][c] = tile;
    }

    // Remove any accidental matches created by shuffle
    this._removeInitialMatches();

    // If still no valid moves after shuffle (extremely unlikely), regenerate
    if (!this._hasValidMove()) {
      this._generateBoard();
    }
  }

  _removeInitialMatches() {
    let matches = this.findMatches();
    let iterations = 0;
    while (matches.length > 0 && iterations < 100) {
      // For each match, change one tile to break it
      for (const match of matches) {
        const [r, c] = match.cells[0];
        if (this.grid[r][c] && !this.grid[r][c].isSpecial()) {
          const currentType = this.grid[r][c].type;
          const others = this.tileTypes.filter(t => t !== currentType);
          this.grid[r][c] = new Tile(others[this._randInt(others.length)]);
        }
      }
      matches = this.findMatches();
      iterations++;
    }
  }

  // ----------------------------------------------------------
  // Remove Matches (public API)
  // ----------------------------------------------------------

  /**
   * Remove given matches from the board, apply gravity, fill.
   * Mainly exposed for testing/external control.
   */
  removeMatches(matches) {
    if (!matches || matches.length === 0) return [];

    const anims = [];
    const removalSet = new Set();
    for (const match of matches) {
      for (const [r, c] of match.cells) {
        removalSet.add(`${r},${c}`);
      }
    }

    const removals = [...removalSet].map(k => k.split(',').map(Number));
    for (const [r, c] of removals) {
      if (this.grid[r][c]) {
        this._trackCollection(this.grid[r][c].type);
        this.grid[r][c] = null;
      }
    }

    anims.push({ type: 'remove', cells: removals });

    const fallAnim = this._applyGravity();
    anims.push({ type: 'fall', moves: fallAnim });

    const fillAnim = this._fillFromTop();
    anims.push({ type: 'fill', tiles: fillAnim });

    return anims;
  }

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  getState() {
    const gridState = this.grid.map(row =>
      row.map(tile => tile ? { type: tile.type, special: tile.special } : null)
    );

    return {
      grid: gridState,
      score: this.score,
      movesRemaining: this.movesRemaining,
      comboLevel: this.comboLevel,
      goals: { ...this.goalProgress },
      gameOver: this.gameOver,
      levelComplete: this.levelComplete,
      theme: this.config.theme,
      tileTypes: [...this.tileTypes],
    };
  }

  // ----------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------

  _inBounds(r, c) {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
  }
}

// ============================================================
// Exports
// ============================================================

export default GameEngine;
export { GameEngine, Tile, EventEmitter, THEMES, SPECIAL, SCORES, GRID_SIZE };
