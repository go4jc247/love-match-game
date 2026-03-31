// powerups.js - Power-up and tools system for Love Match
// Handles match-created powerups, inventory powerups, and spouse gifts

// ============================================================
// POWERUP DEFINITIONS
// ============================================================

export const POWERUP_DEFINITIONS = {
  // --- Match-Created Power-ups ---
  loveArrow: {
    category: 'match',
    matchType: 'four_in_row',
    wife: { name: 'Love Arrow', icon: '💘', description: 'Clears an entire row or column' },
    husband: { name: 'Power Drill', icon: '🔩', description: 'Drills through an entire row or column' },
    effect: 'clear_line',
  },
  heartBomb: {
    category: 'match',
    matchType: 'l_or_t_shape',
    wife: { name: 'Heart Bomb', icon: '💣', description: 'Explodes a 3x3 area with love' },
    husband: { name: 'Dynamite', icon: '🧨', description: 'Blasts a 3x3 area' },
    effect: 'clear_3x3',
  },
  rainbowStar: {
    category: 'match',
    matchType: 'five_in_row',
    wife: { name: 'Rainbow Star', icon: '🌈', description: 'Clears all tiles of a chosen type' },
    husband: { name: 'Golden Hammer', icon: '🔨', description: 'Smashes all tiles of a chosen type' },
    effect: 'clear_color',
  },
  doubleRainbow: {
    category: 'match',
    matchType: 'special_combo',
    wife: { name: 'Double Rainbow', icon: '✨', description: 'Massive board clear!' },
    husband: { name: 'Master Tool', icon: '🛠️', description: 'Massive board clear!' },
    effect: 'massive_clear',
  },

  // --- Inventory Power-ups ---
  loveLetter: {
    category: 'inventory',
    wife: { name: 'Love Letter', icon: '💌', description: 'Shuffles the entire board' },
    husband: { name: 'Blueprint', icon: '📐', description: 'Reshuffles the entire board' },
    effect: 'shuffle',
  },
  cupidsArrow: {
    category: 'inventory',
    wife: { name: "Cupid's Arrow", icon: '🏹', description: 'Removes a single chosen tile' },
    husband: { name: 'Laser Level', icon: '📏', description: 'Zaps a single chosen tile' },
    effect: 'remove_one',
  },
  weddingBell: {
    category: 'inventory',
    wife: { name: 'Wedding Bell', icon: '🔔', description: 'Adds 5 extra moves' },
    husband: { name: 'Air Horn', icon: '📯', description: 'Adds 5 extra moves' },
    effect: 'extra_moves',
  },
  angelWings: {
    category: 'inventory',
    wife: { name: 'Angel Wings', icon: '👼', description: 'Clears a full row AND column (cross)' },
    husband: { name: 'Jetpack', icon: '🚀', description: 'Clears a full row AND column (cross)' },
    effect: 'clear_cross',
  },
  rosePetalRain: {
    category: 'inventory',
    wife: { name: 'Rose Petal Rain', icon: '🌹', description: 'Randomly clears 10 tiles' },
    husband: { name: 'Sawdust Storm', icon: '🌪️', description: 'Randomly clears 10 tiles' },
    effect: 'random_clear_10',
  },
};

// Map match types to powerup keys for lookup
const MATCH_TYPE_TO_POWERUP = {
  four_in_row: 'loveArrow',
  l_or_t_shape: 'heartBomb',
  five_in_row: 'rainbowStar',
  special_combo: 'doubleRainbow',
};

// ============================================================
// TILE CLEARING LOGIC
// ============================================================

/**
 * Compute which tiles to clear for a given effect.
 * @param {string} effect - The effect key from POWERUP_DEFINITIONS
 * @param {number} row - Target row
 * @param {number} col - Target column
 * @param {Array<Array>} board - 2D board array
 * @param {object} [options] - Extra options (direction, swappedTileType, etc.)
 * @returns {{ tilesToClear: Array<{row: number, col: number}>, extraMoves?: number, shuffle?: boolean }}
 */
function computeEffect(effect, row, col, board, options = {}) {
  const rows = board.length;
  const cols = board[0].length;

  switch (effect) {
    case 'clear_line': {
      // Direction based on how the match was formed
      const tiles = [];
      const direction = options.direction || 'row';
      if (direction === 'row') {
        for (let c = 0; c < cols; c++) {
          tiles.push({ row, col: c });
        }
      } else {
        for (let r = 0; r < rows; r++) {
          tiles.push({ row: r, col });
        }
      }
      return { tilesToClear: tiles };
    }

    case 'clear_3x3': {
      const tiles = [];
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            tiles.push({ row: r, col: c });
          }
        }
      }
      return { tilesToClear: tiles };
    }

    case 'clear_color': {
      // Clear all tiles matching the swapped tile's type
      const targetType = options.swappedTileType ?? board[row]?.[col]?.type;
      if (targetType == null) {
        return { tilesToClear: [{ row, col }] };
      }
      const tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c] && board[r][c].type === targetType) {
            tiles.push({ row: r, col: c });
          }
        }
      }
      return { tilesToClear: tiles };
    }

    case 'massive_clear': {
      // Clear roughly 2/3 of the board at random
      const allTiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]) {
            allTiles.push({ row: r, col: c });
          }
        }
      }
      // Shuffle and take ~66%
      const count = Math.ceil(allTiles.length * 0.66);
      shuffleArray(allTiles);
      return { tilesToClear: allTiles.slice(0, count) };
    }

    case 'shuffle': {
      return { tilesToClear: [], shuffle: true };
    }

    case 'remove_one': {
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        return { tilesToClear: [{ row, col }] };
      }
      return { tilesToClear: [] };
    }

    case 'extra_moves': {
      return { tilesToClear: [], extraMoves: 5 };
    }

    case 'clear_cross': {
      const tiles = [];
      for (let c = 0; c < cols; c++) {
        tiles.push({ row, col: c });
      }
      for (let r = 0; r < rows; r++) {
        if (r !== row) {
          tiles.push({ row: r, col });
        }
      }
      return { tilesToClear: tiles };
    }

    case 'random_clear_10': {
      const allTiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c]) {
            allTiles.push({ row: r, col: c });
          }
        }
      }
      shuffleArray(allTiles);
      return { tilesToClear: allTiles.slice(0, Math.min(10, allTiles.length)) };
    }

    default:
      return { tilesToClear: [] };
  }
}

/** Fisher-Yates shuffle (in place) */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================
// POWERUP MANAGER
// ============================================================

let nextPowerupId = 1;

export class PowerupManager {
  constructor() {
    // Inventory: { powerupType: count }
    this.inventory = {};
    // Active board powerups placed by matches: Map<id, { type, row, col, direction }>
    this.boardPowerups = new Map();
  }

  // ----------------------------------------------------------
  // Match-created power-ups
  // ----------------------------------------------------------

  /**
   * Create a powerup from a match and place it on the board.
   * @param {'four_in_row'|'l_or_t_shape'|'five_in_row'|'special_combo'} matchType
   * @param {{ row: number, col: number, direction?: 'row'|'col' }} position
   * @param {'wife'|'husband'} theme
   * @returns {{ id: number, powerupType: string, position: {row, col}, theme: string, displayName: string, icon: string }}
   */
  createFromMatch(matchType, position, theme = 'wife') {
    const powerupType = MATCH_TYPE_TO_POWERUP[matchType];
    if (!powerupType) {
      throw new Error(`Unknown match type: ${matchType}`);
    }

    const def = POWERUP_DEFINITIONS[powerupType];
    const id = nextPowerupId++;
    const entry = {
      id,
      type: powerupType,
      row: position.row,
      col: position.col,
      direction: position.direction || 'row',
    };
    this.boardPowerups.set(id, entry);

    const themed = def[theme] || def.wife;
    return {
      id,
      powerupType,
      position: { row: position.row, col: position.col },
      theme,
      displayName: themed.name,
      icon: themed.icon,
    };
  }

  // ----------------------------------------------------------
  // Activate a board powerup
  // ----------------------------------------------------------

  /**
   * Activate a powerup that sits on the board (created from a match).
   * @param {number} powerupId - The id returned by createFromMatch
   * @param {number} targetRow - Row to target (used for color-clear swap target)
   * @param {number} targetCol - Column to target
   * @param {Array<Array>} board - The current 2D board
   * @param {object} [options] - Extra options (swappedTileType for rainbowStar)
   * @returns {{ tilesToClear: Array<{row,col}>, extraMoves?: number, shuffle?: boolean }}
   */
  activate(powerupId, targetRow, targetCol, board, options = {}) {
    const entry = this.boardPowerups.get(powerupId);
    if (!entry) {
      throw new Error(`No board powerup with id ${powerupId}`);
    }

    const def = POWERUP_DEFINITIONS[entry.type];
    const effectOptions = {
      direction: entry.direction,
      ...options,
    };

    // For clear_color, use the target position (the tile it was swapped with)
    const effectRow = def.effect === 'clear_color' ? targetRow : entry.row;
    const effectCol = def.effect === 'clear_color' ? targetCol : entry.col;

    const result = computeEffect(def.effect, effectRow, effectCol, board, effectOptions);

    // Remove from board after activation
    this.boardPowerups.delete(powerupId);

    return result;
  }

  // ----------------------------------------------------------
  // Inventory power-ups
  // ----------------------------------------------------------

  /**
   * Add power-ups to inventory.
   * @param {string} powerupType - Key from POWERUP_DEFINITIONS (e.g. 'loveLetter')
   * @param {number} [count=1]
   */
  addToInventory(powerupType, count = 1) {
    if (!POWERUP_DEFINITIONS[powerupType]) {
      throw new Error(`Unknown powerup type: ${powerupType}`);
    }
    if (POWERUP_DEFINITIONS[powerupType].category !== 'inventory') {
      throw new Error(`${powerupType} is not an inventory powerup`);
    }
    this.inventory[powerupType] = (this.inventory[powerupType] || 0) + count;
  }

  /**
   * Use a stored inventory power-up. Decrements the count.
   * @param {string} powerupType
   * @param {number} targetRow
   * @param {number} targetCol
   * @param {Array<Array>} board
   * @returns {{ tilesToClear: Array<{row,col}>, extraMoves?: number, shuffle?: boolean }}
   */
  useFromInventory(powerupType, targetRow = 0, targetCol = 0, board = []) {
    if (!this.inventory[powerupType] || this.inventory[powerupType] <= 0) {
      throw new Error(`No ${powerupType} in inventory`);
    }

    const def = POWERUP_DEFINITIONS[powerupType];
    if (!def || def.category !== 'inventory') {
      throw new Error(`${powerupType} is not a valid inventory powerup`);
    }

    this.inventory[powerupType]--;
    if (this.inventory[powerupType] === 0) {
      delete this.inventory[powerupType];
    }

    return computeEffect(def.effect, targetRow, targetCol, board);
  }

  // ----------------------------------------------------------
  // Spouse Gifts
  // ----------------------------------------------------------

  /**
   * Receive a gift power-up from the spouse.
   * Maps the gift to the corresponding inventory powerup and adds it.
   * @param {string} fromSpouse - Display name, e.g. "Your husband" or "Your wife"
   * @param {string} powerupType - Key from POWERUP_DEFINITIONS (any category)
   * @returns {{ message: string, powerupType: string }}
   */
  receiveGift(fromSpouse, powerupType) {
    const def = POWERUP_DEFINITIONS[powerupType];
    if (!def) {
      throw new Error(`Unknown powerup type for gift: ${powerupType}`);
    }

    // For match-created powerups received as gifts, we store them as inventory items
    // so the player can deploy them on their turn
    this.inventory[powerupType] = (this.inventory[powerupType] || 0) + 1;

    // Pick themed name based on who sent it
    const isHusband = fromSpouse.toLowerCase().includes('husband');
    const themed = isHusband ? (def.husband || def.wife) : (def.wife || def.husband);

    return {
      message: `${fromSpouse} sent you a ${themed.name}!`,
      powerupType,
    };
  }

  // ----------------------------------------------------------
  // Use a gift powerup (works for both match-type and inventory-type gifts)
  // ----------------------------------------------------------

  /**
   * Use a gifted powerup from inventory (handles both match-type and inventory-type).
   * @param {string} powerupType
   * @param {number} targetRow
   * @param {number} targetCol
   * @param {Array<Array>} board
   * @param {object} [options]
   * @returns {{ tilesToClear: Array<{row,col}>, extraMoves?: number, shuffle?: boolean }}
   */
  useGift(powerupType, targetRow = 0, targetCol = 0, board = [], options = {}) {
    if (!this.inventory[powerupType] || this.inventory[powerupType] <= 0) {
      throw new Error(`No ${powerupType} in inventory`);
    }

    const def = POWERUP_DEFINITIONS[powerupType];
    if (!def) {
      throw new Error(`Unknown powerup type: ${powerupType}`);
    }

    this.inventory[powerupType]--;
    if (this.inventory[powerupType] === 0) {
      delete this.inventory[powerupType];
    }

    return computeEffect(def.effect, targetRow, targetCol, board, options);
  }

  // ----------------------------------------------------------
  // Queries
  // ----------------------------------------------------------

  /**
   * Get current inventory counts.
   * @returns {Object<string, { count: number, name: string, icon: string, description: string }>}
   */
  getInventory(theme = 'wife') {
    const result = {};
    for (const [type, count] of Object.entries(this.inventory)) {
      const def = POWERUP_DEFINITIONS[type];
      if (!def) continue;
      const themed = def[theme] || def.wife;
      result[type] = {
        count,
        name: themed.name,
        icon: themed.icon,
        description: themed.description,
      };
    }
    return result;
  }

  /**
   * Get the themed display text for a powerup.
   * @param {string} powerupType
   * @param {'wife'|'husband'} theme
   * @returns {{ name: string, icon: string, description: string, effect: string }}
   */
  getEffectDescription(powerupType, theme = 'wife') {
    const def = POWERUP_DEFINITIONS[powerupType];
    if (!def) {
      throw new Error(`Unknown powerup type: ${powerupType}`);
    }
    const themed = def[theme] || def.wife;
    return {
      name: themed.name,
      icon: themed.icon,
      description: themed.description,
      effect: def.effect,
    };
  }

  /**
   * Get all board powerups currently placed.
   * @returns {Array<{ id: number, type: string, row: number, col: number }>}
   */
  getBoardPowerups() {
    return Array.from(this.boardPowerups.values());
  }

  /**
   * Check if a board cell contains a powerup.
   * @param {number} row
   * @param {number} col
   * @returns {object|null} The powerup entry or null
   */
  getPowerupAt(row, col) {
    for (const entry of this.boardPowerups.values()) {
      if (entry.row === row && entry.col === col) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Detect if two adjacent powerups are being swapped (triggers special combo).
   * @param {number} row1
   * @param {number} col1
   * @param {number} row2
   * @param {number} col2
   * @returns {boolean}
   */
  isSpecialCombo(row1, col1, row2, col2) {
    const p1 = this.getPowerupAt(row1, col1);
    const p2 = this.getPowerupAt(row2, col2);
    return !!(p1 && p2);
  }

  /**
   * Activate a special combo when two powerups are swapped together.
   * Removes both and triggers the Double Rainbow / Master Tool effect.
   * @param {number} row1
   * @param {number} col1
   * @param {number} row2
   * @param {number} col2
   * @param {Array<Array>} board
   * @returns {{ tilesToClear: Array<{row,col}>, extraMoves?: number, shuffle?: boolean }}
   */
  activateSpecialCombo(row1, col1, row2, col2, board) {
    const p1 = this.getPowerupAt(row1, col1);
    const p2 = this.getPowerupAt(row2, col2);

    if (!p1 || !p2) {
      throw new Error('Both cells must contain powerups for a special combo');
    }

    // Remove both powerups
    this.boardPowerups.delete(p1.id);
    this.boardPowerups.delete(p2.id);

    // Compute the center point between the two
    const centerRow = Math.round((row1 + row2) / 2);
    const centerCol = Math.round((col1 + col2) / 2);

    return computeEffect('massive_clear', centerRow, centerCol, board);
  }

  /**
   * Reset all state (for new game).
   */
  reset() {
    this.inventory = {};
    this.boardPowerups.clear();
  }
}

export default PowerupManager;
