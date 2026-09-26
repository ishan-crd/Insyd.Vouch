export function Sparkline({ values, width = 96, height = 28 }: { values: (number | null)[]; width?: number; height?: number }) {
  const v = values.filter((x): x is number => x !== null);
  if (v.length < 2) return <span className="spark-empty">—</span>;
  const min = Math.min(...v), max = Math.max(...v), span = max - min || 1;
  const pts = v.map((x, i) => `${((i / (v.length - 1)) * (width - 2) + 1).toFixed(1)},${(height - 2 - ((x - min) / span) * (height - 4)).toFixed(1)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polygon points={`1,${height} ${pts.join(" ")} ${width - 1},${height}`} fill="#1E54E8" opacity=".1" />
      <polyline points={pts.join(" ")} fill="none" stroke="#1E54E8" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
