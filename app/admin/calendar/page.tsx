"use client";

import { RefreshCw } from "lucide-react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { MonthCalendar } from "@/components/calendar";
import { CALENDAR_EXTRAS, EVENTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { daysFromNow, fmtDate, fmtTime } from "@/lib/utils";

export default function AdminCalendar() {
  const toast = useStore((s) => s.toast);
  const items = [
    ...EVENTS.map((e) => ({ id: e.id, title: e.title, start: e.start, tone: "navy" as const, href: `/admin/events/${e.id}` })),
    ...CALENDAR_EXTRAS.map((x) => ({ id: x.id, title: x.title, start: x.start, tone: (x.kind === "Call" ? "copper" : x.kind === "Comms" ? "info" : "muted") as "copper" | "info" | "muted" })),
  ];
  const agenda = items.filter((i) => daysFromNow(i.start) >= 0 && daysFromNow(i.start) <= 7).sort((a, b) => +new Date(a.start) - +new Date(b.start));

  return (
    <div>
      <PageHeader
        eyebrow="Calendar"
        title="Chamber calendar"
        description="Events, intro calls, sponsor meetings and newsletter sends in one view — synced two ways with the team’s Outlook calendars."
        actions={
          <Button variant="secondary" onClick={() => toast({ title: "Calendars synced", body: "Microsoft 365 · Calendly · Google", tone: "info" })}>
            <RefreshCw size={15} /> Sync now
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div>
          <MonthCalendar items={items} />
          <div className="mt-3 flex flex-wrap gap-5 text-[12px] text-muted">
            {[
              ["bg-navy", "Chamber events"],
              ["bg-copper-soft border border-copper/30", "Calls (Calendly)"],
              ["bg-info-soft border border-info/30", "Newsletter sends"],
              ["bg-stone", "Internal"],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-sm ${c}`} /> {l}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Next 7 days" />
            <div className="space-y-3 px-6 pb-6">
              {agenda.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-14 shrink-0 text-right">
                    <div className="text-[12px] font-semibold text-navy">{fmtDate(a.start, "day")}</div>
                    <div className="text-[11.5px] text-faint tabular">{fmtTime(a.start)}</div>
                  </div>
                  <div className={`w-0.5 shrink-0 rounded-full ${a.tone === "navy" ? "bg-navy" : a.tone === "copper" ? "bg-copper" : a.tone === "info" ? "bg-info" : "bg-line"}`} />
                  <div className="text-[13px] leading-snug text-navy">{a.title}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Connected calendars" />
            <div className="space-y-2.5 px-6 pb-6 text-[13px]">
              {["Eleanor Grant · Outlook", "Priya Nair · Outlook", "Omar Al Shehhi · Outlook", "Calendly · 2 event types"].map((c) => (
                <div key={c} className="flex items-center justify-between">
                  <span className="text-navy">{c}</span>
                  <Badge tone="ok" dot>
                    Synced
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
