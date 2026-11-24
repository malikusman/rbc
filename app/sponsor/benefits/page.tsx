"use client";

import { motion } from "motion/react";
import { CalendarClock, Check, Circle } from "lucide-react";
import { Badge, Card, CardHeader, Item, PageHeader, ProgressRing, Stagger } from "@/components/ui";
import { BENEFITS, ME_SPONSOR, sponsorById } from "@/lib/data";
import { cn, fmtDate, relLabel } from "@/lib/utils";

export default function Benefits() {
  const sp = sponsorById(ME_SPONSOR.sponsorId)!;
  const list = BENEFITS.filter((b) => b.sponsorId === sp.id);
  const done = list.filter((b) => b.delivered >= b.total).length;
  const overall = list.reduce((s, b) => s + b.delivered / b.total, 0) / list.length;

  return (
    <div>
      <PageHeader eyebrow="Benefits" title={`Your ${sp.level} package`} description="Everything included in your sponsorship, and how much has been delivered so far. Your relationship manager updates this as each item happens." />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center p-8 text-center">
          <ProgressRing value={overall} size={180} stroke={11} color="#B5713E">
            <div className="font-display text-[46px] leading-none text-navy">{Math.round(overall * 100)}%</div>
            <div className="mt-1 text-[12px] text-faint">delivered</div>
          </ProgressRing>
          <div className="mt-6 text-[14px] text-navy">
            <span className="font-semibold">{done}</span> of {list.length} benefits complete
          </div>
          <div className="mt-1 text-[12.5px] text-muted">Package runs to {fmtDate(sp.end)}</div>
        </Card>

        <Card>
          <CardHeader title="Package items" />
          <Stagger className="divide-y divide-hair border-t border-hair">
            {list.map((b) => {
              const complete = b.delivered >= b.total;
              const pct = b.delivered / b.total;
              return (
                <Item key={b.id} className="flex items-center gap-5 px-6 py-5">
                  <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full", complete ? "bg-ok-soft text-ok" : "bg-copper-soft text-copper-ink")}>
                    {complete ? <Check size={16} strokeWidth={2.5} /> : <Circle size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-navy">{b.label}</div>
                    <div className="text-[12.5px] text-muted">{b.detail}</div>
                    <div className="mt-2.5 flex gap-1">
                      {Array.from({ length: Math.min(b.total, 12) }).map((_, i) => {
                        const filled = b.total <= 12 ? i < b.delivered : i < Math.round(pct * 12);
                        return (
                          <motion.span
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2 + i * 0.03 }}
                            className={cn("h-1.5 flex-1 origin-left rounded-full", filled ? (complete ? "bg-ok" : "bg-copper") : "bg-stone")}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-28 shrink-0 text-right">
                    <div className="font-display text-[22px] text-navy tabular">
                      {b.delivered}
                      <span className="text-[14px] text-faint">/{b.total}</span>
                    </div>
                    {b.due && !complete ? (
                      <Badge tone="info" className="mt-1">
                        <CalendarClock size={11} /> {relLabel(b.due)}
                      </Badge>
                    ) : complete ? (
                      <Badge tone="ok" className="mt-1">Complete</Badge>
                    ) : null}
                  </div>
                </Item>
              );
            })}
          </Stagger>
        </Card>
      </div>
    </div>
  );
}
