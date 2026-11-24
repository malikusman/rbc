"use client";

import { useMemo, useState } from "react";
import { Item, Segmented, Stagger } from "@/components/ui";
import { EventCard } from "@/components/member";
import { Container, PageHero } from "@/components/site";
import { EVENTS, type EventType } from "@/lib/data";
import { cn, daysFromNow } from "@/lib/utils";

const TYPES: ("All" | EventType)[] = ["All", "Networking", "Briefing", "Social", "Leadership", "Trade"];

export default function PublicEvents() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const list = useMemo(
    () =>
      EVENTS.filter((e) => (when === "upcoming" ? daysFromNow(e.start) >= 0 : daysFromNow(e.start) < 0))
        .filter((e) => type === "All" || e.type === type)
        .sort((a, b) => (when === "upcoming" ? 1 : -1) * (+new Date(a.start) - +new Date(b.start))),
    [type, when],
  );
  return (
    <>
      <PageHero eyebrow="Events" title="Breakfasts, briefings and evenings across Ras Al Khaimah." intro="Open to members and their guests. Members book in one tap and pay member prices." photo="networking" />
      <Container className="mt-14">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("h-9 rounded-full border px-4 text-[13.5px] font-medium transition", type === t ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:text-navy")}>
              {t}
            </button>
          ))}
          <div className="ml-auto">
            <Segmented id="pev" value={when} onChange={setWhen} options={[{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }]} />
          </div>
        </div>
        <Stagger key={type + when} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <Item key={e.id}>
              <EventCard e={e} href={`/events/${e.id}`} />
            </Item>
          ))}
        </Stagger>
      </Container>
    </>
  );
}
