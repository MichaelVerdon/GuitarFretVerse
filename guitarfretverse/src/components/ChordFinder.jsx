import React, { useMemo, useState, useCallback } from 'react';
import Fretboard from './Fretboard';
import ChordDiagram from './ChordDiagram';
import Caged from './Caged';
import {
  TUNINGS,
  CHORDS,
  ROOT_LABELS,
  detectChords,
  chordSymbol,
  chordShapesFor,
  noteName,
  mod12,
  getChord,
} from '../utils/theory';
import { pluck, strum } from '../utils/audio';

const STANDARD = TUNINGS[0].notes;
const LIBRARY_CHORDS = ['maj', 'min', 'dom7', 'maj7', 'min7', 'sus2', 'sus4'];

export default function ChordFinder({ onOpen }) {
  const [sel, setSel] = useState(Array(6).fill(null)); // fret per string, null = not played
  const [libRoot, setLibRoot] = useState(0);
  const [libChord, setLibChord] = useState('maj');

  const notes = useMemo(
    () => sel.map((f, si) => (f === null ? null : STANDARD[si] + f)).filter((m) => m !== null),
    [sel]
  );
  const pcs = notes.map(mod12);
  const bass = notes.length ? mod12(Math.min(...notes)) : null;
  const matches = useMemo(() => detectChords(pcs, bass), [pcs.join(','), bass]); // eslint-disable-line react-hooks/exhaustive-deps
  const best = matches[0];

  const toggle = useCallback((si, f, midi) => {
    pluck(midi, 0, { volume: 0.6 });
    setSel((prev) => {
      const next = prev.slice();
      next[si] = next[si] === f ? null : f;
      return next;
    });
  }, []);

  const getCell = useCallback(
    (si, f) => {
      if (sel[si] !== f) return null;
      const pc = mod12(STANDARD[si] + f);
      return { text: noteName(pc, false), root: !!best && pc === best.rootPc, hue: pc, dim: false };
    },
    [sel, best]
  );

  const shapes = useMemo(() => chordShapesFor(libRoot, libChord), [libRoot, libChord]);
  const libFlats = [1, 3, 5, 8, 10].includes(libRoot) && libRoot !== 6;
  const libName = chordSymbol(libRoot, getChord(libChord), libFlats);

  return (
    <div className="tool">
      <section className="panel">
        <h2>Chord finder</h2>
        <p className="hint">
          Click frets to build a chord (one note per string; click again to remove). Standard tuning. Click the open
          string spot (fret 0) for open strings.
        </p>
      </section>

      <Fretboard
        openPitches={STANDARD}
        frets={12}
        getCell={getCell}
        onCellClick={toggle}
        label="Chord builder fretboard"
      />

      <section className="panel" aria-live="polite">
        <div className="row">
          <button type="button" className="btn primary" disabled={!notes.length} onClick={() => strum(notes)}>
            ▶ Strum
          </button>
          <button type="button" className="btn ghost" onClick={() => setSel(Array(6).fill(null))}>
            Clear
          </button>
        </div>
        {notes.length === 0 && <p>No notes selected yet.</p>}
        {notes.length > 0 && (
          <p>
            <strong>Notes:</strong> {[...new Set(notes.map((m) => noteName(m)))].join(', ')}
          </p>
        )}
        {notes.length > 1 && matches.length === 0 && <p>No matching chord name found in the library for those notes.</p>}
        {matches.length > 0 && (
          <div className="chip-row">
            {matches.map((m) => (
              <div key={`${m.rootPc}-${m.chord.id}`} className="chip">
                <strong>{chordSymbol(m.rootPc, m.chord, false, m.bassPc)}</strong>
                <span className="muted">{m.chord.name}</span>
                <button type="button" onClick={() => onOpen({ mode: 'arpeggio', rootPc: m.rootPc, arpId: m.chord.id })}>
                  Arpeggio
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Chord library</h2>
        <div className="controls">
          <div className="field">
            <label htmlFor="lib-root">Root</label>
            <select id="lib-root" value={libRoot} onChange={(e) => setLibRoot(Number(e.target.value))}>
              {ROOT_LABELS.map((l, i) => (
                <option key={l} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lib-chord">Type</label>
            <select id="lib-chord" value={libChord} onChange={(e) => setLibChord(e.target.value)}>
              {CHORDS.filter((c) => LIBRARY_CHORDS.includes(c.id)).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h3>{libName} shapes</h3>
        {shapes.length === 0 ? (
          <p>No shapes stored for this chord yet.</p>
        ) : (
          <div className="diagram-row">
            {shapes.map((sh) => (
              <div key={sh.name} className="diagram-wrap">
                <ChordDiagram frets={sh.frets} barre={sh.barre} title={sh.name} />
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => strum(sh.frets.map((f, si) => (f === null ? null : STANDARD[si] + f)).filter((m) => m !== null))}
                >
                  ▶ Strum
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Caged onOpen={onOpen} />
    </div>
  );
}
