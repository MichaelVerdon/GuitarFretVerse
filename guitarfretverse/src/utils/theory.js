// Music theory engine for GuitarFretVerse.
// Everything on the fretboard is derived from pitch classes (0-11, C = 0)
// and semitone interval sets, so adding a scale or chord is a single entry.

export const mod12 = (n) => ((n % 12) + 12) % 12;

export const NOTE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const ROOT_LABELS = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

// Keys whose parent major key uses flats: F, Bb, Eb, Ab, Db
const FLAT_PARENTS = new Set([5, 10, 3, 8, 1]);

export function noteName(pc, flats = false) {
  return (flats ? NOTE_FLAT : NOTE_SHARP)[mod12(pc)];
}

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

/**
 * Spell one note of a scale or chord. A flattened degree built on a natural
 * root is written with a flat (the b7 of C is Bb, never A#). Everything else
 * follows the key's sharp/flat preference.
 */
export function spellNote(pc, rootPc, degreeLabel, flats) {
  const flatDegree = typeof degreeLabel === 'string' && degreeLabel.startsWith('b');
  return noteName(pc, flatDegree && WHITE_PCS.has(mod12(rootPc)) ? true : flats);
}

/** Decide sharps vs flats. spelling: 'auto' | 'sharp' | 'flat'. */
export function shouldUseFlats(spelling, rootPc, parentOffset = 0) {
  if (spelling === 'sharp') return false;
  if (spelling === 'flat') return true;
  return FLAT_PARENTS.has(mod12(rootPc - parentOffset));
}

// ---------------------------------------------------------------------------
// Tunings (MIDI note numbers, lowest string first)
// ---------------------------------------------------------------------------
export const TUNINGS = [
  { id: 'standard', name: 'Standard (E A D G B e)', notes: [40, 45, 50, 55, 59, 64] },
  { id: 'dropd', name: 'Drop D (D A D G B e)', notes: [38, 45, 50, 55, 59, 64] },
  { id: 'halfdown', name: 'Half step down (Eb)', notes: [39, 44, 49, 54, 58, 63] },
  { id: 'fulldown', name: 'Full step down (D)', notes: [38, 43, 48, 53, 57, 62] },
  { id: 'dadgad', name: 'DADGAD', notes: [38, 45, 50, 55, 57, 62] },
  { id: 'openg', name: 'Open G (D G D G B D)', notes: [38, 43, 50, 55, 59, 62] },
  { id: 'opend', name: 'Open D (D A D F# A D)', notes: [38, 45, 50, 54, 57, 62] },
  { id: 'opene', name: 'Open E (E B E G# B e)', notes: [40, 47, 52, 56, 59, 64] },
  { id: 'seven', name: '7-string (B E A D G B e)', notes: [35, 40, 45, 50, 55, 59, 64] },
  { id: 'eight', name: '8-string (F# B E A D G B e)', notes: [30, 35, 40, 45, 50, 55, 59, 64] },
];

export const getTuning = (id) => TUNINGS.find((t) => t.id === id) || TUNINGS[0];

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** Degree labels for a 7-note scale relative to the major scale: 1 2 b3 4 ... */
export function degreeFormula(intervals) {
  return intervals.map((s, i) => {
    const d = s - MAJOR[i];
    const acc = d < 0 ? 'b'.repeat(-d) : '#'.repeat(d);
    return acc + (i + 1);
  });
}

// parentOffset = semitones from the parent major key's tonic to this scale's
// tonic. Used only to choose sensible sharp/flat spelling.
const S = (id, name, group, intervals, parentOffset, desc, formula) => ({
  id,
  name,
  group,
  intervals,
  parentOffset,
  desc,
  formula: formula || degreeFormula(intervals),
});

export const SCALES = [
  S('major', 'Major (Ionian)', 'Major & modes', [0, 2, 4, 5, 7, 9, 11], 0,
    'The major scale (Ionian mode) is the foundation of Western harmony. It sounds bright, happy and stable, and every other mode on this list can be thought of as the same notes started from a different degree.'),
  S('dorian', 'Dorian', 'Major & modes', [0, 2, 3, 5, 7, 9, 10], 2,
    'The second mode of the major scale. It is like natural minor with a raised 6th, giving a cool, jazzy and slightly mysterious sound. Common in funk, jazz, rock and folk.'),
  S('phrygian', 'Phrygian', 'Major & modes', [0, 1, 3, 5, 7, 8, 10], 4,
    'The third mode of the major scale. The lowered 2nd gives it a dark, exotic, Spanish or Eastern flavour, popular in metal and flamenco.'),
  S('lydian', 'Lydian', 'Major & modes', [0, 2, 4, 6, 7, 9, 11], 5,
    'The fourth mode of the major scale. A major scale with a raised 4th: dreamy, floating and uplifting. Heard a lot in film scores, jazz and progressive rock.'),
  S('mixolydian', 'Mixolydian', 'Major & modes', [0, 2, 4, 5, 7, 9, 10], 7,
    'The fifth mode of the major scale. A major scale with a lowered 7th: laid-back, bluesy and slightly unresolved. The go-to sound over dominant 7th chords in rock, blues and funk.'),
  S('minor', 'Natural Minor (Aeolian)', 'Major & modes', [0, 2, 3, 5, 7, 8, 10], 9,
    'The sixth mode of the major scale. Darker and more melancholic than major, with a sad, introspective feel. The default minor sound in rock, pop and metal.'),
  S('locrian', 'Locrian', 'Major & modes', [0, 1, 3, 5, 6, 8, 10], 11,
    'The seventh mode of the major scale. The flattened 5th makes it tense and unstable, so it is rarely used as a home key, but it works over half-diminished chords in jazz and in metal.'),

  S('minor-pentatonic', 'Minor Pentatonic', 'Pentatonic & blues', [0, 3, 5, 7, 10], 9,
    'A five-note scale with no half steps, and the most-used scale in rock and blues solos. Soulful and gritty, and very hard to play a wrong note with.', ['1', 'b3', '4', '5', 'b7']),
  S('major-pentatonic', 'Major Pentatonic', 'Pentatonic & blues', [0, 2, 4, 7, 9], 0,
    'A five-note scale made by dropping the 4th and 7th from the major scale. Cheerful and open, common in country, rock and pop melodies.', ['1', '2', '3', '5', '6']),
  S('blues', 'Blues (Minor)', 'Pentatonic & blues', [0, 3, 5, 6, 7, 10], 9,
    'The minor pentatonic with an added b5 "blue note". Gritty, expressive and central to blues, rock and jazz.', ['1', 'b3', '4', 'b5', '5', 'b7']),
  S('blues-major', 'Blues (Major)', 'Pentatonic & blues', [0, 2, 3, 4, 7, 9], 0,
    'The major pentatonic with an added b3 passing note. Sweet and country-tinged with a bluesy bend, common in classic rock and country.', ['1', '2', 'b3', '3', '5', '6']),

  S('harmonic-minor', 'Harmonic Minor', 'Minor variants', [0, 2, 3, 5, 7, 8, 11], 9,
    'Natural minor with a raised 7th. The leading tone and the augmented second between b6 and 7 give it a dramatic, exotic sound used in classical, neoclassical metal and Middle Eastern music.'),
  S('melodic-minor', 'Melodic Minor (Jazz)', 'Minor variants', [0, 2, 3, 5, 7, 9, 11], 9,
    'A minor scale with raised 6th and 7th (the ascending form). Smooth and sophisticated; the basis of many jazz scales.'),
  S('dorian-b2', 'Dorian b2', 'Minor variants', [0, 1, 3, 5, 7, 9, 10], 2,
    'The second mode of melodic minor. Dorian with a lowered 2nd, giving a dark but slightly lifted minor sound.'),
  S('hungarian-minor', 'Hungarian Minor', 'Minor variants', [0, 2, 3, 6, 7, 8, 11], 9,
    'Harmonic minor with a raised 4th. Dramatic and gypsy-flavoured, with two augmented seconds.'),

  S('phrygian-dominant', 'Phrygian Dominant', 'Exotic & jazz', [0, 1, 4, 5, 7, 8, 10], 4,
    'The fifth mode of harmonic minor. A major 3rd over a Phrygian sound gives the classic Spanish, flamenco and Middle Eastern flavour. Great over a dominant chord resolving to minor.'),
  S('lydian-dominant', 'Lydian Dominant', 'Exotic & jazz', [0, 2, 4, 6, 7, 9, 10], 7,
    'The fourth mode of melodic minor: Lydian with a b7. Bright and bluesy at once, used over dominant 7#11 chords.'),
  S('altered', 'Altered (Super Locrian)', 'Exotic & jazz', [0, 1, 3, 4, 6, 8, 10], 11,
    'The seventh mode of melodic minor. Every colour tone is altered (b9, #9, b5, #5), making it the standard tense choice over dominant chords that resolve in jazz.',
    ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']),
  S('bebop-dominant', 'Bebop Dominant', 'Exotic & jazz', [0, 2, 4, 5, 7, 9, 10, 11], 7,
    'Mixolydian with an added natural 7th passing note, so chord tones land on the beat when played in eighth notes. A staple of bebop lines.',
    ['1', '2', '3', '4', '5', '6', 'b7', '7']),
  S('whole-tone', 'Whole Tone', 'Exotic & jazz', [0, 2, 4, 6, 8, 10], 0,
    'Six notes, all a whole step apart. Dreamy and directionless with no strong resolution, used by Debussy and in jazz over augmented chords.',
    ['1', '2', '3', '#4', '#5', 'b7']),
  S('diminished-wh', 'Diminished (Whole-Half)', 'Exotic & jazz', [0, 2, 3, 5, 6, 8, 9, 11], 9,
    'An eight-note symmetrical scale alternating whole and half steps. Tense and spooky, played over diminished 7th chords.',
    ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7']),
  S('diminished-hw', 'Diminished (Half-Whole)', 'Exotic & jazz', [0, 1, 3, 4, 6, 7, 9, 10], 0,
    'An eight-note symmetrical scale alternating half and whole steps. The usual choice over dominant 7b9 chords.',
    ['1', 'b2', 'b3', '3', '#4', '5', '6', 'b7']),
];

export const getScale = (id) => SCALES.find((s) => s.id === id) || SCALES[0];

// ---------------------------------------------------------------------------
// Chords / arpeggios
// ---------------------------------------------------------------------------
const C = (id, name, symbol, intervals, formula, desc) => ({
  id,
  name,
  symbol,
  intervals,
  formula,
  desc,
  parentOffset: intervals.includes(3) && !intervals.includes(4) ? 9 : 0,
});

export const CHORDS = [
  C('maj', 'Major', '', [0, 4, 7], ['1', '3', '5'],
    'The root, major third and perfect fifth. A bright, strong and stable sound that outlines a major chord.'),
  C('min', 'Minor', 'm', [0, 3, 7], ['1', 'b3', '5'],
    'The root, minor third and perfect fifth. Sadder and more introspective than major.'),
  C('dim', 'Diminished', 'dim', [0, 3, 6], ['1', 'b3', 'b5'],
    'The root, minor third and diminished fifth. Tense, unstable and dissonant, often used to build suspense.'),
  C('aug', 'Augmented', 'aug', [0, 4, 8], ['1', '3', '#5'],
    'The root, major third and augmented fifth. Dreamy and unresolved; three equally spaced notes.'),
  C('sus2', 'Suspended 2nd', 'sus2', [0, 2, 7], ['1', '2', '5'],
    'Replaces the third with a 2nd. Open and ambiguous, neither major nor minor.'),
  C('sus4', 'Suspended 4th', 'sus4', [0, 5, 7], ['1', '4', '5'],
    'Replaces the third with a 4th. Creates tension that wants to resolve down to the third.'),
  C('maj6', 'Major 6th', '6', [0, 4, 7, 9], ['1', '3', '5', '6'],
    'A major chord with an added 6th. Warm, vintage and slightly sweet.'),
  C('min6', 'Minor 6th', 'm6', [0, 3, 7, 9], ['1', 'b3', '5', '6'],
    'A minor chord with an added major 6th. Smoky and jazzy.'),
  C('dom7', 'Dominant 7th', '7', [0, 4, 7, 10], ['1', '3', '5', 'b7'],
    'Root, major third, fifth and minor seventh. Bluesy and tense, it pulls strongly towards resolution.'),
  C('maj7', 'Major 7th', 'maj7', [0, 4, 7, 11], ['1', '3', '5', '7'],
    'Root, major third, fifth and major seventh. Lush, sophisticated and jazzy.'),
  C('min7', 'Minor 7th', 'm7', [0, 3, 7, 10], ['1', 'b3', '5', 'b7'],
    'Root, minor third, fifth and minor seventh. Rich, soulful and slightly bluesy; widely used in jazz, soul and pop.'),
  C('min7b5', 'Half-diminished (m7b5)', 'm7b5', [0, 3, 6, 10], ['1', 'b3', 'b5', 'b7'],
    'A diminished triad with a minor seventh. Dark and tense; the ii chord in a minor ii-V-i.'),
  C('dim7', 'Diminished 7th', 'dim7', [0, 3, 6, 9], ['1', 'b3', 'b5', 'bb7'],
    'Four notes a minor third apart. Symmetrical, dramatic and unstable.'),
  C('minMaj7', 'Minor-major 7th', 'm(maj7)', [0, 3, 7, 11], ['1', 'b3', '5', '7'],
    'A minor triad with a major seventh. Mysterious and cinematic; think spy themes.'),
  C('add9', 'Add 9', 'add9', [0, 2, 4, 7], ['1', '2', '3', '5'],
    'A major triad plus a 9th (the 2nd) without the seventh. Shimmering and modern.'),
  C('dom9', 'Dominant 9th', '9', [0, 2, 4, 7, 10], ['1', '9', '3', '5', 'b7'],
    'A dominant 7th with a 9th. Funky and full, a staple of soul and funk.'),
  C('maj9', 'Major 9th', 'maj9', [0, 2, 4, 7, 11], ['1', '9', '3', '5', '7'],
    'A major 7th with a 9th. Silky and expansive.'),
  C('min9', 'Minor 9th', 'm9', [0, 2, 3, 7, 10], ['1', '9', 'b3', '5', 'b7'],
    'A minor 7th with a 9th. Smooth and mellow, common in neo-soul and jazz.'),
  C('7sus4', '7sus4', '7sus4', [0, 5, 7, 10], ['1', '4', '5', 'b7'],
    'A suspended 4th chord with a minor seventh. Open and unresolved, popular in funk and gospel.'),
  C('5', 'Power chord (5)', '5', [0, 7], ['1', '5'],
    'Just the root and fifth. Neither major nor minor, and the backbone of rock and metal riffs.'),
];

export const getChord = (id) => CHORDS.find((c) => c.id === id) || CHORDS[0];

// ---------------------------------------------------------------------------
// Describing a selection
// ---------------------------------------------------------------------------

/**
 * Describe what the fretboard should show.
 * mode: 'all' | 'scale' | 'arpeggio'
 */
export function describePattern({ mode, rootPc, scaleId, arpId, spelling = 'auto' }) {
  if (mode === 'all') {
    return {
      mode,
      type: null,
      flats: spelling === 'flat',
      set: null,
      labelBy: null,
      title: 'All notes',
      formula: [],
      notes: [],
    };
  }
  const type = mode === 'scale' ? getScale(scaleId) : getChord(arpId);
  const flats = shouldUseFlats(spelling, rootPc, type.parentOffset);
  const set = new Set(type.intervals);
  const labelBy = {};
  type.intervals.forEach((iv, i) => {
    labelBy[iv] = type.formula[i];
  });
  const rootName = noteName(rootPc, flats);
  return {
    mode,
    type,
    flats,
    set,
    labelBy,
    title: `${rootName} ${type.name} ${mode === 'scale' ? 'Scale' : 'Arpeggio'}`,
    formula: type.formula,
    notes: type.intervals.map((iv, i) => spellNote(rootPc + iv, rootPc, type.formula[i], flats)),
  };
}

// ---------------------------------------------------------------------------
// Positions (fret windows)
// ---------------------------------------------------------------------------

/**
 * Split the neck into playable 5-fret windows, each starting on a scale note of
 * the lowest string. Numbered from the root upwards, within one octave.
 */
export function findPositions({ lowOpen, capo = 0, frets = 15, rootPc, intervalSet, span = 5 }) {
  if (!intervalSet) return [];
  const inSet = (f) => intervalSet.has(mod12(lowOpen + f - rootPc));
  let firstRoot = null;
  for (let f = capo; f <= frets; f++) {
    if (mod12(lowOpen + f) === mod12(rootPc)) {
      firstRoot = f;
      break;
    }
  }
  if (firstRoot === null) firstRoot = capo;
  const starts = [];
  for (let f = firstRoot; f < firstRoot + 12 && f <= frets; f++) {
    if (inSet(f)) starts.push(f);
  }
  return starts.map((start) => ({ start, end: Math.min(start + span - 1, frets) }));
}

// ---------------------------------------------------------------------------
// Playback sequence
// ---------------------------------------------------------------------------

/**
 * Build the list of notes to play, one cell per distinct pitch, ascending
 * (or descending / up-and-down) in pitch.
 */
export function buildSequence({ tuning, capo = 0, frets = 15, rootPc, intervalSet, win = null, direction = 'up' }) {
  const byMidi = new Map();
  for (let s = 0; s < tuning.length; s++) {
    for (let f = capo; f <= frets; f++) {
      if (win && (f < win.start || f > win.end)) continue;
      const midi = tuning[s] + f;
      if (intervalSet && !intervalSet.has(mod12(midi - rootPc))) continue;
      const prev = byMidi.get(midi);
      if (!prev || f < prev.f) byMidi.set(midi, { s, f, midi });
    }
  }
  let seq = [...byMidi.values()].sort((a, b) => a.midi - b.midi);
  if (intervalSet && !win) {
    const start = seq.findIndex((n) => mod12(n.midi) === mod12(rootPc));
    if (start >= 0) {
      const base = seq[start].midi;
      seq = seq.slice(start).filter((n) => n.midi <= base + 24);
    }
  }
  if (direction === 'down') return seq.slice().reverse();
  if (direction === 'updown') return seq.concat(seq.slice(0, -1).reverse());
  return seq;
}

// ---------------------------------------------------------------------------
// Chord detection
// ---------------------------------------------------------------------------

export function chordSymbol(rootPc, chord, flats = false, bassPc = null) {
  let s = noteName(rootPc, flats) + chord.symbol;
  if (bassPc !== null && mod12(bassPc) !== mod12(rootPc)) s += '/' + noteName(bassPc, flats);
  return s;
}

/** Find chords whose pitch classes exactly equal the given notes. */
export function detectChords(pcs, bassPc = null) {
  const set = [...new Set(pcs.map(mod12))];
  if (set.length < 2) return [];
  const found = [];
  for (const r of set) {
    const rel = new Set(set.map((p) => mod12(p - r)));
    for (const chord of CHORDS) {
      if (chord.intervals.length === rel.size && chord.intervals.every((i) => rel.has(i))) {
        found.push({
          rootPc: r,
          chord,
          bassPc: bassPc !== null && mod12(bassPc) !== r ? mod12(bassPc) : null,
        });
      }
    }
  }
  // Root position first, then simpler chords first
  found.sort((a, b) => {
    const aRoot = a.bassPc === null ? 0 : 1;
    const bRoot = b.bassPc === null ? 0 : 1;
    if (aRoot !== bRoot) return aRoot - bRoot;
    return CHORDS.indexOf(a.chord) - CHORDS.indexOf(b.chord);
  });
  return found;
}

// ---------------------------------------------------------------------------
// Scale finder
// ---------------------------------------------------------------------------

/** Every (root, scale) pair that contains all of the selected pitch classes. */
export function scalesContaining(pcs) {
  const sel = [...new Set(pcs.map(mod12))];
  if (!sel.length) return [];
  const out = [];
  for (let root = 0; root < 12; root++) {
    for (const scale of SCALES) {
      const have = new Set(scale.intervals.map((i) => mod12(root + i)));
      if (sel.every((p) => have.has(p))) out.push({ rootPc: root, scale });
    }
  }
  out.sort(
    (a, b) =>
      a.scale.intervals.length - b.scale.intervals.length ||
      SCALES.indexOf(a.scale) - SCALES.indexOf(b.scale) ||
      a.rootPc - b.rootPc
  );
  return out;
}

// ---------------------------------------------------------------------------
// Diatonic chords
// ---------------------------------------------------------------------------
const TRIADS = ['maj', 'min', 'dim', 'aug'];
const SEVENTHS = ['maj7', 'min7', 'dom7', 'min7b5', 'dim7', 'minMaj7'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function matchChord(relPcs, allowedIds) {
  const set = new Set(relPcs);
  return (
    CHORDS.filter((c) => allowedIds.includes(c.id)).find(
      (c) => c.intervals.length === set.size && c.intervals.every((i) => set.has(i))
    ) || null
  );
}

/** Triads and 7th chords built on each degree of a 7-note scale. */
export function diatonicChords(scale, rootPc) {
  const iv = scale.intervals;
  if (iv.length !== 7) return [];
  return iv.map((_, i) => {
    const rel = (k) => mod12(iv[(i + k) % 7] - iv[i]);
    const triad = matchChord([rel(0), rel(2), rel(4)], TRIADS);
    const seventh = matchChord([rel(0), rel(2), rel(4), rel(6)], SEVENTHS);
    const m = /^([b#]*)(\d)$/.exec(scale.formula[i]);
    const deg = m ? Number(m[2]) - 1 : i;
    let roman = ROMAN[deg];
    const q = triad ? triad.id : '';
    if (q === 'min' || q === 'dim') roman = roman.toLowerCase();
    roman = (m ? m[1] : '') + roman + (q === 'dim' ? '°' : q === 'aug' ? '+' : '');
    return { degree: i, rootPc: mod12(rootPc + iv[i]), triad, seventh, roman };
  });
}

// ---------------------------------------------------------------------------
// Circle of fifths / key signatures
// ---------------------------------------------------------------------------
export const CIRCLE_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // major key pitch classes
const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];
const CIRCLE_SIGS = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];

export function keySignature(majorPc) {
  const idx = CIRCLE_ORDER.indexOf(mod12(majorPc));
  const n = CIRCLE_SIGS[idx];
  if (n === 0) return { count: 0, type: 'none', accidentals: [] };
  if (n > 0) return { count: n, type: 'sharps', accidentals: SHARP_ORDER.slice(0, n) };
  return { count: -n, type: 'flats', accidentals: FLAT_ORDER.slice(0, -n) };
}

// ---------------------------------------------------------------------------
// Chord shapes (standard tuning) for the chord library
// ---------------------------------------------------------------------------
const STANDARD = TUNINGS[0].notes;

// Movable shapes: offsets are relative to the barre fret; null = muted string.
export const MOVABLE_SHAPES = {
  maj: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 2, 1, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 2, 2, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 3, 2] },
  ],
  min: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 2, 0, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 2, 1, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 3, 1] },
  ],
  dom7: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 0, 1, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 0, 2, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 1, 2] },
  ],
  maj7: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 1, 1, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 1, 2, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 2, 2] },
  ],
  min7: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 0, 0, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 0, 1, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 1, 1] },
  ],
  sus2: [{ name: 'A shape', rootString: 1, offsets: [null, 0, 2, 2, 0, 0] }],
  sus4: [
    { name: 'E shape', rootString: 0, offsets: [0, 2, 2, 2, 0, 0] },
    { name: 'A shape', rootString: 1, offsets: [null, 0, 2, 2, 3, 0] },
    { name: 'D shape', rootString: 2, offsets: [null, null, 0, 2, 3, 3] },
  ],
};

// Open-position shapes keyed by `${rootPc}:${chordId}` (low E to high e).
export const OPEN_SHAPES = {
  '0:maj': [null, 3, 2, 0, 1, 0],
  '9:maj': [null, 0, 2, 2, 2, 0],
  '7:maj': [3, 2, 0, 0, 0, 3],
  '4:maj': [0, 2, 2, 1, 0, 0],
  '2:maj': [null, null, 0, 2, 3, 2],
  '9:min': [null, 0, 2, 2, 1, 0],
  '4:min': [0, 2, 2, 0, 0, 0],
  '2:min': [null, null, 0, 2, 3, 1],
  '4:dom7': [0, 2, 0, 1, 0, 0],
  '9:dom7': [null, 0, 2, 0, 2, 0],
  '2:dom7': [null, null, 0, 2, 1, 2],
  '7:dom7': [3, 2, 0, 0, 0, 1],
  '0:dom7': [null, 3, 2, 3, 1, 0],
  '11:dom7': [null, 2, 1, 2, 0, 2],
  '0:maj7': [null, 3, 2, 0, 0, 0],
  '5:maj7': [null, null, 3, 2, 1, 0],
  '9:maj7': [null, 0, 2, 1, 2, 0],
  '2:maj7': [null, null, 0, 2, 2, 2],
  '9:min7': [null, 0, 2, 0, 1, 0],
  '4:min7': [0, 2, 0, 0, 0, 0],
  '2:min7': [null, null, 0, 2, 1, 1],
  '9:sus2': [null, 0, 2, 2, 0, 0],
  '2:sus2': [null, null, 0, 2, 3, 0],
  '9:sus4': [null, 0, 2, 2, 3, 0],
  '2:sus4': [null, null, 0, 2, 3, 3],
  '4:sus4': [0, 2, 2, 2, 0, 0],
};

/** All shapes for a chord as { name, frets: [abs fret|null]*6, barre } */
export function chordShapesFor(rootPc, chordId) {
  const out = [];
  const open = OPEN_SHAPES[`${mod12(rootPc)}:${chordId}`];
  if (open) out.push({ name: 'Open', frets: open, barre: 0 });
  (MOVABLE_SHAPES[chordId] || []).forEach((sh) => {
    const barre = mod12(rootPc - STANDARD[sh.rootString]);
    if (barre === 0 && open) return; // identical to the open shape
    const frets = sh.offsets.map((o) => (o === null ? null : o + barre));
    if (Math.max(...frets.filter((f) => f !== null)) > 15) return;
    out.push({ name: `${sh.name}${barre ? ` (fret ${barre})` : ''}`, frets, barre });
  });
  return out;
}
