// Sound engine: every sound is synthesised with the Web Audio API, so there are
// no audio files to download. Effects and the tense "thinking" music have
// separate switches in Settings.
import { getSettings } from '../lib/settings.ts';

/** Call from a tap or click so mobile browsers allow audio later. */
export function unlockAudio(): void {
  try {
    getCtx();
  } catch {
    /* no audio support */
  }
}

let audioCtx: AudioContext | null = null;
let thinkingTimerId: ReturnType<typeof setInterval> | null = null;
let thinkingMasterGain: GainNode | null = null;
let thinkingNoteIndex = 0;


function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playNote(
  ctx: AudioContext,
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  startTime?: number,
  dest?: AudioNode,
) {
  const t = startTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(duration, 0.05));

  osc.connect(gain);
  gain.connect(dest ?? ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// ─── Thinking music ──────────────────────────────────────────────────────────
// 8-step rhythmic pattern at 250ms/step, a tense bed of music
const THINKING_PATTERN: [number, number, number, OscillatorType][] = [
  [82.4,  0.14, 0.28, 'sine'],       // E2 bass pulse
  [329.6, 0.07, 0.10, 'triangle'],   // E4 tick
  [82.4,  0.14, 0.28, 'sine'],       // E2 bass pulse
  [493.9, 0.05, 0.07, 'sine'],       // B4 high tick
  [82.4,  0.14, 0.28, 'sine'],       // E2 bass pulse
  [196.0, 0.09, 0.13, 'triangle'],   // G3 tension mid
  [82.4,  0.14, 0.28, 'sine'],       // E2 bass pulse
  [440.0, 0.05, 0.07, 'sine'],       // A4 high tick
];

export function startThinkingMusic() {
  if (!getSettings().music) return;
  stopThinkingMusic();

  const ctx = getCtx();
  thinkingMasterGain = ctx.createGain();
  thinkingMasterGain.gain.setValueAtTime(0, ctx.currentTime);
  thinkingMasterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.3);
  thinkingMasterGain.connect(ctx.destination);
  thinkingNoteIndex = 0;

  const fire = () => {
    if (!thinkingMasterGain) return;
    const [freq, dur, vol, type] = THINKING_PATTERN[thinkingNoteIndex % THINKING_PATTERN.length];
    playNote(ctx, freq, dur, vol, type, undefined, thinkingMasterGain);
    thinkingNoteIndex++;
  };

  fire();
  thinkingTimerId = setInterval(fire, 250);
}

export function stopThinkingMusic() {
  if (thinkingTimerId !== null) {
    clearInterval(thinkingTimerId);
    thinkingTimerId = null;
  }
  if (thinkingMasterGain) {
    try {
      thinkingMasterGain.gain.setTargetAtTime(0, getCtx().currentTime, 0.08);
    } catch (_) { /* context may be closed */ }
    thinkingMasterGain = null;
  }
}

// ─── Answer selected (suspense lock-in) ──────────────────────────────────────
export function playAnswerSelected() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Two rising stabs then a held tension note
  playNote(ctx, 220, 0.12, 0.18, 'sine', now);
  playNote(ctx, 277.2, 0.12, 0.18, 'sine', now + 0.13);
  playNote(ctx, 329.6, 0.6, 0.14, 'triangle', now + 0.26);
}

// ─── Correct answer fanfare ───────────────────────────────────────────────────
export function playCorrect() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Ascending C-E-G-C arpeggio with held chord
  const arpNotes = [261.6, 329.6, 392.0, 523.3];
  arpNotes.forEach((freq, i) => {
    playNote(ctx, freq, 0.35 + i * 0.1, 0.22, 'sine', now + i * 0.1);
  });
  // Harmonics for richness
  playNote(ctx, 523.3, 0.8, 0.12, 'triangle', now + 0.3);
  playNote(ctx, 784.0, 0.6, 0.08, 'sine', now + 0.4);
}

// ─── Wrong answer ─────────────────────────────────────────────────────────────
export function playWrong() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Descending dissonant buzz
  playNote(ctx, 311.1, 0.25, 0.30, 'sawtooth', now);
  playNote(ctx, 233.1, 0.28, 0.28, 'sawtooth', now + 0.22);
  playNote(ctx, 174.6, 0.35, 0.25, 'sawtooth', now + 0.44);
  // Low thud
  playNote(ctx, 87.3, 0.4, 0.35, 'sine', now + 0.44);
}

// ─── Level up / milestone ─────────────────────────────────────────────────────
export function playLevelUp() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Quick bright ascending arpeggio
  [392.0, 523.3, 659.3, 784.0].forEach((freq, i) => {
    playNote(ctx, freq, 0.2, 0.18, 'triangle', now + i * 0.09);
  });
}

// ─── Safe haven milestone ─────────────────────────────────────────────────────
export function playSafeHaven() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // More dramatic ascending phrase
  [261.6, 329.6, 392.0, 523.3, 659.3, 784.0].forEach((freq, i) => {
    playNote(ctx, freq, 0.3 + i * 0.05, 0.20, 'sine', now + i * 0.1);
  });
  playNote(ctx, 1046.5, 0.6, 0.12, 'triangle', now + 0.6);
}

// ─── Walk away ────────────────────────────────────────────────────────────────
export function playWalkAway() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Gentle descending resolution
  [523.3, 440.0, 392.0, 329.6].forEach((freq, i) => {
    playNote(ctx, freq, 0.25, 0.15, 'sine', now + i * 0.12);
  });
}

// ─── Millionaire win fanfare ──────────────────────────────────────────────────
export function playWin() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Big triumphant ascending fanfare in layers
  const melody = [261.6, 329.6, 392.0, 493.9, 523.3, 659.3, 784.0, 1046.5];
  melody.forEach((freq, i) => {
    playNote(ctx, freq, 0.5 + i * 0.05, 0.22, 'sine', now + i * 0.12);
    playNote(ctx, freq * 1.5, 0.4, 0.10, 'triangle', now + i * 0.12 + 0.04);
  });

  // Sustained triumphant chord at the end
  const chordStart = now + melody.length * 0.12 + 0.1;
  [523.3, 659.3, 784.0, 1046.5].forEach(freq => {
    playNote(ctx, freq, 2.5, 0.18, 'sine', chordStart);
  });
}

// ─── Phone friend ring ────────────────────────────────────────────────────────
export function playPhoneRing() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Two-tone phone ring
  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.6;
    playNote(ctx, 480, 0.2, 0.18, 'sine', t);
    playNote(ctx, 620, 0.2, 0.15, 'sine', t);
    playNote(ctx, 480, 0.2, 0.18, 'sine', t + 0.25);
    playNote(ctx, 620, 0.2, 0.15, 'sine', t + 0.25);
  }
}

// ─── Audience applause (synthesized white-noise burst) ───────────────────────
export function playAudienceReveal() {
  if (!getSettings().sfx) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.5;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}
