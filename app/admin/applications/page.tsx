"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CalendarClock, ShieldCheck, Send, CheckCircle2, GripVertical } from "lucide-react";
import { Avatar, Badge, Button, CloseButton, Modal, PageHeader, statusTone } from "@/components/ui";
import { APP_STAGES, tierById, type AppStage, type Application } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, relLabel } from "@/lib/utils";

const STAGE_HINT: Record<AppStage, string> = {
  Interest: "Registered on the website",
  "Intro call": "Short call with the team",
  KYC: "AML checks in progress",
  Approved: "Invoice and payment link sent",
  Paid: "Welcome pack sent",
};

export default function Applications() {
  const apps = useStore((s) => s.applications);
  const move = useStore((s) => s.moveApplication);
  const toast = useStore((s) => s.toast);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<AppStage | null>(null);
  const [open, setOpen] = useState<Application | null>(null);

  const advance = (a: Application) => {
    const i = APP_STAGES.indexOf(a.stage);
    if (i >= APP_STAGES.length - 1) return;
    const next = APP_STAGES[i + 1];
    move(a.id, next);
    const msg: Record<AppStage, string> = {
      Interest: "",
      "Intro call": "Calendly link sent for an intro call",
      KYC: "Screening started — results in a few minutes",
      Approved: `Invoice sent with a payment link (${aed(tierById(a.tier)!.price * 1.05)})`,
      Paid: "Payment received — member added to the CRM",
    };
    toast({ title: `${a.company} → ${next}`, body: msg[next] });
  };

  const current = open ? apps.find((a) => a.id === open.id) ?? null : null;

  return (
    <div>
      <PageHeader
        eyebrow="Applications"
        title="Joining pipeline"
        description="From ‘register interest’ on the website to a paid, active member. Drag a card to move it, or open it to act."
      />

      <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10">
        <div className="grid min-w-[1060px] grid-cols-5 gap-3">
          {APP_STAGES.map((stage) => {
            const list = apps.filter((a) => a.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(stage);
                }}
                onDragLeave={() => setOver((o) => (o === stage ? null : o))}
                onDrop={() => {
                  if (drag) {
                    const a = apps.find((x) => x.id === drag);
                    if (a && a.stage !== stage) {
                      move(drag, stage);
                      toast({ title: `${a.company} moved to ${stage}` });
                    }
                  }
                  setDrag(null);
                  setOver(null);
                }}
                className={cn("flex min-h-[520px] flex-col rounded-2xl border p-3 transition-colors", over === stage ? "border-navy/30 bg-white" : "border-hair bg-stone/40")}
              >
                <div className="mb-3 px-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold text-navy">{stage}</span>
                    <span className="rounded-full bg-white px-2 text-[12px] font-semibold text-navy tabular shadow-sm">{list.length}</span>
                  </div>
                  <div className="text-[11.5px] text-faint">{STAGE_HINT[stage]}</div>
                </div>
                <div className="flex-1 space-y-2.5">
                  <AnimatePresence>
                    {list.map((a) => (
                      <motion.div
                        key={a.id}
                        layout
                        layoutId={a.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: drag === a.id ? 0.4 : 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      >
                        <div
                          draggable
                          onDragStart={() => setDrag(a.id)}
                          onDragEnd={() => setDrag(null)}
                          onClick={() => setOpen(a)}
                          className="group cursor-grab rounded-xl border border-hair bg-white p-3.5 shadow-[var(--shadow-card)] transition hover:border-line hover:shadow-[var(--shadow-lift)] active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13.5px] font-semibold text-navy">{a.company}</div>
                              <div className="truncate text-[12px] text-muted">{a.contact}</div>
                            </div>
                            <GripVertical size={14} className="mt-0.5 shrink-0 text-line group-hover:text-faint" />
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            <Badge>{tierById(a.tier)?.name}</Badge>
                            {a.founding && <Badge tone="copper">Founding</Badge>}
                            {a.source === "Website" && <Badge tone="info">Website</Badge>}
                            {a.risk && <Badge tone={statusTone(a.risk)}>{a.risk} risk</Badge>}
                          </div>
                          <div className="mt-2.5 line-clamp-2 text-[12px] leading-snug text-muted">{a.note}</div>
                          <div className="mt-3 flex items-center justify-between border-t border-hair pt-2.5">
                            <span className="text-[11px] text-faint">{relLabel(a.received)}</span>
                            {stage !== "Paid" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advance(a);
                                }}
                                className="flex items-center gap-1 text-[12px] font-semibold text-navy opacity-0 transition group-hover:opacity-100 hover:text-red"
                              >
                                Advance <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={!!current} onClose={() => setOpen(null)} side>
        {current && (
          <div>
            <div className="flex items-center justify-between border-b border-hair px-6 py-4">
              <Badge tone="navy">{current.stage}</Badge>
              <CloseButton onClick={() => setOpen(null)} />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Avatar name={current.company} size={52} className="!rounded-2xl" />
                <div>
                  <h2 className="font-display text-[26px] leading-tight text-navy">{current.company}</h2>
                  <div className="text-[13px] text-muted">{current.contact}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-paper p-4">
                  <div className="text-[12px] text-faint">Tier applied for</div>
                  <div className="text-[15px] font-semibold text-navy">{tierById(current.tier)?.name}</div>
                  <div className="text-[12px] text-muted">{aed(tierById(current.tier)!.price)} / year</div>
                </div>
                <div className="rounded-xl bg-paper p-4">
                  <div className="text-[12px] text-faint">Founding status</div>
                  <div className="text-[15px] font-semibold text-navy">{current.founding ? "Eligible" : "Not eligible"}</div>
                  <div className="text-[12px] text-muted">Received {relLabel(current.received).toLowerCase()}</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-hair p-4 text-[13.5px] leading-relaxed text-navy-2">{current.note}</div>

              <div className="eyebrow mt-8 mb-3">Steps</div>
              <ol className="space-y-2">
                {APP_STAGES.map((s, i) => {
                  const idx = APP_STAGES.indexOf(current.stage);
                  const done = i <= idx;
                  return (
                    <li key={s} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px]", i === idx ? "bg-paper font-semibold text-navy" : done ? "text-navy" : "text-faint")}>
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", done ? "bg-navy text-white" : "border border-line")}>{done ? <CheckCircle2 size={14} /> : i + 1}</span>
                      {s}
                      <span className="ml-auto text-[12px] font-normal text-faint">{STAGE_HINT[s]}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => toast({ title: "Calendly link sent", body: `to ${current.contact}`, tone: "info" })}>
                  <CalendarClock size={15} /> Intro call
                </Button>
                <Button variant="secondary" href="/admin/compliance">
                  <ShieldCheck size={15} /> KYC case
                </Button>
                {current.stage !== "Paid" && (
                  <Button variant="dark" className="col-span-2" onClick={() => advance(current)}>
                    <Send size={15} /> Move to {APP_STAGES[APP_STAGES.indexOf(current.stage) + 1]}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
