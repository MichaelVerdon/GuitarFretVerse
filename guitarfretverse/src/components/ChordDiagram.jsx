import React from 'react';

/**
 * Small SVG chord box. frets: array of 6 (low E first); null = muted, 0 = open.
 */
export default function ChordDiagram({ frets, title, barre = 0 }) {
  const strings = frets.length;
  const played = frets.filter((f) => f !== null && f > 0);
  const max = played.length ? Math.max(...played) : 0;
  const min = played.length ? Math.min(...played) : 1;
  const base = max <= 4 ? 1 : min;
  const rows = 5;
  const left = 22;
  const top = 26;
  const colW = 16;
  const rowH = 17;
  const width = left + colW * (strings - 1) + 16;
  const height = top + rowH * rows + 10;
  const x = (si) => left + si * colW;

  // Barre line across all strings that sit on the barre fret
  let barreLine = null;
  if (barre > 0) {
    const idx = frets.map((f, i) => (f === barre ? i : -1)).filter((i) => i >= 0);
    if (idx.length > 1) barreLine = { from: Math.min(...idx), to: Math.max(...idx) };
  }

  return (
    <figure className="chord-diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${frets.map((f) => (f === null ? 'x' : f)).join(' ')}`}>
        {base === 1 && <rect x={left - 1} y={top - 3} width={colW * (strings - 1) + 2} height="4" fill="currentColor" />}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <line key={`h${r}`} x1={left} x2={left + colW * (strings - 1)} y1={top + r * rowH} y2={top + r * rowH} stroke="currentColor" strokeWidth="1" opacity="0.6" />
        ))}
        {Array.from({ length: strings }, (_, s) => (
          <line key={`v${s}`} x1={x(s)} x2={x(s)} y1={top} y2={top + rows * rowH} stroke="currentColor" strokeWidth="1" opacity="0.6" />
        ))}
        {base > 1 && (
          <text x="2" y={top + rowH * 0.7} fontSize="9" fill="currentColor">
            {base}fr
          </text>
        )}
        {frets.map((f, s) => {
          if (f === null) {
            return (
              <text key={`m${s}`} x={x(s)} y={top - 9} fontSize="10" textAnchor="middle" fill="currentColor">
                ×
              </text>
            );
          }
          if (f === 0) {
            return <circle key={`o${s}`} cx={x(s)} cy={top - 12} r="3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />;
          }
          return null;
        })}
        {barreLine && (
          <rect
            x={x(barreLine.from) - 5}
            y={top + (barre - base) * rowH + rowH / 2 - 4.5}
            width={x(barreLine.to) - x(barreLine.from) + 10}
            height="9"
            rx="4.5"
            fill="var(--accent)"
          />
        )}
        {frets.map((f, s) =>
          f !== null && f > 0 ? (
            <circle key={`d${s}`} cx={x(s)} cy={top + (f - base) * rowH + rowH / 2} r="5.2" fill="var(--accent)" />
          ) : null
        )}
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}
