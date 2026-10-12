import { cagedShapes, CAGED_ORDER, CAGED_QUALITIES } from './caged';
import { TUNINGS, mod12 } from './theory';

const STD = TUNINGS[0].notes;
const pcsOf = (frets) => frets.map((f, s) => (f === null ? null : mod12(STD[s] + f))).filter((p) => p !== null);

describe('CAGED shapes', () => {
  test('every shape of every chord only contains chord tones and includes the root', () => {
    CAGED_QUALITIES.forEach((q) => {
      for (let root = 0; root < 12; root++) {
        const want = new Set(q.intervals.map((i) => mod12(root + i)));
        const shapes = cagedShapes(root, q.id, 15);
        expect(shapes.length).toBeGreaterThanOrEqual(3);
        shapes.forEach((sh) => {
          const got = pcsOf(sh.frets);
          got.forEach((p) => expect(want.has(p)).toBe(true));
          expect(got).toContain(root);
          // root, third and any seventh must sound; the fifth may be left out (e.g. the C7 shape)
          q.intervals.filter((i) => i !== 7).forEach((i) => expect(got).toContain(mod12(root + i)));
          expect(Math.max(...sh.frets.filter((f) => f !== null))).toBeLessThanOrEqual(15);
        });
      }
    });
  });

  test('major gives all five shapes, in the cyclic order C A G E D going up the neck', () => {
    for (let root = 0; root < 12; root++) {
      const first = cagedShapes(root, 'maj', 15).filter((sh) => sh.barre < 12);
      expect(first.map((s) => s.letter).sort()).toEqual([...CAGED_ORDER].sort());
      const letters = first.map((s) => s.letter);
      const start = CAGED_ORDER.indexOf(letters[0]);
      const rotated = CAGED_ORDER.map((_, i) => CAGED_ORDER[(start + i) % 5]);
      expect(letters).toEqual(rotated);
    }
  });

  test('known chords', () => {
    const c = cagedShapes(0, 'maj', 15);
    expect(c[0]).toMatchObject({ letter: 'C', frets: [null, 3, 2, 0, 1, 0], barre: 0 });
    const g = cagedShapes(7, 'maj', 15).find((s) => s.letter === 'E');
    expect(g.frets).toEqual([3, 5, 5, 4, 3, 3]); // G major, E shape at fret 3
    const b = cagedShapes(11, 'maj', 15).find((s) => s.letter === 'A');
    expect(b.frets).toEqual([null, 2, 4, 4, 4, 2]); // B major, A shape at fret 2
    const f = cagedShapes(5, 'maj', 15).find((s) => s.letter === 'E');
    expect(f.frets).toEqual([1, 3, 3, 2, 1, 1]);
  });

  test('shapes repeat an octave up only if they fit', () => {
    const all = cagedShapes(0, 'maj', 15);
    expect(all.some((s) => s.letter === 'C' && s.barre === 12)).toBe(true);
    expect(all.every((s) => Math.max(...s.frets.filter((f) => f !== null)) <= 15)).toBe(true);
  });

  test('minor offers the E, A and D shapes', () => {
    const letters = new Set(cagedShapes(9, 'min', 15).map((s) => s.letter));
    expect([...letters].sort()).toEqual(['A', 'D', 'E']);
  });
});
