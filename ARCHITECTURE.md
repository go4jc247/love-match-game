# Love Match Game - Architecture

## Overview
A Royal Match-inspired match-three game with romance, kittens, marriage, and Bible themes.
Web-based (vanilla JS + HTML5 Canvas for game, HTML/CSS for UI).

## Core Systems
1. **Match-3 Engine** - Grid, matching logic, cascading, scoring
2. **Level System** - 50+ levels, progressive difficulty, goals per level
3. **Power-ups/Tools** - Special matches create tools (4-match, 5-match, L-shape, T-shape)
4. **Animation System** - Smooth animations, particle effects, transitions
5. **Bible Reading** - Daily verses, marriage-themed, progress tracking
6. **Spouse Connection** - Love notes, shared progress, tool gifts
7. **Marriage Quizzes** - Questions, dreams/passions sharing
8. **Romantic Suggestions** - Gender-based date ideas, activities
9. **Theme System** - Wife theme (kittens/hearts/flowers) vs Husband theme (tools/wood/mancave)
10. **Persistence** - LocalStorage + optional cloud sync

## Tech Stack
- Vanilla JavaScript (no framework - fast, simple)
- HTML5 Canvas for game board
- CSS3 animations for UI
- LocalStorage for save data
- Service Worker for offline play

## File Structure
- `/src/game-engine.js` - Core match-3 logic
- `/src/renderer.js` - Canvas rendering + animations
- `/src/levels.js` - Level definitions
- `/src/powerups.js` - Power-up system
- `/src/bible.js` - Bible reading system
- `/src/spouse.js` - Spouse connection features
- `/src/quiz.js` - Marriage quizzes
- `/src/themes.js` - Theme management
- `/src/audio.js` - Sound effects
- `/src/ui.js` - UI overlays and menus
- `/index.html` - Main entry point
- `/styles.css` - All styles
