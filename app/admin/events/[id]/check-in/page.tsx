"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ScanLine, Search, UserCheck } from "lucide-react";
import { Avatar, Badge, Card } from "@/components/ui";
import { ATTENDEES, eventById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, fmtTime } from "@/lib/utils";

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const e = eventById(id) ?? eventById("e2")!;
  const checkins = useStore((s) => s.checkins);
  const toggle = useStore((s) => s.toggleCheckin);
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState<(typeof ATTENDEES)[number] | null>(null);
  const [scanning, setScanning] = useState(false);

  const list = useMemo(() => ATTENDEES.filter((a) => (a.name + a.company).toLowerCase().includes(q.toLowerCase())), [q]);
  const pct = checkins.length / ATTENDEES.length;

  const scan = () => {
    const next = ATTENDEES.find((a) => !checkins.includes(a.id));
    if (!next) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toggle(next.id);
      setFlash(next);
      setTimeout(() => setFlash(null), 1800);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/admin/events/${e.id}`} className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> {e.title}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Phone-style scanner */}
        <div className="mx-auto w-full max-w-[380px]">
          <div className="overflow-hidden rounded-[36px] border-[10px] border-navy bg-navy shadow-[var(--shadow-pop)]">
            <div className="relative aspect-[9/14] overflow-hidden bg-[#0B1424]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-4 text-white">
                <div>
                  <div className="text-[11px] text-white/50">Check-in · {fmtTime(e.start)}</div>
                  <div className="text-[14px] font-semibold">{e.title}</div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold tabular">
                  {checkins.length}/{ATTENDEES.length}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  {["top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((c) => (
                    <span key={c} className={cn("absolute h-10 w-10 border-white/80", c)} />
                  ))}
                  <motion.div className="absolute inset-x-4 h-0.5 bg-red shadow-[0_0_20px_4px_rgba(184,50,42,0.6)]" animate={{ top: ["10%", "90%", "10%"] }} transition={{ duration: scanning ? 0.9 : 2.6, repeat: Infinity, ease: "easeInOut" }} />
                </div>
              </div>

              <AnimatePresence>
                {flash && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ok/95 text-white">
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                      <Check size={40} strokeWidth={3} />
                    </motion.div>
                    <div className="font-display text-[28px]">{flash.name}</div>
                    <div className="text-[14px] text-white/80">{flash.company}</div>
                    <div className="mt-3 rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold">{flash.ticket}{flash.note ? ` · ${flash.note}` : ""}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <button onClick={scan} disabled={scanning || pct === 1} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold text-navy transition active:scale-[0.98] disabled:opacity-60">
                  <ScanLine size={18} /> {pct === 1 ? "Everyone is in" : scanning ? "Scanning…" : "Scan next ticket"}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-faint">Works on any phone at the door — no app to install.</p>
        </div>

        {/* Guest list */}
        <Card className="flex flex-col overflow-hidden">
          <div className="border-b border-hair p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[15px] font-semibold text-navy">Guest list</div>
                <div className="text-[12.5px] text-muted">Tap a name to check in manually</div>
              </div>
              <div className="text-right">
                <div className="font-display text-[30px] leading-none text-navy tabular">{Math.round(pct * 100)}%</div>
                <div className="text-[11.5px] text-faint">arrived</div>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone">
              <motion.div className="h-full rounded-full bg-ok" animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            <div className="relative mt-4">
              <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
              <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Find a guest" className="h-10 w-full rounded-xl border border-hair bg-paper/60 pr-3 pl-10 text-[13.5px] outline-none focus:border-line" />
            </div>
          </div>
          <div className="scrollbar-thin max-h-[520px] flex-1 divide-y divide-hair overflow-y-auto">
            {list.map((a) => {
              const inn = checkins.includes(a.id);
              return (
                <motion.button layout key={a.id} onClick={() => toggle(a.id)} className={cn("flex w-full items-center gap-3 px-5 py-3 text-left transition", inn ? "bg-ok-soft/50" : "hover:bg-paper/60")}>
                  <Avatar name={a.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-navy">{a.name}</div>
                    <div className="truncate text-[12px] text-muted">
                      {a.company}
                      {a.note && <span className="text-copper-ink"> · {a.note}</span>}
                    </div>
                  </div>
                  <Badge tone={a.ticket === "Sponsor" ? "copper" : a.ticket === "Speaker" ? "info" : "neutral"}>{a.ticket}</Badge>
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full border transition", inn ? "border-ok bg-ok text-white" : "border-line text-faint")}>
                    {inn ? <Check size={15} strokeWidth={3} /> : <UserCheck size={14} />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
