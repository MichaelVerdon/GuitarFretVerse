// Tiny Web Audio helpers: Karplus-Strong plucked-string notes and a metronome.

let ctx = null;
const bufferCache = new Map();

export function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

function pluckBuffer(audio, midi) {
  const key = `${audio.sampleRate}:${midi}`;
  if (bufferCache.has(key)) return bufferCache.get(key);
  const sr = audio.sampleRate;
  const freq = midiToFreq(midi);
  const period = Math.max(2, Math.round(sr / freq));
  const length = Math.floor(sr * 2.2);
  const buf = audio.createBuffer(1, length, sr);
  const data = buf.getChannelData(0);
  // Noise burst, lightly smoothed so it is not too harsh
  let last = 0;
  for (let i = 0; i < period; i++) {
    const n = Math.random() * 2 - 1;
    last = 0.5 * n + 0.5 * last;
    data[i] = last;
  }
  const decay = 0.996;
  for (let i = period; i < length; i++) {
    data[i] = decay * 0.5 * (data[i - period] + data[i - period - 1 >= 0 ? i - period - 1 : 0]);
  }
  bufferCache.set(key, buf);
  return buf;
}

/** Play one plucked note. `delay` is seconds from now. */
export function pluck(midi, delay = 0, { volume = 0.6, hold = 1.6 } = {}) {
  const audio = getCtx();
  if (!audio) return;
  const src = audio.createBufferSource();
  src.buffer = pluckBuffer(audio, midi);
  const gain = audio.createGain();
  const t0 = audio.currentTime + delay;
  gain.gain.setValueAtTime(Math.max(0.0001, volume), t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + hold);
  src.connect(gain).connect(audio.destination);
  src.start(t0);
  src.stop(t0 + hold + 0.05);
}

/** Strum several notes low to high. */
export function strum(midis, { gap = 0.045, volume = 0.5 } = {}) {
  midis.forEach((m, i) => pluck(m, i * gap, { volume, hold: 2 }));
}

function click(audio, time, accent, volume) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  osc.connect(gain).connect(audio.destination);
  osc.start(time);
  osc.stop(time + 0.06);
}

/**
 * Start a metronome. getBpm / getVolume are read every beat so the tempo can
 * change live. Returns a stop function (or null if audio is unavailable).
 */
export function startMetronome(getBpm, getVolume = () => 0.4) {
  const audio = getCtx();
  if (!audio) return null;
  let next = audio.currentTime + 0.06;
  let beat = 0;
  const id = setInterval(() => {
    while (next < audio.currentTime + 0.15) {
      click(audio, next, beat % 4 === 0, getVolume());
      next += 60 / Math.max(20, getBpm());
      beat += 1;
    }
  }, 25);
  return () => clearInterval(id);
}
