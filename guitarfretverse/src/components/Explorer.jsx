import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Fretboard from './Fretboard';
import {
  SCALES,
  CHORDS,
  TUNINGS,
  ROOT_LABELS,
  getTuning,
  describePattern,
  findPositions,
  buildSequence,
  diatonicChords,
  chordSymbol,
  noteName,
  spellNote,
  mod12,
} from '../utils/theory';
import { FRET_OPTIONS, DEFAULT_STATE } from '../utils/state';
import { pluck, getCtx, startMetronome } from '../utils/audio';

const SCALE_GROUPS = SCALES.reduce((acc, s) => {
  (acc[s.group] = acc[s.group] || []).push(s);
  return acc;
}, {});

function Explorer({ state, update, setState }) {
  const s = state;
  const tuning = getTuning(s.tuningId);
  const info = useMemo(
    () => describePattern({ mode: s.mode, rootPc: s.rootPc, scaleId: s.scaleId, arpId: s.arpId, spelling: s.spelling }),
    [s.mode, s.rootPc, s.scaleId, s.arpId, s.spelling]
  );

  const positions = useMemo(
    () =>
      s.mode === 'all'
        ? []
        : findPositions({ lowOpen: tuning.notes[0], capo: s.capo, frets: s.frets, rootPc: s.rootPc, intervalSet: info.set }),
    [s.mode, tuning, s.capo, s.frets, s.rootPc, info.set]
  );
  const win = s.position > 0 && positions[s.position - 1] ? positions[s.position - 1] : null;

  // ----- practice / playback -------------------------------------------------
  const [bpm, setBpm] = useState(90);
  const [volume, setVolume] = useState(0.6);
  const [direction, setDirection] = useState('updown');
  const [loop, setLoop] = useState(false);
  const [cycle, setCycle] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [audioError, setAudioError] = useState(false);

  const timer = useRef(null);
  const pendingRestart = useRef(false);
  const stopMetro = useRef(null);
  const latest = useRef({});

  const sequence = useMemo(
    () =>
      s.mode === 'all'
        ? tuning.notes.map((midi, si) => ({ s: si, f: 0, midi }))
        : buildSequence({
            tuning: tuning.notes,
            capo: s.capo,
            frets: s.frets,
            rootPc: s.rootPc,
            intervalSet: info.set,
            win,
            direction,
          }),
    [s.mode, tuning, s.capo, s.frets, s.rootPc, info.set, win, direction]
  );
  latest.current = { sequence, bpm, volume, loop, cycle, rootPc: s.rootPc };

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    pendingRestart.current = false;
    setIsPlaying(false);
    setPlaying(null);
  }, []);

  const start = useCallback(() => {
    if (!getCtx()) {
      setAudioError(true);
      return;
    }
    setAudioError(false);
    clearTimeout(timer.current);
    setIsPlaying(true);
    let i = 0;
    const step = () => {
      const L = latest.current;
      if (!L.sequence.length) {
        stop();
        return;
      }
      const n = L.sequence[i];
      pluck(n.midi, 0, { volume: L.volume });
      setPlaying({ s: n.s, f: n.f });
      i += 1;
      const gap = 60000 / L.bpm / 2; // eighth notes
      if (i >= L.sequence.length) {
        if (!L.loop) {
          timer.current = setTimeout(stop, gap);
          return;
        }
        if (L.cycle) {
          // Move up a fourth; the effect below restarts playback on the new key.
          pendingRestart.current = true;
          timer.current = setTimeout(() => update({ rootPc: mod12(L.rootPc + 5) }), gap);
          return;
        }
        i = 0;
      }
      timer.current = setTimeout(step, gap);
    };
    step();
  }, [stop, update]);

  // Changing what is shown stops playback, except when cycling keys
  const seqKey = `${s.mode}|${s.rootPc}|${s.scaleId}|${s.arpId}|${s.tuningId}|${s.capo}|${s.frets}|${s.position}`;
  useEffect(() => {
    if (pendingRestart.current) {
      pendingRestart.current = false;
      start();
    } else if (timer.current) {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqKey]);

  useEffect(() => {
    if (metronomeOn) {
      stopMetro.current = startMetronome(
        () => latest.current.bpm,
        () => 0.35
      );
      if (!stopMetro.current) setAudioError(true);
    }
    return () => {
      if (stopMetro.current) stopMetro.current();
      stopMetro.current = null;
    };
  }, [metronomeOn]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    []
  );

  const onCellClick = useCallback(
    (si, f, midi) => {
      pluck(midi, 0, { volume });
      setPlaying({ s: si, f });
      setTimeout(() => setPlaying((p) => (p && p.s === si && p.f === f && !timer.current ? null : p)), 350);
    },
    [volume]
  );

  // ----- fretboard cells -----------------------------------------------------
  const getCell = useCallback(
    (si, f) => {
      const pc = mod12(tuning.notes[si] + f);
      if (s.mode === 'all') {
        return { text: s.labels === 'none' ? '' : noteName(pc, info.flats), root: false, hue: pc, dim: false };
      }
      const rel = mod12(pc - s.rootPc);
      if (!info.set.has(rel)) return null;
      const dim = !!win && (f < win.start || f > win.end);
      let text = '';
      if (s.labels === 'note') text = spellNote(pc, s.rootPc, info.labelBy[rel], info.flats);
      else if (s.labels === 'interval') text = info.labelBy[rel];
      return { text, root: rel === 0, hue: s.labels === 'interval' ? rel : pc, dim };
    },
    [tuning, s.mode, s.rootPc, s.labels, info, win]
  );

  // ----- diatonic chords -----------------------------------------------------
  const diatonic = useMemo(
    () => (s.mode === 'scale' ? diatonicChords(info.type, s.rootPc) : []),
    [s.mode, info.type, s.rootPc]
  );

  const openChord = (rootPc, chordId) => update({ mode: 'arpeggio', rootPc, arpId: chordId });

  const reset = () => {
    stop();
    setState({ ...DEFAULT_STATE });
  };

  const flats = info.flats;
  const parentNote =
    s.mode === 'scale' && info.type.group === 'Major & modes' && info.type.id !== 'major'
      ? noteName(s.rootPc - info.type.parentOffset, shouldFlat(s, info))
      : null;

  return (
    <div className="explorer">
      <section className="panel controls" aria-label="Choose what to display">
        <div className="field">
          <label htmlFor="mode">Show</label>
          <select id="mode" value={s.mode} onChange={(e) => update({ mode: e.target.value })}>
            <option value="all">All notes</option>
            <option value="scale">Scale</option>
            <option value="arpeggio">Arpeggio</option>
          </select>
        </div>

        {s.mode !== 'all' && (
          <div className="field">
            <label htmlFor="root">Key</label>
            <select id="root" value={s.rootPc} onChange={(e) => update({ rootPc: Number(e.target.value) })}>
              {ROOT_LABELS.map((l, i) => (
                <option key={l} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        )}

        {s.mode === 'scale' && (
          <div className="field">
            <label htmlFor="scale">Scale</label>
            <select id="scale" value={s.scaleId} onChange={(e) => update({ scaleId: e.target.value })}>
              {Object.entries(SCALE_GROUPS).map(([group, list]) => (
                <optgroup key={group} label={group}>
                  {list.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {s.mode === 'arpeggio' && (
          <div className="field">
            <label htmlFor="arp">Arpeggio</label>
            <select id="arp" value={s.arpId} onChange={(e) => update({ arpId: e.target.value })}>
              {CHORDS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {s.mode !== 'all' && (
          <div className="field">
            <label htmlFor="pos">Position</label>
            <select id="pos" value={s.position} onChange={(e) => update({ position: Number(e.target.value) })}>
              <option value={0}>Whole neck</option>
              {positions.map((p, i) => (
                <option key={p.start} value={i + 1}>
                  {`Position ${i + 1} (frets ${p.start}-${p.end})`}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="button" className="btn ghost" onClick={reset}>
          Reset
        </button>
      </section>

      <section className="panel controls secondary" aria-label="Fretboard settings">
        <div className="field">
          <label htmlFor="labels">Labels</label>
          <select id="labels" value={s.labels} onChange={(e) => update({ labels: e.target.value })}>
            <option value="note">Note names</option>
            <option value="interval">Intervals</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="spelling">Sharps / flats</label>
          <select id="spelling" value={s.spelling} onChange={(e) => update({ spelling: e.target.value })}>
            <option value="auto">Auto</option>
            <option value="sharp">Sharps (#)</option>
            <option value="flat">Flats (b)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tuning">Tuning</label>
          <select id="tuning" value={s.tuningId} onChange={(e) => update({ tuningId: e.target.value })}>
            {TUNINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field narrow">
          <label htmlFor="capo">Capo</label>
          <select id="capo" value={s.capo} onChange={(e) => update({ capo: Number(e.target.value) })}>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? 'None' : i}
              </option>
            ))}
          </select>
        </div>
        <div className="field narrow">
          <label htmlFor="frets">Frets</label>
          <select id="frets" value={s.frets} onChange={(e) => update({ frets: Number(e.target.value) })}>
            {FRET_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={s.lefty} onChange={(e) => update({ lefty: e.target.checked })} />
          Left-handed
        </label>
        <label className="check">
          <input type="checkbox" checked={s.vertical} onChange={(e) => update({ vertical: e.target.checked })} />
          Vertical
        </label>
      </section>

      <Fretboard
        openPitches={tuning.notes}
        capo={s.capo}
        frets={s.frets}
        getCell={getCell}
        onCellClick={onCellClick}
        playing={playing}
        lefty={s.lefty}
        vertical={s.vertical}
        label={`${info.title} on a ${tuning.notes.length}-string guitar`}
      />

      <section className="panel practice" aria-label="Practice tools">
        <button type="button" className="btn primary" onClick={isPlaying ? stop : start} aria-pressed={isPlaying}>
          {isPlaying ? '■ Stop' : s.mode === 'all' ? '▶ Play open strings' : '▶ Play'}
        </button>
        <div className="field narrow">
          <label htmlFor="bpm">Tempo: {bpm} bpm</label>
          <input id="bpm" type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
        </div>
        <div className="field narrow">
          <label htmlFor="vol">Volume</label>
          <input id="vol" type="range" min="0.1" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
        </div>
        {s.mode !== 'all' && (
          <div className="field narrow">
            <label htmlFor="dir">Direction</label>
            <select id="dir" value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="up">Ascending</option>
              <option value="down">Descending</option>
              <option value="updown">Up and down</option>
            </select>
          </div>
        )}
        <label className="check">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Loop
        </label>
        {s.mode !== 'all' && (
          <label className="check" title="After each pass, move up a fourth (circle of fourths) so you practise all 12 keys">
            <input type="checkbox" checked={cycle} onChange={(e) => setCycle(e.target.checked)} />
            Cycle keys (4ths)
          </label>
        )}
        <button type="button" className={`btn ${metronomeOn ? 'primary' : 'ghost'}`} onClick={() => setMetronomeOn((v) => !v)} aria-pressed={metronomeOn}>
          Metronome {metronomeOn ? 'on' : 'off'}
        </button>
        {s.mode !== 'all' && (
          <button type="button" className="btn ghost" onClick={() => update({ rootPc: mod12(s.rootPc + 5) })} title="Move to the next key around the circle of fourths">
            Next key →
          </button>
        )}
        {audioError && <p className="warn" role="alert">Audio isn&apos;t available in this browser.</p>}
        <p className="hint">Tip: click any note on the fretboard to hear it.</p>
      </section>

      <section className="panel info" aria-live="polite">
        <h2>{s.mode === 'all' ? `${tuning.name.split(' (')[0]} tuning` : info.title}</h2>
        {s.mode === 'all' ? (
          <>
            <p className="intervals">Strings (low to high): {tuning.notes.map((m) => noteName(m, flats)).join(', ')}</p>
            <p>
              {tuning.id === 'standard'
                ? 'Standard tuning is the most common tuning for the guitar. It is arranged from the lowest pitched string (E) to the highest pitched string (e), and its mostly-fourths layout makes it easy to move chords and scale shapes around the neck.'
                : 'Pick Scale or Arpeggio above to overlay patterns on this tuning. Every shape is calculated from the notes, so it works in any tuning.'}
            </p>
          </>
        ) : (
          <>
            <p className="intervals">
              <strong>Notes:</strong> {info.notes.join(' – ')}
              <span className="sep">|</span>
              <strong>Formula:</strong> {info.formula.join(' ')}
            </p>
            <p>{info.type.desc}</p>
            {parentNote && (
              <p className="hint">
                Same notes as {parentNote} major, starting from {noteName(s.rootPc, flats)}.
              </p>
            )}
          </>
        )}

        {diatonic.length > 0 && (
          <div className="diatonic">
            <h3>Chords in {info.title.replace(' Scale', '')}</h3>
            <div className="chord-grid">
              {diatonic.map((d) => (
                <div key={d.degree} className="chord-card">
                  <span className="roman">{d.roman}</span>
                  {d.triad && (
                    <button type="button" onClick={() => openChord(d.rootPc, d.triad.id)} title="Show this arpeggio">
                      {chordSymbol(d.rootPc, d.triad, flats)}
                    </button>
                  )}
                  {d.seventh && (
                    <button type="button" className="seventh" onClick={() => openChord(d.rootPc, d.seventh.id)} title="Show this arpeggio">
                      {chordSymbol(d.rootPc, d.seventh, flats)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function shouldFlat(s, info) {
  // Spelling for the parent major key name
  if (s.spelling === 'flat') return true;
  if (s.spelling === 'sharp') return false;
  return info.flats;
}

export default Explorer;
