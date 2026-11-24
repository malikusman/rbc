"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CalendarClock, ShieldCheck, Sparkles } from "lucide-react";
import { Button, EventArt, Field, Input, Select } from "@/components/ui";
import { Container } from "@/components/site";
import { TIERS, type TierId } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn } from "@/lib/utils";

const STEPS = ["Membership", "Your business", "About you", "Intro call", "Review"];
const SECTORS = ["Consulting", "Legal", "Accounting & finance", "Construction & engineering", "Hospitality & tourism", "Education", "Healthcare", "Logistics & maritime", "Real estate", "Technology", "Creative", "Other"];

function slots() {
  const out: { day: string; date: Date }[] = [];
  const d = new Date();
  while (out.length < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push({ day: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), date: new Date(d) });
  }
  return out;
}

function JoinFlow() {
  const params = useSearchParams();
  const addApplication = useStore((s) => s.addApplication);
  const initialTier = (TIERS.find((t) => t.id === params.get("tier"))?.id ?? "business") as TierId;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const days = useMemo(slots, []);
  const [f, setF] = useState({
    tier: initialTier,
    company: "",
    sector: "Consulting",
    emirate: "RAK Mainland",
    licence: "",
    trn: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    day: 0,
    time: "10:00",
    terms: false,
    news: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const tier = TIERS.find((t) => t.id === f.tier)!;
  const individual = f.tier === "individual";

  const canNext = [true, individual ? true : !!f.company.trim(), !!f.name.trim() && f.email.includes("@"), true, f.terms][step];

  const submit = () => {
    addApplication({
      company: individual && !f.company ? f.name : f.company,
      contact: f.name,
      email: f.email,
      tier: f.tier,
      sector: f.sector,
      emirate: f.emirate,
      note: `Intro call booked for ${days[f.day].day} at ${f.time} · applied on the website`,
    });
    setDone(true);
  };

  if (done)
    return (
      <Container className="pt-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-[32px] border border-hair bg-white p-10 text-center shadow-[var(--shadow-lift)] md:p-14">
          <svg width="76" height="76" viewBox="0 0 72 72" className="mx-auto">
            <motion.circle cx="36" cy="36" r="32" fill="none" stroke="#2F7A55" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
            <motion.path d="M23 37 L32 46 L50 27" fill="none" stroke="#2F7A55" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5 }} />
          </svg>
          <h1 className="font-display mt-6 text-[40px] leading-tight text-navy">Application received.</h1>
          <p className="mt-3 text-[16px] text-muted">
            Thank you, {f.name.split(" ")[0]}. We’ve sent a confirmation to {f.email} and a calendar invite for {days[f.day].day} at {f.time}.
          </p>
          <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
            {[
              { t: "Intro call", b: `${days[f.day].day}, ${f.time} — 20 minutes with the membership team` },
              { t: "Company checks", b: "Trade licence and ownership, usually within two working days" },
              { t: "Invoice and welcome", b: `${aed(tier.price)} + VAT by secure payment link, then your digital card` },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold", i === 0 ? "bg-navy text-white" : "bg-stone text-navy")}>{i + 1}</span>
                <div>
                  <div className="text-[15px] font-semibold text-navy">{s.t}</div>
                  <div className="text-[13.5px] text-muted">{s.b}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" href="/">
              Back to the website
            </Button>
            <Button variant="dark" href="/admin/applications">
              <Sparkles size={15} /> See it in the BCC RAK console
            </Button>
          </div>
          <p className="mt-4 text-[12px] text-faint">Demo: your application now appears in the staff pipeline.</p>
        </motion.div>
      </Container>
    );

  return (
    <Container className="pt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <Link href="/membership" className="inline-flex items-center gap-2 text-[13.5px] font-medium text-muted hover:text-navy">
            <ArrowLeft size={15} /> Membership
          </Link>
          <h1 className="font-display mt-5 text-[42px] leading-tight text-navy md:text-[52px]">Join the Chamber</h1>
          <p className="mt-2 text-[16px] text-muted">About two minutes. Founding status applies to applications received before the launch evening.</p>

          <div className="mt-8 flex gap-2" role="list" aria-label="Progress">
            {STEPS.map((s, i) => (
              <div key={s} role="listitem" className="flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-stone">
                  <motion.div className="h-full bg-red" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                </div>
                <div className={cn("mt-2 hidden text-[12px] sm:block", i === step ? "font-semibold text-navy" : "text-faint")}>{s}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-hair bg-white p-7 shadow-[var(--shadow-card)] md:p-9">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
                {step === 0 && (
                  <div className="grid gap-3">
                    {TIERS.map((t) => (
                      <button key={t.id} onClick={() => set("tier", t.id)} className={cn("flex items-center gap-4 rounded-2xl border p-5 text-left transition", f.tier === t.id ? "border-navy ring-1 ring-navy" : "border-hair hover:border-line")}>
                        <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", f.tier === t.id ? "border-navy bg-navy" : "border-line")}>{f.tier === t.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>
                        <div className="flex-1">
                          <div className="text-[16px] font-semibold text-navy">{t.name}</div>
                          <div className="text-[13.5px] text-muted">{t.blurb}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-[22px] text-navy">{aed(t.price)}</div>
                          <div className="text-[11.5px] text-faint">per year + VAT</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={individual ? "Company (optional)" : "Company name"} className="sm:col-span-2">
                      <Input value={f.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" placeholder="e.g. Harrow & Gulf Consulting" />
                    </Field>
                    <Field label="Sector">
                      <Select value={f.sector} onChange={(e) => set("sector", e.target.value)}>
                        {SECTORS.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    </Field>
                    <Field label="Licensed in">
                      <Select value={f.emirate} onChange={(e) => set("emirate", e.target.value)}>
                        {["RAK Mainland", "RAKEZ", "RAK ICC", "RAK Maritime City", "Another emirate", "Not yet licensed"].map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    </Field>
                    <Field label="Trade licence number" hint="We’ll ask for a copy after your call">
                      <Input value={f.licence} onChange={(e) => set("licence", e.target.value)} />
                    </Field>
                    <Field label="TRN (optional)" hint="For VAT invoices and e-invoicing">
                      <Input value={f.trn} onChange={(e) => set("trn", e.target.value)} className="font-mono" />
                    </Field>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
                    <Field label="Job title"><Input value={f.role} onChange={(e) => set("role", e.target.value)} autoComplete="organization-title" /></Field>
                    <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>
                    <Field label="Mobile" hint="For WhatsApp reminders"><Input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+971" /></Field>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-navy"><CalendarClock size={16} /> Book a 20-minute intro call</div>
                    <p className="mt-1 text-[13.5px] text-muted">Powered by Calendly in production. Times are Gulf Standard Time.</p>
                    <div className="mt-5 grid grid-cols-5 gap-2">
                      {days.map((d, i) => (
                        <button key={d.day} onClick={() => set("day", i)} className={cn("rounded-xl border px-2 py-3 text-center text-[13px] transition", f.day === i ? "border-navy bg-navy text-white" : "border-hair hover:border-line")}>
                          {d.day.split(" ")[0]}
                          <div className={cn("font-display text-[20px]", f.day === i ? "text-white" : "text-navy")}>{d.date.getDate()}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["09:30", "10:00", "11:30", "14:00", "15:30", "16:30"].map((t) => (
                        <button key={t} onClick={() => set("time", t)} className={cn("h-10 rounded-xl border px-4 font-mono text-[13px] transition", f.time === t ? "border-red bg-red text-white" : "border-hair hover:border-line")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <dl className="grid gap-x-6 gap-y-4 text-[14px] sm:grid-cols-2">
                      {[
                        ["Membership", `${tier.name} · ${aed(tier.price)} + VAT`],
                        ["Company", f.company || "—"],
                        ["Sector / licence", `${f.sector} · ${f.emirate}`],
                        ["Contact", `${f.name}${f.role ? `, ${f.role}` : ""}`],
                        ["Email", f.email],
                        ["Intro call", `${days[f.day].day} at ${f.time}`],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[12px] text-faint">{k}</dt>
                          <dd className="font-medium text-navy">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-6 space-y-3 border-t border-hair pt-5 text-[14px]">
                      <label className="flex items-start gap-3">
                        <input type="checkbox" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-1 h-4 w-4 accent-navy" />
                        <span className="text-navy-2">I agree to the membership terms and to the Chamber carrying out standard company checks (trade licence, ownership and sanctions screening).</span>
                      </label>
                      <label className="flex items-start gap-3">
                        <input type="checkbox" checked={f.news} onChange={(e) => set("news", e.target.checked)} className="mt-1 h-4 w-4 accent-navy" />
                        <span className="text-navy-2">Send me the Weekly Update.</span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-between border-t border-hair pt-6">
              <Button variant="quiet" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                <ArrowLeft size={15} /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="dark" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Continue <ArrowRight size={15} />
                </Button>
              ) : (
                <Button variant="primary" onClick={submit} disabled={!canNext}>
                  Submit application
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <EventArt art="dusk" photo="networking" width={840} className="aspect-[4/5] rounded-[28px]" label={
              <div className="flex h-full flex-col justify-end p-7 text-white">
                <div className="text-[12px] font-semibold tracking-[0.14em] text-[#F0C9A6] uppercase">{tier.name} membership</div>
                <div className="font-display mt-2 text-[30px] leading-tight">{aed(tier.price)} <span className="text-[16px] text-white/70">/ year</span></div>
                <ul className="mt-4 space-y-2 text-[13.5px] text-white/85">
                  {tier.benefits.map((b) => <li key={b} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#F0C9A6]" /> {b}</li>)}
                </ul>
              </div>
            } />
            <div className="mt-4 flex items-center gap-2 px-1 text-[12.5px] text-muted"><ShieldCheck size={14} /> Your details are kept private and used only for your application.</div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

export default function Join() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <JoinFlow />
    </Suspense>
  );
}
