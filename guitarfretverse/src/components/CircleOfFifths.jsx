import React, { useState } from 'react';
import { CIRCLE_ORDER, keySignature, mod12 } from '../utils/theory';

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;

function polar(r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

// Display names for each slot, written the way key signatures usually are
const MAJOR_NAMES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const MINOR_NAMES = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

export default function CircleOfFifths({ onOpen, onGoTo }) {
  const [selected, setSelected] = useState({ idx: 0, minor: false });
  const majorPc = (idx) => CIRCLE_ORDER[idx];
  const minorPc = (idx) => mod12(CIRCLE_ORDER[idx] + 9);

  const selMajor = majorPc(selected.idx);
  const sig = keySignature(selMajor);
  const left = (selected.idx + 11) % 12;
  const right = (selected.idx + 1) % 12;
  const name = selected.minor ? MINOR_NAMES[selected.idx] : MAJOR_NAMES[selected.idx];

  const slot = (idx, minor) => {
    const angle = idx * 30;
    const r = minor ? 98 : 155;
    const [x, y] = polar(r, angle);
    const isSel = selected.idx === idx && selected.minor === minor;
    const related = !minor === !selected.minor && (idx === left || idx === right);
    const label = minor ? MINOR_NAMES[idx] : MAJOR_NAMES[idx];
    const choose = () => {
      setSelected({ idx, minor });
    };
    return (
      <g
        key={`${idx}-${minor}`}
        role="button"
        tabIndex={0}
        aria-label={`${label} ${minor ? 'minor' : 'major'}`}
        aria-pressed={isSel}
        onClick={choose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            choose();
          }
        }}
        className={`circle-slot ${isSel ? 'sel' : ''} ${related ? 'related' : ''}`}
      >
        <circle cx={x} cy={y} r={minor ? 24 : 28} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={minor ? 12.5 : 15}>
          {label}
        </text>
      </g>
    );
  };

  const keyRootPc = selected.minor ? minorPc(selected.idx) : majorPc(selected.idx);
  const progSeed = { keyPc: keyRootPc, mode: selected.minor ? 'minor' : 'major' };

  // The six chords that live around the selected key on the circle
  const homeChords = selected.minor
    ? [
        ['i', MINOR_NAMES[selected.idx]],
        ['iv', MINOR_NAMES[left]],
        ['v', MINOR_NAMES[right]],
        ['III', MAJOR_NAMES[selected.idx]],
        ['VI', MAJOR_NAMES[left]],
        ['VII', MAJOR_NAMES[right]],
      ]
    : [
        ['I', MAJOR_NAMES[selected.idx]],
        ['IV', MAJOR_NAMES[left]],
        ['V', MAJOR_NAMES[right]],
        ['vi', MINOR_NAMES[selected.idx]],
        ['ii', MINOR_NAMES[left]],
        ['iii', MINOR_NAMES[right]],
      ];

  return (
    <div className="tool">
      <section className="panel circle-panel">
        <h2>Circle of fifths</h2>
        <div className="circle-layout">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="circle-svg" role="group" aria-label="Circle of fifths">
            {CIRCLE_ORDER.map((_, i) => slot(i, false))}
            {CIRCLE_ORDER.map((_, i) => slot(i, true))}
            <text x={CX} y={CY - 6} textAnchor="middle" className="circle-center">
              {name}
            </text>
            <text x={CX} y={CY + 14} textAnchor="middle" className="circle-center sub">
              {selected.minor ? 'minor' : 'major'}
            </text>
          </svg>
          <div className="circle-info" aria-live="polite">
            <h3>
              {name} {selected.minor ? 'minor' : 'major'}
            </h3>
            <p>
              <strong>Key signature:</strong>{' '}
              {sig.count === 0
                ? 'no sharps or flats'
                : `${sig.count} ${sig.count === 1 ? sig.type.slice(0, -1) : sig.type} (${sig.accidentals.join(', ')})`}
            </p>
            <p>
              <strong>Closely related keys:</strong>{' '}
              {selected.minor
                ? `${MINOR_NAMES[left]} (iv), ${MINOR_NAMES[right]} (v), ${MAJOR_NAMES[selected.idx]} major (relative)`
                : `${MAJOR_NAMES[left]} (IV), ${MAJOR_NAMES[right]} (V), ${MINOR_NAMES[selected.idx]} (relative minor)`}
            </p>
            <p>
              <strong>Chords around this key on the circle:</strong>
            </p>
            <div className="chord-grid">
              {homeChords.map(([roman, chord]) => (
                <div key={roman} className="chord-card">
                  <span className="roman">{roman}</span>
                  <span className="chord-name">{chord}</span>
                </div>
              ))}
            </div>
            <div className="row">
              <button
                type="button"
                className="btn primary"
                onClick={() => onOpen({ mode: 'scale', rootPc: keyRootPc, scaleId: selected.minor ? 'minor' : 'major' })}
              >
                Show scale on fretboard
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  onOpen({ mode: 'scale', rootPc: keyRootPc, scaleId: selected.minor ? 'minor-pentatonic' : 'major-pentatonic' })
                }
              >
                Show pentatonic
              </button>
              <button type="button" className="btn ghost" onClick={() => onGoTo('progressions', progSeed)}>
                Progressions in {name} →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel guide">
        <h2>How the circle of fifths works</h2>
        <details open>
          <summary>What it is</summary>
          <p>
            The circle of fifths arranges all 12 keys in a ring, each one a perfect fifth (seven semitones) above the
            last: C → G → D → A → E → B → F#, and so on until you return to C. The outer ring shows the major keys and
            the inner ring shows the minor keys.
          </p>
        </details>
        <details>
          <summary>Sharps, flats and key signatures</summary>
          <p>
            Move <strong>clockwise</strong> and each key adds one sharp: C has none, G has one (F#), D has two (F#, C#),
            and so on. Move <strong>counter-clockwise</strong> (up a fourth) and each key adds one flat: F has one (Bb),
            Bb has two (Bb, Eb).
          </p>
          <p className="hint">
            The sharps always arrive in this order: F C G D A E B. The flats come in the reverse order: B E A D G C F.
          </p>
        </details>
        <details>
          <summary>Relative minors</summary>
          <p>
            Each minor key sits inside its relative major and uses exactly the same notes. A minor has the same notes as
            C major, but starts and rests on A instead of C. To find the relative minor of a major key, go down three
            semitones (C → A, G → E, F → D).
          </p>
        </details>
        <details>
          <summary>Finding chords for a song</summary>
          <p>
            Pick a key. Its two neighbours on the same ring are the <strong>IV</strong> and <strong>V</strong> chords,
            and the three minor chords directly beneath those three (inner ring) are <strong>vi</strong>,{' '}
            <strong>ii</strong> and <strong>iii</strong>. That gives you six chords that sound good together and
            cover most songs in that key. The diminished vii° chord is the one you will use least.
          </p>
          <p>
            In C major: C, F and G on the outer ring, with Am, Dm and Em beneath them on the inner ring. Select C in
            the circle above to see them.
          </p>
        </details>
        <details>
          <summary>Why it helps when writing and playing</summary>
          <ul>
            <li>
              <strong>Strong chord movement:</strong> chord roots that move one step counter-clockwise (such as G to C or
              Dm to G) sound resolved. This is the basis of V → I and ii → V → I.
            </li>
            <li>
              <strong>Modulating:</strong> moving to a neighbouring key changes only one note, so it is the smoothest way to
              change key mid-song.
            </li>
            <li>
              <strong>Transposing:</strong> to move a song up or down, shift every chord the same number of steps around the
              ring.
            </li>
            <li>
              <strong>Choosing scales:</strong> a key and its relative minor share a scale, so one set of notes covers both.
            </li>
          </ul>
          <button type="button" className="btn ghost small" onClick={() => onGoTo('progressions', progSeed)}>
            Learn to build chord progressions →
          </button>
        </details>
      </section>
    </div>
  );
}
