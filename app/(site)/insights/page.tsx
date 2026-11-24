"use client";

import Link from "next/link";
import { EventArt } from "@/components/ui";
import { Container, PageHero, Reveal } from "@/components/site";
import { ARTICLES } from "@/lib/content";

export default function Insights() {
  const [lead, ...rest] = ARTICLES;
  return (
    <>
      <PageHero eyebrow="Insights" title="News and guidance for British business in RAK." photo="roundtable" />
      <Container className="mt-16">
        <Reveal>
          <Link href={`/insights/${lead.slug}`} className="group grid items-center gap-8 rounded-[28px] border border-hair bg-white p-5 md:grid-cols-2 md:p-6">
            <EventArt art={lead.art} photo={lead.photo} width={900} className="aspect-[4/3] rounded-[22px]" />
            <div className="p-2 md:p-6">
              <div className="text-[12px] font-semibold tracking-wide text-copper-ink uppercase">{lead.category} · {lead.minutes} min read</div>
              <h2 className="font-display mt-3 text-[34px] leading-tight text-navy group-hover:text-red">{lead.title}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted">{lead.excerpt}</p>
            </div>
          </Link>
        </Reveal>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.06}>
              <Link href={`/insights/${a.slug}`} className="group block">
                <EventArt art={a.art} photo={a.photo} width={800} className="aspect-[16/9] rounded-[24px]" />
                <div className="mt-4 text-[12px] font-semibold tracking-wide text-copper-ink uppercase">{a.category} · {a.minutes} min read</div>
                <h3 className="font-display mt-1.5 text-[26px] leading-snug text-navy group-hover:text-red">{a.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
