"use client";

import { Handshake, Landmark, LifeBuoy, Users } from "lucide-react";
import { Avatar, Button, EventArt } from "@/components/ui";
import { Container, PageHero, Reveal, SectionHead } from "@/components/site";
import { useStore } from "@/lib/store";

const STEPS = [
  { n: "01", t: "Member-led", b: "Members set the Chamber’s priorities through an elected board and open roundtables." },
  { n: "02", t: "Independent", b: "Funded by membership and partnerships, and free to speak for British business in the emirate." },
  { n: "03", t: "Practical", b: "Every event and briefing is designed to leave members with a useful contact or a clear next step." },
];

export default function About() {
  const sponsors = useStore((s) => s.sponsors).filter((s) => s.stage === "Active" || s.stage === "Signed");
  return (
    <>
      <PageHero eyebrow="About the Chamber" title={<>British business, rooted in Ras Al Khaimah.</>} intro="The British Chamber of Commerce Ras Al Khaimah brings together British companies and professionals building their future in the emirate." photo="desert" />

      <Container className="mt-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <SectionHead eyebrow="What we do" title="Connect. Represent. Support." />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { i: Handshake, t: "Connect", b: "A year-round programme of events that puts members in the same room as each other, government and investors." },
              { i: Landmark, t: "Represent", b: "A clear voice for British business with Ras Al Khaimah’s authorities and with the UK." },
              { i: LifeBuoy, t: "Support", b: "Introductions, briefings and practical guidance on setting up, hiring and compliance." },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-hair bg-white p-6 shadow-[var(--shadow-card)]">
                  <x.i size={20} className="text-copper" />
                  <h3 className="font-display mt-5 text-[24px] text-navy">{x.t}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{x.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>

      <Container className="mt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <EventArt art="dusk" photo="networking" width={900} className="aspect-[5/4] rounded-[28px]" />
          </Reveal>
          <div>
            <SectionHead eyebrow="How we work" title="Built by members, for members." />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.06}>
                  <div className="flex gap-5 border-t border-hair pt-6">
                    <span className="font-mono text-[13px] text-copper-ink">{s.n}</span>
                    <div>
                      <h3 className="text-[17px] font-semibold text-navy">{s.t}</h3>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{s.b}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container className="mt-24">
        <SectionHead eyebrow="Founding board" title="The people behind the Chamber." intro="Board members will be announced at the launch evening." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Chair", "Vice Chair", "Treasurer", "Board member"].map((r, i) => (
            <Reveal key={r} delay={i * 0.05}>
              <div className="rounded-3xl border border-dashed border-line bg-white/60 p-6 text-center">
                <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-stone text-faint">
                  <Users size={26} />
                </span>
                <div className="mt-4 text-[15px] font-semibold text-navy">To be announced</div>
                <div className="text-[13px] text-muted">{r}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="mt-24">
        <SectionHead eyebrow="Partners and sponsors" title="With thanks to our founding partners." action={<Button variant="dark" href="/sponsorship">Become a partner</Button>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-hair bg-white p-5">
              <Avatar name={s.name} size={44} className="!rounded-xl" />
              <div>
                <div className="font-display text-[19px] text-navy">{s.name}</div>
                <div className="text-[12.5px] text-muted">
                  {s.level} partner · {s.sector}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
