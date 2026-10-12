import { PROGRESSIONS, resolveProgression, voiceChord, getProgression, COMMON_NEXT } from './progressions';
import { CHORDS, mod12 } from './theory';

const labels = (id, key) => resolveProgression(getProgression(id), key).map((c) => c.label);

describe('progression registry', () => {
  test('ids are unique and every chord id exists', () => {
    expect(new Set(PROGRESSIONS.map((p) => p.id)).size).toBe(PROGRESSIONS.length);
    PROGRESSIONS.forEach((p) => {
      p.steps.forEach(([roman, offset, chordId]) => {
        expect(typeof roman).toBe('string');
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThan(12);
        expect(CHORDS.some((c) => c.id === chordId)).toBe(true);
      });
    });
  });

  test('both modes have entries', () => {
    expect(PROGRESSIONS.some((p) => p.mode === 'major')).toBe(true);
    expect(PROGRESSIONS.some((p) => p.mode === 'minor')).toBe(true);
  });
});

describe('resolving progressions', () => {
  test('I-V-vi-IV in G is G D Em C', () => {
    expect(labels('pop-1564', 7)).toEqual(['G', 'D', 'Em', 'C']);
  });

  test('I-V-vi-IV in Bb uses flats', () => {
    expect(labels('pop-1564', 10)).toEqual(['Bb', 'F', 'Gm', 'Eb']);
  });

  test('ii-V-I in C is Dm7 G7 Cmaj7', () => {
    expect(labels('jazz-251', 0).slice(0, 3)).toEqual(['Dm7', 'G7', 'Cmaj7']);
  });

  test('12-bar blues has 12 dominant 7th bars: A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 E7', () => {
    expect(labels('blues-12', 9)).toEqual(['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7']);
  });

  test('borrowed bVII is spelled with a flat: I-bVII-IV-I in C is C Bb F C', () => {
    expect(labels('mixo-rock', 0)).toEqual(['C', 'Bb', 'F', 'C']);
    expect(labels('mixo-rock', 7)).toEqual(['G', 'F', 'C', 'G']);
  });

  test('minor keys keep sharp spelling: i-bVII in G# minor is G#m F#', () => {
    expect(labels('andalusian', 8).slice(0, 2)).toEqual(['G#m', 'F#']);
  });

  test('Andalusian cadence in A minor is Am G F E', () => {
    expect(labels('andalusian', 9)).toEqual(['Am', 'G', 'F', 'E']);
  });

  test('minor progressions in D minor use Bb (flat key)', () => {
    expect(labels('minor-epic', 2)).toEqual(['Dm', 'Bb', 'F', 'C']);
  });
});

describe('voicing', () => {
  test('bass note is the root and notes ascend', () => {
    CHORDS.forEach((chord) => {
      for (let root = 0; root < 12; root++) {
        const v = voiceChord(root, chord);
        expect(mod12(v[0])).toBe(root);
        expect(v[0]).toBeGreaterThanOrEqual(40);
        expect(v[0]).toBeLessThan(52);
        expect(v).toHaveLength(chord.intervals.length);
        v.slice(1).forEach((n, i) => expect(mod12(n - v[0])).toBe(chord.intervals[i + 1]));
      }
    });
  });
});

describe('next-chord guide', () => {
  test('every degree has suggestions in range', () => {
    for (let d = 0; d < 7; d++) {
      expect(COMMON_NEXT[d].length).toBeGreaterThan(0);
      COMMON_NEXT[d].forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(7);
      });
    }
  });
});
