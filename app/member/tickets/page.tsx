"use client";

import Link from "next/link";
import { useState } from "react";
import { Item, PageHeader, Segmented, Stagger, Badge, Card, Button } from "@/components/ui";
import { DateBlock, TicketStub } from "@/components/member";
import { eventById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { daysFromNow, fmtTime } from "@/lib/utils";

export default function Tickets() {
  const tickets = useStore((s) => s.tickets);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const rows = tickets
    .map((t) => ({ t, e: eventById(t.eventId)! }))
    .filter((x) => (tab === "upcoming" ? daysFromNow(x.e.start) >= 0 : daysFromNow(x.e.start) < 0))
    .sort((a, b) => (tab === "upcoming" ? 1 : -1) * (+new Date(a.e.start) - +new Date(b.e.start)));

  return (
    <div>
      <PageHeader
        eyebrow="My tickets"
        title="Your bookings"
        description="Show the QR code at the door, or save tickets to Apple or Google Wallet."
        actions={
          <Segmented
            id="tk"
            value={tab}
            onChange={setTab}
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past" },
            ]}
          />
        }
      />
      {tab === "upcoming" ? (
        <Stagger key="u" className="space-y-5">
          {rows.map(({ t, e }) => (
            <Item key={t.id}>
              <TicketStub t={t} e={e} />
            </Item>
          ))}
          {rows.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted">No upcoming bookings yet.</p>
              <Button variant="dark" href="/member/events" className="mt-4">
                Browse events
              </Button>
            </Card>
          )}
        </Stagger>
      ) : (
        <Stagger key="p">
          <Card className="divide-y divide-hair">
            {rows.map(({ t, e }) => (
              <Item key={t.id}>
                <Link href={`/member/events/${e.id}`} className="flex items-center gap-4 p-5 transition hover:bg-paper/60">
                  <DateBlock iso={e.start} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-navy">{e.title}</div>
                    <div className="text-[13px] text-muted">
                      {fmtTime(e.start)} · {e.venue}
                    </div>
                  </div>
                  <Badge tone="ok">Attended</Badge>
                  <span className="hidden text-[12.5px] text-faint sm:block">{t.qty} place{t.qty > 1 ? "s" : ""}</span>
                </Link>
              </Item>
            ))}
          </Card>
        </Stagger>
      )}
    </div>
  );
}
