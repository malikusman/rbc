"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { MapPin, Clock, Users, Check, Wallet, CalendarPlus, Video } from "lucide-react";
import { cn, aed, fmtDate, fmtTime, relLabel } from "@/lib/utils";
import { Badge, EventArt, ProgressBar, QR, Crest } from "./ui";
import { COMPANIES, ME_MEMBER, sponsorById, tierById, type ChamberEvent } from "@/lib/data";
import { useRegistered, useStore, type Ticket } from "@/lib/store";
import { downloadIcs, googleCalUrl } from "@/lib/ics";

/* ------------------------------- Event card -------------------------------- */

export function DateBlock({ iso, light }: { iso: string; light?: boolean }) {
  const d = new Date(iso);
  return (
    <div className={cn("flex w-14 shrink-0 flex-col items-center rounded-xl py-1.5 text-center", light ? "bg-white/95 text-navy shadow-sm backdrop-blur" : "bg-paper text-navy")}>
      <span className="text-[10.5px] font-semibold tracking-[0.12em] text-red uppercase">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
      <span className="font-display text-[24px] leading-none">{d.getDate()}</span>
      <span className="mt-0.5 text-[10.5px] text-faint">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
    </div>
  );
}

export function EventCard({ e, href, booked }: { e: ChamberEvent; href: string; booked?: boolean }) {
  const registered = useRegistered(e.id, e.registered);
  const full = registered >= e.capacity;
  const sponsor = sponsorById(e.sponsorId);
  return (
    <Link href={href} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-white shadow-[var(--shadow-card)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
        <EventArt
          art={e.art}
          photo={e.photo}
          width={640}
          className="h-40"
          label={
            <div className="flex h-full flex-col justify-between p-4">
              <div className="flex items-start justify-between">
                <DateBlock iso={e.start} light />
                <div className="flex gap-1.5">
                  {booked && (
                    <Badge tone="ok" className="!bg-white/95">
                      <Check size={12} /> Booked
                    </Badge>
                  )}
                  {full && !booked && <Badge className="!bg-white/95 !text-navy">Waitlist</Badge>}
                </div>
              </div>
              <span className="self-start rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">{e.type}</span>
            </div>
          }
        />
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[20px] leading-snug text-navy transition-colors group-hover:text-red">{e.title}</h3>
          <div className="mt-2.5 space-y-1.5 text-[13px] text-muted">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-faint" /> {fmtDate(e.start, "weekday")} · {fmtTime(e.start)}
            </div>
            <div className="flex items-center gap-2">
              {e.area === "Online" ? <Video size={13} className="text-faint" /> : <MapPin size={13} className="text-faint" />} {e.venue}
            </div>
          </div>
          <div className="mt-auto pt-5">
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="text-faint">
                {registered} of {e.capacity} places
              </span>
              <span className="font-semibold text-navy">{e.memberPrice === 0 ? "Free for members" : aed(e.memberPrice)}</span>
            </div>
            <ProgressBar value={registered / e.capacity} color={full ? "bg-copper" : "bg-navy"} />
            {sponsor && <div className="mt-3 text-[11.5px] text-faint">Supported by {sponsor.name}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------ Membership card ---------------------------- */

export function MembershipCard({ tilt = false, className }: { tilt?: boolean; className?: string }) {
  const company = COMPANIES.find((c) => c.id === ME_MEMBER.companyId)!;
  const tier = tierById(company.tier)!;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 20 });
  const shine = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glare = useTransform(shine, (s) => `radial-gradient(circle at ${s} 0%, rgba(255,255,255,0.18), transparent 50%)`);

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        onMouseMove={(e) => {
          if (!tilt) return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={tilt ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined}
        className="relative aspect-[1.586/1] w-full overflow-hidden rounded-[22px] bg-navy text-white shadow-[0_30px_60px_-24px_rgba(20,33,58,0.55)]"
      >
        <svg viewBox="0 0 400 252" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <radialGradient id="mc-g" cx="85%" cy="10%" r="70%">
              <stop offset="0" stopColor="#B5713E" stopOpacity="0.45" />
              <stop offset="1" stopColor="#14213A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="252" fill="url(#mc-g)" />
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${200 + i * 9} L80 ${150 + i * 9} L130 ${172 + i * 9} L200 ${118 + i * 9} L262 ${165 + i * 9} L320 ${140 + i * 9} L400 ${178 + i * 9}`}
              fill="none"
              stroke={i === 0 ? "#B8322A" : "#fff"}
              strokeOpacity={i === 0 ? 0.9 : 0.07}
            />
          ))}
        </svg>
        {tilt && <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />}
        <div className="relative flex h-full flex-col justify-between p-[7%]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Crest size={30} />
              <div className="leading-tight">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">British Chamber</div>
                <div className="text-[10px] tracking-[0.18em] text-white/50 uppercase">of Commerce · RAK</div>
              </div>
            </div>
            <span className="rounded-full border border-copper/50 bg-copper/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#F0C9A6] uppercase">Founding</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="font-display truncate text-[clamp(18px,2.4vw,26px)] leading-tight">{ME_MEMBER.name}</div>
              <div className="mt-0.5 truncate text-[12px] text-white/60">{company.name}</div>
              <div className="mt-3 flex gap-5 text-[10.5px] tracking-wide text-white/50 uppercase">
                <div>
                  <div>Tier</div>
                  <div className="mt-0.5 text-[12px] font-semibold tracking-normal text-[#F0C9A6] normal-case">{tier.name}</div>
                </div>
                <div>
                  <div>Member no.</div>
                  <div className="mt-0.5 font-mono text-[12px] tracking-normal text-white normal-case">{ME_MEMBER.memberNo}</div>
                </div>
                <div className="hidden sm:block">
                  <div>Valid to</div>
                  <div className="mt-0.5 text-[12px] font-semibold tracking-normal text-white normal-case">{fmtDate(company.renews!, "short")}</div>
                </div>
              </div>
            </div>
            <div className="shrink-0 rounded-xl bg-white p-1.5">
              <QR value={`https://britishchamberrak.net/m/${ME_MEMBER.memberNo}`} size={64} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------- Ticket stub ------------------------------ */

export function TicketStub({ t, e, compact }: { t: Ticket; e: ChamberEvent; compact?: boolean }) {
  const toast = useStore((s) => s.toast);
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-hair bg-white shadow-[var(--shadow-card)] md:flex-row">
      <EventArt art={e.art} photo={e.photo} width={448} className={cn("shrink-0 md:w-56", compact ? "h-28 md:h-auto" : "h-36 md:h-auto")} label={<div className="flex h-full items-end p-4"><DateBlock iso={e.start} light /></div>} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow mb-1">{relLabel(e.start)}</div>
            <h3 className="font-display text-[21px] leading-snug text-navy">{e.title}</h3>
          </div>
          <Badge tone="ok" dot>
            Confirmed
          </Badge>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] text-muted sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <Clock size={13} className="text-faint" /> {fmtDate(e.start, "weekday")}, {fmtTime(e.start)}–{fmtTime(e.end)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={13} className="text-faint" /> {e.venue}
          </span>
          <span className="flex items-center gap-2">
            <Users size={13} className="text-faint" /> {t.qty === 1 ? "1 place" : `${t.qty} places (you + ${t.qty - 1} guest${t.qty > 2 ? "s" : ""})`}
          </span>
          <span className="font-mono text-[12px] text-faint">{t.code}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => toast({ title: "Added to Apple Wallet", body: `${e.title} · ${t.code}` })}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-navy px-3.5 text-[13px] font-medium text-white transition hover:bg-navy-2"
          >
            <Wallet size={14} /> Add to Wallet
          </button>
          <a href={googleCalUrl(e)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13px] font-medium text-navy transition hover:bg-paper">
            <CalendarPlus size={14} /> Google
          </a>
          <button onClick={() => downloadIcs(e)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13px] font-medium text-navy transition hover:bg-paper">
            <CalendarPlus size={14} /> Outlook / Apple
          </button>
        </div>
      </div>
      <div className="relative flex items-center justify-center border-t border-dashed border-line p-5 md:border-t-0 md:border-l">
        <span className="absolute -top-3 -left-3 hidden h-6 w-6 rounded-full border border-hair bg-paper md:block" />
        <span className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full border border-hair bg-paper md:block" />
        <div className="text-center">
          <QR value={t.code} size={compact ? 96 : 112} />
          <div className="mt-2 text-[11px] text-faint">Scan at the door</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Quantity stepper ----------------------------- */

export function Stepper({ value, onChange, min = 1, max = 6 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const [dir, setDir] = useState(0);
  return (
    <div className="inline-flex h-10 items-center rounded-xl border border-line bg-white">
      <button
        className="h-full w-10 text-lg text-navy disabled:text-faint"
        disabled={value <= min}
        onClick={() => {
          setDir(-1);
          onChange(value - 1);
        }}
      >
        −
      </button>
      <div className="relative h-full w-8 overflow-hidden">
        <motion.span key={value} initial={{ y: dir * 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-navy tabular">
          {value}
        </motion.span>
      </div>
      <button
        className="h-full w-10 text-lg text-navy disabled:text-faint"
        disabled={value >= max}
        onClick={() => {
          setDir(1);
          onChange(value + 1);
        }}
      >
        +
      </button>
    </div>
  );
}
