"use client";

import { Check, Download, MapPin, Clock } from "lucide-react";
import { Badge, Button, Card, EventArt, Item, PageHeader, ProgressBar, Stagger } from "@/components/ui";
import { DateBlock } from "@/components/member";
import { EVENTS, ME_SPONSOR } from "@/lib/data";
import { useStore } from "@/lib/store";
import { daysFromNow, fmtDate, fmtTime, relLabel } from "@/lib/utils";

const PLACEMENTS: Record<string, string[]> = {
  e1: ["Stage backdrop", "Lanyards", "Printed programme", "Welcome remarks"],
  e8: ["Welcome banner", "Website listing", "Weekly Update"],
  e9: ["Roundtable host", "Website listing"],
};

export default function SponsorEvents() {
  const toast = useStore((s) => s.toast);
  const events = EVENTS.filter((e) => e.sponsorId === ME_SPONSOR.sponsorId).sort((a, b) => +new Date(b.start) - +new Date(a.start));

  return (
    <div>
      <PageHeader eyebrow="Sponsored events" title="Your events, and how they performed" description="Registrations, attendance and where your brand appeared. Lead lists include only attendees who opted in." />
      <Stagger className="space-y-5">
        {events.map((e) => {
          const past = daysFromNow(e.start) < 0;
          const att = e.checkedIn ?? 0;
          return (
            <Item key={e.id}>
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-[260px_1fr]">
                  <EventArt art={e.art} photo={e.photo} width={520} className="h-40 md:h-full" label={<div className="flex h-full items-end p-4"><DateBlock iso={e.start} light /></div>} />
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="eyebrow mb-1">{relLabel(e.start)}</div>
                        <h3 className="font-display text-[24px] leading-snug text-navy">{e.title}</h3>
                        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
                          <span className="flex items-center gap-1.5"><Clock size={13} /> {fmtDate(e.start, "weekday")} · {fmtTime(e.start)}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={13} /> {e.venue}</span>
                        </div>
                      </div>
                      <Badge tone={past ? "ok" : "info"} dot>
                        {past ? "Completed" : "Upcoming"}
                      </Badge>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                      <div>
                        <div className="text-[12px] text-faint">Registered</div>
                        <div className="font-display text-[28px] leading-tight text-navy tabular">
                          {e.registered}
                          <span className="text-[15px] text-faint"> / {e.capacity}</span>
                        </div>
                        <ProgressBar value={e.registered / e.capacity} className="mt-2" />
                      </div>
                      <div>
                        <div className="text-[12px] text-faint">{past ? "Attended" : "Expected"}</div>
                        <div className="font-display text-[28px] leading-tight text-navy tabular">{past ? att : Math.round(e.registered * 0.9)}</div>
                        <div className="mt-1 text-[12px] text-muted">{past ? `${Math.round((att / e.registered) * 100)}% show rate` : "Based on a 90% show rate"}</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-faint">Your brand appeared on</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {(PLACEMENTS[e.id] ?? ["Website listing"]).map((p) => (
                            <span key={p} className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[11.5px] text-navy-2">
                              <Check size={11} className="text-ok" /> {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-hair pt-5">
                      {past ? (
                        <Button size="sm" variant="dark" onClick={() => toast({ title: "Lead list exported", body: `${Math.round(att * 0.4)} opted-in contacts (CSV)` })}>
                          <Download size={14} /> Opted-in leads ({Math.round(att * 0.4)})
                        </Button>
                      ) : (
                        <Button size="sm" variant="dark" onClick={() => toast({ title: "Event brief downloaded", tone: "info" })}>
                          <Download size={14} /> Event brief
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => toast({ title: "Photos shared", body: "Gallery link sent to your email.", tone: "info" })}>
                        {past ? "Event photos" : "Upload brand assets"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Item>
          );
        })}
      </Stagger>
    </div>
  );
}
