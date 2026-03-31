// Love Match - Audio System
// Procedural sound generation using Web Audio API

// ─── Musical Constants ───────────────────────────────────────────────
const NOTE_FREQS = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// ─── Envelope Helper ─────────────────────────────────────────────────
function applyEnvelope(gainNode, ctx, { attack = 0.01, decay = 0.1, sustain = 0.3, release = 0.2, peak = 1, startTime = null } = {}) {
  const t = startTime ?? ctx.currentTime;
  const g = gainNode.gain;
  g.setValueAtTime(0, t);
  g.linearRampToValueAtTime(peak, t + attack);
  g.linearRampToValueAtTime(peak * sustain, t + attack + decay);
  g.linearRampToValueAtTime(0, t + attack + decay + release);
  return t + attack + decay + release;
}

// ─── Tone Helper ─────────────────────────────────────────────────────
function playTone(ctx, dest, freq, type, envelope, startTime = null) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime ?? ctx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  const endTime = applyEnvelope(gain, ctx, { ...envelope, startTime });
  osc.start(startTime ?? ctx.currentTime);
  osc.stop(endTime + 0.05);
  return { osc, gain, endTime };
}

// ─── Noise Helper ────────────────────────────────────────────────────
function createNoiseBuffer(ctx, duration = 0.5) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ─── Sound Generators ────────────────────────────────────────────────

const SoundGenerators = {

  // 1. Tile Select - soft click/pop
  tileSelect(ctx, dest) {
    const t = ctx.currentTime;
    // Short pop using a sine wave with fast decay
    playTone(ctx, dest, 880, 'sine', { attack: 0.001, decay: 0.04, sustain: 0, release: 0.03, peak: 0.4 });
    playTone(ctx, dest, 1320, 'sine', { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02, peak: 0.2 });
  },

  // 2. Tile Swap - whoosh
  tileSwap(ctx, dest) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    // Noise-based whoosh
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.25);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(3000, t + 0.1);
    filter.frequency.linearRampToValueAtTime(800, t + 0.25);
    filter.Q.setValueAtTime(2, t);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);
    noise.start(t);
    noise.stop(t + 0.3);
  },

  // 3. Match 3 - pleasant chime (3 ascending notes)
  match3(ctx, dest) {
    const notes = [NOTE_FREQS.E5, NOTE_FREQS.G5, NOTE_FREQS.C6];
    const env = { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.3, peak: 0.35 };
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.08;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 2, 'sine', { ...env, peak: 0.1 }, t);
    });
  },

  // 4. Match 4 - bigger chime + sparkle
  match4(ctx, dest) {
    const notes = [NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G5, NOTE_FREQS.C6];
    const env = { attack: 0.005, decay: 0.2, sustain: 0.25, release: 0.4, peak: 0.35 };
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.07;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 2.01, 'sine', { ...env, peak: 0.08 }, t); // slight detune for shimmer
    });
    // Sparkle overlay
    this._sparkle(ctx, dest, ctx.currentTime + 0.15, 0.15);
  },

  // 5. Match 5 - epic chord with shimmer
  match5(ctx, dest) {
    const t = ctx.currentTime;
    // Rich major chord
    const chord = [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.E5];
    const env = { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.6, peak: 0.25 };
    chord.forEach((freq, i) => {
      playTone(ctx, dest, freq, 'sine', env, t + i * 0.03);
      playTone(ctx, dest, freq * 2.003, 'triangle', { ...env, peak: 0.08 }, t + i * 0.03);
    });
    // Rising sparkle arpeggio
    const sparkleNotes = [NOTE_FREQS.C6, NOTE_FREQS.E6, NOTE_FREQS.C6, NOTE_FREQS.E6];
    sparkleNotes.forEach((freq, i) => {
      playTone(ctx, dest, freq, 'sine', { attack: 0.001, decay: 0.06, sustain: 0, release: 0.1, peak: 0.12 }, t + 0.2 + i * 0.06);
    });
  },

  // 6. Cascade - each level plays a higher note
  cascade(ctx, dest, level = 0) {
    const scale = [NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G5, NOTE_FREQS.C6, NOTE_FREQS.E6];
    const freq = scale[Math.min(level, scale.length - 1)];
    const env = { attack: 0.005, decay: 0.12, sustain: 0.15, release: 0.25, peak: 0.35 };
    playTone(ctx, dest, freq, 'sine', env);
    playTone(ctx, dest, freq * 1.5, 'sine', { ...env, peak: 0.12 });
    playTone(ctx, dest, freq * 2, 'sine', { ...env, peak: 0.06 });
  },

  // 7. Invalid Swap - soft buzz/thud
  invalidSwap(ctx, dest) {
    const t = ctx.currentTime;
    // Low thud
    playTone(ctx, dest, 100, 'sine', { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1, peak: 0.3 });
    // Buzz
    playTone(ctx, dest, 85, 'sawtooth', { attack: 0.005, decay: 0.08, sustain: 0, release: 0.08, peak: 0.08 });
    // Filtered noise thud
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + 0.15);
  },

  // 8. Powerup Create - magical ascending tone with sparkle
  powerupCreate(ctx, dest) {
    const t = ctx.currentTime;
    // Ascending glissando
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.4);
    osc.connect(gain);
    gain.connect(dest);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.3);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.55);

    // Harmonic overtone
    playTone(ctx, dest, 800, 'triangle', { attack: 0.1, decay: 0.2, sustain: 0.1, release: 0.2, peak: 0.1 });

    // Sparkle at the end
    this._sparkle(ctx, dest, t + 0.3, 0.12);
  },

  // 9. Powerup Activate - explosion/whoosh
  powerupActivate(ctx, dest) {
    const t = ctx.currentTime;
    // Initial impact
    playTone(ctx, dest, 150, 'sine', { attack: 0.001, decay: 0.15, sustain: 0, release: 0.2, peak: 0.4 });
    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.3);
    filter.Q.setValueAtTime(1, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + 0.45);
    // Whoosh tail
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(600, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(100, t + 0.4);
    osc2.connect(g2);
    g2.connect(dest);
    g2.gain.setValueAtTime(0.15, t + 0.05);
    g2.gain.linearRampToValueAtTime(0, t + 0.4);
    osc2.start(t + 0.05);
    osc2.stop(t + 0.45);
  },

  // 10. Rocket Fire - swoosh
  rocketFire(ctx, dest) {
    const t = ctx.currentTime;
    // Rising noise swoosh
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(4000, t + 0.15);
    filter.frequency.exponentialRampToValueAtTime(1500, t + 0.4);
    filter.Q.setValueAtTime(3, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.45);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + 0.5);
    // Tonal swoosh
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);
    osc.connect(g2);
    g2.connect(dest);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.15, t + 0.05);
    g2.gain.linearRampToValueAtTime(0, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.45);
  },

  // 11. Bomb Explode - deep boom with reverb
  bombExplode(ctx, dest) {
    const t = ctx.currentTime;
    // Deep sine boom
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    osc.connect(gain);
    gain.connect(dest);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.85);
    // Noise crunch
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.5);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    noise.connect(filter);
    filter.connect(g2);
    g2.connect(dest);
    noise.start(t);
    noise.stop(t + 0.65);
    // Sub-bass impact
    playTone(ctx, dest, 40, 'sine', { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3, peak: 0.4 });
  },

  // 12. Star Activate - ethereal chord
  starActivate(ctx, dest) {
    const t = ctx.currentTime;
    const chord = [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.B4, NOTE_FREQS.D5];
    const env = { attack: 0.05, decay: 0.4, sustain: 0.3, release: 0.8, peak: 0.2 };
    chord.forEach((freq, i) => {
      // Slightly detuned pairs for ethereal shimmer
      playTone(ctx, dest, freq, 'sine', env, t + i * 0.04);
      playTone(ctx, dest, freq * 1.003, 'sine', { ...env, peak: 0.12 }, t + i * 0.04);
      playTone(ctx, dest, freq * 2, 'triangle', { ...env, peak: 0.05 }, t + i * 0.04);
    });
    // High shimmer
    this._sparkle(ctx, dest, t + 0.15, 0.08);
    this._sparkle(ctx, dest, t + 0.4, 0.06);
  },

  // 13. Combo Small - quick fanfare (3-4 combo)
  comboSmall(ctx, dest) {
    const notes = [NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.E5];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1;
      playTone(ctx, dest, freq, 'sine', { attack: 0.005, decay: 0.1, sustain: 0.15, release: 0.15, peak: 0.3 }, t);
      playTone(ctx, dest, freq * 1.5, 'triangle', { attack: 0.005, decay: 0.08, sustain: 0, release: 0.1, peak: 0.08 }, t);
    });
  },

  // 14. Combo Big - grand fanfare (5+ combo)
  comboBig(ctx, dest) {
    const notes = [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G5];
    const env = { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.4, peak: 0.25 };
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.08;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 2.005, 'sine', { ...env, peak: 0.06 }, t);
    });
    // Final chord ring
    const t = ctx.currentTime + 0.5;
    [NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G5].forEach(freq => {
      playTone(ctx, dest, freq, 'sine', { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5, peak: 0.15 }, t);
    });
    this._sparkle(ctx, dest, t + 0.1, 0.1);
  },

  // 15. Level Complete - victory melody
  levelComplete(ctx, dest) {
    // C E G C' E' C' (ascending to triumphant resolution)
    const melody = [
      { freq: NOTE_FREQS.C4, time: 0 },
      { freq: NOTE_FREQS.E4, time: 0.12 },
      { freq: NOTE_FREQS.G4, time: 0.24 },
      { freq: NOTE_FREQS.C5, time: 0.4 },
      { freq: NOTE_FREQS.E5, time: 0.52 },
      { freq: NOTE_FREQS.C5, time: 0.7 },  // resolve back
    ];
    const env = { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.25, peak: 0.3 };
    melody.forEach(({ freq, time }) => {
      const t = ctx.currentTime + time;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 2, 'triangle', { ...env, peak: 0.08 }, t);
    });
    // Final sustained chord
    const tChord = ctx.currentTime + 0.85;
    [NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.G4, NOTE_FREQS.C5].forEach(freq => {
      playTone(ctx, dest, freq, 'sine', { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.6, peak: 0.2 }, tChord);
    });
    this._sparkle(ctx, dest, tChord + 0.2, 0.1);
  },

  // 16. Level Fail - gentle descending notes
  levelFail(ctx, dest) {
    const notes = [NOTE_FREQS.E4, NOTE_FREQS.D4, NOTE_FREQS.C4, NOTE_FREQS.B3];
    const env = { attack: 0.02, decay: 0.2, sustain: 0.15, release: 0.3, peak: 0.2 };
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.25;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 0.998, 'sine', { ...env, peak: 0.1 }, t); // slight detune for sadness
    });
  },

  // 17. Star Earn - bright ding
  starEarn(ctx, dest) {
    const t = ctx.currentTime;
    playTone(ctx, dest, NOTE_FREQS.E6, 'sine', { attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.4, peak: 0.3 });
    playTone(ctx, dest, NOTE_FREQS.E6 * 2, 'sine', { attack: 0.001, decay: 0.1, sustain: 0, release: 0.2, peak: 0.1 });
    playTone(ctx, dest, NOTE_FREQS.C6, 'sine', { attack: 0.001, decay: 0.1, sustain: 0.05, release: 0.3, peak: 0.15 });
  },

  // 18. Button Click - soft UI click
  buttonClick(ctx, dest) {
    playTone(ctx, dest, 1000, 'sine', { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02, peak: 0.2 });
    playTone(ctx, dest, 1500, 'sine', { attack: 0.001, decay: 0.015, sustain: 0, release: 0.015, peak: 0.1 });
  },

  // 19. Menu Open - soft swoosh
  menuOpen(ctx, dest) {
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.15);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.3);
    filter.Q.setValueAtTime(2, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + 0.3);
    // Subtle tonal rise
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(700, t + 0.2);
    osc.connect(g2);
    g2.connect(dest);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.08, t + 0.05);
    g2.gain.linearRampToValueAtTime(0, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  // 20. Note Received - gentle bell + sparkle
  noteReceived(ctx, dest) {
    const t = ctx.currentTime;
    // Bell tone (sine + harmonics)
    playTone(ctx, dest, NOTE_FREQS.G5, 'sine', { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5, peak: 0.25 });
    playTone(ctx, dest, NOTE_FREQS.G5 * 2.76, 'sine', { attack: 0.001, decay: 0.15, sustain: 0, release: 0.2, peak: 0.08 });
    playTone(ctx, dest, NOTE_FREQS.G5 * 5.4, 'sine', { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1, peak: 0.04 });
    this._sparkle(ctx, dest, t + 0.15, 0.1);
  },

  // 21. Note Open - paper unfolding
  noteOpen(ctx, dest) {
    const t = ctx.currentTime;
    // Filtered noise for paper texture
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.linearRampToValueAtTime(6000, t + 0.15);
    filter.frequency.linearRampToValueAtTime(4000, t + 0.3);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.15);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(t);
    noise.stop(t + 0.35);
    // Gentle reveal tone
    playTone(ctx, dest, NOTE_FREQS.E5, 'sine', { attack: 0.05, decay: 0.15, sustain: 0.1, release: 0.2, peak: 0.12 }, t + 0.1);
  },

  // 22. Gift Received - magical chime
  giftReceived(ctx, dest) {
    const notes = [NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G5, NOTE_FREQS.C6];
    const env = { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.4, peak: 0.25 };
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1;
      playTone(ctx, dest, freq, 'sine', env, t);
      playTone(ctx, dest, freq * 1.002, 'sine', { ...env, peak: 0.12 }, t);
    });
    this._sparkle(ctx, dest, ctx.currentTime + 0.25, 0.12);
    this._sparkle(ctx, dest, ctx.currentTime + 0.45, 0.08);
  },

  // 23. Quiz Correct - happy ding
  quizCorrect(ctx, dest) {
    const t = ctx.currentTime;
    playTone(ctx, dest, NOTE_FREQS.C5, 'sine', { attack: 0.005, decay: 0.1, sustain: 0.15, release: 0.2, peak: 0.3 });
    playTone(ctx, dest, NOTE_FREQS.E5, 'sine', { attack: 0.005, decay: 0.1, sustain: 0.15, release: 0.2, peak: 0.3 }, t + 0.1);
    playTone(ctx, dest, NOTE_FREQS.G5, 'sine', { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.3, peak: 0.3 }, t + 0.2);
  },

  // 24. Quiz Wrong - gentle buzz
  quizWrong(ctx, dest) {
    const t = ctx.currentTime;
    playTone(ctx, dest, 200, 'sine', { attack: 0.01, decay: 0.15, sustain: 0, release: 0.15, peak: 0.2 });
    playTone(ctx, dest, 190, 'sine', { attack: 0.01, decay: 0.15, sustain: 0, release: 0.15, peak: 0.15 });
    // Slight descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.2);
    osc.connect(gain);
    gain.connect(dest);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.3);
  },

  // ─── Internal Helpers ──────────────────────────────────────────────
  _sparkle(ctx, dest, startTime, peakVol = 0.1) {
    const sparkleFreqs = [2400, 3200, 4000, 4800, 3600];
    sparkleFreqs.forEach((freq, i) => {
      playTone(ctx, dest, freq, 'sine', {
        attack: 0.001, decay: 0.03, sustain: 0, release: 0.05,
        peak: peakVol * (1 - i * 0.15),
      }, startTime + i * 0.04);
    });
  },
};


// ─── Music Generators ────────────────────────────────────────────────

class MusicGenerator {
  constructor(ctx, dest) {
    this.ctx = ctx;
    this.dest = dest;
    this.isPlaying = false;
    this.scheduledNodes = [];
    this.loopTimer = null;
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.scheduledNodes.forEach(node => {
      try { node.stop(); } catch (e) { /* already stopped */ }
    });
    this.scheduledNodes = [];
  }

  _scheduleOsc(freq, type, startTime, duration, volume = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    osc.connect(gain);
    gain.connect(this.dest);
    // Soft attack and release
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.04);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    this.scheduledNodes.push(osc);
    return osc;
  }

  // 25. Wife theme - gentle music-box romantic feel
  playWife() {
    this.isPlaying = true;
    const bpm = 90;
    const beat = 60 / bpm;
    // 8-bar melody in C major, gentle and romantic
    const melody = [
      // Bar 1
      { note: 'E5', start: 0, dur: 1 },
      { note: 'D5', start: 1, dur: 0.5 },
      { note: 'C5', start: 1.5, dur: 0.5 },
      { note: 'D5', start: 2, dur: 1 },
      { note: 'E5', start: 3, dur: 1 },
      // Bar 2
      { note: 'G5', start: 4, dur: 1.5 },
      { note: 'E5', start: 5.5, dur: 0.5 },
      { note: 'D5', start: 6, dur: 1 },
      { note: 'C5', start: 7, dur: 1 },
      // Bar 3
      { note: 'A4', start: 8, dur: 1 },
      { note: 'C5', start: 9, dur: 1 },
      { note: 'E5', start: 10, dur: 1 },
      { note: 'D5', start: 11, dur: 1 },
      // Bar 4
      { note: 'C5', start: 12, dur: 2 },
      { note: 'E5', start: 14, dur: 1 },
      { note: 'G5', start: 15, dur: 1 },
      // Bar 5
      { note: 'A5', start: 16, dur: 1.5 },
      { note: 'G5', start: 17.5, dur: 0.5 },
      { note: 'E5', start: 18, dur: 1 },
      { note: 'D5', start: 19, dur: 1 },
      // Bar 6
      { note: 'C5', start: 20, dur: 1 },
      { note: 'D5', start: 21, dur: 0.5 },
      { note: 'E5', start: 21.5, dur: 0.5 },
      { note: 'G5', start: 22, dur: 1 },
      { note: 'E5', start: 23, dur: 1 },
      // Bar 7
      { note: 'D5', start: 24, dur: 1 },
      { note: 'C5', start: 25, dur: 1 },
      { note: 'A4', start: 26, dur: 1 },
      { note: 'G4', start: 27, dur: 1 },
      // Bar 8 - resolve
      { note: 'C5', start: 28, dur: 3 },
      { note: 'E5', start: 31, dur: 1 },
    ];

    // Simple bass pattern (root notes)
    const bass = [
      { note: 'C3', start: 0, dur: 4 },
      { note: 'G3', start: 4, dur: 4 },
      { note: 'A3', start: 8, dur: 4 },
      { note: 'G3', start: 12, dur: 4 },
      { note: 'F3', start: 16, dur: 4 },
      { note: 'C3', start: 20, dur: 4 },
      { note: 'G3', start: 24, dur: 4 },
      { note: 'C3', start: 28, dur: 4 },
    ];

    const loopLength = 32 * beat;

    const scheduleLoop = () => {
      if (!this.isPlaying) return;
      // Clear old nodes
      this.scheduledNodes = [];
      const now = this.ctx.currentTime + 0.05;

      melody.forEach(({ note, start, dur }) => {
        const freq = NOTE_FREQS[note];
        if (!freq) return;
        const t = now + start * beat;
        // Music-box tone: sine + quiet harmonic
        this._scheduleOsc(freq, 'sine', t, dur * beat, 0.08);
        this._scheduleOsc(freq * 2, 'sine', t, dur * beat * 0.6, 0.02);
      });

      bass.forEach(({ note, start, dur }) => {
        const freq = NOTE_FREQS[note];
        if (!freq) return;
        this._scheduleOsc(freq, 'triangle', now + start * beat, dur * beat, 0.06);
      });

      // Schedule next loop
      this.loopTimer = setTimeout(() => scheduleLoop(), (loopLength - 0.5) * 1000);
    };

    scheduleLoop();
  }

  // 26. Husband theme - rhythmic, slightly upbeat
  playHusband() {
    this.isPlaying = true;
    const bpm = 110;
    const beat = 60 / bpm;

    // Upbeat melody in G major
    const melody = [
      // Bar 1
      { note: 'G4', start: 0, dur: 0.5 },
      { note: 'B4', start: 0.5, dur: 0.5 },
      { note: 'D5', start: 1, dur: 1 },
      { note: 'B4', start: 2, dur: 0.5 },
      { note: 'G4', start: 2.5, dur: 0.5 },
      { note: 'A4', start: 3, dur: 1 },
      // Bar 2
      { note: 'B4', start: 4, dur: 0.5 },
      { note: 'D5', start: 4.5, dur: 0.5 },
      { note: 'G5', start: 5, dur: 1 },
      { note: 'D5', start: 6, dur: 1 },
      { note: 'B4', start: 7, dur: 1 },
      // Bar 3
      { note: 'C5', start: 8, dur: 1 },
      { note: 'E5', start: 9, dur: 0.5 },
      { note: 'D5', start: 9.5, dur: 0.5 },
      { note: 'C5', start: 10, dur: 0.5 },
      { note: 'B4', start: 10.5, dur: 0.5 },
      { note: 'A4', start: 11, dur: 1 },
      // Bar 4
      { note: 'G4', start: 12, dur: 2 },
      { note: 'D5', start: 14, dur: 1 },
      { note: 'B4', start: 15, dur: 1 },
      // Bar 5
      { note: 'E5', start: 16, dur: 1 },
      { note: 'D5', start: 17, dur: 0.5 },
      { note: 'C5', start: 17.5, dur: 0.5 },
      { note: 'B4', start: 18, dur: 1 },
      { note: 'A4', start: 19, dur: 1 },
      // Bar 6
      { note: 'G4', start: 20, dur: 0.5 },
      { note: 'A4', start: 20.5, dur: 0.5 },
      { note: 'B4', start: 21, dur: 0.5 },
      { note: 'D5', start: 21.5, dur: 0.5 },
      { note: 'G5', start: 22, dur: 1.5 },
      { note: 'D5', start: 23.5, dur: 0.5 },
      // Bar 7
      { note: 'E5', start: 24, dur: 1 },
      { note: 'D5', start: 25, dur: 1 },
      { note: 'C5', start: 26, dur: 1 },
      { note: 'A4', start: 27, dur: 1 },
      // Bar 8
      { note: 'G4', start: 28, dur: 3 },
      { note: 'B4', start: 31, dur: 1 },
    ];

    // Steady bass with rhythm
    const bass = [
      { note: 'G3', start: 0, dur: 2 },
      { note: 'G3', start: 2, dur: 2 },
      { note: 'G3', start: 4, dur: 2 },
      { note: 'D3', start: 6, dur: 2 },
      { note: 'C3', start: 8, dur: 2 },
      { note: 'D3', start: 10, dur: 2 },
      { note: 'G3', start: 12, dur: 4 },
      { note: 'C3', start: 16, dur: 2 },
      { note: 'D3', start: 18, dur: 2 },
      { note: 'G3', start: 20, dur: 2 },
      { note: 'D3', start: 22, dur: 2 },
      { note: 'C3', start: 24, dur: 2 },
      { note: 'D3', start: 26, dur: 2 },
      { note: 'G3', start: 28, dur: 4 },
    ];

    // Simple rhythmic kick on each beat
    const kicks = [];
    for (let i = 0; i < 32; i++) {
      kicks.push(i);
    }

    const loopLength = 32 * beat;

    const scheduleLoop = () => {
      if (!this.isPlaying) return;
      this.scheduledNodes = [];
      const now = this.ctx.currentTime + 0.05;

      melody.forEach(({ note, start, dur }) => {
        const freq = NOTE_FREQS[note];
        if (!freq) return;
        this._scheduleOsc(freq, 'triangle', now + start * beat, dur * beat, 0.09);
      });

      bass.forEach(({ note, start, dur }) => {
        const freq = NOTE_FREQS[note];
        if (!freq) return;
        this._scheduleOsc(freq, 'square', now + start * beat, dur * beat, 0.04);
      });

      // Subtle rhythmic pulse every beat
      kicks.forEach(beatNum => {
        const t = now + beatNum * beat;
        this._scheduleOsc(80, 'sine', t, beat * 0.3, 0.03);
      });

      this.loopTimer = setTimeout(() => scheduleLoop(), (loopLength - 0.5) * 1000);
    };

    scheduleLoop();
  }
}


// ─── MP3 Music Player with Crossfade ────────────────────────────────

const MUSIC_TRACKS = [
  { id: 'track-01', file: 'music/track-01.mp3', label: 'Track 1' },
  { id: 'track-02', file: 'music/track-02.mp3', label: 'Track 2' },
  { id: 'track-03', file: 'music/track-03.mp3', label: 'Track 3' },
  { id: 'track-04', file: 'music/track-04.mp3', label: 'Track 4' },
  { id: 'track-05', file: 'music/track-05.mp3', label: 'Track 5' },
  { id: 'track-06', file: 'music/track-06.mp3', label: 'Track 6' },
  { id: 'track-07', file: 'music/track-07.mp3', label: 'Track 7' },
  { id: 'track-08', file: 'music/track-08.mp3', label: 'Track 8' },
  { id: 'track-09', file: 'music/track-09.mp3', label: 'Track 9' },
  { id: 'track-10', file: 'music/track-10.mp3', label: 'Track 10' },
];

const SCREEN_MUSIC_DEFAULTS = {
  mainMenu:   'track-01',
  levelMap:   'track-02',
  gameplay:   'track-03',
  bible:      'track-04',
  loveNotes:  'track-05',
  quizzes:    'track-06',
  us:         'track-07',
  settings:   'track-08',
};

const CROSSFADE_MS = 2000; // 2-second crossfade

class Mp3MusicPlayer {
  constructor() {
    this._audios = new Map();       // trackId -> HTMLAudioElement
    this._currentTrackId = null;
    this._volume = 0.4;
    this._muted = false;
    this._screenMap = { ...SCREEN_MUSIC_DEFAULTS };
    this._fadeInterval = null;

    // Load saved screen-to-track mapping
    try {
      const saved = localStorage.getItem('lovematch_music_map');
      if (saved) Object.assign(this._screenMap, JSON.parse(saved));
    } catch {}
  }

  /** Preload all tracks */
  preload() {
    for (const track of MUSIC_TRACKS) {
      if (!this._audios.has(track.id)) {
        const audio = new Audio(track.file);
        audio.loop = true;
        audio.volume = 0;
        audio.preload = 'auto';
        this._audios.set(track.id, audio);
      }
    }
  }

  /** Get current screen → track mapping */
  getScreenMap() { return { ...this._screenMap }; }

  /** Set which track plays on a given screen */
  setScreenTrack(screen, trackId) {
    this._screenMap[screen] = trackId;
    try {
      localStorage.setItem('lovematch_music_map', JSON.stringify(this._screenMap));
    } catch {}
  }

  /** Get all available tracks */
  getTracks() { return MUSIC_TRACKS; }

  /** Get all screen names */
  getScreenNames() { return Object.keys(SCREEN_MUSIC_DEFAULTS); }

  /** Play the track assigned to a screen, with crossfade */
  playForScreen(screenName) {
    const trackId = this._screenMap[screenName];
    if (!trackId || trackId === 'none') {
      this.stop();
      return;
    }
    this.crossfadeTo(trackId);
  }

  /** Crossfade from current track to a new one */
  crossfadeTo(trackId) {
    if (trackId === this._currentTrackId) return;
    if (this._muted) {
      this._currentTrackId = trackId;
      return;
    }

    const newAudio = this._audios.get(trackId);
    if (!newAudio) return;

    const oldAudio = this._currentTrackId ? this._audios.get(this._currentTrackId) : null;
    const oldTrackId = this._currentTrackId;
    this._currentTrackId = trackId;

    // Clear any in-progress fade
    if (this._fadeInterval) clearInterval(this._fadeInterval);

    // Start new track at volume 0
    newAudio.volume = 0;
    newAudio.currentTime = 0;
    newAudio.play().catch(() => {});

    const steps = 40;
    const stepMs = CROSSFADE_MS / steps;
    let step = 0;

    this._fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      // Fade new in
      newAudio.volume = Math.min(this._volume, this._volume * progress);

      // Fade old out
      if (oldAudio) {
        oldAudio.volume = Math.max(0, this._volume * (1 - progress));
      }

      if (step >= steps) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        newAudio.volume = this._volume;
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.volume = 0;
        }
      }
    }, stepMs);
  }

  /** Stop all music */
  stop() {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    this._fadeInterval = null;
    for (const [id, audio] of this._audios) {
      audio.pause();
      audio.volume = 0;
    }
    this._currentTrackId = null;
  }

  /** Set volume (0-1) */
  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    const current = this._currentTrackId ? this._audios.get(this._currentTrackId) : null;
    if (current && !this._muted) {
      current.volume = this._volume;
    }
  }

  /** Mute */
  mute() {
    this._muted = true;
    for (const [, audio] of this._audios) {
      audio.pause();
      audio.volume = 0;
    }
  }

  /** Unmute and resume current track */
  unmute() {
    this._muted = false;
    if (this._currentTrackId) {
      const audio = this._audios.get(this._currentTrackId);
      if (audio) {
        audio.volume = this._volume;
        audio.play().catch(() => {});
      }
    }
  }

  get isMuted() { return this._muted; }
}

// ─── AudioManager ────────────────────────────────────────────────────

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.musicGenerator = null;
    this.mp3Player = new Mp3MusicPlayer();
    this._muted = false;
    this._sfxVolume = 0.7;
    this._musicVolume = 0.4;
    this._initialized = false;
    this._currentTheme = null;
  }

  /**
   * Initialize the audio context. Must be called after a user interaction
   * (click/tap) to satisfy browser autoplay policies.
   */
  init() {
    if (this._initialized) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master -> speakers
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // SFX bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this._sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Music bus
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this._musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.musicGenerator = new MusicGenerator(this.ctx, this.musicGain);
    this.mp3Player.preload();
    this.mp3Player.setVolume(this._musicVolume);
    this._initialized = true;
  }

  /**
   * Play a one-shot sound effect by name.
   * @param {string} soundName - One of the defined sound effect names
   */
  playSound(soundName) {
    if (!this._initialized || this._muted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const generator = SoundGenerators[soundName];
    if (generator) {
      generator.call(SoundGenerators, this.ctx, this.sfxGain);
    } else {
      console.warn(`[AudioManager] Unknown sound: ${soundName}`);
    }
  }

  /**
   * Play a cascade match sound at increasing pitch for each cascade level.
   * @param {number} cascadeLevel - 0 for first cascade, 1, 2, etc.
   */
  playCascadeSound(cascadeLevel) {
    if (!this._initialized || this._muted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    SoundGenerators.cascade(this.ctx, this.sfxGain, cascadeLevel);
  }

  /**
   * Play music for a specific screen (uses MP3 crossfade player).
   * @param {string} screenName - e.g. 'mainMenu', 'gameplay', 'bible'
   */
  playMusicForScreen(screenName) {
    if (!this._initialized) return;
    if (this._muted) return;
    this.musicGenerator.stop(); // stop procedural music
    this.mp3Player.playForScreen(screenName);
  }

  /**
   * Start looping background music for a theme (legacy/fallback).
   * @param {'wife'|'husband'} theme
   */
  playMusic(theme) {
    if (!this._initialized) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this._currentTheme = theme;
    if (this._muted) return;

    // Use MP3 player if a screen context is active, otherwise fallback to procedural
    // (playMusicForScreen is preferred — this is kept for backwards compat)
  }

  /**
   * Stop background music.
   */
  stopMusic() {
    if (this.musicGenerator) {
      this.musicGenerator.stop();
    }
    this.mp3Player.stop();
    this._currentTheme = null;
  }

  /**
   * Set music volume (0 to 1).
   * @param {number} vol
   */
  setMusicVolume(vol) {
    this._musicVolume = Math.max(0, Math.min(1, vol));
    if (this._initialized && this.musicGain) {
      this.musicGain.gain.setValueAtTime(this._musicVolume, this.ctx.currentTime);
    }
    this.mp3Player.setVolume(this._musicVolume);
  }

  /**
   * Set SFX volume (0 to 1).
   * @param {number} vol
   */
  setSFXVolume(vol) {
    this._sfxVolume = Math.max(0, Math.min(1, vol));
    if (this._initialized && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this._sfxVolume, this.ctx.currentTime);
    }
  }

  /**
   * Mute all audio.
   */
  mute() {
    this._muted = true;
    if (this._initialized && this.masterGain) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    if (this.musicGenerator) {
      this.musicGenerator.stop();
    }
    this.mp3Player.mute();
  }

  /**
   * Unmute all audio and resume music if a theme was playing.
   */
  unmute() {
    this._muted = false;
    if (this._initialized && this.masterGain) {
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.mp3Player.unmute();
  }

  /**
   * Check mute state.
   * @returns {boolean}
   */
  isMuted() {
    return this._muted;
  }
}

export default AudioManager;
