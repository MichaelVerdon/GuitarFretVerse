import {
  SCALES,
  CHORDS,
  TUNINGS,
  describePattern,
  detectChords,
  scalesContaining,
  diatonicChords,
  keySignature,
  findPositions,
  buildSequence,
  chordShapesFor,
  noteName,
  mod12,
} from './theory';
import { sanitize, stateToQuery, queryToState, DEFAULT_STATE } from './state';

const names = (root, scaleId, spelling = 'auto') =>
  describePattern({ mode: 'scale', rootPc: root, scaleId, spelling }).notes;

describe('scales', () => {
  test('every scale has a label for every interval, and starts on the root', () => {
    SCALES.forEach((s) => {
      expect(s.formula).toHaveLength(s.intervals.length);
      expect(s.intervals[0]).toBe(0);
      expect(new Set(s.intervals).size).toBe(s.intervals.length);
    });
  });

  test('A minor pentatonic is A C D E G', () => {
    expect(names(9, 'minor-pentatonic')).toEqual(['A', 'C', 'D', 'E', 'G']);
  });

  test('C major is the white notes', () => {
    expect(names(0, 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  test('modes share notes with their parent major key', () => {
    const cMajor = [...names(0, 'major')].sort();
    expect([...names(2, 'dorian')].sort()).toEqual(cMajor);
    expect([...names(4, 'phrygian')].sort()).toEqual(cMajor);
    expect([...names(5, 'lydian')].sort()).toEqual(cMajor);
    expect([...names(7, 'mixolydian')].sort()).toEqual(cMajor);
    expect([...names(9, 'minor')].sort()).toEqual(cMajor);
    expect([...names(11, 'locrian')].sort()).toEqual(cMajor);
  });

  test('auto spelling uses flats for flat keys', () => {
    expect(names(10, 'major')).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);
    expect(names(7, 'major')[6]).toBe('F#');
    // D minor lives in the key of F major, so it gets Bb
    expect(names(2, 'minor')).toContain('Bb');
  });

  test('flat degrees on natural roots are written with flats', () => {
    const arp = (root, id) => describePattern({ mode: 'arpeggio', rootPc: root, arpId: id }).notes;
    expect(arp(0, 'dom7')).toEqual(['C', 'E', 'G', 'Bb']);
    expect(arp(0, 'dom9')).toEqual(['C', 'D', 'E', 'G', 'Bb']);
    expect(names(0, 'blues-major')).toEqual(['C', 'D', 'Eb', 'E', 'G', 'A']);
    // sharp keys keep their sharps: G# natural minor has F#, not Gb
    expect(names(8, 'minor')).toEqual(['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#']);
    expect(arp(7, 'dom7')).toEqual(['G', 'B', 'D', 'F']);
  });

  test('degree formulas are generated correctly', () => {
    expect(SCALES.find((s) => s.id === 'phrygian').formula).toEqual(['1', 'b2', 'b3', '4', '5', 'b6', 'b7']);
    expect(SCALES.find((s) => s.id === 'lydian').formula).toEqual(['1', '2', '3', '#4', '5', '6', '7']);
  });
});

describe('chords', () => {
  test('arpeggio notes', () => {
    const d = describePattern({ mode: 'arpeggio', rootPc: 0, arpId: 'maj7' });
    expect(d.notes).toEqual(['C', 'E', 'G', 'B']);
  });

  test('detects common chords by name', () => {
    // C E G = C major, bass C
    const c = detectChords([0, 4, 7], 0);
    expect(c[0].rootPc).toBe(0);
    expect(c[0].chord.id).toBe('maj');
    // Am7 and C6 share notes; root-position reading wins when bass is A
    const am7 = detectChords([9, 0, 4, 7], 9);
    expect(am7[0].chord.id).toBe('min7');
    expect(am7[0].rootPc).toBe(9);
  });

  test('power chord is recognised from two notes', () => {
    const r = detectChords([4, 11], 4);
    expect(r[0].chord.id).toBe('5');
  });

  test('chord ids are unique', () => {
    expect(new Set(CHORDS.map((c) => c.id)).size).toBe(CHORDS.length);
    expect(new Set(SCALES.map((c) => c.id)).size).toBe(SCALES.length);
  });
});

describe('scale finder', () => {
  test('C E G fits C major but not C minor', () => {
    const r = scalesContaining([0, 4, 7]);
    expect(r.some((x) => x.rootPc === 0 && x.scale.id === 'major')).toBe(true);
    expect(r.some((x) => x.rootPc === 0 && x.scale.id === 'minor')).toBe(false);
  });

  test('fewest-note scales are listed first', () => {
    const r = scalesContaining([0]);
    expect(r[0].scale.intervals.length).toBeLessThanOrEqual(r[r.length - 1].scale.intervals.length);
  });
});

describe('diatonic chords', () => {
  test('C major gives C Dm Em F G Am Bdim and the right sevenths', () => {
    const d = diatonicChords(SCALES.find((s) => s.id === 'major'), 0);
    expect(d.map((x) => x.triad.id)).toEqual(['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']);
    expect(d.map((x) => x.seventh.id)).toEqual(['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'min7b5']);
    expect(d.map((x) => x.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  test('pentatonic scales have no diatonic chords', () => {
    expect(diatonicChords(SCALES.find((s) => s.id === 'minor-pentatonic'), 9)).toEqual([]);
  });
});

describe('circle of fifths', () => {
  test('key signatures', () => {
    expect(keySignature(0).count).toBe(0);
    expect(keySignature(2)).toMatchObject({ count: 2, type: 'sharps', accidentals: ['F#', 'C#'] });
    expect(keySignature(10)).toMatchObject({ count: 2, type: 'flats', accidentals: ['Bb', 'Eb'] });
  });
});

describe('fretboard maths', () => {
  const std = TUNINGS[0].notes;

  test('open E string is E, fret 5 is A', () => {
    expect(noteName(std[0])).toBe('E');
    expect(noteName(std[0] + 5)).toBe('A');
  });

  test('every standard-tuning minor pentatonic position starts on a scale note of the low string', () => {
    const d = describePattern({ mode: 'scale', rootPc: 9, scaleId: 'minor-pentatonic' });
    const pos = findPositions({ lowOpen: std[0], frets: 15, rootPc: 9, intervalSet: d.set });
    expect(pos).toHaveLength(5);
    expect(pos[0].start).toBe(5); // A on the low E string
    pos.forEach((p) => expect(d.set.has(mod12(std[0] + p.start - 9))).toBe(true));
  });

  test('sequence for A minor pentatonic spans two octaves from A', () => {
    const d = describePattern({ mode: 'scale', rootPc: 9, scaleId: 'minor-pentatonic' });
    const seq = buildSequence({ tuning: std, frets: 15, rootPc: 9, intervalSet: d.set });
    expect(seq[0].midi).toBe(45); // A2
    expect(seq[seq.length - 1].midi).toBe(69); // A4
    seq.forEach((n) => expect(d.set.has(mod12(n.midi - 9))).toBe(true));
  });

  test('up-and-down sequence does not repeat the top note', () => {
    const d = describePattern({ mode: 'scale', rootPc: 0, scaleId: 'major' });
    const up = buildSequence({ tuning: std, frets: 15, rootPc: 0, intervalSet: d.set });
    const ud = buildSequence({ tuning: std, frets: 15, rootPc: 0, intervalSet: d.set, direction: 'updown' });
    expect(ud).toHaveLength(up.length * 2 - 1);
  });
});

describe('chord shapes', () => {
  const std = TUNINGS[0].notes;
  const pcsOf = (frets) => new Set(frets.map((f, i) => (f === null ? null : mod12(std[i] + f))).filter((x) => x !== null));

  test('every stored shape actually spells its chord', () => {
    const ids = ['maj', 'min', 'dom7', 'maj7', 'min7', 'sus2', 'sus4'];
    for (let root = 0; root < 12; root++) {
      ids.forEach((id) => {
        const chord = CHORDS.find((c) => c.id === id);
        const want = new Set(chord.intervals.map((i) => mod12(root + i)));
        chordShapesFor(root, id).forEach((sh) => {
          const got = pcsOf(sh.frets);
          // Each played note must belong to the chord and the root must be present
          got.forEach((p) => expect(want.has(p)).toBe(true));
          expect(got.has(root)).toBe(true);
        });
      });
    }
  });

  test('F major gets an E-shape barre at fret 1', () => {
    const shapes = chordShapesFor(5, 'maj');
    expect(shapes[0].frets).toEqual([1, 3, 3, 2, 1, 1]);
  });
});

describe('url state', () => {
  test('round trip', () => {
    const s = sanitize({ ...DEFAULT_STATE, mode: 'arpeggio', rootPc: 3, arpId: 'min7', tuningId: 'dropd', capo: 2, lefty: true });
    expect(queryToState('?' + stateToQuery(s))).toEqual(s);
  });

  test('garbage input falls back to defaults', () => {
    expect(sanitize({ mode: 'nope', rootPc: 99, scaleId: 'zzz', frets: 7 })).toEqual(DEFAULT_STATE);
    expect(queryToState('')).toBeNull();
  });
});
