"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar, Button, EventArt } from "@/components/ui";
import { Container } from "@/components/site";
import { ARTICLES, articleBySlug } from "@/lib/content";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const a = articleBySlug(slug);
  if (!a) return <Container className="py-24 text-muted">Article not found.</Container>;
  const next = ARTICLES.find((x) => x.slug !== a.slug)!;
  return (
    <article>
      <Container className="pt-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/insights" className="inline-flex items-center gap-2 text-[13.5px] font-medium text-muted hover:text-navy">
            <ArrowLeft size={15} /> Insights
          </Link>
          <div className="mt-8 text-[12.5px] font-semibold tracking-wide text-copper-ink uppercase">{a.category} · {a.minutes} min read</div>
          <h1 className="font-display mt-3 text-[42px] leading-[1.06] text-navy md:text-[56px]">{a.title}</h1>
          <p className="mt-5 text-[19px] leading-relaxed text-muted">{a.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-[14px] text-navy">
            <Avatar name={a.author} size={36} /> {a.author}
          </div>
        </div>
        <EventArt art={a.art} photo={a.photo} width={1600} priority className="mx-auto mt-10 aspect-[21/9] max-w-5xl rounded-[28px]" />
        <div className="mx-auto mt-12 max-w-[680px] space-y-6 text-[17.5px] leading-[1.8] text-navy-2">
          {a.body.map((b, i) => (
            <div key={i}>
              {b.h && <h2 className="font-display mb-2 text-[28px] leading-snug text-navy">{b.h}</h2>}
              <p>{b.p}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-16 flex max-w-[680px] flex-col gap-4 rounded-[24px] border border-hair bg-white p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="eyebrow mb-1">Read next</div>
            <Link href={`/insights/${next.slug}`} className="font-display text-[21px] text-navy hover:text-red">
              {next.title}
            </Link>
          </div>
          <Button variant="primary" href="/join">
            Join the Chamber
          </Button>
        </div>
      </Container>
    </article>
  );
}
