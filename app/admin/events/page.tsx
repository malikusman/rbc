"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, ScanLine } from "lucide-react";
import { Badge, Button, Card, PageHeader, ProgressBar, Segmented } from "@/components/ui";
import { DateBlock } from "@/components/member";
import { EVENTS, sponsorById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, daysFromNow, fmtTime, relLabel } from "@/lib/utils";

export default function AdminEvents() {
  const extra = useStore((s) => s.extraRegistrations);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = EVENTS.filter((e) => (tab === "upcoming" ? daysFromNow(e.start) >= 0 : daysFromNow(e.start) < 0)).sort(
    (a, b) => (tab === "upcoming" ? 1 : -1) * (+new Date(a.start) - +new Date(b.start)),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Events"
        title="Event management"
        description="Create events, sell tickets, attach sponsors and check guests in at the door. Published events appear on the WordPress site automatically."
        actions={
          <>
            <Button variant="secondary" href="/admin/events/e2/check-in">
              <ScanLine size={15} /> Check-in mode
            </Button>
            <Button variant="dark" href="/admin/events/new">
              <CalendarPlus size={15} /> Create event
            </Button>
          </>
        }
      />
      <div className="mb-4">
        <Segmented
          id="aev"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
          ]}
        />
      </div>
      <Card className="divide-y divide-hair">
        {list.map((e) => {
          const reg = e.registered + (extra[e.id] ?? 0);
          const revenue = Math.round(reg * 0.7 * e.memberPrice + reg * 0.3 * e.guestPrice);
          const sp = sponsorById(e.sponsorId);
          return (
            <Link key={e.id} href={`/admin/events/${e.id}`} className="grid items-center gap-4 px-6 py-4 transition hover:bg-paper/60 md:grid-cols-[auto_1fr_200px_120px_110px]">
              <DateBlock iso={e.start} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold text-navy">{e.title}</span>
                  {reg >= e.capacity && <Badge tone="copper">Sold out</Badge>}
                </div>
                <div className="text-[12.5px] text-muted">
                  {fmtTime(e.start)} · {e.venue}
                  {sp && <span className="text-faint"> · {sp.name}</span>}
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-muted">{tab === "past" ? `${e.checkedIn} attended` : `${reg} registered`}</span>
                  <span className="text-faint">{e.capacity}</span>
                </div>
                <ProgressBar value={(tab === "past" ? e.checkedIn ?? 0 : reg) / e.capacity} color={reg >= e.capacity ? "bg-copper" : "bg-navy"} />
              </div>
              <div className="text-right text-[13.5px] font-semibold text-navy tabular">{revenue ? aed(revenue) : "Free"}</div>
              <div className="text-right">
                <Badge tone={tab === "past" ? "ok" : "info"}>{tab === "past" ? "Completed" : relLabel(e.start)}</Badge>
              </div>
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
