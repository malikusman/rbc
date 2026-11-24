"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Handshake, ShieldCheck, Receipt, IdCard, Sparkles } from "lucide-react";
import { Avatar, EventArt, Logo } from "@/components/ui";
import { ME_MEMBER, ME_SPONSOR, STAFF } from "@/lib/data";

const ROLES = [
  {
    href: "/member",
    title: "Member",
    who: ME_MEMBER.name,
    sub: "Managing Director, Thames & Hajar Engineering",
    blurb: "Book events, carry your membership card and pay invoices.",
    icon: IdCard,
  },
  {
    href: "/sponsor",
    title: "Sponsor & partner",
    who: ME_SPONSOR.name,
    sub: "Head of Marketing, Meridian Bank RAK",
    blurb: "See sponsorship value, benefits delivered and event results.",
    icon: Handshake,
  },
  {
    href: "/admin",
    title: "BCC RAK team",
    who: STAFF.admin.name,
    sub: "Executive Director",
    blurb: "Run members, events, billing, compliance and the CRM.",
    icon: ShieldCheck,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function SignIn() {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.08fr_1fr]">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-navy text-white lg:block">
        <EventArt art="dusk" photo="jebelJais" width={1200} priority overlay="none" className="!absolute inset-0 opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/40" />
        <Ridges />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex items-center gap-3 text-[13px] tracking-wide text-white/60">
            <span className="h-px w-8 bg-copper" /> BCC RAK Hub
          </motion.div>

          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="font-display text-[56px] leading-[1.02] xl:text-[68px]"
            >
              British business,
              <br />
              <span className="italic text-[#E9C7A8]">in one place.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease }} className="mt-6 max-w-md text-[16px] leading-relaxed text-white/70">
              Membership, events, sponsorship and billing for the British Chamber of Commerce Ras Al Khaimah — on one calm, connected platform.
            </motion.p>

            <motion.ul initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }} className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4">
              {[
                { icon: CalendarDays, t: "Events & bookings" },
                { icon: IdCard, t: "Memberships & renewals" },
                { icon: Receipt, t: "RAK payments & e-invoicing" },
                { icon: Sparkles, t: "Sponsor value, tracked" },
              ].map(({ icon: Icon, t }) => (
                <motion.li key={t} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }} className="flex items-center gap-3 text-[14px] text-white/80">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon size={15} />
                  </span>
                  {t}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="flex items-end justify-between text-[12px] text-white/40">
            <span>Ras Al Khaimah, United Arab Emirates</span>
            <span>Demo build · Pebble Intelligent Solutions</span>
          </div>
        </div>
      </div>

      {/* Right: sign in */}
      <div className="flex items-center justify-center px-6 py-12 md:px-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="w-full max-w-[440px]">
          <div className="flex items-center justify-between">
            <Logo width={190} />
            <Link href="/" className="text-[13px] font-medium text-muted hover:text-navy">← Website</Link>
          </div>
          <h2 className="font-display mt-10 text-[34px] leading-tight text-navy">Welcome back</h2>
          <p className="mt-2 text-[15px] text-muted">Sign in to the member area of the Chamber.</p>

          <div className="mt-8 grid grid-cols-2 gap-2.5">
            <button className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-[13.5px] font-medium text-navy transition hover:border-navy-3/40">
              <MsLogo /> Microsoft
            </button>
            <button className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-[13.5px] font-medium text-navy transition hover:border-navy-3/40">
              <span className="inline-flex h-5 items-center rounded bg-[#1E3A2F] px-1.5 text-[9.5px] font-bold tracking-wide text-white">UAE</span> UAE Pass
            </button>
          </div>

          <div className="my-7 flex items-center gap-3 text-[12px] text-faint">
            <span className="h-px flex-1 bg-hair" /> or explore the demo as <span className="h-px flex-1 bg-hair" />
          </div>

          <motion.div initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }} className="space-y-2.5">
            {ROLES.map((r) => (
              <motion.div key={r.href} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}>
                <Link
                  href={r.href}
                  className="group flex items-center gap-4 rounded-2xl border border-hair bg-white p-4 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-line hover:shadow-[var(--shadow-lift)]"
                >
                  <Avatar name={r.who} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-navy">{r.title}</span>
                      <span className="text-[12px] text-faint">· {r.who}</span>
                    </div>
                    <div className="mt-0.5 text-[13px] leading-snug text-muted">{r.blurb}</div>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper text-navy transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-navy group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 text-center text-[12px] leading-relaxed text-faint">
            Demo data only. Payments use a simulated RAK gateway — no real cards are charged.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function MsLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function Ridges() {
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="82%" cy="18%" r="45%">
          <stop offset="0" stopColor="#B5713E" stopOpacity="0.35" />
          <stop offset="1" stopColor="#14213A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="900" fill="url(#glow)" />
      <motion.circle cx="660" cy="150" r="44" fill="#E9C7A8" initial={{ opacity: 0, cy: 180 }} animate={{ opacity: 0.85, cy: 150 }} transition={{ duration: 2, ease }} />
      {lines.map((i) => {
        const y = 560 + i * 24;
        const d = `M0 ${y} L120 ${y - 70 + (i % 3) * 8} L210 ${y - 30} L330 ${y - 130 + i * 3} L430 ${y - 50} L520 ${y - 95} L640 ${y - 20} L800 ${y - 75}`;
        return (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={i === 2 ? "#B8322A" : "#ffffff"}
            strokeOpacity={i === 2 ? 0.9 : 0.06 + (14 - i) * 0.012}
            strokeWidth={i === 2 ? 1.6 : 1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.1 + i * 0.06, ease }}
          />
        );
      })}
    </svg>
  );
}
