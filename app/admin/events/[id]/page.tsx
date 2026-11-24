"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Mail, ScanLine, Video } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, CountUp, EventArt, ProgressRing } from "@/components/ui";
import { BarChart } from "@/components/charts";
import { ATTENDEES, eventById, sponsorById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, fmtDate, fmtTime, relLabel } from "@/lib/utils";

export default function AdminEvent() {
  const { id } = useParams<{ id: string }>();
  const e = eventById(id);
  const extra = useStore((s) => s.extraRegistrations);
  const checkins = useStore((s) => s.checkins);
  const toast = useStore((s) => s.toast);
  if (!e) return <div className="text-muted">Event not found.</div>;
  const reg = e.registered + (extra[e.id] ?? 0);
  const sp = sponsorById(e.sponsorId);
  const revenue = Math.round(reg * 0.7 * e.memberPrice + reg * 0.3 * e.guestPrice);
  const isLive = e.id === "e2";

  return (
    <div>
      <Link href="/admin/events" className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> Events
      </Link>
      <EventArt
        art={e.art}
        photo={e.photo}
        width={1400}
        className="rounded-3xl"
        label={
          <div className="flex flex-col gap-5 p-7 text-white md:flex-row md:items-end md:p-9">
            <div className="flex-1">
              <div className="mb-3 flex gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] backdrop-blur">{e.type}</span>
                <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-navy">{relLabel(e.start)}</span>
              </div>
              <h1 className="font-display text-[36px] leading-tight md:text-[44px]">{e.title}</h1>
              <div className="mt-2 text-[14px] text-white/80">
                {fmtDate(e.start, "long")} · {fmtTime(e.start)} · {e.venue}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast({ title: "Attendee list exported", body: "CSV with dietary notes", tone: "info" })}>
                <Download size={15} /> Export
              </Button>
              <Button variant="primary" href={`/admin/events/${e.id}/check-in`}>
                <ScanLine size={15} /> Check-in mode
              </Button>
            </div>
          </div>
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <ProgressRing value={reg / e.capacity} size={64} stroke={6}>
            <span className="text-[12px] font-semibold text-navy">{Math.round((reg / e.capacity) * 100)}%</span>
          </ProgressRing>
          <div>
            <div className="font-display text-[28px] leading-none text-navy">
              <CountUp value={reg} />
            </div>
            <div className="text-[12px] text-muted">of {e.capacity} registered</div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] text-muted">Ticket revenue</div>
          <div className="font-display mt-2 text-[28px] leading-none text-navy">{revenue ? <CountUp value={revenue} format={(n) => aed(Math.round(n))} /> : "Free"}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] text-muted">Checked in</div>
          <div className="font-display mt-2 text-[28px] leading-none text-navy">{isLive ? checkins.length : e.checkedIn ?? 0}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[12px] text-muted">Sponsor</div>
          <div className="mt-2 text-[15px] font-semibold text-navy">{sp?.name ?? "—"}</div>
          {sp && <Badge tone="copper" className="mt-1">{sp.level}</Badge>}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Attendees"
            sub={`${ATTENDEES.length} shown · members, guests, speakers and sponsors`}
            action={
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Reminder scheduled", body: "Email + WhatsApp, 24 hours before" })}>
                <Mail size={14} /> Remind all
              </Button>
            }
          />
          <div className="divide-y divide-hair border-t border-hair">
            {ATTENDEES.map((a) => {
              const inn = isLive ? checkins.includes(a.id) : false;
              return (
                <div key={a.id} className="flex items-center gap-3 px-6 py-3">
                  <Avatar name={a.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-navy">{a.name}</div>
                    <div className="truncate text-[12px] text-muted">{a.company}</div>
                  </div>
                  {a.note && <span className="hidden text-[11.5px] text-faint md:block">{a.note}</span>}
                  <Badge tone={a.ticket === "Sponsor" ? "copper" : a.ticket === "Speaker" ? "info" : a.ticket === "Guest" ? "outline" : "neutral"}>{a.ticket}</Badge>
                  {isLive && <Badge tone={inn ? "ok" : "outline"} dot>{inn ? "In" : "Expected"}</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Registrations by week" />
            <div className="px-6 pt-4 pb-6">
              <BarChart
                height={160}
                data={[
                  { label: "Wk 1", value: Math.round(reg * 0.32) },
                  { label: "Wk 2", value: Math.round(reg * 0.24) },
                  { label: "Wk 3", value: Math.round(reg * 0.18) },
                  { label: "Wk 4", value: Math.round(reg * 0.26) },
                ]}
                highlight={3}
              />
            </div>
          </Card>
          <Card className="p-6">
            <div className="eyebrow mb-2">Published to</div>
            <div className="space-y-2 text-[13.5px] text-navy">
              <div className="flex justify-between"><span>britishchamberrak.net (WordPress)</span><Badge tone="ok">Live</Badge></div>
              <div className="flex justify-between"><span>Member portal & app</span><Badge tone="ok">Live</Badge></div>
              <div className="flex justify-between"><span>Weekly Update (Mailchimp)</span><Badge tone="info">Next send</Badge></div>
              {e.hybrid && <div className="flex justify-between"><span className="flex items-center gap-1.5"><Video size={13} /> Microsoft Teams link</span><Badge tone="ok">Created</Badge></div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
