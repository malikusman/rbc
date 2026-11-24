"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button, EventArt, Field, Input, Textarea } from "@/components/ui";
import { Container } from "@/components/site";
import { useStore } from "@/lib/store";
import { aed, cn } from "@/lib/utils";
import type { SponsorLevel } from "@/lib/data";

const LEVELS: { id: SponsorLevel | "Event"; label: string; price: number; sub: string }[] = [
  { id: "Platinum", label: "Platinum", price: 150000, sub: "Headline annual partner" },
  { id: "Gold", label: "Gold", price: 75000, sub: "Own an event series" },
  { id: "Silver", label: "Silver", price: 35000, sub: "One flagship event + year-round presence" },
  { id: "Event", label: "Single event", price: 20000, sub: "Back one breakfast, briefing or evening" },
];
const GOALS = ["Brand visibility", "New clients & leads", "Thought leadership", "Hosting members", "Hiring talent", "Supporting the community"];

function PartnerForm() {
  const params = useSearchParams();
  const addSponsor = useStore((s) => s.addSponsor);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["id"]>((LEVELS.find((l) => l.id === params.get("level"))?.id ?? "Gold") as (typeof LEVELS)[number]["id"]);
  const [goals, setGoals] = useState<string[]>(["Brand visibility"]);
  const [f, setF] = useState({ company: "", sector: "", name: "", role: "", email: "", phone: "", note: "" });
  const [done, setDone] = useState(false);
  const L = LEVELS.find((l) => l.id === level)!;
  const ok = f.company.trim() && f.name.trim() && f.email.includes("@");

  if (done)
    return (
      <Container className="pt-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-[32px] border border-hair bg-white p-10 text-center shadow-[var(--shadow-lift)] md:p-14">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-ok-soft text-ok"><Check size={30} /></span>
          <h1 className="font-display mt-6 text-[40px] leading-tight text-navy">Thank you, {f.name.split(" ")[0]}.</h1>
          <p className="mt-3 text-[16px] text-muted">Omar Al Shehhi, our Partnerships Manager, will send a tailored proposal for {f.company} within two working days.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" href="/">Back to the website</Button>
            <Button variant="dark" href="/admin/sponsors"><Sparkles size={15} /> See it in the BCC RAK console</Button>
          </div>
          <p className="mt-4 text-[12px] text-faint">Demo: the enquiry now appears under Sponsors & partners → In negotiation.</p>
        </motion.div>
      </Container>
    );

  return (
    <Container className="pt-10">
      <Link href="/sponsorship" className="inline-flex items-center gap-2 text-[13.5px] font-medium text-muted hover:text-navy"><ArrowLeft size={15} /> Partnerships</Link>
      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="font-display text-[42px] leading-tight text-navy md:text-[52px]">Partner with the Chamber</h1>
          <p className="mt-2 text-[16px] text-muted">Tell us what you’d like to achieve and we’ll shape a package around it.</p>
          <div className="mt-8 rounded-[28px] border border-hair bg-white p-7 shadow-[var(--shadow-card)] md:p-9">
            <div className="text-[13px] font-medium text-navy-2">Partnership level</div>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => setLevel(l.id)} className={cn("rounded-2xl border p-4 text-left transition", level === l.id ? "border-navy ring-1 ring-navy" : "border-hair hover:border-line")}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold text-navy">{l.label}</span>
                    <span className="text-[12.5px] text-faint">from {aed(l.price)}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-muted">{l.sub}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 text-[13px] font-medium text-navy-2">What matters most?</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoals((x) => (x.includes(g) ? x.filter((y) => y !== g) : [...x, g]))} aria-pressed={goals.includes(g)} className={cn("h-9 rounded-full border px-4 text-[13px] transition", goals.includes(g) ? "border-navy bg-navy text-white" : "border-hair text-muted hover:text-navy")}>
                  {g}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Company"><Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" /></Field>
              <Field label="Sector"><Input value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })} /></Field>
              <Field label="Your name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
              <Field label="Job title"><Input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
              <Field label="Phone"><Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" placeholder="+971" /></Field>
              <Field label="Anything else?" className="sm:col-span-2"><Textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Events you’d like to support, timing, budget…" /></Field>
            </div>
            <div className="mt-8 flex justify-end border-t border-hair pt-6">
              <Button
                variant="primary"
                size="lg"
                disabled={!ok}
                onClick={() => {
                  addSponsor({ name: f.company.trim(), sector: f.sector || "Other", level: level === "Event" ? "Partner" : level, amount: L.price, contact: f.name, email: f.email, note: [goals.join(", "), f.note].filter(Boolean).join(" · "), source: "Website" });
                  setDone(true);
                }}
              >
                Send enquiry
              </Button>
            </div>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <EventArt art="dusk" photo="dinner" width={800} className="aspect-[4/5] rounded-[28px]" label={
              <div className="flex h-full flex-col justify-end p-7 text-white">
                <div className="text-[12px] font-semibold tracking-[0.14em] text-[#F0C9A6] uppercase">Every partner gets</div>
                <ul className="mt-3 space-y-2 text-[14px] text-white/90">
                  {["A private partner portal", "A named relationship manager", "Live benefit tracking", "Opted-in event leads"].map((x) => <li key={x} className="flex gap-2"><Check size={15} className="mt-0.5 text-[#F0C9A6]" /> {x}</li>)}
                </ul>
              </div>
            } />
          </div>
        </aside>
      </div>
    </Container>
  );
}

export default function Partner() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PartnerForm />
    </Suspense>
  );
}
