"use client";

import { Check, BarChart3, Megaphone, Mic, Ticket } from "lucide-react";
import { Button, EventArt } from "@/components/ui";
import { Container, PageHero, Reveal, SectionHead } from "@/components/site";
import { SPONSOR_LEVELS } from "@/lib/content";
import { aed, cn } from "@/lib/utils";

export default function Sponsorship() {
  return (
    <>
      <PageHero eyebrow="Partnerships" title={<>Put your brand in the room.</>} intro="Annual and event partnerships for organisations that want to reach the British business community in Ras Al Khaimah." photo="banquet">
        <Button variant="primary" size="lg" href="/partner">
          Enquire now
        </Button>
      </PageHero>

      <Container className="mt-24">
        <SectionHead eyebrow="Why partner" title="Visibility you can measure." intro="Every partner gets a private portal showing contract value and dates, benefits delivered, event attendance and opted-in leads — so you always know what your partnership is doing." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Megaphone, t: "Brand presence", b: "Stage, print, newsletter and portal placements across the year." },
            { i: Mic, t: "Thought leadership", b: "Speaking slots and hosted roundtables with senior members." },
            { i: Ticket, t: "Hospitality", b: "Complimentary tickets for your clients and team." },
            { i: BarChart3, t: "Reporting", b: "Live delivery tracking and quarterly member-insight reports." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-hair bg-white p-6 shadow-[var(--shadow-card)]">
                <x.i size={20} className="text-copper" />
                <h3 className="font-display mt-5 text-[22px] text-navy">{x.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{x.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <SectionHead eyebrow="Annual partnerships" title="Three levels. Tailored to you." intro="Indicative prices exclude VAT. Annual partners also receive Corporate membership." center />
        <div className="grid gap-5 lg:grid-cols-3">
          {SPONSOR_LEVELS.map((l, i) => (
            <Reveal key={l.level} delay={i * 0.06}>
              <div className={cn("flex h-full flex-col rounded-[28px] border p-8", i === 0 ? "border-navy bg-navy text-white" : "border-hair bg-white")}>
                <div className={cn("text-[15px] font-semibold", i === 0 ? "text-[#F0C9A6]" : "text-copper-ink")}>{l.level}</div>
                <div className="font-display mt-4 text-[42px] leading-none">{aed(l.price)}</div>
                <div className={cn("mt-1.5 text-[13px]", i === 0 ? "text-white/60" : "text-faint")}>per year, from</div>
                <p className={cn("mt-5 text-[14.5px]", i === 0 ? "text-white/75" : "text-muted")}>{l.blurb}</p>
                <ul className="mt-6 space-y-3 text-[14px]">
                  {l.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <Check size={16} className={cn("mt-0.5 shrink-0", i === 0 ? "text-[#F0C9A6]" : "text-ok")} /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Button variant={i === 0 ? "primary" : "dark"} size="lg" className="w-full" href={`/partner?level=${l.level}`}>
                    Enquire about {l.level}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <div className="grid items-center gap-10 rounded-[32px] border border-hair bg-white p-8 md:p-12 lg:grid-cols-[1fr_1.1fr]">
          <EventArt art="dawn" photo="auditorium" width={800} className="aspect-[4/3] rounded-[24px]" />
          <div>
            <div className="eyebrow mb-3 !text-red">Event partnerships</div>
            <h2 className="font-display text-[36px] leading-tight text-navy md:text-[44px]">Back a single event.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">Breakfasts, briefings, the launch evening and the annual gala are all open to event partners. We’ll shape a package around your audience and objectives.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="dark" size="lg" href="/partner?level=Event">
                Discuss an event
              </Button>
              <Button variant="secondary" size="lg" href="/events">
                See upcoming events
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
