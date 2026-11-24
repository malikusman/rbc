"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Clock, MapPin, Globe, CalendarCheck, Video, Mail } from "lucide-react";
import { Badge, Button, Card, EventArt, Field, Input, Modal, Select, Textarea, Toggle } from "@/components/ui";
import { DateBlock } from "@/components/member";
import { SPONSORS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, rel } from "@/lib/utils";

const STEPS = ["Details", "Date & venue", "Tickets", "Sponsor & publish"];
const COVERS = [
  { art: "dusk", photo: "banquet" },
  { art: "dawn", photo: "networking" },
  { art: "sea", photo: "coffeeMeeting" },
  { art: "stone", photo: "presenter" },
  { art: "ember", photo: "jebelJais" },
] as const;
type Cover = (typeof COVERS)[number];

export default function NewEvent() {
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    title: "Spring trade networking",
    type: "Networking",
    summary: "An evening for members and visiting UK businesses to meet over drinks.",
    date: rel(52, 18, 30).slice(0, 10),
    time: "18:30",
    venue: "The Harbour Club, Al Hamra",
    hybrid: false,
    capacity: 120,
    member: 120,
    guest: 220,
    sponsor: "s2",
    cover: COVERS[1] as Cover,
    wp: true,
    newsletter: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const start = new Date(`${f.date}T${f.time}:00`).toISOString();

  return (
    <div>
      <Link href="/admin/events" className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> Events
      </Link>
      <h1 className="font-display mb-8 text-[36px] text-navy md:text-[40px]">Create an event</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex gap-2">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} className="group flex-1 text-left">
                <div className="h-1 overflow-hidden rounded-full bg-stone">
                  <motion.div className="h-full bg-navy" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                </div>
                <div className={cn("mt-2 text-[12.5px] font-medium", i === step ? "text-navy" : "text-faint group-hover:text-muted")}>
                  {i + 1}. {s}
                </div>
              </button>
            ))}
          </div>

          <Card className="p-7">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="space-y-5">
                {step === 0 && (
                  <>
                    <Field label="Event title">
                      <Input value={f.title} onChange={(e) => set("title", e.target.value)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Type">
                        <Select value={f.type} onChange={(e) => set("type", e.target.value)}>
                          {["Networking", "Briefing", "Social", "Leadership", "Trade"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Cover style">
                        <div className="flex gap-2">
                          {COVERS.map((c) => (
                            <button key={c.photo} aria-label={`Cover: ${c.photo}`} onClick={() => set("cover", c)} className={cn("h-11 flex-1 overflow-hidden rounded-xl ring-offset-2 transition", f.cover.photo === c.photo && "ring-2 ring-navy")}>
                              <EventArt art={c.art} photo={c.photo} width={120} className="h-full w-full" />
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                    <Field label="Short description" hint="Shown on cards, the website and in the newsletter">
                      <Textarea value={f.summary} onChange={(e) => set("summary", e.target.value)} />
                    </Field>
                  </>
                )}
                {step === 1 && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Date">
                        <Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
                      </Field>
                      <Field label="Start time">
                        <Input type="time" value={f.time} onChange={(e) => set("time", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Venue">
                      <Select value={f.venue} onChange={(e) => set("venue", e.target.value)}>
                        {["The Harbour Club, Al Hamra", "Ras Coast Beach Resort — Terrace", "RAK Business Centre, Level 12", "Jebel Jais Summit Lodge", "Marlow House, Mina Al Arab"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </Select>
                    </Field>
                    <div className="flex items-center justify-between rounded-xl border border-hair p-4">
                      <div>
                        <div className="text-[14px] font-medium text-navy">Also run online</div>
                        <div className="text-[12.5px] text-muted">Creates a Microsoft Teams link for remote guests</div>
                      </div>
                      <Toggle checked={f.hybrid} onChange={(v) => set("hybrid", v)} label="Hybrid" />
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <Field label="Capacity">
                      <Input type="number" value={f.capacity} onChange={(e) => set("capacity", +e.target.value)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Member price (AED)" hint="0 = free for members">
                        <Input type="number" value={f.member} onChange={(e) => set("member", +e.target.value)} />
                      </Field>
                      <Field label="Guest price (AED)">
                        <Input type="number" value={f.guest} onChange={(e) => set("guest", +e.target.value)} />
                      </Field>
                    </div>
                    <div className="rounded-xl bg-paper p-4 text-[13px] text-muted">
                      Prices exclude 5% VAT. Payments go through RAKBANKpay (cards, Apple Pay, Google Pay, Aani); business buyers receive a UAE e-invoice automatically.
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Field label="Sponsor">
                      <Select value={f.sponsor} onChange={(e) => set("sponsor", e.target.value)}>
                        <option value="">No sponsor</option>
                        {SPONSORS.filter((s) => s.stage === "Active").map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} · {s.level}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    {[
                      { k: "wp" as const, t: "Publish to britishchamberrak.net", d: "Appears in the WordPress events listing" },
                      { k: "newsletter" as const, t: "Feature in the next Weekly Update", d: "Added to the Mailchimp campaign draft" },
                    ].map((x) => (
                      <div key={x.k} className="flex items-center justify-between rounded-xl border border-hair p-4">
                        <div>
                          <div className="text-[14px] font-medium text-navy">{x.t}</div>
                          <div className="text-[12.5px] text-muted">{x.d}</div>
                        </div>
                        <Toggle checked={f[x.k]} onChange={(v) => set(x.k, v)} label={x.t} />
                      </div>
                    ))}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between border-t border-hair pt-5">
              <Button variant="quiet" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="dark" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setDone(true)}>
                  Publish event
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="eyebrow mb-3">Live preview</div>
          <div className="overflow-hidden rounded-2xl border border-hair bg-white shadow-[var(--shadow-lift)]">
            <EventArt
              art={f.cover.art}
              photo={f.cover.photo}
              width={760}
              className="h-44"
              label={
                <div className="flex h-full flex-col justify-between p-4">
                  <DateBlock iso={start} light />
                  <span className="self-start rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">{f.type}</span>
                </div>
              }
            />
            <div className="p-5">
              <motion.h3 key={f.title} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-display text-[21px] leading-snug text-navy">
                {f.title || "Untitled event"}
              </motion.h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.summary}</p>
              <div className="mt-3 space-y-1.5 text-[13px] text-muted">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-faint" /> {new Date(start).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {f.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-faint" /> {f.venue}
                </div>
                {f.hybrid && (
                  <div className="flex items-center gap-2 text-info">
                    <Video size={13} /> Online via Teams
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-hair pt-4 text-[13px]">
                <span className="text-faint">0 of {f.capacity} places</span>
                <span className="font-semibold text-navy">{f.member === 0 ? "Free for members" : aed(f.member)}</span>
              </div>
              {f.sponsor && <div className="mt-2 text-[11.5px] text-faint">Supported by {SPONSORS.find((s) => s.id === f.sponsor)?.name}</div>}
            </div>
          </div>
        </div>
      </div>

      <Modal open={done} onClose={() => setDone(false)}>
        <div className="p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ok-soft text-ok">
            <Check size={22} />
          </div>
          <h3 className="font-display text-[28px] text-navy">Event published</h3>
          <p className="mt-1 text-[14px] text-muted">{f.title} is live. Here’s where it went:</p>
          <ul className="mt-6 space-y-3">
            {[
              { i: Globe, t: "Website events page (WordPress)", on: f.wp },
              { i: CalendarCheck, t: "Member portal and calendar feeds", on: true },
              { i: Mail, t: "Weekly Update draft in Mailchimp", on: f.newsletter },
              { i: Video, t: "Microsoft Teams meeting created", on: f.hybrid },
            ]
              .filter((x) => x.on)
              .map((x, idx) => (
                <motion.li key={x.t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.12 }} className="flex items-center gap-3 text-[14px] text-navy">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
                    <x.i size={15} />
                  </span>
                  {x.t}
                  <Badge tone="ok" className="ml-auto">
                    Done
                  </Badge>
                </motion.li>
              ))}
          </ul>
          <div className="mt-8 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDone(false)}>
              Keep editing
            </Button>
            <Button
              variant="dark"
              className="flex-1"
              onClick={() => {
                toast({ title: "Event published", body: f.title });
                router.push("/admin/events");
              }}
            >
              Back to events
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
