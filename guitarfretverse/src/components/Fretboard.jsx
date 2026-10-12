import React from 'react';
import { noteName } from '../utils/theory';

const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

/**
 * Presentational fretboard.
 *
 * openPitches: MIDI note of each open string, lowest first.
 * getCell(stringIndex, fret) -> null | { text, root, hue, dim }
 * Fret numbers shown are absolute; with a capo the first column is the capo.
 */
function Fretboard({
  openPitches,
  capo = 0,
  frets = 15,
  getCell,
  onCellClick,
  playing,
  lefty = false,
  vertical = false,
  label = 'Guitar fretboard',
}) {
  const n = openPitches.length;
  const nCols = frets - capo + 1;
  const fretList = Array.from({ length: nCols }, (_, i) => capo + i);

  // Grid placement helpers. Horizontal: high string on top, nut at left.
  // Vertical: nut at top, low string on the left.
  const place = (si, f) =>
    vertical
      ? { gridRow: f - capo + 1, gridColumn: si + 2 }
      : { gridRow: n - si, gridColumn: f - capo + 1 };

  const gridStyle = vertical
    ? {
        gridTemplateColumns: `2.2rem repeat(${n}, minmax(2.6rem, 1fr))`,
        gridTemplateRows: `repeat(${nCols}, 2.7rem)`,
      }
    : {
        gridTemplateColumns: `minmax(2.6rem, 0.8fr) repeat(${nCols - 1}, minmax(3rem, 1fr))`,
        gridTemplateRows: `repeat(${n}, 2.5rem) 1.8rem`,
      };

  const stringWidth = (si) => 1 + (2.2 * (n - 1 - si)) / Math.max(1, n - 1);

  return (
    <div className="fb-scroll">
      <div
        className={`fb ${vertical ? 'vertical' : 'horizontal'} ${lefty ? 'lefty' : ''}`}
        style={gridStyle}
        role="group"
        aria-label={label}
      >
        {/* Inlay dots sit underneath the notes */}
        {fretList.map((f) => {
          const single = SINGLE_INLAYS.includes(f);
          const dbl = DOUBLE_INLAYS.includes(f);
          if (!single && !dbl) return null;
          const style = vertical
            ? { gridRow: f - capo + 1, gridColumn: `2 / ${n + 2}` }
            : { gridColumn: f - capo + 1, gridRow: `1 / ${n + 1}` };
          return (
            <div key={`inlay-${f}`} className={`fb-inlay ${dbl ? 'double' : ''}`} style={style} aria-hidden="true">
              <span />
              {dbl && <span />}
            </div>
          );
        })}

        {/* Fret numbers */}
        {fretList.map((f, i) => {
          const style = vertical
            ? { gridRow: i + 1, gridColumn: 1 }
            : { gridRow: n + 1, gridColumn: i + 1 };
          return (
            <div key={`num-${f}`} className="fb-number" style={style} aria-hidden="true">
              {f === 0 ? 'open' : f}
            </div>
          );
        })}

        {/* Cells: one button per string/fret */}
        {openPitches.map((open, si) =>
          fretList.map((f) => {
            const cell = getCell(si, f);
            const isNut = f === capo;
            const midi = open + f;
            const isPlaying = playing && playing.s === si && playing.f === f;
            const classes = ['fb-cell'];
            if (isNut) classes.push(capo === 0 ? 'nut' : 'capo');
            return (
              <button
                key={`${si}-${f}`}
                type="button"
                className={classes.join(' ')}
                style={place(si, f)}
                tabIndex={cell ? 0 : -1}
                onClick={onCellClick ? () => onCellClick(si, f, midi) : undefined}
                aria-label={`${noteName(midi)}, string ${n - si}, fret ${f}${cell && cell.root ? ', root' : ''}`}
              >
                <span className="fb-string" style={{ '--w': `${stringWidth(si)}px` }} />
                {cell && (
                  <span
                    className={`fb-dot ${cell.root ? 'root' : ''} ${cell.dim ? 'dim' : ''} ${isPlaying ? 'playing' : ''}`}
                    style={cell.root ? undefined : { background: `hsl(${(cell.hue % 12) * 30} 62% 38%)` }}
                  >
                    {cell.text}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default React.memo(Fretboard);
