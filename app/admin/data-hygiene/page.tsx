"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, GitMerge, Sparkles, X } from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader, ProgressRing } from "@/components/ui";
import { COMPANIES, DUPLICATES, HYGIENE_ISSUES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FIX_LABEL: Record<string, string> = {
  h1: "Request TRNs by email",
  h2: "Pause and notify owners",
  h3: "Match by email domain",
  h4: "Archive inactive",
  h5: "Reformat to +971",
  h6: "Send consent request",
};

export default function DataHygiene() {
  const resolved = useStore((s) => s.resolvedDuplicates);
  const fixed = useStore((s) => s.fixedIssues);
  const resolve = useStore((s) => s.resolveDuplicate);
  const fix = useStore((s) => s.fixIssue);
  const toast = useStore((s) => s.toast);

  const base = Math.round(COMPANIES.reduce((s, c) => s + c.quality, 0) / COMPANIES.length);
  const score = Math.min(99, base + fixed.length * 2 + resolved.length);
  const dups = DUPLICATES.filter((d) => !resolved.includes(d.id));
  const issues = HYGIENE_ISSUES.filter((i) => !fixed.includes(i.id));

  return (
    <div>
      <PageHeader
        eyebrow="Data hygiene"
        title="Keep the CRM clean"
        description="Duplicates, gaps and stale records found automatically across the CRM, Zoho Books, Mailchimp and event sign-ups."
        actions={
          <Button
            variant="dark"
            onClick={() => {
              HYGIENE_ISSUES.forEach((i) => !fixed.includes(i.id) && fix(i.id));
              toast({ title: "Safe fixes applied", body: "Formats corrected and requests sent. Merges still need a review." });
            }}
          >
            <Sparkles size={15} /> Fix all safe issues
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="flex flex-col items-center p-8 text-center">
          <ProgressRing value={score / 100} size={170} stroke={11} color={score >= 85 ? "#2F7A55" : "#B5713E"}>
            <motion.div key={score} initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-[48px] leading-none text-navy">
              {score}
            </motion.div>
            <div className="mt-1 text-[12px] text-faint">quality score</div>
          </ProgressRing>
          <div className="mt-6 text-[14px] font-semibold text-navy">{score >= 85 ? "In good shape" : "Room to improve"}</div>
          <div className="mt-1 text-[12.5px] text-muted">
            {issues.length} open issues · {dups.length} possible duplicates
          </div>
          <div className="mt-6 w-full space-y-2 border-t border-hair pt-5 text-left text-[12.5px]">
            {["CRM", "Zoho Books", "Mailchimp", "Event sign-ups"].map((s) => (
              <div key={s} className="flex justify-between">
                <span className="text-muted">{s}</span>
                <span className="flex items-center gap-1 text-ok">
                  <Check size={12} /> scanned
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Issues found" sub="Each fix is logged in the audit trail." />
          <div className="divide-y divide-hair border-t border-hair">
            <AnimatePresence initial={false}>
              {issues.map((i) => (
                <motion.div key={i.id} layout exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 overflow-hidden px-6 py-4">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", i.severity === "high" ? "bg-red" : i.severity === "medium" ? "bg-copper" : "bg-line")} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-navy">
                      {i.label} <span className="ml-1 rounded-full bg-stone px-2 text-[12px] font-semibold tabular">{i.count}</span>
                    </div>
                    <div className="text-[12.5px] text-muted">{i.impact}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      fix(i.id);
                      toast({ title: FIX_LABEL[i.id], body: `${i.count} records updated` });
                    }}
                  >
                    {FIX_LABEL[i.id]} <ArrowRight size={13} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {issues.length === 0 && (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ok-soft text-ok">
                  <Check size={22} />
                </span>
                <div className="mt-3 text-[15px] font-semibold text-navy">All clear</div>
                <div className="text-[13px] text-muted">The next scan runs tonight at 02:00.</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="font-display text-[26px] text-navy">Possible duplicates</h2>
        <span className="text-[13px] text-muted">{dups.length} to review</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence>
          {dups.map((d) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}>
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Badge>{d.kind}</Badge>
                  <span className="text-[12px] font-semibold text-navy">{d.confidence}% match</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <DupSide r={d.a} primary />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone text-navy">
                    <GitMerge size={14} />
                  </span>
                  <DupSide r={d.b} />
                </div>
                <div className="mt-3 text-[12.5px] text-muted">{d.reason}</div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => {
                      resolve(d.id);
                      toast({ title: "Records merged", body: `Kept ${d.a.name}; history combined from both.` });
                    }}
                  >
                    <GitMerge size={13} /> Merge into first
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => resolve(d.id)}>
                    <X size={13} /> Not a duplicate
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DupSide({ r, primary }: { r: { name: string; detail: string; source: string }; primary?: boolean }) {
  return (
    <div className={cn("min-w-0 rounded-xl border p-3.5", primary ? "border-navy/20 bg-paper" : "border-hair")}>
      <div className="truncate text-[14px] font-semibold text-navy">{r.name}</div>
      <div className="mt-0.5 truncate text-[12px] text-muted">{r.detail}</div>
      <div className="mt-2 text-[11px] text-faint">from {r.source}</div>
    </div>
  );
}
