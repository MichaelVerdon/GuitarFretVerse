import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  ROOT_LABELS,
  getScale,
  diatonicChords,
  chordSymbol,
  shouldUseFlats,
  noteName,
} from '../utils/theory';
import {
  PROGRESSIONS,
  CATEGORIES,
  COMMON_NEXT,
  FUNCTIONS,
  CADENCES,
  resolveProgression,
  voiceChord,
} from '../utils/progressions';
import { strum, getCtx } from '../utils/audio';

export default function Progressions({ seed, onOpen }) {
  const [keyPc, setKeyPc] = useState(seed ? seed.keyPc : 0);
  const [mode, setMode] = useState(seed ? seed.mode : 'major');
  const [category, setCategory] = useState('All');
  const [bpm, setBpm] = useState(80);
  const [beats, setBeats] = useState(2);
  const [loop, setLoop] = useState(true);
  const [sevenths, setSevenths] = useState(false);
  const [custom, setCustom] = useState([]); // [{ degree, seventh }]
  const [now, setNow] = useState(null); // { source, index }
  const [audioError, setAudioError] = useState(false);

  // Jump to a key chosen elsewhere (e.g. the circle of fifths)
  useEffect(() => {
    if (seed) {
      setKeyPc(seed.keyPc);
      setMode(seed.mode);
    }
  }, [seed]);

  const timer = useRef(null);
  const live = useRef({});
  live.current = { bpm, beats, loop };

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    setNow(null);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = useCallback(
    (source, list) => {
      stop();
      if (!list.length) return;
      if (!getCtx()) {
        setAudioError(true);
        return;
      }
      setAudioError(false);
      let i = 0;
      const step = () => {
        if (i >= list.length) {
          if (!live.current.loop) {
            stop();
            return;
          }
          i = 0;
        }
        const c = list[i];
        strum(voiceChord(c.rootPc, c.chord), { gap: 0.04, volume: 0.5 });
        setNow({ source, index: i });
        i += 1;
        timer.current = setTimeout(step, (60000 / live.current.bpm) * live.current.beats);
      };
      step();
    },
    [stop]
  );

  // Stop playback when the key or mode changes underneath it
  useEffect(() => {
    stop();
  }, [keyPc, mode, stop]);

  const flats = shouldUseFlats('auto', keyPc, mode === 'minor' ? 9 : 0);
  const keyName = `${noteName(keyPc, flats)} ${mode}`;

  const list = useMemo(
    () => PROGRESSIONS.filter((p) => p.mode === mode && (category === 'All' || p.category === category)),
    [mode, category]
  );

  const diatonic = useMemo(
    () => diatonicChords(getScale(mode === 'major' ? 'major' : 'minor'), keyPc),
    [mode, keyPc]
  );

  const customChords = custom.map(({ degree, seventh }) => {
    const d = diatonic[degree];
    const chord = seventh && d.seventh ? d.seventh : d.triad;
    return { degree, roman: d.roman, rootPc: d.rootPc, chord, label: chordSymbol(d.rootPc, chord, flats) };
  });

  const suggested = custom.length ? COMMON_NEXT[custom[custom.length - 1].degree] : [0];

  const addChord = (degree) => setCustom((c) => [...c, { degree, seventh: sevenths }]);

  return (
    <div className="tool">
      <section className="panel">
        <h2>Chord progressions</h2>
        <p>
          A chord progression is the sequence of chords underneath a song. Pick a key and the chords below are
          worked out for you; press play to hear them, or click any chord to see its arpeggio on the fretboard.
        </p>
        <div className="controls">
          <div className="field">
            <label htmlFor="prog-key">Key</label>
            <select id="prog-key" value={keyPc} onChange={(e) => setKeyPc(Number(e.target.value))}>
              {ROOT_LABELS.map((l, i) => (
                <option key={l} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="label-like">Mode</span>
            <div className="row tight">
              <button type="button" className={`btn ${mode === 'major' ? 'primary' : 'ghost'}`} aria-pressed={mode === 'major'} onClick={() => setMode('major')}>
                Major
              </button>
              <button type="button" className={`btn ${mode === 'minor' ? 'primary' : 'ghost'}`} aria-pressed={mode === 'minor'} onClick={() => setMode('minor')}>
                Minor
              </button>
            </div>
          </div>
          <div className="field narrow">
            <label htmlFor="prog-bpm">Tempo: {bpm} bpm</label>
            <input id="prog-bpm" type="range" min="40" max="160" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </div>
          <div className="field narrow">
            <label htmlFor="prog-beats">Beats per chord</label>
            <select id="prog-beats" value={beats} onChange={(e) => setBeats(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
          <label className="check">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            Loop
          </label>
        </div>
        {audioError && <p className="warn" role="alert">Audio isn&apos;t available in this browser.</p>}
      </section>

      <section className="panel guide">
        <h2>How to build a progression</h2>
        <details open>
          <summary>1. Start with the chords of a key</summary>
          <p>
            Every key has seven &quot;diatonic&quot; chords, built by stacking thirds on each note of the scale. In{' '}
            <strong>{keyName}</strong> they are:
          </p>
          <div className="chord-grid">
            {diatonic.map((d) => (
              <div key={d.degree} className="chord-card">
                <span className="roman">{d.roman}</span>
                <span className="chord-name">{chordSymbol(d.rootPc, d.triad, flats)}</span>
                <span className="muted small-text">{chordSymbol(d.rootPc, d.seventh, flats)}</span>
              </div>
            ))}
          </div>
          <p className="hint">
            Roman numerals show the position in the key, so a progression works in any key. Upper case means major,
            lower case means minor, and ° means diminished.
          </p>
        </details>

        <details>
          <summary>2. Know what each chord does</summary>
          <div className="function-grid">
            {FUNCTIONS.map((f) => (
              <div key={f.name} className="function-card">
                <h3>{f.name}</h3>
                <p className="chords-line">{f.chords}</p>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <p>
            A reliable recipe is <strong>tonic → subdominant → dominant → tonic</strong>, for example I → IV → V → I.
            You can swap chords for others with the same job (vi for I, ii for IV) to change the colour without
            changing the direction.
          </p>
        </details>

        <details>
          <summary>3. Move with purpose (the circle of fifths)</summary>
          <p>
            Roots that move <strong>down a fifth</strong> (or up a fourth) sound especially natural, which is the move
            from V to I, ii to V, or vi to ii. On the circle of fifths that is one step counter-clockwise. Chords that
            are neighbours on the circle share most of their notes, so they glide together easily.
          </p>
        </details>

        <details>
          <summary>4. End phrases with a cadence</summary>
          <div className="function-grid">
            {CADENCES.map(([name, steps, text]) => (
              <div key={name} className="function-card">
                <h3>{name}</h3>
                <p className="chords-line">{steps}</p>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </details>

        <details>
          <summary>5. Quick tips</summary>
          <ul>
            <li>Start on the I chord (or the i chord in minor) so the listener knows where home is.</li>
            <li>Four or eight bars is a good length. Most songs repeat a short loop.</li>
            <li>Add 7ths (Cmaj7, G7, Am7) for a jazzier, softer feel, or stay with triads for punch.</li>
            <li>Borrow one chord from the parallel key (for example bVII in a major key) for a rock sound.</li>
            <li>Change the rhythm and strumming, not just the chords. The same four chords can sound completely different.</li>
            <li>Solo over a progression with the scale of its key. For C major use C major or A minor pentatonic.</li>
          </ul>
        </details>
      </section>

      <section className="panel">
        <h2>Progression library</h2>
        <div className="chip-row" role="group" aria-label="Filter by style">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className={`chip button ${category === c ? 'on' : ''}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {list.length === 0 && <p>No progressions in this style for {mode} keys yet. Try another style or switch mode.</p>}
        <div className="prog-list">
          {list.map((p) => {
            const chords = resolveProgression(p, keyPc);
            const source = `lib:${p.id}`;
            const isPlaying = now && now.source === source;
            return (
              <article key={p.id} className="prog-card">
                <header>
                  <h3>{p.name}</h3>
                  <span className="tag">{p.category}</span>
                  <span className="tag mood">{p.mood}</span>
                </header>
                <div className="prog-chords">
                  {chords.map((c, i) => (
                    <button
                      key={`${c.label}-${i}`}
                      type="button"
                      className={`prog-chord ${isPlaying && now.index === i ? 'now' : ''}`}
                      onClick={() => onOpen({ mode: 'arpeggio', rootPc: c.rootPc, arpId: c.chord.id })}
                      title="Show this arpeggio on the fretboard"
                    >
                      <span className="roman">{c.roman}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
                <p>{p.desc}</p>
                {p.examples.length > 0 && (
                  <p className="hint">
                    Heard in: {p.examples.join(' · ')}
                  </p>
                )}
                <button type="button" className="btn primary small" onClick={() => (isPlaying ? stop() : play(source, chords))} aria-pressed={!!isPlaying}>
                  {isPlaying ? '■ Stop' : `▶ Play in ${noteName(keyPc, flats)}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>Build your own</h2>
        <p>
          Tap chords to add them. The highlighted ones are common moves from the last chord you added, which is a
          guide rather than a rule.
        </p>
        <label className="check">
          <input type="checkbox" checked={sevenths} onChange={(e) => setSevenths(e.target.checked)} />
          Use 7th chords
        </label>
        <div className="chord-grid builder-buttons" role="group" aria-label={`Chords in ${keyName}`}>
          {diatonic.map((d) => {
            const chord = sevenths && d.seventh ? d.seventh : d.triad;
            return (
              <button
                key={d.degree}
                type="button"
                className={`build-btn ${suggested.includes(d.degree) ? 'suggested' : ''}`}
                onClick={() => addChord(d.degree)}
              >
                <span className="roman">{d.roman}</span>
                <span>{chordSymbol(d.rootPc, chord, flats)}</span>
              </button>
            );
          })}
        </div>

        <div className="prog-chords custom" aria-live="polite">
          {customChords.length === 0 && <span className="muted">Your progression will appear here.</span>}
          {customChords.map((c, i) => (
            <span key={i} className={`prog-chord ${now && now.source === 'custom' && now.index === i ? 'now' : ''}`}>
              <button
                type="button"
                className="plain"
                onClick={() => onOpen({ mode: 'arpeggio', rootPc: c.rootPc, arpId: c.chord.id })}
                title="Show this arpeggio on the fretboard"
              >
                <span className="roman">{c.roman}</span>
                <span>{c.label}</span>
              </button>
              <button
                type="button"
                className="remove"
                aria-label={`Remove ${c.label}`}
                onClick={() => setCustom((cs) => cs.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="row">
          <button
            type="button"
            className="btn primary"
            disabled={!customChords.length}
            onClick={() => (now && now.source === 'custom' ? stop() : play('custom', customChords))}
          >
            {now && now.source === 'custom' ? '■ Stop' : '▶ Play'}
          </button>
          <button type="button" className="btn ghost" disabled={!custom.length} onClick={() => setCustom((c) => c.slice(0, -1))}>
            Undo
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={!custom.length}
            onClick={() => {
              stop();
              setCustom([]);
            }}
          >
            Clear
          </button>
        </div>
        {customChords.length > 0 && (
          <p className="hint">
            Numerals: {customChords.map((c) => c.roman).join(' – ')} · Chords: {customChords.map((c) => c.label).join(' – ')}
          </p>
        )}
      </section>
    </div>
  );
}
