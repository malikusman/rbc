"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus, CalendarClock, ClipboardCheck, PartyPopper } from "lucide-react";
import { Button, EventArt } from "@/components/ui";
import { Container, PageHero, Reveal, SectionHead } from "@/components/site";
import { TIERS } from "@/lib/data";
import { MEMBERSHIP_FAQ } from "@/lib/content";
import { aed, cn } from "@/lib/utils";

const ROWS: { label: string; v: [string | boolean, string | boolean, string | boolean] }[] = [
  { label: "Named seats", v: ["1", "3", "10"] },
  { label: "Member pricing at events", v: [true, true, true] },
  { label: "Member portal & digital card", v: [true, true, true] },
  { label: "Weekly Update & insights", v: [true, true, true] },
  { label: "Company directory listing", v: [false, true, true] },
  { label: "Complimentary event tickets", v: [false, "2 a quarter", "6 a quarter"] },
  { label: "Introductions to RAK authorities", v: [false, true, true] },
  { label: "Policy roundtable invitations", v: [false, false, true] },
  { label: "Dedicated relationship manager", v: [false, false, true] },
];

export default function Membership() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHero eyebrow="Membership" title={<>Join before launch. Keep founder status for life.</>} intro="Membership for British professionals, growing businesses and larger organisations in Ras Al Khaimah." photo="coffeeMeeting">
        <Button variant="primary" size="lg" href="/join">
          Apply now
        </Button>
      </PageHero>

      <Container className="mt-24">
        <SectionHead eyebrow="Choose your tier" title="Simple, annual membership." intro="Prices exclude 5% VAT. Founding status is free and applies to anyone who joins before the launch evening." center />
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.06}>
              <div className={cn("relative flex h-full flex-col rounded-[28px] border p-8", i === 1 ? "border-navy bg-navy text-white shadow-[var(--shadow-pop)]" : "border-hair bg-white shadow-[var(--shadow-card)]")}>
                {i === 1 && <span className="absolute -top-3 left-8 rounded-full bg-red px-3 py-1 text-[11.5px] font-semibold text-white">Most popular</span>}
                <div className={cn("text-[15px] font-semibold", i === 1 ? "text-[#F0C9A6]" : "text-copper-ink")}>{t.name}</div>
                <div className="font-display mt-4 text-[48px] leading-none">{aed(t.price)}</div>
                <div className={cn("mt-1.5 text-[13px]", i === 1 ? "text-white/60" : "text-faint")}>per year · {t.seats} seat{t.seats > 1 ? "s" : ""}</div>
                <p className={cn("mt-5 text-[14.5px] leading-relaxed", i === 1 ? "text-white/75" : "text-muted")}>{t.blurb}</p>
                <ul className="mt-6 space-y-3 text-[14px]">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <Check size={16} className={cn("mt-0.5 shrink-0", i === 1 ? "text-[#F0C9A6]" : "text-ok")} /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Button variant={i === 1 ? "primary" : "dark"} size="lg" className="w-full" href={`/join?tier=${t.id}`}>
                    Apply for {t.name}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="mt-20">
        <Reveal>
          <div className="overflow-x-auto rounded-[28px] border border-hair bg-white">
            <table className="w-full min-w-[640px] text-[14px]">
              <caption className="sr-only">Compare membership tiers</caption>
              <thead>
                <tr className="border-b border-hair text-left">
                  <th className="px-7 py-5 font-display text-[20px] font-normal text-navy">Compare tiers</th>
                  {TIERS.map((t) => (
                    <th key={t.id} className="px-4 py-5 text-center text-[14px] font-semibold text-navy">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-b border-hair/70 last:border-0">
                    <td className="px-7 py-4 text-navy-2">{r.label}</td>
                    {r.v.map((v, i) => (
                      <td key={i} className="px-4 py-4 text-center">
                        {v === true ? <Check size={17} className="mx-auto text-ok" aria-label="Included" /> : v === false ? <Minus size={16} className="mx-auto text-line" aria-label="Not included" /> : <span className="text-navy">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>

      <Container className="mt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="How to join" title="Three steps, about a week." />
            <ol className="space-y-5">
              {[
                { i: ClipboardCheck, t: "Register interest", b: "Tell us about you and your business in a two-minute form." },
                { i: CalendarClock, t: "Have a short call", b: "Pick a time that suits you. We’ll talk through what you need and run standard company checks." },
                { i: PartyPopper, t: "Welcome aboard", b: "Pay online, get your digital membership card and book your first event." },
              ].map((s, idx) => (
                <li key={s.t}>
                  <Reveal delay={idx * 0.06} className="flex gap-5 rounded-3xl border border-hair bg-white p-6">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-navy">
                      <s.i size={19} />
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold text-copper-ink">Step {idx + 1}</div>
                      <h3 className="text-[17px] font-semibold text-navy">{s.t}</h3>
                      <p className="mt-1 text-[14px] text-muted">{s.b}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
          <Reveal>
            <EventArt art="ember" photo="cafe" width={900} className="aspect-[4/5] rounded-[28px]" />
          </Reveal>
        </div>
      </Container>

      <Container className="mt-24">
        <div className="mx-auto max-w-3xl">
          <SectionHead eyebrow="Frequently asked" title="Questions about membership" center />
          <div className="divide-y divide-hair rounded-[28px] border border-hair bg-white">
            {MEMBERSHIP_FAQ.map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left">
                  <span className="text-[16px] font-semibold text-navy">{f.q}</span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-navy">{open === i ? <Minus size={15} /> : <Plus size={15} />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-7 pb-6 text-[15px] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="primary" size="lg" href="/join">
              Start your application
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
