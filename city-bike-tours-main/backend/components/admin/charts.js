"use client";

import { useEffect, useRef, useState } from "react";

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// Smooth line through points (Catmull-Rom → cubic Bézier).
function smooth(points) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const niceMax = (v) => {
  if (v <= 0) return 10;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

/**
 * Two smooth curves over the same x labels. `a` is drawn as the filled violet area on the left axis,
 * `b` as a teal line scaled to its own maximum (its real values appear in the tooltip).
 */
export function DualAreaChart({ labels, a, b, aName, bName, formatA = (v) => v, formatB = (v) => v, height = 270 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { l: 52, r: 14, t: 14, b: 28 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const maxA = niceMax(Math.max(...a, 0));
  const maxB = niceMax(Math.max(...b, 0));
  const x = (i) => pad.l + (labels.length === 1 ? w / 2 : (i / (labels.length - 1)) * w);
  const ya = (v) => pad.t + h - (v / maxA) * h;
  const yb = (v) => pad.t + h - (v / maxB) * h;
  const ptsA = a.map((v, i) => [x(i), ya(v)]);
  const ptsB = b.map((v, i) => [x(i), yb(v)]);
  const lineA = smooth(ptsA);
  const areaA = ptsA.length > 1 ? `${lineA} L${x(a.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="adm-chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label={`${aName} and ${bName} by month`}>
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a24bff" stopOpacity="0.55" /><stop offset="1" stopColor="#a24bff" stopOpacity="0" /></linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3c0" stopOpacity="0.12" /><stop offset="1" stopColor="#22d3c0" stopOpacity="0" /></linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={pad.t + h - t * h} y2={pad.t + h - t * h} stroke="rgba(160,170,255,.10)" strokeDasharray="3 5" />
            <text x={pad.l - 10} y={pad.t + h - t * h + 4} textAnchor="end" fontSize="11" fill="#6b7199">{formatA(Math.round(maxA * t))}</text>
          </g>
        ))}
        {labels.map((l, i) => i % Math.ceil(labels.length / 8) === 0 && <text key={l + i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11.5" fill="#6b7199">{l}</text>)}
        {ptsB.length > 1 && <path d={`${smooth(ptsB)} L${x(b.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z`} fill="url(#gB)" />}
        {areaA && <path d={areaA} fill="url(#gA)" />}
        {ptsB.length > 1 && <path d={smooth(ptsB)} fill="none" stroke="#22d3c0" strokeWidth="2.5" filter="url(#glow)" />}
        {ptsA.length > 1 && <path d={lineA} fill="none" stroke="#b567ff" strokeWidth="2.5" filter="url(#glow)" />}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="rgba(255,255,255,.25)" />
            <circle cx={x(hover)} cy={ya(a[hover])} r="5" fill="#0f1430" stroke="#b567ff" strokeWidth="2.5" />
            <circle cx={x(hover)} cy={yb(b[hover])} r="5" fill="#0f1430" stroke="#22d3c0" strokeWidth="2.5" />
          </g>
        )}
        {labels.map((l, i) => (
          <rect key={l + i} x={x(i) - w / labels.length / 2} y={pad.t} width={w / labels.length} height={h} fill="transparent"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)} />
        ))}
      </svg>
      {hover != null && (
        <div className="adm-tip" style={{ left: Math.min(Math.max(x(hover), 80), width - 80), top: Math.min(ya(a[hover]), yb(b[hover])) - 12 }}>
          <b>{labels[hover]}</b>
          <span style={{ color: "#cf9bff" }}>{aName}: {formatA(a[hover])}</span><br />
          <span style={{ color: "#22d3c0" }}>{bName}: {formatB(b[hover])}</span>
        </div>
      )}
    </div>
  );
}

/** Bars with a dashed capacity line; bars at or over capacity turn teal→red-ish via `full` colour. */
export function CapacityBars({ items, capacity, height = 200 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { l: 28, r: 6, t: 12, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = niceMax(Math.max(capacity, ...items.map((i) => i.value), 1));
  const slot = w / items.length;
  const bw = Math.max(6, Math.min(18, slot * 0.58));
  const y = (v) => pad.t + h - (v / max) * h;

  return (
    <div className="adm-chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label="Riders booked per day against daily capacity">
        <defs>
          <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c27bff" /><stop offset="1" stopColor="#7a3cff" /></linearGradient>
          <linearGradient id="barFull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8aa0" /><stop offset="1" stopColor="#ff5d7a" /></linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={pad.t + h - t * h} y2={pad.t + h - t * h} stroke="rgba(160,170,255,.08)" />
            <text x={pad.l - 8} y={pad.t + h - t * h + 4} textAnchor="end" fontSize="10.5" fill="#6b7199">{Math.round(max * t)}</text>
          </g>
        ))}
        <line x1={pad.l} x2={width - pad.r} y1={y(capacity)} y2={y(capacity)} stroke="#22d3c0" strokeDasharray="4 4" strokeWidth="1.5" />
        {items.map((it, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(it.value);
          return (
            <g key={it.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx - slot / 2} y={pad.t} width={slot} height={h} fill="transparent" />
              {it.value > 0 && <rect x={cx - bw / 2} y={top} width={bw} height={pad.t + h - top} rx="3" fill={it.value >= capacity ? "url(#barFull)" : "url(#bar)"} opacity={hover == null || hover === i ? 1 : 0.55} />}
              {(i % Math.ceil(items.length / 7) === 0) && <text x={cx} y={height - 8} textAnchor="middle" fontSize="10.5" fill="#6b7199">{it.label}</text>}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="adm-tip" style={{ left: Math.min(Math.max(pad.l + slot * hover + slot / 2, 70), width - 70), top: y(items[hover].value) - 8 }}>
          <b>{items[hover].full}</b>{items[hover].value} of {capacity} riders
        </div>
      )}
    </div>
  );
}

export function Spark({ values, color = "#a24bff", width = 96, height = 34 }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * (width - 4) + 2, height - 3 - (v / max) * (height - 8)]);
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={smooth(pts)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Full-width smooth line with a soft violet fill, like the small trend cards in the reference. */
export function LineMini({ values, labels, height = 96 }) {
  const [ref, width] = useWidth();
  const pad = { l: 4, r: 4, t: 8, b: 4 };
  const max = Math.max(...values, 1);
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const pts = values.map((v, i) => [pad.l + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w), pad.t + h - (v / max) * h]);
  const line = smooth(pts);
  return (
    <div className="adm-chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label={`Trend: ${labels.map((l, i) => `${l} ${values[i]}`).join(", ")}`}>
        <defs><linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a24bff" stopOpacity="0.4" /><stop offset="1" stopColor="#a24bff" stopOpacity="0" /></linearGradient></defs>
        {pts.length > 1 && <path d={`${line} L${pts[pts.length - 1][0]},${pad.t + h} L${pts[0][0]},${pad.t + h} Z`} fill="url(#gM)" />}
        {pts.length > 1 && <path d={line} fill="none" stroke="#b567ff" strokeWidth="2.5" />}
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#0d1230" stroke="#b567ff" strokeWidth="2" />)}
      </svg>
    </div>
  );
}
