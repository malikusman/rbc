"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* Vertical bar chart with optional second (ghost) series, e.g. capacity vs registered */
export function BarChart({
  data,
  height = 220,
  format = (n) => n.toLocaleString("en-GB"),
  highlight,
}: {
  data: { label: string; value: number; ghost?: number; sub?: string }[];
  height?: number;
  format?: (n: number) => string;
  highlight?: number;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.ghost ?? 0)), 1);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="w-full">
      <div className="relative flex items-end gap-3" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <div key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-hair" style={{ bottom: `${g * 100}%` }} />
        ))}
        {data.map((d, i) => {
          const active = hover === i || (hover === null && highlight === i);
          return (
            <div key={d.label} className="relative flex h-full flex-1 flex-col items-center justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {d.ghost !== undefined && <div className="absolute bottom-0 left-1/2 w-full max-w-[64px] -translate-x-1/2 rounded-t-lg bg-stone/80" style={{ height: `${(d.ghost / max) * 100}%` }} />}
              <motion.div
                className={cn("relative w-full max-w-[64px] rounded-t-lg transition-colors", active ? "bg-red" : "bg-navy")}
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 1 : 0 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-navy px-2 py-1 text-[11.5px] font-semibold whitespace-nowrap text-white tabular"
                >
                  {format(d.value)}
                  {d.ghost !== undefined && <span className="font-normal text-white/60"> / {format(d.ghost)}</span>}
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <div className="truncate text-[11.5px] font-medium text-navy-2">{d.label}</div>
            {d.sub && <div className="truncate text-[10.5px] text-faint">{d.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Stacked area chart for revenue by stream */
export function StackedArea({
  data,
  keys,
  colors,
  height = 240,
  labels,
}: {
  data: Record<string, number | string>[];
  keys: string[];
  colors: string[];
  height?: number;
  labels: string[];
}) {
  const W = 640;
  const H = height;
  const pad = { l: 8, r: 8, t: 12, b: 4 };
  const totals = data.map((d) => keys.reduce((s, k) => s + (d[k] as number), 0));
  const max = Math.max(...totals) * 1.12 || 1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const [hover, setHover] = useState<number | null>(null);

  const layers = keys.map((k, ki) => {
    const lower = data.map((d) => keys.slice(0, ki).reduce((s, kk) => s + (d[kk] as number), 0));
    const upper = data.map((d, i) => lower[i] + (d[k] as number));
    const top = upper.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
    const bottom = lower
      .map((v, i) => [x(i), y(v)] as const)
      .reverse()
      .map(([a, b]) => `L${a} ${b}`)
      .join(" ");
    return { k, d: `${top} ${bottom} Z`, line: top, color: colors[ki] };
  });

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height }} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="#E9E5DC" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        ))}
        {layers.map((l, i) => (
          <motion.g key={l.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
            <path d={l.d} fill={l.color} fillOpacity={0.9} />
            <path d={l.line} fill="none" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </motion.g>
        ))}
        {data.map((_, i) => (
          <rect key={i} x={x(i) - W / data.length / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="#14213A" strokeOpacity={0.35} vectorEffect="non-scaling-stroke" />}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[170px] rounded-xl border border-hair bg-white p-3 text-[12px] shadow-[var(--shadow-lift)]"
          style={{ left: `calc(${(x(hover) / W) * 100}% ${hover > data.length / 2 ? "- 186px" : "+ 12px"})` }}
        >
          <div className="mb-1.5 font-semibold text-navy">{labels[hover]}</div>
          {keys
            .slice()
            .reverse()
            .map((k) => {
              const ki = keys.indexOf(k);
              return (
                <div key={k} className="flex items-center justify-between gap-4 py-0.5">
                  <span className="flex items-center gap-1.5 text-muted capitalize">
                    <span className="h-2 w-2 rounded-sm" style={{ background: colors[ki] }} />
                    {k}
                  </span>
                  <span className="font-medium text-navy tabular">AED {(data[hover][k] as number).toLocaleString("en-GB")}</span>
                </div>
              );
            })}
        </div>
      )}
      <div className="mt-2 flex justify-between px-1">
        {labels.map((l) => (
          <span key={l} className="text-[11.5px] text-faint">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Donut with legend */
export function Donut({ parts, size = 150, stroke = 18, center }: { parts: { label: string; value: number; color: string }[]; size?: number; stroke?: number; center?: React.ReactNode }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECE8DF" strokeWidth={stroke} />
        {parts.map((p, i) => {
          const len = (p.value / total) * c;
          const off = acc;
          acc += len;
          return (
            <motion.circle
              key={p.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: -off }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
    </div>
  );
}

/* Horizontal funnel for pipeline stages */
export function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[12.5px] text-muted">{s.label}</span>
          <div className="h-7 flex-1 overflow-hidden rounded-lg bg-stone/60">
            <motion.div
              className="flex h-full items-center justify-end rounded-lg bg-navy pr-2.5 text-[11.5px] font-semibold text-white"
              style={{ opacity: 1 - i * 0.12 }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, (s.value / max) * 100)}%` }}
              transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              {s.value}
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
