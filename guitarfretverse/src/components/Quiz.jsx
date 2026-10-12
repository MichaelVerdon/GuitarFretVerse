import React, { useState, useCallback, useMemo } from 'react';
import Fretboard from './Fretboard';
import { TUNINGS, NOTE_SHARP, ROOT_LABELS, noteName, mod12 } from '../utils/theory';
import { safeGet, safeSet } from '../utils/state';
import { pluck } from '../utils/audio';

const STANDARD = TUNINGS[0].notes;
const MAX_FRET = 12;
const BEST_KEY = 'gfv-quiz-best';
const STRING_NAMES = ['low E', 'A', 'D', 'G', 'B', 'high e'];

const rand = (n) => Math.floor(Math.random() * n);

function newQuestion(mode, prev) {
  let q;
  do {
    const s = rand(6);
    const f = mode === 'name' ? rand(MAX_FRET + 1) : 0;
    const pc = mode === 'name' ? mod12(STANDARD[s] + f) : rand(12);
    q = { s, f, pc };
  } while (prev && q.s === prev.s && q.pc === prev.pc && q.f === prev.f);
  return q;
}

export default function Quiz() {
  const [mode, setMode] = useState('name'); // 'name' = name the note, 'find' = find the note
  const [q, setQ] = useState(() => newQuestion('name'));
  const [result, setResult] = useState(null); // { correct, answer } after answering
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  const [best, setBest] = useState(() => Number(safeGet(BEST_KEY)) || 0);
  const [clicked, setClicked] = useState(null);

  const record = useCallback(
    (correct) => {
      setScore((sc) => {
        const streak = correct ? sc.streak + 1 : 0;
        if (streak > best) {
          setBest(streak);
          safeSet(BEST_KEY, String(streak));
        }
        return { right: sc.right + (correct ? 1 : 0), total: sc.total + 1, streak };
      });
    },
    [best]
  );

  const next = useCallback(
    (m = mode) => {
      setResult(null);
      setClicked(null);
      setQ((prev) => newQuestion(m, prev));
    },
    [mode]
  );

  const changeMode = (m) => {
    setMode(m);
    setScore((sc) => ({ ...sc, streak: 0 }));
    next(m);
  };

  const answerName = (pc) => {
    if (result) return;
    const correct = pc === q.pc;
    pluck(STANDARD[q.s] + q.f, 0, { volume: 0.6 });
    setResult({ correct, answer: noteName(q.pc) });
    record(correct);
  };

  const clickFret = (si, f, midi) => {
    if (mode !== 'find' || result) return;
    if (si !== q.s) return;
    pluck(midi, 0, { volume: 0.6 });
    const correct = mod12(midi) === q.pc;
    setClicked(f);
    setResult({ correct, answer: noteName(q.pc) });
    record(correct);
  };

  // All correct frets on the target string, revealed after an answer in find mode
  const correctFrets = useMemo(() => {
    const out = [];
    for (let f = 0; f <= MAX_FRET; f++) if (mod12(STANDARD[q.s] + f) === q.pc) out.push(f);
    return out;
  }, [q]);

  const getCell = useCallback(
    (si, f) => {
      if (mode === 'name') {
        if (si !== q.s || f !== q.f) return null;
        return { text: result ? noteName(q.pc) : '?', root: !result, hue: q.pc, dim: false };
      }
      if (si !== q.s) return null;
      if (result && correctFrets.includes(f)) return { text: noteName(q.pc), root: false, hue: q.pc, dim: false };
      if (result && f === clicked) return { text: noteName(mod12(STANDARD[si] + f)), root: false, hue: 11, dim: true };
      return null;
    },
    [mode, q, result, correctFrets, clicked]
  );

  const accuracy = score.total ? Math.round((score.right / score.total) * 100) : 0;

  return (
    <div className="tool">
      <section className="panel">
        <h2>Fretboard quiz</h2>
        <div className="row">
          <button type="button" className={`btn ${mode === 'name' ? 'primary' : 'ghost'}`} onClick={() => changeMode('name')}>
            Name the note
          </button>
          <button type="button" className={`btn ${mode === 'find' ? 'primary' : 'ghost'}`} onClick={() => changeMode('find')}>
            Find the note
          </button>
        </div>
        <p className="quiz-prompt">
          {mode === 'name'
            ? `Which note is on the ${STRING_NAMES[q.s]} string, fret ${q.f}?`
            : `Click a ${noteName(q.pc)} on the ${STRING_NAMES[q.s]} string.`}
        </p>
        <p className="muted">
          Score {score.right}/{score.total} ({accuracy}%) · Streak {score.streak} · Best streak {best}
        </p>
      </section>

      <Fretboard
        openPitches={STANDARD}
        frets={MAX_FRET}
        getCell={getCell}
        onCellClick={mode === 'find' ? clickFret : undefined}
        label="Quiz fretboard"
      />

      <section className="panel" aria-live="polite">
        {mode === 'name' && (
          <div className="note-picker" role="group" aria-label="Answer">
            {NOTE_SHARP.map((n, pc) => (
              <button key={n} type="button" className="note-btn" disabled={!!result} onClick={() => answerName(pc)}>
                {ROOT_LABELS[pc]}
              </button>
            ))}
          </div>
        )}
        {result && (
          <p className={result.correct ? 'ok' : 'bad'}>
            {result.correct ? 'Correct!' : `Not quite - it was ${result.answer}${mode === 'find' ? ` (shown on the board).` : '.'}`}
          </p>
        )}
        {result && (
          <button type="button" className="btn primary" onClick={() => next()} autoFocus>
            Next question
          </button>
        )}
        {!result && mode === 'find' && <p className="hint">Click a fret on the {STRING_NAMES[q.s]} string (other strings are ignored).</p>}
      </section>
    </div>
  );
}
