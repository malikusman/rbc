"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Handshake, Landmark, LifeBuoy, Mountain, Plane, Sun, Users } from "lucide-react";
import { Button, EventArt } from "@/components/ui";
import { EventCard } from "@/components/member";
import { ArrowLink, Container, Reveal, SectionHead } from "@/components/site";
import { EVENTS, TIERS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, daysFromNow, fmtDate } from "@/lib/utils";
import { ARTICLES } from "@/lib/content";
import { LanaOrb, LANA_GRADIENT, useLanaUI } from "@/components/lana";
import { suggestionsFor } from "@/lib/lana";
import { useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const WHY = [
  { icon: Landmark, title: "A place to build", body: "Mainland, free zone or an international company — Ras Al Khaimah offers clear routes to set up and grow, with costs that compare well across the UAE." },
  { icon: Plane, title: "Well connected", body: "Under an hour from Dubai International, with its own airport and port, and easy reach of the wider Gulf and the UK." },
  { icon: Sun, title: "A life worth living", body: "Beaches, desert and the Hajar mountains — including Jebel Jais, the UAE’s highest peak — on your doorstep." },
  { icon: Users, title: "A growing British community", body: "More British families and firms are choosing the emirate. The Chamber brings them together from day one." },
];

const PILLARS = [
  { icon: Handshake, title: "Connect", body: "Breakfasts, briefings and evenings where members meet each other, government and the wider business community." },
  { icon: Landmark, title: "Represent", body: "A single voice for British business in Ras Al Khaimah, working with the emirate’s authorities and the UK." },
  { icon: LifeBuoy, title: "Support", body: "Practical help for companies setting up, hiring and growing — from licensing to e-invoicing." },
];

export default function Home() {
  const sponsors = useStore((s) => s.sponsors);
  const upcoming = EVENTS.filter((e) => daysFromNow(e.start) >= 0)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 3);
  const partners = sponsors.filter((s) => s.stage === "Active" || s.stage === "Signed");
  const launch = EVENTS[0];

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <Container className="pt-4">
          <EventArt
            art="dusk"
            photo="jebelJais"
            width={1800}
            priority
            overlay="full"
            className="rounded-[32px]"
            label={
              <div className="grid min-h-[600px] items-end gap-10 p-8 text-white md:min-h-[660px] md:p-14 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E9C7A8]" /> Founding membership is open until the launch evening
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }} className="font-display max-w-3xl text-[48px] leading-[1.02] md:text-[76px]">
                    The first British business platform in <span className="italic text-[#E9C7A8]">Ras Al Khaimah.</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease }} className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80">
                    We connect, represent and support British businesses and professionals building their future in the emirate.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.24, ease }} className="mt-9 flex flex-wrap gap-3">
                    <Button variant="primary" size="lg" href="/join">
                      Become a founding member <ArrowRight size={16} />
                    </Button>
                    <Link href="/sponsorship" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-[15px] font-medium text-white backdrop-blur transition hover:bg-white/20">
                      Partner with us
                    </Link>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4, ease }} className="hidden justify-self-end lg:block">
                  <Link href={`/events/${launch.id}`} className="block w-[320px] rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition hover:bg-white/15">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">Next up</div>
                    <div className="font-display mt-2 text-[24px] leading-tight">{launch.title}</div>
                    <div className="mt-2 text-[13px] text-white/75">
                      {fmtDate(launch.start, "weekday")} · {launch.venue}
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-[#F0C9A6]">
                      Details <ArrowRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              </div>
            }
          />
        </Container>
      </section>

      {/* Partners strip */}
      <Container className="mt-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="eyebrow shrink-0">Founding partners</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {partners.slice(0, 5).map((p) => (
              <span key={p.id} className="font-display text-[19px] tracking-tight text-navy-3 transition hover:text-navy">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* Why RAK */}
      <Container className="mt-28">
        <SectionHead eyebrow="Why Ras Al Khaimah?" title={<>An emirate made for building something.</>} intro="Ras Al Khaimah combines a business-friendly set-up with a quality of life that keeps people here. Here’s why British companies are taking a closer look." />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="grid grid-cols-2 gap-4">
            <EventArt art="ember" photo="dunes" width={600} className="row-span-2 min-h-[420px] rounded-3xl" />
            <EventArt art="stone" photo="desert" width={500} className="min-h-[200px] rounded-3xl" />
            <EventArt art="sea" photo="cafe" width={500} className="min-h-[200px] rounded-3xl" />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-hair bg-white p-6 shadow-[var(--shadow-card)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-navy">
                    <w.icon size={18} />
                  </span>
                  <h3 className="font-display mt-5 text-[22px] text-navy">{w.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      {/* Pillars */}
      <section className="mt-28 bg-navy py-24 text-white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <div className="eyebrow mb-3 !text-[#E9C7A8]">What we do</div>
              <h2 className="font-display text-[40px] leading-[1.06] md:text-[52px]">British business, rooted in Ras Al Khaimah.</h2>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">An independent, member-led chamber for British companies and professionals in the emirate.</p>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#F0C9A6] hover:text-white">
                About the Chamber <ArrowRight size={15} />
              </Link>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <p.icon size={22} className="text-[#E9C7A8]" />
                    <h3 className="font-display mt-6 text-[26px]">{p.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-white/70">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Events */}
      <Container className="mt-28">
        <SectionHead eyebrow="Upcoming events" title="Meet the people building business in RAK." action={<ArrowLink href="/events">All events</ArrowLink>} />
        <div className="grid gap-5 md:grid-cols-3">
          {upcoming.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.06}>
              <EventCard e={e} href={`/events/${e.id}`} />
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Membership */}
      <Container className="mt-28">
        <div className="rounded-[32px] border border-hair bg-white p-8 shadow-[var(--shadow-card)] md:p-14">
          <SectionHead eyebrow="Membership" title={<>Join before launch. Keep founder status for life.</>} intro="Three simple tiers for individuals, growing businesses and larger organisations." action={<Button variant="dark" href="/membership">Compare memberships</Button>} />
          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.06}>
                <div className={`flex h-full flex-col rounded-3xl border p-7 ${i === 1 ? "border-navy bg-navy text-white" : "border-hair bg-paper/50"}`}>
                  <div className={`text-[14px] font-semibold ${i === 1 ? "text-[#F0C9A6]" : "text-copper-ink"}`}>{t.name}</div>
                  <div className="font-display mt-3 text-[38px] leading-none">{aed(t.price)}</div>
                  <div className={`mt-1 text-[12.5px] ${i === 1 ? "text-white/60" : "text-faint"}`}>per year + VAT · {t.seats} seat{t.seats > 1 ? "s" : ""}</div>
                  <p className={`mt-5 text-[14px] leading-relaxed ${i === 1 ? "text-white/75" : "text-muted"}`}>{t.blurb}</p>
                  <ul className="mt-5 space-y-2.5 text-[13.5px]">
                    {t.benefits.slice(0, 3).map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <Check size={15} className={`mt-0.5 shrink-0 ${i === 1 ? "text-[#F0C9A6]" : "text-ok"}`} /> {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Button variant={i === 1 ? "primary" : "secondary"} className="w-full" href={`/join?tier=${t.id}`}>
                      Apply for {t.name}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      {/* Sponsorship band */}
      <Container className="mt-28">
        <EventArt
          art="dusk"
          photo="banquet"
          width={1600}
          overlay="full"
          className="rounded-[32px]"
          label={
            <div className="flex min-h-[420px] flex-col justify-center p-8 text-white md:p-14">
              <div className="max-w-xl">
                <div className="eyebrow mb-3 !text-[#E9C7A8]">Partnerships</div>
                <h2 className="font-display text-[40px] leading-[1.06] md:text-[52px]">Put your brand in the room.</h2>
                <p className="mt-5 text-[16px] leading-relaxed text-white/80">Annual and event partnerships give your business visibility with decision-makers across Ras Al Khaimah — with every benefit tracked in your own partner portal.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" href="/partner">
                    Enquire about partnership
                  </Button>
                  <Link href="/sponsorship" className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-[15px] font-medium text-white hover:bg-white/10">
                    See packages
                  </Link>
                </div>
              </div>
            </div>
          }
        />
      </Container>

      {/* Insights */}
      <Container className="mt-28">
        <SectionHead eyebrow="From the Chamber" title="Insights for British business in RAK." action={<ArrowLink href="/insights">All insights</ArrowLink>} />
        <div className="grid gap-5 md:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.06}>
              <Link href={`/insights/${a.slug}`} className="group block">
                <EventArt art={a.art} photo={a.photo} width={640} className="aspect-[4/3] rounded-3xl transition-transform duration-500 group-hover:scale-[0.99]" />
                <div className="mt-4 text-[12px] font-semibold tracking-wide text-copper-ink uppercase">{a.category}</div>
                <h3 className="font-display mt-1.5 text-[23px] leading-snug text-navy group-hover:text-red">{a.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Ask Lana */}
      <Container className="mt-28">
        <AskLanaBand />
      </Container>

      {/* CTA */}
      <Container className="mt-28">
        <div className="grid items-center gap-8 rounded-[32px] bg-stone/70 p-8 md:p-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Mountain size={26} className="text-copper" />
            <h2 className="font-display mt-4 text-[36px] leading-tight text-navy md:text-[46px]">Let us know if you’d like to be involved.</h2>
            <p className="mt-3 max-w-xl text-[16px] text-muted">Register your interest in membership or partnership and we’ll be in touch within two working days.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button variant="primary" size="lg" href="/join">
              Apply for membership
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Contact the team
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

function AskLanaBand() {
  const setOpen = useLanaUI((s) => s.setOpen);
  const [q, setQ] = useState("");
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-hair bg-white p-8 md:p-14">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: LANA_GRADIENT }} />
      <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <LanaOrb size={120} />
        <div>
          <h2 className="font-display text-[34px] leading-tight text-navy md:text-[44px]">Have a question? Ask Lana.</h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted">Membership, events, partnerships or moving your business to Ras Al Khaimah — type or just ask out loud.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) setOpen(true, q.trim());
              setQ("");
            }}
            className="mt-6 flex max-w-xl gap-2 rounded-2xl border border-line bg-white p-1.5 focus-within:border-[#8A7BE8]"
          >
            <label htmlFor="home-lana" className="sr-only">Ask Lana</label>
            <input id="home-lana" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. How much is Business membership?" className="h-11 flex-1 bg-transparent px-3 text-[15px] text-navy outline-none placeholder:text-faint" />
            <Button variant="dark" type="submit">Ask</Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestionsFor("public").slice(0, 4).map((s) => (
              <button key={s} onClick={() => setOpen(true, s)} className="rounded-full border border-hair bg-paper/60 px-3.5 py-1.5 text-[13px] text-navy-2 transition hover:border-[#8A7BE8]">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
