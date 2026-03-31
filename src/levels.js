// Love Match - Level Definitions & Level Manager
// 50 levels with progressive difficulty across 10 story chapters

// ============================================================
// LEVEL DEFINITIONS
// ============================================================

const LEVELS = [
  // ──────────────────────────────────────────────────────────
  // Chapter 1: "The Beginning" (Levels 1-5)
  // 4 tile types, high moves, simple collect goals, tutorials
  // ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "First Love",
    description: "Match 3 hearts to begin your journey",
    gridSize: 8,
    moves: 35,
    tileTypes: 4,
    goals: [{ type: "collect", tile: "heart", count: 10 }],
    starThresholds: [800, 1600, 2800],
    specialRules: {},
    tutorialText: "Swap two adjacent tiles to make a row of 3 or more matching tiles. Try it now!",
    bibleVerse: "1 Corinthians 13:4 - Love is patient, love is kind.",
    chapter: "The Beginning",
  },
  {
    id: 2,
    name: "Love Letters",
    description: "Collect roses for your beloved",
    gridSize: 8,
    moves: 35,
    tileTypes: 4,
    goals: [{ type: "collect", tile: "rose", count: 12 }],
    starThresholds: [900, 1800, 3000],
    specialRules: {},
    tutorialText: "Each match clears tiles and drops new ones from above. Look for chain reactions!",
    bibleVerse: "Song of Solomon 2:16 - My beloved is mine and I am his.",
    chapter: "The Beginning",
  },
  {
    id: 3,
    name: "Sweet Nothings",
    description: "Collect hearts and roses",
    gridSize: 8,
    moves: 32,
    tileTypes: 4,
    goals: [
      { type: "collect", tile: "heart", count: 8 },
      { type: "collect", tile: "rose", count: 8 },
    ],
    starThresholds: [1000, 2000, 3200],
    specialRules: {},
    tutorialText: "You can have multiple goals! Check the goal panel to track your progress.",
    bibleVerse: "Genesis 2:24 - Therefore a man shall leave his father and mother and hold fast to his wife, and they shall become one flesh.",
    chapter: "The Beginning",
  },
  {
    id: 4,
    name: "Promise Ring",
    description: "Collect rings to seal your promise",
    gridSize: 8,
    moves: 32,
    tileTypes: 4,
    goals: [{ type: "collect", tile: "ring", count: 15 }],
    starThresholds: [1000, 2200, 3500],
    specialRules: {},
    tutorialText: "Matching 4 in a row creates a special tile with extra power!",
    bibleVerse: "Ruth 1:16 - Where you go I will go, and where you stay I will stay.",
    chapter: "The Beginning",
  },
  {
    id: 5,
    name: "The Proposal",
    description: "Reach the target score to pop the question",
    gridSize: 8,
    moves: 30,
    tileTypes: 4,
    goals: [{ type: "score", count: 3000 }],
    starThresholds: [1200, 2500, 4000],
    specialRules: {},
    tutorialText: "Score goals require you to earn points. Bigger matches and combos give more points!",
    bibleVerse: "Proverbs 18:22 - He who finds a wife finds what is good and receives favor from the Lord.",
    chapter: "The Beginning",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 2: "Growing Together" (Levels 6-10)
  // 5 tile types, introduce score goals, slightly fewer moves
  // ──────────────────────────────────────────────────────────
  {
    id: 6,
    name: "Wedding Day",
    description: "Collect flowers for the ceremony",
    gridSize: 8,
    moves: 28,
    tileTypes: 5,
    goals: [{ type: "collect", tile: "flower", count: 18 }],
    starThresholds: [1400, 2800, 4200],
    specialRules: {},
    tutorialText: "A new tile type has appeared! More variety means you need to plan your moves carefully.",
    bibleVerse: "Ecclesiastes 4:9 - Two are better than one, because they have a good return for their labor.",
    chapter: "Growing Together",
  },
  {
    id: 7,
    name: "Honeymoon",
    description: "Score big on your getaway",
    gridSize: 8,
    moves: 28,
    tileTypes: 5,
    goals: [{ type: "score", count: 4000 }],
    starThresholds: [1600, 3000, 4500],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Song of Solomon 4:10 - How delightful is your love, my sister, my bride!",
    chapter: "Growing Together",
  },
  {
    id: 8,
    name: "Moving In",
    description: "Collect hearts and flowers for your new home",
    gridSize: 8,
    moves: 27,
    tileTypes: 5,
    goals: [
      { type: "collect", tile: "heart", count: 12 },
      { type: "collect", tile: "flower", count: 10 },
    ],
    starThresholds: [1800, 3200, 4800],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Psalm 127:1 - Unless the Lord builds the house, the builders labor in vain.",
    chapter: "Growing Together",
  },
  {
    id: 9,
    name: "First Dinner",
    description: "Collect roses and reach the score target",
    gridSize: 8,
    moves: 26,
    tileTypes: 5,
    goals: [
      { type: "collect", tile: "rose", count: 14 },
      { type: "score", count: 2500 },
    ],
    starThresholds: [2000, 3500, 5000],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Song of Solomon 8:7 - Many waters cannot quench love; rivers cannot sweep it away.",
    chapter: "Growing Together",
  },
  {
    id: 10,
    name: "Planting Seeds",
    description: "Collect all five tile types",
    gridSize: 8,
    moves: 26,
    tileTypes: 5,
    goals: [
      { type: "collect", tile: "heart", count: 8 },
      { type: "collect", tile: "rose", count: 8 },
      { type: "collect", tile: "ring", count: 8 },
    ],
    starThresholds: [2200, 3800, 5500],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Galatians 6:9 - Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    chapter: "Growing Together",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 3: "First Dance" (Levels 11-15)
  // 6 tile types, introduce combo goals, powerup tutorial
  // ──────────────────────────────────────────────────────────
  {
    id: 11,
    name: "Dance Floor",
    description: "Create combos on the dance floor",
    gridSize: 8,
    moves: 25,
    tileTypes: 6,
    goals: [{ type: "combo", count: 3 }],
    starThresholds: [2400, 4000, 6000],
    specialRules: {},
    tutorialText: "A combo happens when one match causes another! Set up chain reactions for bonus points.",
    bibleVerse: "Colossians 3:14 - And over all these virtues put on love, which binds them all together in perfect unity.",
    chapter: "First Dance",
  },
  {
    id: 12,
    name: "Slow Dance",
    description: "Collect hearts with fewer moves",
    gridSize: 8,
    moves: 24,
    tileTypes: 6,
    goals: [{ type: "collect", tile: "heart", count: 20 }],
    starThresholds: [2600, 4200, 6200],
    specialRules: {},
    tutorialText: "With 6 tile types, matches are harder to find. Look at the whole board before moving!",
    bibleVerse: "1 Peter 4:8 - Above all, love each other deeply, because love covers over a multitude of sins.",
    chapter: "First Dance",
  },
  {
    id: 13,
    name: "The Waltz",
    description: "Score high and create combos",
    gridSize: 8,
    moves: 24,
    tileTypes: 6,
    goals: [
      { type: "score", count: 5000 },
      { type: "combo", count: 4 },
    ],
    starThresholds: [2800, 4500, 6500],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Ephesians 5:25 - Husbands, love your wives, just as Christ loved the church.",
    chapter: "First Dance",
  },
  {
    id: 14,
    name: "Tango of Hearts",
    description: "Use powerups to collect tiles",
    gridSize: 8,
    moves: 23,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "heart", count: 15 },
      { type: "collect", tile: "flower", count: 15 },
    ],
    starThresholds: [3000, 4800, 7000],
    specialRules: {},
    tutorialText: "Match 5 in a row to create a Rainbow tile! It clears all tiles of one color when matched.",
    bibleVerse: "1 John 4:19 - We love because he first loved us.",
    chapter: "First Dance",
  },
  {
    id: 15,
    name: "Last Dance",
    description: "A grand finale of combos and collection",
    gridSize: 8,
    moves: 22,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "rose", count: 18 },
      { type: "combo", count: 5 },
    ],
    starThresholds: [3200, 5000, 7500],
    specialRules: {},
    tutorialText: null,
    bibleVerse: "Philippians 1:9 - And this is my prayer: that your love may abound more and more in knowledge and depth of insight.",
    chapter: "First Dance",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 4: "Building a Home" (Levels 16-20)
  // Introduce LOCKED TILES (chains), mixed goals
  // ──────────────────────────────────────────────────────────
  {
    id: 16,
    name: "Foundation",
    description: "Clear the chains to build your home",
    gridSize: 8,
    moves: 25,
    tileTypes: 6,
    goals: [{ type: "clearLocked", count: 8 }],
    starThresholds: [3000, 5200, 7800],
    specialRules: {
      lockedTiles: {
        count: 8,
        placement: "random",
      },
    },
    tutorialText: "Some tiles are locked with chains! Match next to them to break the chains and free them.",
    bibleVerse: "Matthew 7:24 - Everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock.",
    chapter: "Building a Home",
  },
  {
    id: 17,
    name: "Framing",
    description: "Free locked tiles and collect hearts",
    gridSize: 8,
    moves: 24,
    tileTypes: 6,
    goals: [
      { type: "clearLocked", count: 10 },
      { type: "collect", tile: "heart", count: 12 },
    ],
    starThresholds: [3200, 5500, 8000],
    specialRules: {
      lockedTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 24:3 - By wisdom a house is built, and through understanding it is established.",
    chapter: "Building a Home",
  },
  {
    id: 18,
    name: "Painting Walls",
    description: "Collect colored tiles and clear chains",
    gridSize: 8,
    moves: 23,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "flower", count: 16 },
      { type: "clearLocked", count: 12 },
    ],
    starThresholds: [3500, 5800, 8500],
    specialRules: {
      lockedTiles: {
        count: 12,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Joshua 24:15 - But as for me and my household, we will serve the Lord.",
    chapter: "Building a Home",
  },
  {
    id: 19,
    name: "Hanging Pictures",
    description: "Score big while dealing with locked tiles",
    gridSize: 8,
    moves: 22,
    tileTypes: 6,
    goals: [
      { type: "score", count: 6000 },
      { type: "clearLocked", count: 10 },
    ],
    starThresholds: [3800, 6000, 9000],
    specialRules: {
      lockedTiles: {
        count: 14,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 128:3 - Your wife will be like a fruitful vine within your house.",
    chapter: "Building a Home",
  },
  {
    id: 20,
    name: "Home Sweet Home",
    description: "Complete three goals to finish your home",
    gridSize: 8,
    moves: 22,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "heart", count: 14 },
      { type: "clearLocked", count: 12 },
      { type: "score", count: 4000 },
    ],
    starThresholds: [4000, 6500, 9500],
    specialRules: {
      lockedTiles: {
        count: 16,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 31:27 - She watches over the affairs of her household and does not eat the bread of idleness.",
    chapter: "Building a Home",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 5: "Through the Storm" (Levels 21-25)
  // Introduce FROZEN TILES (match twice to clear), harder goals
  // ──────────────────────────────────────────────────────────
  {
    id: 21,
    name: "Rain Clouds",
    description: "Thaw the frozen tiles",
    gridSize: 8,
    moves: 25,
    tileTypes: 6,
    goals: [{ type: "clearFrozen", count: 8 }],
    starThresholds: [4000, 6800, 10000],
    specialRules: {
      frozenTiles: {
        count: 8,
        placement: "random",
      },
    },
    tutorialText: "Frozen tiles are covered in ice! Match them once to crack the ice, then again to fully clear them.",
    bibleVerse: "Isaiah 43:2 - When you pass through the waters, I will be with you.",
    chapter: "Through the Storm",
  },
  {
    id: 22,
    name: "Thunder",
    description: "Collect hearts through the frost",
    gridSize: 8,
    moves: 24,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "heart", count: 18 },
      { type: "clearFrozen", count: 10 },
    ],
    starThresholds: [4200, 7000, 10500],
    specialRules: {
      frozenTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Nahum 1:7 - The Lord is good, a refuge in times of trouble.",
    chapter: "Through the Storm",
  },
  {
    id: 23,
    name: "Lightning",
    description: "Score high while thawing ice",
    gridSize: 8,
    moves: 23,
    tileTypes: 6,
    goals: [
      { type: "score", count: 7000 },
      { type: "clearFrozen", count: 12 },
    ],
    starThresholds: [4500, 7500, 11000],
    specialRules: {
      frozenTiles: {
        count: 14,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Romans 8:28 - And we know that in all things God works for the good of those who love him.",
    chapter: "Through the Storm",
  },
  {
    id: 24,
    name: "Weathering It",
    description: "Clear both chains and ice",
    gridSize: 8,
    moves: 22,
    tileTypes: 6,
    goals: [
      { type: "clearLocked", count: 8 },
      { type: "clearFrozen", count: 8 },
    ],
    starThresholds: [4800, 8000, 11500],
    specialRules: {
      lockedTiles: {
        count: 8,
        placement: "random",
      },
      frozenTiles: {
        count: 8,
        placement: "random",
      },
    },
    tutorialText: "Chains AND ice? Stay focused. Prioritize whichever obstacle blocks your goals most.",
    bibleVerse: "James 1:12 - Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life.",
    chapter: "Through the Storm",
  },
  {
    id: 25,
    name: "Rainbow After Rain",
    description: "A triple challenge to end the storm",
    gridSize: 8,
    moves: 22,
    tileTypes: 6,
    goals: [
      { type: "collect", tile: "rose", count: 16 },
      { type: "clearFrozen", count: 10 },
      { type: "combo", count: 6 },
    ],
    starThresholds: [5000, 8500, 12000],
    specialRules: {
      frozenTiles: {
        count: 12,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Genesis 9:13 - I have set my rainbow in the clouds, and it will be the sign of the covenant between me and the earth.",
    chapter: "Through the Storm",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 6: "Renewal of Vows" (Levels 26-30)
  // 7 tile types, introduce STONE BLOCKS (unmovable), creative layouts
  // ──────────────────────────────────────────────────────────
  {
    id: 26,
    name: "Written in Stone",
    description: "Navigate around the stone blocks",
    gridSize: 8,
    moves: 24,
    tileTypes: 7,
    goals: [{ type: "collect", tile: "heart", count: 20 }],
    starThresholds: [5000, 8800, 12500],
    specialRules: {
      stoneBlocks: {
        positions: [
          [3, 3], [3, 4], [4, 3], [4, 4],
        ],
      },
    },
    tutorialText: "Stone blocks cannot be moved or matched. You must work around them!",
    bibleVerse: "Malachi 2:14 - The Lord is the witness between you and the wife of your youth.",
    chapter: "Renewal of Vows",
  },
  {
    id: 27,
    name: "New Promises",
    description: "Collect tiles around the obstacles",
    gridSize: 8,
    moves: 23,
    tileTypes: 7,
    goals: [
      { type: "collect", tile: "flower", count: 18 },
      { type: "score", count: 6000 },
    ],
    starThresholds: [5200, 9000, 13000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [1, 1], [1, 6], [6, 1], [6, 6],
          [3, 3], [4, 4],
        ],
      },
    },
    tutorialText: null,
    bibleVerse: "Jeremiah 31:3 - I have loved you with an everlasting love; I have drawn you with unfailing kindness.",
    chapter: "Renewal of Vows",
  },
  {
    id: 28,
    name: "Heart-Shaped Path",
    description: "Clear obstacles in a heart-shaped board",
    gridSize: 8,
    moves: 23,
    tileTypes: 7,
    goals: [
      { type: "clearLocked", count: 10 },
      { type: "collect", tile: "ring", count: 14 },
    ],
    starThresholds: [5500, 9500, 13500],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 0], [0, 3], [0, 4], [0, 7],
          [7, 0], [7, 1], [7, 6], [7, 7],
        ],
      },
      lockedTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Song of Solomon 3:4 - I found the one my heart loves.",
    chapter: "Renewal of Vows",
  },
  {
    id: 29,
    name: "Eternal Flame",
    description: "Thaw ice surrounded by stone",
    gridSize: 8,
    moves: 22,
    tileTypes: 7,
    goals: [
      { type: "clearFrozen", count: 12 },
      { type: "combo", count: 5 },
    ],
    starThresholds: [5800, 10000, 14000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 3], [0, 4], [3, 0], [4, 0],
          [3, 7], [4, 7], [7, 3], [7, 4],
        ],
      },
      frozenTiles: {
        count: 14,
        placement: "nearStone",
      },
    },
    tutorialText: null,
    bibleVerse: "Romans 12:10 - Be devoted to one another in love. Honor one another above yourselves.",
    chapter: "Renewal of Vows",
  },
  {
    id: 30,
    name: "Vow Renewal",
    description: "Conquer every obstacle to renew your vows",
    gridSize: 8,
    moves: 22,
    tileTypes: 7,
    goals: [
      { type: "collect", tile: "heart", count: 16 },
      { type: "clearLocked", count: 8 },
      { type: "clearFrozen", count: 8 },
    ],
    starThresholds: [6000, 10500, 15000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [2, 2], [2, 5], [5, 2], [5, 5],
        ],
      },
      lockedTiles: {
        count: 8,
        placement: "random",
      },
      frozenTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "1 Corinthians 13:7 - Love bears all things, believes all things, hopes all things, endures all things.",
    chapter: "Renewal of Vows",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 7: "Growing Family" (Levels 31-35)
  // Combine obstacles, tighter move limits
  // ──────────────────────────────────────────────────────────
  {
    id: 31,
    name: "Nursery",
    description: "Prepare the nursery by clearing obstacles",
    gridSize: 8,
    moves: 21,
    tileTypes: 7,
    goals: [
      { type: "clearLocked", count: 12 },
      { type: "collect", tile: "flower", count: 16 },
    ],
    starThresholds: [6200, 11000, 15500],
    specialRules: {
      stoneBlocks: {
        positions: [[3, 3], [4, 4]],
      },
      lockedTiles: {
        count: 14,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 127:3 - Children are a heritage from the Lord, offspring a reward from him.",
    chapter: "Growing Family",
  },
  {
    id: 32,
    name: "First Steps",
    description: "Create combos to celebrate milestones",
    gridSize: 8,
    moves: 20,
    tileTypes: 7,
    goals: [
      { type: "combo", count: 8 },
      { type: "score", count: 8000 },
    ],
    starThresholds: [6500, 11500, 16000],
    specialRules: {
      frozenTiles: {
        count: 10,
        placement: "random",
      },
      stoneBlocks: {
        positions: [[0, 0], [0, 7], [7, 0], [7, 7]],
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 22:6 - Start children off on the way they should go, and even when they are old they will not turn from it.",
    chapter: "Growing Family",
  },
  {
    id: 33,
    name: "Family Dinner",
    description: "Collect for the whole family",
    gridSize: 8,
    moves: 20,
    tileTypes: 7,
    goals: [
      { type: "collect", tile: "heart", count: 14 },
      { type: "collect", tile: "rose", count: 14 },
      { type: "collect", tile: "ring", count: 10 },
    ],
    starThresholds: [6800, 12000, 16500],
    specialRules: {
      lockedTiles: {
        count: 10,
        placement: "random",
      },
      frozenTiles: {
        count: 6,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 133:1 - How good and pleasant it is when God's people live together in unity!",
    chapter: "Growing Family",
  },
  {
    id: 34,
    name: "Bedtime Stories",
    description: "Clear the board of all obstacles",
    gridSize: 8,
    moves: 19,
    tileTypes: 7,
    goals: [
      { type: "clearLocked", count: 10 },
      { type: "clearFrozen", count: 10 },
    ],
    starThresholds: [7000, 12500, 17000],
    specialRules: {
      stoneBlocks: {
        positions: [[2, 3], [2, 4], [5, 3], [5, 4]],
      },
      lockedTiles: {
        count: 12,
        placement: "random",
      },
      frozenTiles: {
        count: 12,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Deuteronomy 6:7 - Impress them on your children. Talk about them when you sit at home and when you walk along the road.",
    chapter: "Growing Family",
  },
  {
    id: 35,
    name: "Family Portrait",
    description: "A complex multi-goal family challenge",
    gridSize: 8,
    moves: 19,
    tileTypes: 7,
    goals: [
      { type: "collect", tile: "heart", count: 18 },
      { type: "clearLocked", count: 10 },
      { type: "clearFrozen", count: 8 },
      { type: "score", count: 6000 },
    ],
    starThresholds: [7500, 13000, 18000],
    specialRules: {
      stoneBlocks: {
        positions: [[3, 0], [4, 0], [3, 7], [4, 7]],
      },
      lockedTiles: {
        count: 12,
        placement: "clustered",
      },
      frozenTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "3 John 1:4 - I have no greater joy than to hear that my children are walking in the truth.",
    chapter: "Growing Family",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 8: "Golden Years" (Levels 36-40)
  // 8 tile types, all obstacles, challenging goals
  // ──────────────────────────────────────────────────────────
  {
    id: 36,
    name: "Silver Anniversary",
    description: "Celebrate 25 years with a grand collection",
    gridSize: 8,
    moves: 20,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 20 },
      { type: "collect", tile: "ring", count: 15 },
    ],
    starThresholds: [7800, 13500, 18500],
    specialRules: {
      lockedTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: "The eighth tile type is here! The board is more complex now, but so is your love.",
    bibleVerse: "Proverbs 5:18 - May your fountain be blessed, and may you rejoice in the wife of your youth.",
    chapter: "Golden Years",
  },
  {
    id: 37,
    name: "Grandchildren",
    description: "Score big for the next generation",
    gridSize: 8,
    moves: 19,
    tileTypes: 8,
    goals: [
      { type: "score", count: 10000 },
      { type: "combo", count: 8 },
    ],
    starThresholds: [8000, 14000, 19000],
    specialRules: {
      stoneBlocks: {
        positions: [[1, 1], [1, 6], [6, 1], [6, 6]],
      },
      frozenTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 17:6 - Children's children are a crown to the aged, and parents are the pride of their children.",
    chapter: "Golden Years",
  },
  {
    id: 38,
    name: "Memory Lane",
    description: "Navigate a winding path of obstacles",
    gridSize: 8,
    moves: 18,
    tileTypes: 8,
    goals: [
      { type: "clearLocked", count: 12 },
      { type: "clearFrozen", count: 10 },
      { type: "collect", tile: "flower", count: 14 },
    ],
    starThresholds: [8500, 14500, 20000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 2], [0, 5], [2, 0], [2, 7],
          [5, 0], [5, 7], [7, 2], [7, 5],
        ],
      },
      lockedTiles: {
        count: 14,
        placement: "random",
      },
      frozenTiles: {
        count: 12,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Lamentations 3:22-23 - His compassions never fail. They are new every morning; great is your faithfulness.",
    chapter: "Golden Years",
  },
  {
    id: 39,
    name: "Golden Sunset",
    description: "A gorgeous but demanding puzzle",
    gridSize: 8,
    moves: 18,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 16 },
      { type: "collect", tile: "rose", count: 16 },
      { type: "combo", count: 6 },
    ],
    starThresholds: [9000, 15000, 21000],
    specialRules: {
      stoneBlocks: {
        positions: [[3, 3], [3, 4], [4, 3], [4, 4]],
      },
      lockedTiles: {
        count: 10,
        placement: "clustered",
      },
      frozenTiles: {
        count: 10,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 90:12 - Teach us to number our days, that we may gain a heart of wisdom.",
    chapter: "Golden Years",
  },
  {
    id: 40,
    name: "Golden Anniversary",
    description: "The ultimate golden challenge",
    gridSize: 8,
    moves: 17,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 20 },
      { type: "clearLocked", count: 12 },
      { type: "clearFrozen", count: 10 },
      { type: "score", count: 8000 },
    ],
    starThresholds: [9500, 16000, 22000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 0], [0, 7], [7, 0], [7, 7],
          [3, 3], [4, 4],
        ],
      },
      lockedTiles: {
        count: 14,
        placement: "clustered",
      },
      frozenTiles: {
        count: 12,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "1 Corinthians 13:13 - And now these three remain: faith, hope and love. But the greatest of these is love.",
    chapter: "Golden Years",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 9: "Legacy of Love" (Levels 41-45)
  // Expert levels, very tight moves, complex multi-goals
  // ──────────────────────────────────────────────────────────
  {
    id: 41,
    name: "Love Letters Found",
    description: "Unearth treasures from the past",
    gridSize: 8,
    moves: 17,
    tileTypes: 8,
    goals: [
      { type: "clearLocked", count: 16 },
      { type: "collect", tile: "heart", count: 14 },
    ],
    starThresholds: [10000, 17000, 23000],
    specialRules: {
      stoneBlocks: {
        positions: [[2, 2], [2, 5], [5, 2], [5, 5]],
      },
      lockedTiles: {
        count: 18,
        placement: "clustered",
      },
      frozenTiles: {
        count: 6,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 119:105 - Your word is a lamp for my feet, a light on my path.",
    chapter: "Legacy of Love",
  },
  {
    id: 42,
    name: "Passing the Torch",
    description: "Score massively with tight constraints",
    gridSize: 8,
    moves: 16,
    tileTypes: 8,
    goals: [
      { type: "score", count: 12000 },
      { type: "combo", count: 10 },
    ],
    starThresholds: [10500, 17500, 24000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [1, 3], [1, 4], [6, 3], [6, 4],
          [3, 1], [4, 1], [3, 6], [4, 6],
        ],
      },
      frozenTiles: {
        count: 12,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "2 Timothy 1:5 - I am reminded of your sincere faith, which first lived in your grandmother Lois and in your mother Eunice.",
    chapter: "Legacy of Love",
  },
  {
    id: 43,
    name: "Heirloom Ring",
    description: "Collect precious rings through dense obstacles",
    gridSize: 8,
    moves: 16,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "ring", count: 20 },
      { type: "clearLocked", count: 10 },
      { type: "clearFrozen", count: 10 },
    ],
    starThresholds: [11000, 18000, 25000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 3], [0, 4], [7, 3], [7, 4],
        ],
      },
      lockedTiles: {
        count: 12,
        placement: "random",
      },
      frozenTiles: {
        count: 12,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 13:22 - A good person leaves an inheritance for their children's children.",
    chapter: "Legacy of Love",
  },
  {
    id: 44,
    name: "Wisdom of Years",
    description: "Use every strategy you have learned",
    gridSize: 8,
    moves: 15,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 16 },
      { type: "collect", tile: "rose", count: 16 },
      { type: "clearFrozen", count: 12 },
    ],
    starThresholds: [11500, 19000, 26000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [2, 0], [5, 0], [2, 7], [5, 7],
          [0, 2], [0, 5], [7, 2], [7, 5],
        ],
      },
      lockedTiles: {
        count: 8,
        placement: "clustered",
      },
      frozenTiles: {
        count: 14,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Proverbs 3:3-4 - Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart.",
    chapter: "Legacy of Love",
  },
  {
    id: 45,
    name: "Love's Legacy",
    description: "A five-goal expert challenge",
    gridSize: 8,
    moves: 15,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 14 },
      { type: "collect", tile: "flower", count: 14 },
      { type: "clearLocked", count: 10 },
      { type: "clearFrozen", count: 8 },
      { type: "combo", count: 6 },
    ],
    starThresholds: [12000, 20000, 28000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 0], [0, 7], [7, 0], [7, 7],
          [3, 3], [3, 4], [4, 3], [4, 4],
        ],
      },
      lockedTiles: {
        count: 12,
        placement: "clustered",
      },
      frozenTiles: {
        count: 10,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Psalm 145:4 - One generation commends your works to another; they tell of your mighty acts.",
    chapter: "Legacy of Love",
  },

  // ──────────────────────────────────────────────────────────
  // Chapter 10: "Eternal Love" (Levels 46-50)
  // Master levels, ultimate challenge
  // ──────────────────────────────────────────────────────────
  {
    id: 46,
    name: "Heavenly Match",
    description: "A divine collection challenge",
    gridSize: 8,
    moves: 15,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 22 },
      { type: "collect", tile: "ring", count: 18 },
      { type: "score", count: 10000 },
    ],
    starThresholds: [12500, 21000, 30000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [1, 1], [1, 6], [6, 1], [6, 6],
          [3, 0], [4, 0], [3, 7], [4, 7],
        ],
      },
      lockedTiles: {
        count: 12,
        placement: "clustered",
      },
      frozenTiles: {
        count: 10,
        placement: "random",
      },
    },
    tutorialText: null,
    bibleVerse: "Revelation 19:7 - Let us rejoice and be glad and give him glory! For the wedding of the Lamb has come.",
    chapter: "Eternal Love",
  },
  {
    id: 47,
    name: "Unbreakable Bond",
    description: "Clear every obstacle type in tight quarters",
    gridSize: 8,
    moves: 14,
    tileTypes: 8,
    goals: [
      { type: "clearLocked", count: 14 },
      { type: "clearFrozen", count: 14 },
      { type: "combo", count: 8 },
    ],
    starThresholds: [13000, 22000, 32000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 2], [0, 5], [2, 0], [5, 0],
          [2, 7], [5, 7], [7, 2], [7, 5],
          [3, 3], [4, 4],
        ],
      },
      lockedTiles: {
        count: 16,
        placement: "clustered",
      },
      frozenTiles: {
        count: 16,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Ecclesiastes 4:12 - Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken.",
    chapter: "Eternal Love",
  },
  {
    id: 48,
    name: "Forever & Always",
    description: "A massive multi-goal endurance test",
    gridSize: 8,
    moves: 14,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 18 },
      { type: "collect", tile: "rose", count: 18 },
      { type: "clearLocked", count: 12 },
      { type: "clearFrozen", count: 10 },
    ],
    starThresholds: [14000, 24000, 34000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [1, 3], [1, 4], [3, 1], [4, 1],
          [3, 6], [4, 6], [6, 3], [6, 4],
        ],
      },
      lockedTiles: {
        count: 14,
        placement: "clustered",
      },
      frozenTiles: {
        count: 12,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "Romans 8:38-39 - Neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.",
    chapter: "Eternal Love",
  },
  {
    id: 49,
    name: "Love Conquers All",
    description: "The penultimate test of devotion",
    gridSize: 8,
    moves: 13,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 20 },
      { type: "clearLocked", count: 14 },
      { type: "clearFrozen", count: 12 },
      { type: "combo", count: 10 },
      { type: "score", count: 12000 },
    ],
    starThresholds: [15000, 26000, 36000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 0], [0, 3], [0, 4], [0, 7],
          [3, 0], [4, 0], [3, 7], [4, 7],
          [7, 0], [7, 3], [7, 4], [7, 7],
        ],
      },
      lockedTiles: {
        count: 16,
        placement: "clustered",
      },
      frozenTiles: {
        count: 14,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "1 John 4:18 - There is no fear in love. But perfect love drives out fear.",
    chapter: "Eternal Love",
  },
  {
    id: 50,
    name: "Eternal Love",
    description: "The ultimate challenge - prove your love is eternal",
    gridSize: 8,
    moves: 12,
    tileTypes: 8,
    goals: [
      { type: "collect", tile: "heart", count: 24 },
      { type: "collect", tile: "rose", count: 20 },
      { type: "clearLocked", count: 16 },
      { type: "clearFrozen", count: 14 },
      { type: "combo", count: 12 },
    ],
    starThresholds: [16000, 28000, 40000],
    specialRules: {
      stoneBlocks: {
        positions: [
          [0, 0], [0, 7], [7, 0], [7, 7],
          [2, 2], [2, 5], [5, 2], [5, 5],
          [3, 3], [3, 4], [4, 3], [4, 4],
        ],
      },
      lockedTiles: {
        count: 18,
        placement: "clustered",
      },
      frozenTiles: {
        count: 16,
        placement: "clustered",
      },
    },
    tutorialText: null,
    bibleVerse: "1 Corinthians 13:8 - Love never fails.",
    chapter: "Eternal Love",
  },
];

// ============================================================
// CHAPTER DEFINITIONS
// ============================================================

const CHAPTERS = [
  { id: 1, name: "The Beginning", levelRange: [1, 5], icon: "seedling" },
  { id: 2, name: "Growing Together", levelRange: [6, 10], icon: "sprout" },
  { id: 3, name: "First Dance", levelRange: [11, 15], icon: "music" },
  { id: 4, name: "Building a Home", levelRange: [16, 20], icon: "house" },
  { id: 5, name: "Through the Storm", levelRange: [21, 25], icon: "cloud" },
  { id: 6, name: "Renewal of Vows", levelRange: [26, 30], icon: "rings" },
  { id: 7, name: "Growing Family", levelRange: [31, 35], icon: "family" },
  { id: 8, name: "Golden Years", levelRange: [36, 40], icon: "star" },
  { id: 9, name: "Legacy of Love", levelRange: [41, 45], icon: "scroll" },
  { id: 10, name: "Eternal Love", levelRange: [46, 50], icon: "infinity" },
];

// ============================================================
// LEVEL MANAGER CLASS
// ============================================================

class LevelManager {
  /**
   * @param {object|null} savedProgress - Previously serialized progress, or null for new game
   */
  constructor(savedProgress = null) {
    this.levels = LEVELS;
    this.chapters = CHAPTERS;

    if (savedProgress) {
      this._loadProgress(savedProgress);
    } else {
      this._initProgress();
    }
  }

  // ── Initialization ──────────────────────────────────────

  _initProgress() {
    this.progress = {
      currentLevel: 1,
      highestUnlocked: 1,
      totalStars: 0,
      levelResults: {},
      // levelResults[id] = { completed: bool, stars: number, highScore: number, attempts: number }
    };
  }

  _loadProgress(data) {
    this.progress = {
      currentLevel: data.currentLevel ?? 1,
      highestUnlocked: data.highestUnlocked ?? 1,
      totalStars: data.totalStars ?? 0,
      levelResults: data.levelResults ?? {},
    };
  }

  // ── Core API ────────────────────────────────────────────

  /**
   * Get the level definition for the current level.
   * @returns {object} Level definition
   */
  getCurrentLevel() {
    return this.getLevel(this.progress.currentLevel);
  }

  /**
   * Get a level definition by ID.
   * @param {number} levelId
   * @returns {object|null} Level definition or null
   */
  getLevel(levelId) {
    return this.levels.find((l) => l.id === levelId) ?? null;
  }

  /**
   * Record completing a level with a given star count and score.
   * Unlocks the next level if applicable.
   *
   * @param {number} stars - 1, 2, or 3
   * @param {number} score - final score for the attempt
   * @returns {{ newBest: boolean, starsEarned: number, nextLevelUnlocked: boolean, chapterComplete: boolean }}
   */
  completeLevel(stars, score) {
    const levelId = this.progress.currentLevel;
    const existing = this.progress.levelResults[levelId];

    const previousStars = existing?.stars ?? 0;
    const previousHigh = existing?.highScore ?? 0;

    const newStars = Math.max(stars, previousStars);
    const newHigh = Math.max(score, previousHigh);
    const attempts = (existing?.attempts ?? 0) + 1;

    this.progress.levelResults[levelId] = {
      completed: true,
      stars: newStars,
      highScore: newHigh,
      attempts,
    };

    // Recalculate total stars
    this.progress.totalStars = Object.values(this.progress.levelResults).reduce(
      (sum, r) => sum + (r.stars ?? 0),
      0
    );

    // Unlock next level
    let nextLevelUnlocked = false;
    if (levelId < this.levels.length) {
      const nextId = levelId + 1;
      if (nextId > this.progress.highestUnlocked) {
        this.progress.highestUnlocked = nextId;
        nextLevelUnlocked = true;
      }
    }

    // Check if the chapter is now complete
    const chapter = this.getChapter(levelId);
    let chapterComplete = false;
    if (chapter) {
      const [start, end] = chapter.levelRange;
      chapterComplete = true;
      for (let id = start; id <= end; id++) {
        if (!this.progress.levelResults[id]?.completed) {
          chapterComplete = false;
          break;
        }
      }
    }

    return {
      newBest: newHigh > previousHigh,
      starsEarned: newStars - previousStars,
      nextLevelUnlocked,
      chapterComplete,
    };
  }

  /**
   * Set the current level (for when the player selects a level from the map).
   * @param {number} levelId
   * @returns {boolean} true if level is unlocked and was set
   */
  setCurrentLevel(levelId) {
    if (levelId < 1 || levelId > this.levels.length) return false;
    if (levelId > this.progress.highestUnlocked) return false;
    this.progress.currentLevel = levelId;
    return true;
  }

  /**
   * Advance to the next level after completing the current one.
   * @returns {boolean} true if advanced, false if already at last level
   */
  advanceToNextLevel() {
    const nextId = this.progress.currentLevel + 1;
    if (nextId > this.levels.length) return false;
    this.progress.currentLevel = nextId;
    return true;
  }

  // ── Queries ─────────────────────────────────────────────

  /**
   * Get all unlocked level IDs.
   * @returns {number[]}
   */
  getUnlockedLevels() {
    const ids = [];
    for (let i = 1; i <= this.progress.highestUnlocked; i++) {
      ids.push(i);
    }
    return ids;
  }

  /**
   * Get the full progress snapshot (serializable).
   * @returns {object}
   */
  getLevelProgress() {
    return {
      currentLevel: this.progress.currentLevel,
      highestUnlocked: this.progress.highestUnlocked,
      totalStars: this.progress.totalStars,
      maxPossibleStars: this.levels.length * 3,
      completedCount: Object.values(this.progress.levelResults).filter(
        (r) => r.completed
      ).length,
      totalLevels: this.levels.length,
      levelResults: { ...this.progress.levelResults },
    };
  }

  /**
   * Get the chapter that contains a given level.
   * @param {number} levelId
   * @returns {object|null} Chapter definition or null
   */
  getChapter(levelId) {
    return (
      this.chapters.find(
        (ch) => levelId >= ch.levelRange[0] && levelId <= ch.levelRange[1]
      ) ?? null
    );
  }

  /**
   * Get all chapters with their completion status.
   * @returns {object[]}
   */
  getAllChapters() {
    return this.chapters.map((ch) => {
      const [start, end] = ch.levelRange;
      let completedLevels = 0;
      let totalStars = 0;
      const totalLevels = end - start + 1;

      for (let id = start; id <= end; id++) {
        const result = this.progress.levelResults[id];
        if (result?.completed) completedLevels++;
        totalStars += result?.stars ?? 0;
      }

      return {
        ...ch,
        completedLevels,
        totalLevels,
        totalStars,
        maxStars: totalLevels * 3,
        isComplete: completedLevels === totalLevels,
        isUnlocked: start <= this.progress.highestUnlocked,
      };
    });
  }

  /**
   * Get the result for a specific level.
   * @param {number} levelId
   * @returns {{ completed: boolean, stars: number, highScore: number, attempts: number }|null}
   */
  getLevelResult(levelId) {
    return this.progress.levelResults[levelId] ?? null;
  }

  /**
   * Serialize progress for saving (localStorage, server, etc.).
   * @returns {string} JSON string
   */
  serialize() {
    return JSON.stringify(this.progress);
  }

  /**
   * Create a LevelManager from a serialized JSON string.
   * @param {string} json
   * @returns {LevelManager}
   */
  static deserialize(json) {
    const data = JSON.parse(json);
    return new LevelManager(data);
  }

  /** Get all level definitions. */
  getLevels() { return this.levels; }

  /** Get total number of levels. */
  getMaxLevel() { return this.levels.length; }
}

// ============================================================
// EXPORTS
// ============================================================

export { LEVELS, CHAPTERS, LevelManager };
export default LevelManager;
