// CAGED system: the five open chord shapes (C, A, G, E, D) moved up the neck.
import { mod12 } from './theory';

export const CAGED_ORDER = ['C', 'A', 'G', 'E', 'D'];

export const CAGED_QUALITIES = [
  { id: 'maj', name: 'Major', chordId: 'maj', intervals: [0, 4, 7] },
  { id: 'min', name: 'Minor', chordId: 'min', intervals: [0, 3, 7] },
  { id: 'dom7', name: 'Dominant 7th', chordId: 'dom7', intervals: [0, 4, 7, 10] },
  { id: 'maj7', name: 'Major 7th', chordId: 'maj7', intervals: [0, 4, 7, 11] },
];

// [letter, pitch class of the open shape's root, frets low E to high e (null = muted)]
const SHAPES = {
  maj: [
    ['C', 0, [null, 3, 2, 0, 1, 0]],
    ['A', 9, [null, 0, 2, 2, 2, 0]],
    ['G', 7, [3, 2, 0, 0, 0, 3]],
    ['E', 4, [0, 2, 2, 1, 0, 0]],
    ['D', 2, [null, null, 0, 2, 3, 2]],
  ],
  dom7: [
    ['C', 0, [null, 3, 2, 3, 1, 0]],
    ['A', 9, [null, 0, 2, 0, 2, 0]],
    ['G', 7, [3, 2, 0, 0, 0, 1]],
    ['E', 4, [0, 2, 0, 1, 0, 0]],
    ['D', 2, [null, null, 0, 2, 1, 2]],
  ],
  maj7: [
    ['C', 0, [null, 3, 2, 0, 0, 0]],
    ['A', 9, [null, 0, 2, 1, 2, 0]],
    ['G', 7, [3, 2, 0, 0, 0, 2]],
    ['E', 4, [0, 2, 1, 1, 0, 0]],
    ['D', 2, [null, null, 0, 2, 2, 2]],
  ],
  // Minor chords are normally taught from the Em, Am and Dm shapes.
  min: [
    ['A', 9, [null, 0, 2, 2, 1, 0]],
    ['E', 4, [0, 2, 2, 0, 0, 0]],
    ['D', 2, [null, null, 0, 2, 3, 1]],
  ],
};

/**
 * All CAGED shapes for a chord, positioned for the given root, in order up the
 * neck. Shapes repeat an octave higher when they still fit within maxFret.
 */
export function cagedShapes(rootPc, qualityId, maxFret = 15) {
  const list = SHAPES[qualityId] || SHAPES.maj;
  const out = [];
  list.forEach(([letter, shapeRoot, base]) => {
    const b0 = mod12(rootPc - shapeRoot);
    [b0, b0 + 12].forEach((barre) => {
      const frets = base.map((f) => (f === null ? null : f + barre));
      const played = frets.filter((f) => f !== null);
      if (Math.max(...played) <= maxFret) {
        out.push({
          letter,
          barre,
          frets,
          low: Math.min(...played),
          high: Math.max(...played),
          // only the E, A and D shapes are genuine barre chords
          showBarre: barre > 0 && ['E', 'A', 'D'].includes(letter),
        });
      }
    });
  });
  return out.sort((a, b) => a.barre - b.barre || CAGED_ORDER.indexOf(a.letter) - CAGED_ORDER.indexOf(b.letter));
}
