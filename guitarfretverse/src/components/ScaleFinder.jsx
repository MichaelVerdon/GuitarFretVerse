import React, { useMemo, useState } from 'react';
import { NOTE_SHARP, ROOT_LABELS, scalesContaining, shouldUseFlats, noteName, detectChords, chordSymbol } from '../utils/theory';

export default function ScaleFinder({ onOpen }) {
  const [picked, setPicked] = useState([]);
  const [limit, setLimit] = useState(24);

  const toggle = (pc) => {
    setLimit(24);
    setPicked((p) => (p.includes(pc) ? p.filter((x) => x !== pc) : [...p, pc]));
  };

  const results = useMemo(() => scalesContaining(picked), [picked]);
  const chords = useMemo(() => detectChords(picked), [picked]);

  return (
    <div className="tool">
      <section className="panel">
        <h2>Scale finder</h2>
        <p className="hint">Pick the notes you&apos;re playing and see which scales contain all of them.</p>
        <div className="note-picker" role="group" aria-label="Notes">
          {NOTE_SHARP.map((n, pc) => (
            <button
              key={n}
              type="button"
              className={`note-btn ${picked.includes(pc) ? 'on' : ''}`}
              aria-pressed={picked.includes(pc)}
              onClick={() => toggle(pc)}
            >
              {ROOT_LABELS[pc]}
            </button>
          ))}
        </div>
        <button type="button" className="btn ghost" disabled={!picked.length} onClick={() => setPicked([])}>
          Clear
        </button>
        {chords.length > 0 && (
          <p>
            <strong>Could also be the chord:</strong>{' '}
            {chords.slice(0, 4).map((m) => chordSymbol(m.rootPc, m.chord, false, m.bassPc)).join(', ')}
          </p>
        )}
      </section>

      <section className="panel" aria-live="polite">
        {picked.length === 0 ? (
          <p>Select at least one note.</p>
        ) : results.length === 0 ? (
          <p>No scales in the library contain all of those notes.</p>
        ) : (
          <>
            <p>
              <strong>{results.length}</strong> matching scale{results.length === 1 ? '' : 's'} (fewest notes first):
            </p>
            <div className="chip-row">
              {results.slice(0, limit).map((r) => {
                const flats = shouldUseFlats('auto', r.rootPc, r.scale.parentOffset);
                return (
                  <button
                    key={`${r.rootPc}-${r.scale.id}`}
                    type="button"
                    className="chip button"
                    onClick={() => onOpen({ mode: 'scale', rootPc: r.rootPc, scaleId: r.scale.id })}
                  >
                    <strong>{noteName(r.rootPc, flats)}</strong> {r.scale.name}
                    <span className="muted"> · {r.scale.intervals.length} notes</span>
                  </button>
                );
              })}
            </div>
            {results.length > limit && (
              <button type="button" className="btn ghost" onClick={() => setLimit((l) => l + 36)}>
                Show more
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
