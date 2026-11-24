"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarClock, Eye, MessageSquare, Phone, Users, UserPlus, Sparkles } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, CountUp, Item, ProgressBar, ProgressRing, Stagger } from "@/components/ui";
import { BarChart } from "@/components/charts";
import { DateBlock } from "@/components/member";
import { BENEFITS, EVENTS, ME_SPONSOR, STAFF, sponsorById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, daysFromNow, fmtDate, fmtTime, relLabel } from "@/lib/utils";

export default function SponsorHome() {
  const sp = sponsorById(ME_SPONSOR.sponsorId)!;
  const toast = useStore((s) => s.toast);
  const total = (+new Date(sp.end) - +new Date(sp.start)) / 86_400_000;
  const elapsed = Math.max(0, -daysFromNow(sp.start));
  const left = daysFromNow(sp.end);
  const benefits = BENEFITS.filter((b) => b.sponsorId === sp.id);
  const delivered = benefits.reduce((s, b) => s + b.delivered / b.total, 0) / benefits.length;
  const events = EVENTS.filter((e) => e.sponsorId === sp.id).sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const reached = events.reduce((s, e) => s + (e.checkedIn ?? e.registered), 0);
  const upcoming = events.filter((e) => daysFromNow(e.start) >= 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="navy">{sp.level} partner</Badge>
            <span className="text-[12.5px] text-faint">since {fmtDate(sp.start)}</span>
          </div>
          <h1 className="font-display text-[36px] leading-tight text-navy md:text-[44px]">{sp.name}</h1>
          <p className="mt-2 text-[15px] text-muted">Welcome back, {ME_SPONSOR.name.split(" ")[0]}. Here’s how your partnership is performing.</p>
        </div>
        <Button variant="dark" onClick={() => toast({ title: "Report scheduled", body: "A PDF summary will be emailed every quarter.", tone: "info" })}>
          Download quarterly report
        </Button>
      </div>

      <Stagger className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Item>
          <Card className="relative h-full overflow-hidden p-7">
            <div className="grain pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr]">
              <div className="relative">
                <ProgressRing value={elapsed / total} size={176} stroke={10} color="#14213A">
                  <div className="eyebrow">Validity</div>
                  <div className="font-display mt-1 text-[40px] leading-none text-navy">{left}</div>
                  <div className="text-[12px] text-faint">days remaining</div>
                </ProgressRing>
                <div className="absolute inset-[18px]">
                  <ProgressRing value={delivered} size={140} stroke={6} color="#B5713E" track="transparent" delay={0.4} />
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1">Sponsorship value</div>
                <div className="font-display text-[42px] leading-none text-navy">
                  <CountUp value={sp.amount} format={(n) => aed(Math.round(n))} />
                </div>
                <div className="mt-1 text-[13px] text-muted">
                  {fmtDate(sp.start)} – {fmtDate(sp.end)}
                </div>
                <div className="mt-6 space-y-3 text-[13px]">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-navy" />
                    <span className="flex-1 text-muted">Term elapsed</span>
                    <span className="font-semibold text-navy tabular">{Math.round((elapsed / total) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-copper" />
                    <span className="flex-1 text-muted">Benefits delivered</span>
                    <span className="font-semibold text-navy tabular">{Math.round(delivered * 100)}%</span>
                  </div>
                  <div className="rounded-xl bg-ok-soft px-3 py-2 text-[12.5px] text-ok">Delivery is on track for the time of year.</div>
                </div>
              </div>
            </div>
          </Card>
        </Item>

        <Item>
          <Card className="flex h-full flex-col">
            <CardHeader eyebrow="Your relationship manager" title={STAFF.rm.name} sub={STAFF.rm.role} action={<Avatar name={STAFF.rm.name} size={44} />} />
            <div className="px-6 text-[13.5px] leading-relaxed text-muted">“Your keynote slot is open for either the launch evening or the Women in Leadership lunch — just let me know.”</div>
            <div className="mt-auto grid grid-cols-3 gap-2 p-6">
              <Button variant="secondary" size="sm" href="/sponsor/messages">
                <MessageSquare size={14} /> Message
              </Button>
              <Button variant="secondary" size="sm" onClick={() => toast({ title: `Calling ${STAFF.rm.phone}`, tone: "info" })}>
                <Phone size={14} /> Call
              </Button>
              <Button variant="dark" size="sm" onClick={() => toast({ title: "Calendly opened", body: "Pick a 30-minute slot with Omar.", tone: "info" })}>
                <CalendarClock size={14} /> Meet
              </Button>
            </div>
          </Card>
        </Item>
      </Stagger>

      <Stagger className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { icon: Users, label: "People reached at events", value: reached, sub: `across ${events.length} sponsored events` },
          { icon: Eye, label: "Newsletter impressions", value: 9840, sub: "5 Weekly Update features" },
          { icon: UserPlus, label: "Opted-in leads", value: 46, sub: "attendees who shared details" },
          { icon: Sparkles, label: "Logo placements", value: 28, sub: "stage, print, web and portal" },
        ].map((k) => (
          <Item key={k.label}>
            <Card className="p-5">
              <k.icon size={17} className="text-copper-ink" />
              <div className="font-display mt-3 text-[32px] leading-none text-navy">
                <CountUp value={k.value} />
              </div>
              <div className="mt-2 text-[13px] font-medium text-navy">{k.label}</div>
              <div className="text-[12px] text-faint">{k.sub}</div>
            </Card>
          </Item>
        ))}
      </Stagger>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader eyebrow="Attendance" title="Sponsored events" sub="Registered against capacity" action={<Link href="/sponsor/events" className="flex items-center gap-1 text-[13px] font-medium text-navy hover:text-red">Details <ArrowUpRight size={14} /></Link>} />
          <div className="px-6 pt-6 pb-6">
            <BarChart
              data={events.map((e) => ({ label: e.title.replace("Chamber ", "").replace("Founding members’ ", "").replace("Free zone or mainland? ", "").replace(/^./, (c) => c.toUpperCase()), sub: fmtDate(e.start, "day"), value: e.checkedIn ?? e.registered, ghost: e.capacity }))}
              highlight={events.findIndex((e) => daysFromNow(e.start) >= 0)}
            />
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Benefits" title="What’s been delivered" action={<Link href="/sponsor/benefits" className="flex items-center gap-1 text-[13px] font-medium text-navy hover:text-red">All <ArrowUpRight size={14} /></Link>} />
          <div className="space-y-4 px-6 pb-6">
            {benefits.slice(0, 5).map((b) => (
              <div key={b.id}>
                <div className="mb-1.5 flex justify-between gap-3 text-[13px]">
                  <span className="truncate text-navy">{b.label}</span>
                  <span className="shrink-0 font-semibold text-navy tabular">
                    {b.delivered}/{b.total}
                  </span>
                </div>
                <ProgressBar value={b.delivered / b.total} color={b.delivered === b.total ? "bg-ok" : "bg-copper"} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {upcoming[0] && (
        <Card className="mt-5 flex flex-col gap-5 p-6 md:flex-row md:items-center">
          <DateBlock iso={upcoming[0].start} />
          <div className="flex-1">
            <div className="eyebrow mb-1">Next sponsored event · {relLabel(upcoming[0].start)}</div>
            <div className="font-display text-[22px] text-navy">{upcoming[0].title}</div>
            <div className="text-[13px] text-muted">
              {fmtTime(upcoming[0].start)} · {upcoming[0].venue} · {upcoming[0].registered} registered
            </div>
          </div>
          <Button variant="secondary" href="/sponsor/events">
            Event brief
          </Button>
        </Card>
      )}
    </div>
  );
}
