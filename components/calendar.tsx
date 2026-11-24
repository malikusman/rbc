"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, fmtTime } from "@/lib/utils";

export type CalItem = { id: string; title: string; start: string; tone: "navy" | "red" | "copper" | "muted" | "info"; href?: string };

const toneCls: Record<CalItem["tone"], string> = {
  navy: "bg-navy text-white",
  red: "bg-red/10 text-red border border-red/15",
  copper: "bg-copper-soft text-copper-ink border border-copper/15",
  muted: "bg-stone text-navy-2",
  info: "bg-info-soft text-info border border-info/15",
};

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendar({ items, initial, compact = false }: { items: CalItem[]; initial?: Date; compact?: boolean }) {
  const [cursor, setCursor] = useState(() => {
    const d = initial ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dir, setDir] = useState(0);

  const days = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>();
    for (const it of items) {
      const d = new Date(it.start);
      const k = d.toDateString();
      m.set(k, [...(m.get(k) ?? []), it].sort((a, b) => +new Date(a.start) - +new Date(b.start)));
    }
    return m;
  }, [items]);

  const today = new Date().toDateString();
  const move = (n: number) => {
    setDir(n);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-[24px] text-navy">
          {cursor.toLocaleDateString("en-GB", { month: "long" })} <span className="text-faint">{cursor.getFullYear()}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-hair bg-white text-navy transition hover:border-line" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              setDir(0);
              setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
            }}
            className="h-9 rounded-xl border border-hair bg-white px-3 text-[13px] font-medium text-navy transition hover:border-line"
          >
            Today
          </button>
          <button onClick={() => move(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-hair bg-white text-navy transition hover:border-line" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hair bg-white">
        <div className="grid grid-cols-7 border-b border-hair bg-paper/60">
          {DOW.map((d) => (
            <div key={d} className="px-3 py-2.5 text-[11.5px] font-semibold tracking-wide text-faint uppercase">
              {d}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cursor.toISOString()}
            initial={{ opacity: 0, x: dir * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7"
          >
            {days.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const list = byDay.get(d.toDateString()) ?? [];
              const isToday = d.toDateString() === today;
              return (
                <div key={i} className={cn("border-hair p-1.5", compact ? "min-h-[84px]" : "min-h-[112px]", i % 7 !== 6 && "border-r", i < 35 && "border-b", !inMonth && "bg-paper/50")}>
                  <div className="mb-1 flex justify-end">
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12px] tabular",
                        isToday ? "bg-red font-semibold text-white" : inMonth ? "text-navy-2" : "text-faint",
                      )}
                    >
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {list.slice(0, 3).map((it) => {
                      const body = (
                        <div className={cn("truncate rounded-md px-1.5 py-1 text-[11.5px] leading-tight font-medium transition hover:brightness-95", toneCls[it.tone])} title={it.title}>
                          <span className="font-normal tabular">{fmtTime(it.start)}</span> {it.title}
                        </div>
                      );
                      return it.href ? (
                        <Link key={it.id} href={it.href} className="block">
                          {body}
                        </Link>
                      ) : (
                        <div key={it.id}>{body}</div>
                      );
                    })}
                    {list.length > 3 && <div className="px-1.5 text-[11px] text-faint">+{list.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
