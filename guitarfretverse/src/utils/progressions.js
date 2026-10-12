// Chord progression registry and helpers.
import { getChord, chordSymbol, shouldUseFlats, mod12 } from './theory';

// Each step is [roman numeral, semitones above the tonic, chord id].
// "major" progressions are measured from a major tonic, "minor" from a minor tonic.
const P = (id, name, mode, category, steps, mood, desc, examples = []) => ({
  id,
  name,
  mode,
  category,
  steps,
  mood,
  desc,
  examples,
});

export const CATEGORIES = ['Pop', 'Rock', 'Blues', 'Jazz', 'Folk & classical', 'Dark & epic'];

export const PROGRESSIONS = [
  P('pop-1564', 'I – V – vi – IV', 'major', 'Pop',
    [['I', 0, 'maj'], ['V', 7, 'maj'], ['vi', 9, 'min'], ['IV', 5, 'maj']],
    'Uplifting, familiar',
    'The most used progression in modern pop. It starts at home (I), lifts to the dominant (V), dips into the relative minor (vi) for a touch of emotion, then lands on IV which pulls back to the start.',
    ['Let It Be (The Beatles)', 'No Woman, No Cry (Bob Marley)', 'Someone Like You (Adele)']),
  P('pop-6415', 'vi – IV – I – V', 'major', 'Pop',
    [['vi', 9, 'min'], ['IV', 5, 'maj'], ['I', 0, 'maj'], ['V', 7, 'maj']],
    'Emotional, anthemic',
    'The same four chords as I–V–vi–IV, started from the minor chord. Starting on vi makes the loop feel moodier and more yearning.',
    ['Despacito (Luis Fonsi)']),
  P('pop-4156', 'IV – I – V – vi', 'major', 'Pop',
    [['IV', 5, 'maj'], ['I', 0, 'maj'], ['V', 7, 'maj'], ['vi', 9, 'min']],
    'Open, hopeful',
    'Another rotation of the pop four-chord loop. Opening on IV feels lifted and unresolved, so it works well for choruses.'),
  P('fifties', 'I – vi – IV – V', 'major', 'Pop',
    [['I', 0, 'maj'], ['vi', 9, 'min'], ['IV', 5, 'maj'], ['V', 7, 'maj']],
    'Nostalgic, sweet',
    'The "50s progression" or doo-wop changes. Each chord moves smoothly and the V at the end sets up a strong return to I.',
    ['Stand By Me (Ben E. King)']),
  P('canon', 'Canon: I – V – vi – iii – IV – I – IV – V', 'major', 'Folk & classical',
    [['I', 0, 'maj'], ['V', 7, 'maj'], ['vi', 9, 'min'], ['iii', 4, 'min'], ['IV', 5, 'maj'], ['I', 0, 'maj'], ['IV', 5, 'maj'], ['V', 7, 'maj']],
    'Flowing, romantic',
    'Pachelbel\'s eight-chord sequence. The roots step down through the key (1, 5, 6, 3, 4, 1, 4, 5), which gives it a cascading, cyclical feel.',
    ['Canon in D (Pachelbel)']),
  P('three-chord', 'I – IV – V', 'major', 'Rock',
    [['I', 0, 'maj'], ['IV', 5, 'maj'], ['V', 7, 'maj'], ['I', 0, 'maj']],
    'Simple, driving',
    'The three-chord song: tonic, subdominant, dominant. These are the three major chords you get by looking at the neighbours on the circle of fifths.',
    ['La Bamba (Ritchie Valens)', 'Twist and Shout (The Beatles)']),
  P('mixo-rock', 'I – bVII – IV – I', 'major', 'Rock',
    [['I', 0, 'maj'], ['bVII', 10, 'maj'], ['IV', 5, 'maj'], ['I', 0, 'maj']],
    'Rootsy, rock and roll',
    'A borrowed bVII chord (from Mixolydian) gives a classic rock and roll sound. Try the Mixolydian scale over it.',
    ['Sweet Home Alabama (Lynyrd Skynyrd)']),
  P('plagal', 'I – IV – I', 'major', 'Folk & classical',
    [['I', 0, 'maj'], ['IV', 5, 'maj'], ['I', 0, 'maj'], ['I', 0, 'maj']],
    'Gentle, resolved',
    'The plagal ("amen") cadence. IV to I is softer and less urgent than V to I, and is a staple of gospel, folk and hymns.'),
  P('blues-12', '12-bar blues', 'major', 'Blues',
    [['I7', 0, 'dom7'], ['I7', 0, 'dom7'], ['I7', 0, 'dom7'], ['I7', 0, 'dom7'],
     ['IV7', 5, 'dom7'], ['IV7', 5, 'dom7'], ['I7', 0, 'dom7'], ['I7', 0, 'dom7'],
     ['V7', 7, 'dom7'], ['IV7', 5, 'dom7'], ['I7', 0, 'dom7'], ['V7', 7, 'dom7']],
    'Earthy, swinging',
    'Twelve bars built on three dominant 7th chords. One chord per bar. The final V7 is a "turnaround" that sends you back to the top. Solo with the minor or major blues scale.',
    ['Johnny B. Goode (Chuck Berry)', 'Hound Dog (Elvis Presley)']),
  P('jazz-251', 'ii7 – V7 – Imaj7', 'major', 'Jazz',
    [['ii7', 2, 'min7'], ['V7', 7, 'dom7'], ['Imaj7', 0, 'maj7'], ['Imaj7', 0, 'maj7']],
    'Smooth, sophisticated',
    'The backbone of jazz harmony. The roots fall by fifths (ii to V to I), moving round the circle of fifths against the clock.',
    ['Autumn Leaves (jazz standard)']),
  P('jazz-turnaround', 'Imaj7 – vi7 – ii7 – V7', 'major', 'Jazz',
    [['Imaj7', 0, 'maj7'], ['vi7', 9, 'min7'], ['ii7', 2, 'min7'], ['V7', 7, 'dom7']],
    'Classic, circular',
    'The "I–vi–ii–V" turnaround. Every root falls a fifth after the opening step, so it loops endlessly back to I.',
    ['I Got Rhythm (Gershwin)']),
  P('pop-1465', 'I – IV – vi – V', 'major', 'Pop',
    [['I', 0, 'maj'], ['IV', 5, 'maj'], ['vi', 9, 'min'], ['V', 7, 'maj']],
    'Bright, driving',
    'A common alternative to the I–V–vi–IV loop that ends on the dominant, which creates strong forward pull into the next verse or chorus.'),

  P('andalusian', 'i – bVII – bVI – V', 'minor', 'Dark & epic',
    [['i', 0, 'min'], ['bVII', 10, 'maj'], ['bVI', 8, 'maj'], ['V', 7, 'maj']],
    'Dramatic, Spanish',
    'The Andalusian cadence: a descending line from i down to V. The major V (borrowed from harmonic minor) gives a strong, flamenco-style pull back to i.',
    ['Hit the Road Jack (Ray Charles)']),
  P('minor-epic', 'i – bVI – bIII – bVII', 'minor', 'Dark & epic',
    [['i', 0, 'min'], ['bVI', 8, 'maj'], ['bIII', 3, 'maj'], ['bVII', 10, 'maj']],
    'Epic, brooding',
    'The minor-key equivalent of the pop loop. All four chords are straight from the natural minor scale, so it works in rock, metal and film themes.',
    ['Zombie (The Cranberries)']),
  P('minor-1-4-5', 'i – iv – v', 'minor', 'Dark & epic',
    [['i', 0, 'min'], ['iv', 5, 'min'], ['v', 7, 'min'], ['i', 0, 'min']],
    'Modal, moody',
    'The three minor chords of the natural minor scale. Softer and less tense than using a major V.'),
  P('minor-1-4-V', 'i – iv – V', 'minor', 'Folk & classical',
    [['i', 0, 'min'], ['iv', 5, 'min'], ['V', 7, 'maj'], ['i', 0, 'min']],
    'Classical, serious',
    'Using a major V (from harmonic minor) gives a strong cadence back to i. The standard minor-key "home, away, tension, home".'),
  P('minor-ride', 'i – bVI – bVII', 'minor', 'Rock',
    [['i', 0, 'min'], ['bVI', 8, 'maj'], ['bVII', 10, 'maj'], ['i', 0, 'min']],
    'Heroic, driving',
    'A rock staple. The step up from bVI to bVII feels like a climb, then it falls back to i.'),
  P('jazz-minor-251', 'iiø7 – V7 – i7', 'minor', 'Jazz',
    [['iiø7', 2, 'min7b5'], ['V7', 7, 'dom7'], ['i7', 0, 'min7'], ['i7', 0, 'min7']],
    'Dark, jazzy',
    'The minor ii–V–i. The half-diminished ii chord and the dominant V7 pull strongly into the minor tonic.'),
  P('blues-minor-12', '12-bar minor blues', 'minor', 'Blues',
    [['i7', 0, 'min7'], ['i7', 0, 'min7'], ['i7', 0, 'min7'], ['i7', 0, 'min7'],
     ['iv7', 5, 'min7'], ['iv7', 5, 'min7'], ['i7', 0, 'min7'], ['i7', 0, 'min7'],
     ['bVI7', 8, 'dom7'], ['V7', 7, 'dom7'], ['i7', 0, 'min7'], ['V7', 7, 'dom7']],
    'Smoky, brooding',
    'The minor version of the twelve-bar form. The bVI7 to V7 move in bars 9 and 10 gives it a distinctive, descending turnaround.'),
];

export const getProgression = (id) => PROGRESSIONS.find((p) => p.id === id);

/** Turn a progression into real chords in a given key. */
export function resolveProgression(prog, keyPc, spelling = 'auto') {
  const flats = shouldUseFlats(spelling, keyPc, prog.mode === 'minor' ? 9 : 0);
  return prog.steps.map(([roman, offset, chordId]) => {
    const rootPc = mod12(keyPc + offset);
    const chord = getChord(chordId);
    // A flattened degree in a major key (e.g. bVII) is written with flats: Bb, not A#.
    const stepFlats = prog.mode === 'major' && roman.startsWith('b') ? true : flats;
    return { roman, rootPc, chord, label: chordSymbol(rootPc, chord, stepFlats) };
  });
}

/** Play-friendly open voicing: bass note low, other chord tones above. */
export function voiceChord(rootPc, chord) {
  let bass = 40; // E2
  while (mod12(bass) !== mod12(rootPc)) bass += 1;
  const uppers = chord.intervals.slice(1).map((iv) => bass + 12 + iv);
  return [bass, ...uppers];
}

// Which diatonic degrees (0-6) usually follow a given degree.
// A simplification of common practice harmony, intended as guidance only.
export const COMMON_NEXT = {
  0: [3, 4, 5, 1],
  1: [4, 6],
  2: [5, 3],
  3: [4, 0, 1],
  4: [0, 5],
  5: [3, 1, 4],
  6: [0],
};

export const FUNCTIONS = [
  {
    name: 'Tonic',
    chords: 'I, vi, iii',
    text: 'Home. Stable and at rest. Songs usually begin and end here.',
  },
  {
    name: 'Subdominant',
    chords: 'IV, ii',
    text: 'Moving away from home. Gentle lift and anticipation.',
  },
  {
    name: 'Dominant',
    chords: 'V, vii°',
    text: 'Tension that wants to resolve back to the tonic. The V chord contains the leading note, which pulls up to the root.',
  },
];

export const CADENCES = [
  ['Authentic', 'V → I', 'The strongest full stop. Tension resolves to home.'],
  ['Plagal', 'IV → I', 'The "amen" ending. Softer and warmer than V → I.'],
  ['Half', '… → V', 'Ends on the dominant, like a comma or a question mark. Good for the end of a verse.'],
  ['Deceptive', 'V → vi', 'Sets up an authentic ending, then goes to the relative minor instead for a surprise.'],
];
