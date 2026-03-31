// themes.js — Love Match game theme system
// Two complete visual themes: "Garden of Love" (wife) and "The Workshop" (husband)

export const WIFE_THEME = {
  id: 'wife',
  name: 'Garden of Love',
  description: 'A romantic garden filled with love and beauty',

  colors: {
    primary: '#FF69B4',
    secondary: '#E6E6FA',
    accent: '#B76E79',
    background: '#FFF0F5',
    text: '#4A2040',
    textLight: '#FFFDD0',
    softPink: '#FFB6C1',
    hotPink: '#FF69B4',
    lavender: '#E6E6FA',
    roseGold: '#B76E79',
    cream: '#FFFDD0',
    mint: '#98FB98',
    deepPink: '#FF1493',
    coral: '#FF7F50',
    gold: '#FFD700',
    roseRed: '#C21E56',
    springGreen: '#90EE90',
    white: '#FFFEFA',
  },

  tiles: [
    { name: 'Kitten',  emoji: '🐱', bgColor: '#FFB6C1', bgGradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC1CC 100%)' },
    { name: 'Heart',   emoji: '❤️', bgColor: '#C21E56', bgGradient: 'linear-gradient(135deg, #C21E56 0%, #E8365D 100%)' },
    { name: 'Rose',    emoji: '🌹', bgColor: '#FF1493', bgGradient: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)' },
    { name: 'Ring',    emoji: '💍', bgColor: '#FFD700', bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 100%)' },
    { name: 'Dove',    emoji: '🕊️', bgColor: '#FFFDD0', bgGradient: 'linear-gradient(135deg, #FFFDD0 0%, #FFFEFA 100%)' },
    { name: 'Cake',    emoji: '🎂', bgColor: '#E6E6FA', bgGradient: 'linear-gradient(135deg, #E6E6FA 0%, #F0E6FF 100%)' },
    { name: 'Bouquet', emoji: '💐', bgColor: '#90EE90', bgGradient: 'linear-gradient(135deg, #90EE90 0%, #98FB98 100%)' },
    { name: 'Gift',    emoji: '🎁', bgColor: '#FF7F50', bgGradient: 'linear-gradient(135deg, #FF7F50 0%, #FFA07A 100%)' },
  ],

  powerups: {
    lineBlast:   { name: 'Love Arrow',      icon: '💘' },
    bomb:        { name: 'Heart Bomb',       icon: '💗' },
    rainbow:     { name: 'Rainbow Star',     icon: '🌈' },
    wings:       { name: 'Angel Wings',      icon: '👼' },
    storm:       { name: 'Rose Petal Rain',  icon: '🌸' },
    letter:      { name: 'Love Letter',      icon: '💌' },
    superArrow:  { name: "Cupid's Arrow",    icon: '🏹' },
    bell:        { name: 'Wedding Bell',     icon: '🔔' },
  },

  fonts: {
    heading: "'Dancing Script', 'Pacifico', cursive",
    body: "'Quicksand', 'Nunito', sans-serif",
    score: "'Fredoka One', 'Bubblegum Sans', cursive",
  },

  background: {
    gradient: 'linear-gradient(180deg, #FFB6C1 0%, #E6E6FA 50%, #FFF0F5 100%)',
    floatingElements: ['🌸', '🦋', '✨', '💕', '🌺'],
    floatingCount: 20,
    floatingSpeed: { min: 8, max: 18 },
    floatingOpacity: { min: 0.3, max: 0.7 },
    floatingSizeRange: { min: 14, max: 28 },
  },

  board: {
    tileShape: 'rounded',
    tileBorderRadius: 14,
    tileBorder: '2px solid rgba(255, 105, 180, 0.3)',
    tileShadow: '0 3px 8px rgba(183, 110, 121, 0.25)',
    tileHoverShadow: '0 5px 16px rgba(255, 105, 180, 0.4)',
    tileActiveScale: 0.92,
    boardBackground: 'rgba(255, 255, 255, 0.35)',
    boardBorder: '3px solid rgba(255, 182, 193, 0.5)',
    boardBorderRadius: 18,
    boardShadow: '0 8px 32px rgba(183, 110, 121, 0.2)',
    patternOverlay: 'floral',
    gapSize: 4,
  },

  ui: {
    buttonBackground: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
    buttonText: '#FFFFFF',
    buttonBorderRadius: 24,
    buttonShadow: '0 4px 12px rgba(255, 105, 180, 0.4)',
    buttonHoverBackground: 'linear-gradient(135deg, #FF1493 0%, #C71585 100%)',
    buttonShape: 'heart-inspired',
    borderStyle: 'flower',
    borderImage: 'url(assets/flower-border.png)',
    headerBackground: 'rgba(255, 182, 193, 0.6)',
    scoreBackground: 'rgba(230, 230, 250, 0.7)',
    modalBackground: 'rgba(255, 240, 245, 0.95)',
    modalBorder: '2px solid #FFB6C1',
    progressBarColor: 'linear-gradient(90deg, #FF69B4, #FF1493, #B76E79)',
    iconStyle: 'hearts',
  },

  particles: {
    match: {
      types: ['❤️', '✨', '💕'],
      count: 8,
      speed: { min: 2, max: 6 },
      lifetime: 800,
      gravity: 0.3,
      spread: 60,
      sizeRange: { min: 12, max: 24 },
    },
    combo: {
      types: ['🌸', '🦋', '💖', '✨', '🌺'],
      count: 16,
      speed: { min: 3, max: 8 },
      lifetime: 1200,
      gravity: 0.2,
      spread: 120,
      sizeRange: { min: 14, max: 30 },
    },
    cascade: {
      types: ['🌷', '🌸', '💐', '✨'],
      count: 24,
      speed: { min: 1, max: 4 },
      lifetime: 2000,
      gravity: 0.15,
      spread: 180,
      sizeRange: { min: 10, max: 22 },
    },
    powerup: {
      types: ['💗', '💘', '💝', '✨', '🌈'],
      count: 20,
      speed: { min: 4, max: 10 },
      lifetime: 1500,
      gravity: 0.1,
      spread: 360,
      sizeRange: { min: 16, max: 32 },
    },
    ambient: {
      types: ['🌸', '🦋'],
      count: 5,
      speed: { min: 0.5, max: 1.5 },
      lifetime: 6000,
      gravity: -0.02,
      spread: 40,
      sizeRange: { min: 12, max: 20 },
    },
  },

  sounds: {
    mood: 'romantic',
    tempo: 'gentle',
    matchSound: 'chime',
    comboSound: 'harp-gliss',
    powerupSound: 'sparkle-rise',
    backgroundLoop: 'music-box',
  },

  animations: {
    matchDuration: 400,
    swapDuration: 250,
    cascadeDuration: 300,
    cascadeDelay: 60,
    bounceIntensity: 1.1,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};


export const HUSBAND_THEME = {
  id: 'husband',
  name: 'The Workshop',
  description: 'A rugged workshop full of tools and craftsmanship',

  colors: {
    primary: '#D2691E',
    secondary: '#708090',
    accent: '#228B22',
    background: '#2C1A0E',
    text: '#F5F0E8',
    textLight: '#DEB887',
    saddleBrown: '#8B4513',
    chocolate: '#D2691E',
    forestGreen: '#228B22',
    steel: '#708090',
    navy: '#000080',
    warmWood: '#DEB887',
    darkGray: '#404040',
    silver: '#C0C0C0',
    blueSteel: '#4682B4',
    redBrown: '#8B2500',
    electricYellow: '#FFD700',
    lightWood: '#D2B48C',
  },

  tiles: [
    { name: 'Hammer', emoji: '🔨', bgColor: '#708090', bgGradient: 'linear-gradient(135deg, #708090 0%, #8A9BAE 100%)' },
    { name: 'Saw',    emoji: '🪚', bgColor: '#C0C0C0', bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #D8D8D8 100%)' },
    { name: 'Drill',  emoji: '🔧', bgColor: '#4682B4', bgGradient: 'linear-gradient(135deg, #4682B4 0%, #5A9BD4 100%)' },
    { name: 'Wrench', emoji: '🔩', bgColor: '#404040', bgGradient: 'linear-gradient(135deg, #404040 0%, #5A5A5A 100%)' },
    { name: 'Log',    emoji: '🪵', bgColor: '#DEB887', bgGradient: 'linear-gradient(135deg, #DEB887 0%, #D2B48C 100%)' },
    { name: 'Axe',    emoji: '🪓', bgColor: '#8B2500', bgGradient: 'linear-gradient(135deg, #8B2500 0%, #A0522D 100%)' },
    { name: 'Bolt',   emoji: '⚡', bgColor: '#FFD700', bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFC125 100%)' },
    { name: 'Plank',  emoji: '📐', bgColor: '#D2B48C', bgGradient: 'linear-gradient(135deg, #D2B48C 0%, #C4A882 100%)' },
  ],

  powerups: {
    lineBlast:   { name: 'Power Drill',    icon: '🔧' },
    bomb:        { name: 'Dynamite',        icon: '🧨' },
    rainbow:     { name: 'Golden Hammer',   icon: '🔨' },
    wings:       { name: 'Master Tool',     icon: '🛠️' },
    storm:       { name: 'Sawdust Storm',   icon: '🌪️' },
    letter:      { name: 'Blueprint',       icon: '📐' },
    superArrow:  { name: 'Laser Level',     icon: '📏' },
    bell:        { name: 'Air Horn',        icon: '📢' },
  },

  fonts: {
    heading: "'Black Ops One', 'Bebas Neue', sans-serif",
    body: "'Roboto Condensed', 'Oswald', sans-serif",
    score: "'Bungee', 'Anton', sans-serif",
  },

  background: {
    gradient: 'linear-gradient(180deg, #3E2723 0%, #2C1A0E 50%, #1A0F08 100%)',
    floatingElements: ['🪵', '⚙️', '🔩', '💨'],
    floatingCount: 12,
    floatingSpeed: { min: 6, max: 14 },
    floatingOpacity: { min: 0.15, max: 0.4 },
    floatingSizeRange: { min: 12, max: 24 },
  },

  board: {
    tileShape: 'square',
    tileBorderRadius: 4,
    tileBorder: '2px solid rgba(112, 128, 144, 0.5)',
    tileShadow: '0 3px 8px rgba(0, 0, 0, 0.4)',
    tileHoverShadow: '0 5px 16px rgba(210, 105, 30, 0.5)',
    tileActiveScale: 0.94,
    boardBackground: 'rgba(60, 30, 10, 0.6)',
    boardBorder: '4px solid rgba(139, 69, 19, 0.7)',
    boardBorderRadius: 6,
    boardShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(222, 184, 135, 0.1)',
    patternOverlay: 'woodgrain',
    gapSize: 3,
  },

  ui: {
    buttonBackground: 'linear-gradient(135deg, #708090 0%, #4A5568 100%)',
    buttonText: '#F5F0E8',
    buttonBorderRadius: 6,
    buttonShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    buttonHoverBackground: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    buttonShape: 'riveted',
    borderStyle: 'metal',
    borderImage: 'url(assets/metal-border.png)',
    headerBackground: 'rgba(139, 69, 19, 0.7)',
    scoreBackground: 'rgba(112, 128, 144, 0.5)',
    modalBackground: 'rgba(44, 26, 14, 0.95)',
    modalBorder: '3px solid #708090',
    progressBarColor: 'linear-gradient(90deg, #D2691E, #FFD700, #228B22)',
    iconStyle: 'tools',
  },

  particles: {
    match: {
      types: ['⚡', '🔥', '💥'],
      count: 8,
      speed: { min: 3, max: 7 },
      lifetime: 600,
      gravity: 0.5,
      spread: 50,
      sizeRange: { min: 12, max: 24 },
    },
    combo: {
      types: ['🔥', '⚡', '💥', '⚙️', '🔩'],
      count: 14,
      speed: { min: 4, max: 10 },
      lifetime: 1000,
      gravity: 0.4,
      spread: 100,
      sizeRange: { min: 14, max: 28 },
    },
    cascade: {
      types: ['🪵', '⚙️', '🔩', '💨'],
      count: 20,
      speed: { min: 2, max: 5 },
      lifetime: 1600,
      gravity: 0.3,
      spread: 150,
      sizeRange: { min: 10, max: 20 },
    },
    powerup: {
      types: ['🔥', '⚡', '💥', '🌪️', '🧨'],
      count: 18,
      speed: { min: 5, max: 12 },
      lifetime: 1200,
      gravity: 0.2,
      spread: 360,
      sizeRange: { min: 16, max: 32 },
    },
    ambient: {
      types: ['💨', '⚙️'],
      count: 4,
      speed: { min: 0.3, max: 1.0 },
      lifetime: 5000,
      gravity: 0.05,
      spread: 30,
      sizeRange: { min: 10, max: 18 },
    },
  },

  sounds: {
    mood: 'upbeat',
    tempo: 'rhythmic',
    matchSound: 'clank',
    comboSound: 'power-saw',
    powerupSound: 'electric-drill',
    backgroundLoop: 'workshop-rhythm',
  },

  animations: {
    matchDuration: 350,
    swapDuration: 200,
    cascadeDuration: 250,
    cascadeDelay: 50,
    bounceIntensity: 1.15,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};


const THEMES = {
  wife: WIFE_THEME,
  husband: HUSBAND_THEME,
};


export class ThemeManager {
  constructor(themeId = 'wife') {
    this._themeId = themeId;
    this._theme = THEMES[themeId];
    if (!this._theme) {
      throw new Error(`Unknown theme: "${themeId}". Valid themes: ${Object.keys(THEMES).join(', ')}`);
    }
  }

  getTheme() {
    return { ...this._theme };
  }

  setTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) {
      throw new Error(`Unknown theme: "${themeId}". Valid themes: ${Object.keys(THEMES).join(', ')}`);
    }
    this._themeId = themeId;
    this._theme = theme;
    return this;
  }

  get themeId() {
    return this._themeId;
  }

  getTileConfig(tileIndex) {
    const tile = this._theme.tiles[tileIndex];
    if (!tile) {
      throw new RangeError(`Tile index ${tileIndex} out of range (0-${this._theme.tiles.length - 1})`);
    }
    return {
      emoji: tile.emoji,
      name: tile.name,
      bgColor: tile.bgColor,
      bgGradient: tile.bgGradient,
    };
  }

  getTileCount() {
    return this._theme.tiles.length;
  }

  getAllTiles() {
    return this._theme.tiles.map((tile) => ({
      emoji: tile.emoji,
      name: tile.name,
      bgColor: tile.bgColor,
      bgGradient: tile.bgGradient,
    }));
  }

  getPowerupName(powerupType) {
    const powerup = this._theme.powerups[powerupType];
    if (!powerup) {
      throw new Error(`Unknown powerup type: "${powerupType}". Valid types: ${Object.keys(this._theme.powerups).join(', ')}`);
    }
    return powerup.name;
  }

  getPowerupIcon(powerupType) {
    const powerup = this._theme.powerups[powerupType];
    if (!powerup) {
      throw new Error(`Unknown powerup type: "${powerupType}". Valid types: ${Object.keys(this._theme.powerups).join(', ')}`);
    }
    return powerup.icon;
  }

  getAllPowerups() {
    return { ...this._theme.powerups };
  }

  getColors() {
    return {
      primary: this._theme.colors.primary,
      secondary: this._theme.colors.secondary,
      accent: this._theme.colors.accent,
      background: this._theme.colors.background,
      text: this._theme.colors.text,
    };
  }

  getFullColorPalette() {
    return { ...this._theme.colors };
  }

  getFonts() {
    return {
      heading: this._theme.fonts.heading,
      body: this._theme.fonts.body,
      score: this._theme.fonts.score,
    };
  }

  getParticleConfig(effectType) {
    const config = this._theme.particles[effectType];
    if (!config) {
      throw new Error(`Unknown particle effect: "${effectType}". Valid types: ${Object.keys(this._theme.particles).join(', ')}`);
    }
    return { ...config };
  }

  getAllParticleConfigs() {
    const result = {};
    for (const [key, value] of Object.entries(this._theme.particles)) {
      result[key] = { ...value };
    }
    return result;
  }

  getBackgroundConfig() {
    return { ...this._theme.background };
  }

  getBoardStyle() {
    return { ...this._theme.board };
  }

  getUIConfig() {
    return { ...this._theme.ui };
  }

  getSoundConfig() {
    return { ...this._theme.sounds };
  }

  getAnimationConfig() {
    return { ...this._theme.animations };
  }

  getThemeCSSVariables() {
    const t = this._theme;
    return {
      // Core colors
      '--lm-color-primary': t.colors.primary,
      '--lm-color-secondary': t.colors.secondary,
      '--lm-color-accent': t.colors.accent,
      '--lm-color-background': t.colors.background,
      '--lm-color-text': t.colors.text,
      '--lm-color-text-light': t.colors.textLight,

      // Fonts
      '--lm-font-heading': t.fonts.heading,
      '--lm-font-body': t.fonts.body,
      '--lm-font-score': t.fonts.score,

      // Background
      '--lm-bg-gradient': t.background.gradient,

      // Board
      '--lm-tile-border-radius': `${t.board.tileBorderRadius}px`,
      '--lm-tile-border': t.board.tileBorder,
      '--lm-tile-shadow': t.board.tileShadow,
      '--lm-tile-hover-shadow': t.board.tileHoverShadow,
      '--lm-tile-active-scale': t.board.tileActiveScale,
      '--lm-board-bg': t.board.boardBackground,
      '--lm-board-border': t.board.boardBorder,
      '--lm-board-border-radius': `${t.board.boardBorderRadius}px`,
      '--lm-board-shadow': t.board.boardShadow,
      '--lm-board-gap': `${t.board.gapSize}px`,

      // UI
      '--lm-btn-bg': t.ui.buttonBackground,
      '--lm-btn-text': t.ui.buttonText,
      '--lm-btn-radius': `${t.ui.buttonBorderRadius}px`,
      '--lm-btn-shadow': t.ui.buttonShadow,
      '--lm-btn-hover-bg': t.ui.buttonHoverBackground,
      '--lm-header-bg': t.ui.headerBackground,
      '--lm-score-bg': t.ui.scoreBackground,
      '--lm-modal-bg': t.ui.modalBackground,
      '--lm-modal-border': t.ui.modalBorder,
      '--lm-progress-bar': t.ui.progressBarColor,

      // Animations
      '--lm-anim-match': `${t.animations.matchDuration}ms`,
      '--lm-anim-swap': `${t.animations.swapDuration}ms`,
      '--lm-anim-cascade': `${t.animations.cascadeDuration}ms`,
      '--lm-anim-cascade-delay': `${t.animations.cascadeDelay}ms`,
      '--lm-anim-bounce': t.animations.bounceIntensity,
      '--lm-anim-easing': t.animations.easing,
    };
  }

  /**
   * Injects theme CSS custom properties onto a target element (defaults to :root).
   * Useful for applying the theme in a browser environment.
   */
  applyCSS(targetElement = null) {
    const el = targetElement || document.documentElement;
    const vars = this.getThemeCSSVariables();
    for (const [prop, value] of Object.entries(vars)) {
      el.style.setProperty(prop, value);
    }
    return this;
  }
}


export default ThemeManager;
