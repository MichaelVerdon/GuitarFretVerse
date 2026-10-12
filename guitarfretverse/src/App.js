import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import logo from './images/guitarfretverselogo.png';
import Explorer from './components/Explorer';
import ChordFinder from './components/ChordFinder';
import ScaleFinder from './components/ScaleFinder';
import CircleOfFifths from './components/CircleOfFifths';
import Progressions from './components/Progressions';
import Quiz from './components/Quiz';
import { loadInitialState, persistState, tabFromQuery, sanitize } from './utils/state';
import { describePattern, getTuning } from './utils/theory';

const TAB_LABELS = [
  ['explore', 'Explorer'],
  ['chords', 'Chords'],
  ['scales', 'Scale finder'],
  ['circle', 'Circle of fifths'],
  ['progressions', 'Progressions'],
  ['quiz', 'Quiz'],
];

// Fields that change which notes are shown; changing them resets the position box.
const PATTERN_KEYS = ['mode', 'rootPc', 'scaleId', 'arpId', 'tuningId', 'capo', 'frets'];

function App() {
  const [state, setState] = useState(loadInitialState);
  const [progSeed, setProgSeed] = useState(null);
  const [tab, setTab] = useState(() => (typeof window !== 'undefined' ? tabFromQuery(window.location.search) : 'explore'));

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const patternChanged = PATTERN_KEYS.some((k) => k in patch && patch[k] !== prev[k]);
      if (patternChanged && !('position' in patch)) next.position = 0;
      return sanitize(next);
    });
  }, []);

  // Open something in the Explorer from another tab
  const openInExplorer = useCallback(
    (patch) => {
      update({ position: 0, ...patch });
      setTab('explore');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [update]
  );

  // Jump to another tab, optionally seeding the progressions key
  const goTo = useCallback((target, seed) => {
    if (seed) setProgSeed({ ...seed, nonce: Date.now() });
    setTab(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    persistState(state, tab);
    const info = describePattern(state);
    const tuning = getTuning(state.tuningId);
    const base = 'GuitarFretVerse';
    if (tab === 'explore') {
      document.title =
        state.mode === 'all'
          ? `Guitar fretboard notes | ${base}`
          : `${info.title} on guitar | ${base}`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          'content',
          state.mode === 'all'
            ? 'Interactive guitar fretboard with every note, scales, arpeggios, chords and ear-training tools.'
            : `${info.title} on the guitar fretboard (${tuning.name.split(' (')[0]} tuning): notes ${info.notes.join(' ')}, intervals ${info.formula.join(' ')}, positions and playback.`
        );
      }
    } else {
      document.title = `${TAB_LABELS.find((t) => t[0] === tab)[1]} | ${base}`;
    }
  }, [state, tab]);

  return (
    <div className="App">
      <header className="site-header">
        <img src={logo} className="logo" alt="GuitarFretVerse" />
        <nav className="tabs" role="tablist" aria-label="Tools">
          {TAB_LABELS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="main-panel"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main id="main-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'explore' && <Explorer state={state} update={update} setState={setState} />}
        {tab === 'chords' && <ChordFinder onOpen={openInExplorer} />}
        {tab === 'scales' && <ScaleFinder onOpen={openInExplorer} />}
        {tab === 'circle' && <CircleOfFifths onOpen={openInExplorer} onGoTo={goTo} />}
        {tab === 'progressions' && <Progressions seed={progSeed} onOpen={openInExplorer} />}
        {tab === 'quiz' && <Quiz />}
      </main>
      <footer className="site-footer">GuitarFretVerse · all patterns are calculated from music theory, so they work in any tuning.</footer>
    </div>
  );
}

export default App;
