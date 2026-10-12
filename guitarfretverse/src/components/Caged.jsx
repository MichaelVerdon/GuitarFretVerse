import React, { useMemo, useState, useCallback } from 'react';
import Fretboard from './Fretboard';
import ChordDiagram from './ChordDiagram';
import { TUNINGS, ROOT_LABELS, noteName, spellNote, mod12, shouldUseFlats, chordSymbol, getChord } from '../utils/theory';
import { cagedShapes, CAGED_ORDER, CAGED_QUALITIES } from '../utils/caged';
import { pluck, strum } from '../utils/audio';

const STANDARD = TUNINGS[0].notes;
const FRETS = 15;
// Colour of each shape (hue index; the fretboard turns it into hsl(index * 30deg))
const HUE = { C: 1, A: 4, G: 6, E: 8, D: 10 };
const hsl = (letter) => `hsl(${HUE[letter] * 30} 62% 38%)`;

export default function Caged({ onOpen }) {
  const [rootPc, setRootPc] = useState(0);
  const [quality, setQuality] = useState('maj');
  const [picked, setPicked] = useState('all'); // 'all' or a shape letter

  const q = CAGED_QUALITIES.find((x) => x.id === quality);
  const flats = shouldUseFlats('auto', rootPc, quality === 'min' || quality === 'min7' ? 9 : 0);
  const chordDef = getChord(q.chordId);
  const chordName = chordSymbol(rootPc, chordDef, flats);
  const shapes = useMemo(() => cagedShapes(rootPc, quality, FRETS), [rootPc, quality]);

  // Index every fretted note back to the shapes that use it
  const cellMap = useMemo(() => {
    const map = new Map();
    shapes.forEach((sh, i) => {
      sh.frets.forEach((f, s) => {
        if (f === null) return;
        const key = `${s}-${f}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(i);
      });
    });
    return map;
  }, [shapes]);

  const letters = useMemo(() => CAGED_ORDER.filter((l) => shapes.some((sh) => sh.letter === l)), [shapes]);
  const activeLetter = picked === 'all' || letters.includes(picked) ? picked : 'all';

  const getCell = useCallback(
    (s, f) => {
      const hits = cellMap.get(`${s}-${f}`);
      if (!hits) return null;
      const pc = mod12(STANDARD[s] + f);
      const inPicked = activeLetter === 'all' ? hits : hits.filter((i) => shapes[i].letter === activeLetter);
      const idx = (inPicked.length ? inPicked : hits)[0];
      const rel = mod12(pc - rootPc);
      const label = chordDef.formula[chordDef.intervals.indexOf(rel)];
      return {
        text: spellNote(pc, rootPc, label, flats),
        root: pc === mod12(rootPc),
        hue: HUE[shapes[idx].letter],
        dim: activeLetter !== 'all' && inPicked.length === 0,
      };
    },
    [cellMap, shapes, activeLetter, rootPc, flats, chordDef]
  );

  const playShape = (sh) =>
    strum(sh.frets.map((f, s) => (f === null ? null : STANDARD[s] + f)).filter((m) => m !== null));

  const onCell = useCallback((s, f, midi) => pluck(midi, 0, { volume: 0.6 }), []);

  return (
    <section className="panel caged">
      <h2>The CAGED system</h2>
      <p>
        The CAGED system links the five open chord shapes <strong>C, A, G, E and D</strong>. Any of them can be slid up
        the neck as a movable chord, and together they cover the whole fretboard for any chord. Moving up the neck the
        shapes always appear in the same order (C → A → G → E → D, then round again), so once you know one shape you can
        find the next.
      </p>

      <div className="controls">
        <div className="field">
          <label htmlFor="caged-root">Chord root</label>
          <select id="caged-root" value={rootPc} onChange={(e) => setRootPc(Number(e.target.value))}>
            {ROOT_LABELS.map((l, i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="caged-quality">Chord type</label>
          <select id="caged-quality" value={quality} onChange={(e) => setQuality(e.target.value)}>
            {CAGED_QUALITIES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => onOpen({ mode: 'arpeggio', rootPc, arpId: q.chordId })}
          title="See this chord's notes on the main fretboard"
        >
          Show {chordName} arpeggio →
        </button>
      </div>

      <h3>All {letters.length} shapes of {chordName} on the neck</h3>
      <div className="chip-row" role="group" aria-label="Highlight a shape">
        <button type="button" className={`chip button ${activeLetter === 'all' ? 'on' : ''}`} aria-pressed={activeLetter === 'all'} onClick={() => setPicked('all')}>
          All shapes
        </button>
        {letters.map((l) => (
          <button
            key={l}
            type="button"
            className={`chip button shape-chip ${activeLetter === l ? 'on' : ''}`}
            style={{ '--shape': hsl(l) }}
            aria-pressed={activeLetter === l}
            onClick={() => setPicked(l)}
          >
            <span className="swatch" aria-hidden="true" />
            {l} shape
          </button>
        ))}
      </div>

      <Fretboard
        openPitches={STANDARD}
        frets={FRETS}
        getCell={getCell}
        onCellClick={onCell}
        label={`All CAGED shapes of ${chordName}`}
      />
      <p className="hint">Gold dots are the root ({noteName(rootPc, flats)}). Each colour is one shape; click a dot to hear it.</p>

      <h3>Shape diagrams, in order up the neck</h3>
      <div className="diagram-row caged-row">
        {shapes.map((sh) => (
          <div
            key={`${sh.letter}-${sh.barre}`}
            className={`diagram-wrap caged-card ${activeLetter === sh.letter ? 'on' : ''}`}
            style={{ '--shape': hsl(sh.letter) }}
          >
            <span className="caged-letter">{sh.letter} shape</span>
            <ChordDiagram
              frets={sh.frets}
              barre={sh.showBarre ? sh.barre : 0}
              title={sh.low === 0 ? `${chordName} · open` : `${chordName} · frets ${sh.low}–${sh.high}`}
            />
            <div className="row tight">
              <button type="button" className="btn ghost small" onClick={() => playShape(sh)}>
                ▶ Strum
              </button>
              <button type="button" className="btn ghost small" onClick={() => setPicked(sh.letter)} aria-pressed={activeLetter === sh.letter}>
                Highlight
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="guide">
        <details open>
          <summary>How to use CAGED</summary>
          <ul>
            <li>
              <strong>Find your starting shape.</strong> Pick the shape you already know (say the open C chord) and slide
              it until its root note matches the chord you want. Shapes with a barre (E, A and D) are played with the
              first finger across the strings.
            </li>
            <li>
              <strong>The roots stay put.</strong> In every shape the gold root notes are in a fixed place, which is why
              each shape can be moved: the pattern is the same, only the fret changes.
            </li>
            <li>
              <strong>Neighbours overlap.</strong> The end of one shape shares notes with the start of the next. Learn
              to see where one shape hands over to another and you can move between positions smoothly.
            </li>
            <li>
              <strong>Use it for scales too.</strong> The major and minor pentatonic boxes sit inside the same positions,
              so a chord shape tells you where to solo. Try Explorer, position view.
            </li>
            <li>
              <strong>Practise it.</strong> Play the same chord in all five shapes going up the neck, then back down.
            </li>
          </ul>
          <p className="hint">
            Minor chords are normally taught with the E, A and D shapes (Em, Am and Dm). The C and G forms are awkward as
            minor barre chords, so only three shapes are shown for minor.
          </p>
        </details>
      </div>
    </section>
  );
}
