// Explorer state: defaults, URL <-> state conversion, safe localStorage.
import { SCALES, CHORDS, TUNINGS, NOTE_SHARP, NOTE_FLAT } from './theory';

export const DEFAULT_STATE = {
  mode: 'scale', // 'all' | 'scale' | 'arpeggio'
  rootPc: 0,
  scaleId: 'major',
  arpId: 'maj',
  tuningId: 'standard',
  capo: 0,
  frets: 15,
  labels: 'note', // 'note' | 'interval' | 'none'
  spelling: 'auto', // 'auto' | 'sharp' | 'flat'
  position: 0, // 0 = whole neck
  lefty: false,
  vertical: false,
};

export const FRET_OPTIONS = [12, 15, 17, 19, 21, 22, 24];

const STORAGE_KEY = 'gfv-explorer-v1';

export function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* storage unavailable (private mode etc.) - ignore */
  }
}

const rootToString = (pc) => NOTE_SHARP[pc];
function rootFromString(str) {
  if (str == null) return null;
  let i = NOTE_SHARP.indexOf(str);
  if (i < 0) i = NOTE_FLAT.indexOf(str);
  return i < 0 ? null : i;
}

/** Validate and merge arbitrary input onto the defaults. */
export function sanitize(input) {
  const s = { ...DEFAULT_STATE };
  if (!input || typeof input !== 'object') return s;
  if (['all', 'scale', 'arpeggio'].includes(input.mode)) s.mode = input.mode;
  if (Number.isInteger(input.rootPc) && input.rootPc >= 0 && input.rootPc < 12) s.rootPc = input.rootPc;
  if (SCALES.some((x) => x.id === input.scaleId)) s.scaleId = input.scaleId;
  if (CHORDS.some((x) => x.id === input.arpId)) s.arpId = input.arpId;
  if (TUNINGS.some((x) => x.id === input.tuningId)) s.tuningId = input.tuningId;
  if (FRET_OPTIONS.includes(input.frets)) s.frets = input.frets;
  if (Number.isInteger(input.capo) && input.capo >= 0 && input.capo <= 9) s.capo = input.capo;
  if (['note', 'interval', 'none'].includes(input.labels)) s.labels = input.labels;
  if (['auto', 'sharp', 'flat'].includes(input.spelling)) s.spelling = input.spelling;
  if (Number.isInteger(input.position) && input.position >= 0 && input.position <= 12) s.position = input.position;
  s.lefty = input.lefty === true;
  s.vertical = input.vertical === true;
  if (s.capo >= s.frets - 3) s.capo = 0;
  return s;
}

export function stateToQuery(s) {
  const p = new URLSearchParams();
  p.set('mode', s.mode);
  if (s.mode !== 'all') {
    p.set('root', rootToString(s.rootPc));
    if (s.mode === 'scale') p.set('scale', s.scaleId);
    else p.set('arp', s.arpId);
  }
  if (s.tuningId !== DEFAULT_STATE.tuningId) p.set('tuning', s.tuningId);
  if (s.capo) p.set('capo', String(s.capo));
  if (s.frets !== DEFAULT_STATE.frets) p.set('frets', String(s.frets));
  if (s.labels !== DEFAULT_STATE.labels) p.set('labels', s.labels);
  if (s.spelling !== DEFAULT_STATE.spelling) p.set('spelling', s.spelling);
  if (s.position) p.set('pos', String(s.position));
  if (s.lefty) p.set('lefty', '1');
  if (s.vertical) p.set('vertical', '1');
  return p.toString();
}

export function queryToState(search) {
  const p = new URLSearchParams(search);
  if (![...p.keys()].length) return null;
  const raw = {};
  raw.mode = p.get('mode') || undefined;
  const root = rootFromString(p.get('root'));
  if (root !== null) raw.rootPc = root;
  if (p.get('scale')) raw.scaleId = p.get('scale');
  if (p.get('arp')) raw.arpId = p.get('arp');
  if (p.get('tuning')) raw.tuningId = p.get('tuning');
  if (p.get('capo')) raw.capo = parseInt(p.get('capo'), 10);
  if (p.get('frets')) raw.frets = parseInt(p.get('frets'), 10);
  if (p.get('labels')) raw.labels = p.get('labels');
  if (p.get('spelling')) raw.spelling = p.get('spelling');
  if (p.get('pos')) raw.position = parseInt(p.get('pos'), 10);
  raw.lefty = p.get('lefty') === '1';
  raw.vertical = p.get('vertical') === '1';
  return sanitize(raw);
}

export function loadInitialState() {
  const fromUrl = typeof window !== 'undefined' ? queryToState(window.location.search) : null;
  if (fromUrl) return fromUrl;
  const saved = safeGet(STORAGE_KEY);
  if (saved) {
    try {
      return sanitize(JSON.parse(saved));
    } catch (e) {
      /* fall through */
    }
  }
  return { ...DEFAULT_STATE };
}

export const TABS = ['explore', 'chords', 'scales', 'circle', 'progressions', 'quiz'];

export function tabFromQuery(search) {
  const t = new URLSearchParams(search).get('tab');
  return TABS.includes(t) ? t : 'explore';
}

export function persistState(s, tab = 'explore') {
  safeSet(STORAGE_KEY, JSON.stringify(s));
  try {
    const p = new URLSearchParams(stateToQuery(s));
    if (tab !== 'explore') p.set('tab', tab);
    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}${window.location.hash}`);
  } catch (e) {
    /* ignore (e.g. sandboxed iframes) */
  }
}
