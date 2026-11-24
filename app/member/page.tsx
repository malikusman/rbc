"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Pin, Receipt, Ticket } from "lucide-react";
import { Badge, Button, Card, CardHeader, CountUp, EventArt, Item, ProgressRing, Stagger } from "@/components/ui";
import { DateBlock, EventCard, MembershipCard } from "@/components/member";
import { COMPANIES, EVENTS, ME_MEMBER, eventById, invoiceTotal } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, daysFromNow, fmtDate, fmtTime, relLabel } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function MemberHome() {
  const tickets = useStore((s) => s.tickets);
  const invoices = useStore((s) => s.invoices);
  const posts = useStore((s) => s.posts);
  const company = COMPANIES.find((c) => c.id === ME_MEMBER.companyId)!;

  const upcomingTickets = tickets
    .map((t) => ({ t, e: eventById(t.eventId)! }))
    .filter((x) => x.e && daysFromNow(x.e.start) >= 0)
    .sort((a, b) => +new Date(a.e.start) - +new Date(b.e.start));
  const next = upcomingTickets[0];
  const attended = tickets.filter((t) => daysFromNow(eventById(t.eventId)!.start) < 0).length;
  const due = invoices.filter((i) => i.companyId === "c1" && (i.status === "Due" || i.status === "Overdue"));
  const dueTotal = due.reduce((s, i) => s + invoiceTotal(i), 0);
  const bookedIds = new Set(tickets.map((t) => t.eventId));
  const suggestions = EVENTS.filter((e) => daysFromNow(e.start) >= 0 && !bookedIds.has(e.id))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 3);
  const renewIn = daysFromNow(company.renews!);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow mb-2">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1 className="font-display text-[36px] leading-tight text-navy md:text-[44px]">
            {greeting()}, {ME_MEMBER.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            You have <span className="font-semibold text-navy">{upcomingTickets.length} upcoming event{upcomingTickets.length === 1 ? "" : "s"}</span>
            {due.length > 0 && (
              <>
                {" "}
                and <span className="font-semibold text-navy">{due.length} invoice{due.length > 1 ? "s" : ""}</span> to settle
              </>
            )}
            .
          </p>
        </div>
        <Button variant="dark" href="/member/events">
          <CalendarDays size={16} /> Browse events
        </Button>
      </div>

      <Stagger className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        {/* Next event hero */}
        <Item>
          {next ? (
            <Link href={`/member/events/${next.e.id}`} className="group block h-full">
              <EventArt
                art={next.e.art}
                photo={next.e.photo}
                width={1100}
                priority
                className="h-full min-h-[300px] rounded-2xl shadow-[var(--shadow-lift)]"
                label={
                  <div className="flex h-full flex-col justify-between p-7 text-white">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium backdrop-blur">Your next event</span>
                      <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-navy">{relLabel(next.e.start)}</span>
                    </div>
                    <div>
                      <h2 className="font-display max-w-lg text-[34px] leading-[1.08] md:text-[40px]">{next.e.title}</h2>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/80">
                        <span className="flex items-center gap-2">
                          <Clock size={14} /> {fmtDate(next.e.start, "weekday")} · {fmtTime(next.e.start)}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin size={14} /> {next.e.venue}
                        </span>
                        <span className="flex items-center gap-2">
                          <Ticket size={14} /> {next.t.qty} place{next.t.qty > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy transition group-hover:gap-3">
                        View ticket <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                }
              />
            </Link>
          ) : (
            <Card className="flex h-full items-center justify-center p-10 text-muted">No upcoming bookings</Card>
          )}
        </Item>

        {/* Membership */}
        <Item>
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Your membership</div>
              <Link href="/member/membership" className="flex items-center gap-1 text-[13px] font-medium text-navy hover:text-red">
                Manage <ArrowUpRight size={14} />
              </Link>
            </div>
            <MembershipCard className="mt-4" />
            <div className="mt-5 flex items-center gap-4">
              <ProgressRing value={renewIn / 365} size={56} stroke={5} color="#B5713E">
                <span className="text-[12px] font-semibold text-navy tabular">{Math.round((renewIn / 365) * 100)}%</span>
              </ProgressRing>
              <div className="text-[13px] leading-snug">
                <div className="font-semibold text-navy">Renews {fmtDate(company.renews!)}</div>
                <div className="text-muted">Auto-renew is on · {renewIn} days left</div>
              </div>
            </div>
          </Card>
        </Item>
      </Stagger>

      {/* KPIs */}
      <Stagger className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { label: "Upcoming bookings", value: upcomingTickets.length, sub: "across the next 6 weeks" },
          { label: "Events attended", value: attended, sub: "since you joined" },
          { label: "Outstanding", value: dueTotal, sub: due.length ? `${due.length} invoice${due.length > 1 ? "s" : ""} due` : "All settled", money: true },
          { label: "Member for", value: Math.abs(daysFromNow(company.since)), sub: "days · founding member" },
        ].map((k) => (
          <Item key={k.label}>
            <Card className="p-5">
              <div className="text-[12.5px] text-muted">{k.label}</div>
              <div className="font-display mt-2 text-[34px] leading-none text-navy">
                {k.money ? <CountUp value={k.value} format={(n) => aed(Math.round(n))} /> : <CountUp value={k.value} />}
              </div>
              <div className="mt-2 text-[12px] text-faint">{k.sub}</div>
            </Card>
          </Item>
        ))}
      </Stagger>

      {due.length > 0 && (
        <Card className="mt-5 flex flex-col items-start gap-4 border-red/15 bg-gradient-to-r from-white to-[#FBF3F2] p-5 sm:flex-row sm:items-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 text-red">
            <Receipt size={18} />
          </span>
          <div className="flex-1">
            <div className="text-[14.5px] font-semibold text-navy">
              Invoice {due[0].number} · {aed(invoiceTotal(due[0]), { decimals: true })}
            </div>
            <div className="text-[13px] text-muted">
              {due[0].lines[0].label} · due {fmtDate(due[0].due)}
            </div>
          </div>
          <Button variant="primary" href={`/pay/${due[0].id}`}>
            Pay now
          </Button>
        </Card>
      )}

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[26px] text-navy">Coming up</h2>
            <Link href="/member/events" className="text-[13px] font-medium text-navy hover:text-red">
              All events →
            </Link>
          </div>
          <Stagger className="grid gap-5 sm:grid-cols-2">
            {suggestions.slice(0, 2).map((e) => (
              <Item key={e.id}>
                <EventCard e={e} href={`/member/events/${e.id}`} />
              </Item>
            ))}
          </Stagger>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[26px] text-navy">From the Chamber</h2>
            <Link href="/member/messages" className="text-[13px] font-medium text-navy hover:text-red">
              Message board →
            </Link>
          </div>
          <Card className="divide-y divide-hair">
            {posts.slice(0, 3).map((p) => (
              <Link key={p.id} href="/member/messages" className="block p-5 transition hover:bg-paper/60">
                <div className="mb-1.5 flex items-center gap-2">
                  {p.pinned && <Pin size={12} className="text-red" />}
                  <Badge tone={p.topic === "Announcement" ? "navy" : p.topic === "Policy" ? "info" : "neutral"}>{p.topic}</Badge>
                  <span className="text-[12px] text-faint">{relLabel(p.time)}</span>
                </div>
                <div className="text-[14.5px] font-semibold text-navy">{p.title}</div>
                <div className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{p.body}</div>
              </Link>
            ))}
          </Card>
          {upcomingTickets[1] && (
            <Card className="mt-5">
              <CardHeader eyebrow="Also booked" title={upcomingTickets[1].e.title} />
              <div className="flex items-center gap-4 px-6 pb-5">
                <DateBlock iso={upcomingTickets[1].e.start} />
                <div className="text-[13px] text-muted">
                  {fmtTime(upcomingTickets[1].e.start)} · {upcomingTickets[1].e.venue}
                  {upcomingTickets[1].e.hybrid && <div className="mt-1 text-info">Join in person or on Teams</div>}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
