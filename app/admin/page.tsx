"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarPlus, CreditCard, FileCheck2, Megaphone, ShieldAlert, Ticket, TrendingUp, UserPlus, MailWarning } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, CountUp, Item, ProgressBar, Sparkline, Stagger } from "@/components/ui";
import { Donut, Funnel, StackedArea } from "@/components/charts";
import { DateBlock } from "@/components/member";
import { APP_STAGES, EVENTS, REVENUE, STAFF, invoiceTotal } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, compactAed, daysFromNow, fmtTime, relLabel, rel } from "@/lib/utils";

export default function AdminDashboard() {
  const apps = useStore((s) => s.applications);
  const invoices = useStore((s) => s.invoices);
  const kyc = useStore((s) => s.kyc);
  const extra = useStore((s) => s.extraRegistrations);
  const COMPANIES = useStore((s) => s.companies);
  const SPONSORS = useStore((s) => s.sponsors);

  const members = COMPANIES.filter((c) => c.tier && c.status !== "Lapsed" && c.status !== "Prospect");
  const renewals = COMPANIES.filter((c) => c.renews && daysFromNow(c.renews) <= 30 && daysFromNow(c.renews) >= 0);
  const quarter = REVENUE.slice(-3).reduce((s, r) => s + r.membership + r.events + r.sponsorship, 0);
  const sponsorBooked = SPONSORS.filter((s) => s.stage === "Active" || s.stage === "Signed").reduce((s, x) => s + x.amount, 0);
  const pipeline = SPONSORS.filter((s) => s.stage === "Proposal" || s.stage === "Renewal talks").reduce((s, x) => s + x.amount, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const escalated = kyc.filter((k) => k.status === "Escalated" || k.status === "Awaiting documents");
  const upcoming = EVENTS.filter((e) => daysFromNow(e.start) >= 0)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .slice(0, 4);
  const mix = [
    { label: "Corporate", value: members.filter((c) => c.tier === "corporate").length, color: "#14213A" },
    { label: "Business", value: members.filter((c) => c.tier === "business").length, color: "#B5713E" },
    { label: "Individual", value: members.filter((c) => c.tier === "individual").length, color: "#B8322A" },
  ];

  const hour = new Date().getHours();
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow mb-2">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1 className="font-display text-[36px] leading-tight text-navy md:text-[44px]">
            {hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, {STAFF.admin.name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            The launch evening is <span className="font-semibold text-navy">{relLabel(EVENTS[0].start).toLowerCase()}</span> and {EVENTS[0].registered + (extra.e1 ?? 0)} guests have registered.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" href="/admin/communications">
            <Megaphone size={15} /> New announcement
          </Button>
          <Button variant="dark" href="/admin/events/new">
            <CalendarPlus size={15} /> Create event
          </Button>
        </div>
      </div>

      <Stagger className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        {[
          { label: "Member companies", value: members.length, fmt: (n: number) => Math.round(n).toString(), spark: [2, 5, 8, 11, 12, members.length], delta: "+4 this month" },
          { label: "Revenue this quarter", value: quarter, fmt: (n: number) => compactAed(n), spark: REVENUE.map((r) => r.membership + r.events + r.sponsorship), delta: "+18% vs last quarter" },
          { label: "Sponsorship booked", value: sponsorBooked, fmt: (n: number) => compactAed(n), spark: [0, 75, 185, 260, 295, sponsorBooked / 1000], delta: `${compactAed(pipeline)} in pipeline` },
          { label: "Renewals in 30 days", value: renewals.length, fmt: (n: number) => Math.round(n).toString(), spark: [0, 0, 1, 1, 2, renewals.length], delta: `${aed(renewals.length * 5000)} at stake`, warn: true },
        ].map((k) => (
          <Item key={k.label}>
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div className="text-[12.5px] text-muted">{k.label}</div>
                <Sparkline data={k.spark} color={k.warn ? "#B5713E" : "#14213A"} width={72} height={26} />
              </div>
              <div className="font-display mt-3 text-[34px] leading-none text-navy">
                <CountUp value={k.value} format={k.fmt} />
              </div>
              <div className={`mt-2 flex items-center gap-1 text-[12px] ${k.warn ? "text-warn" : "text-ok"}`}>
                {!k.warn && <TrendingUp size={12} />} {k.delta}
              </div>
            </Card>
          </Item>
        ))}
      </Stagger>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Revenue"
            title="Collected since opening"
            sub="Payments settled through RAKBANK and bank transfer, synced from Zoho Books"
            action={
              <div className="hidden gap-4 text-[12px] text-muted sm:flex">
                {[
                  ["Membership", "#14213A"],
                  ["Events", "#B8322A"],
                  ["Sponsorship", "#D9B596"],
                ].map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} /> {l}
                  </span>
                ))}
              </div>
            }
          />
          <div className="px-6 pb-6">
            <StackedArea data={REVENUE} keys={["membership", "events", "sponsorship"]} colors={["#14213A", "#B8322A", "#D9B596"]} labels={REVENUE.map((r) => r.m)} height={230} />
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Membership" title="Mix by tier" sub={`${members.filter((m) => m.founding).length} founding members so far`} />
          <div className="flex items-center gap-6 px-6 pb-6">
            <Donut
              parts={mix}
              size={150}
              center={
                <>
                  <div className="font-display text-[34px] leading-none text-navy">{members.length}</div>
                  <div className="text-[11px] text-faint">companies</div>
                </>
              }
            />
            <div className="flex-1 space-y-3">
              {mix.map((m) => (
                <div key={m.label} className="flex items-center gap-3 text-[13px]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  <span className="flex-1 text-navy">{m.label}</span>
                  <span className="font-semibold text-navy tabular">{m.value}</span>
                </div>
              ))}
              <div className="border-t border-hair pt-3 text-[12px] text-muted">Target at launch: 25 companies</div>
              <ProgressBar value={members.length / 25} color="bg-copper" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader eyebrow="Needs attention" title="Today’s list" />
          <div className="divide-y divide-hair border-t border-hair">
            {[
              { icon: ShieldAlert, tone: "text-bad bg-bad-soft", title: `${escalated.length} KYC cases open`, sub: "One possible sanctions match to review", href: "/admin/compliance" },
              { icon: CreditCard, tone: "text-warn bg-warn-soft", title: `${overdue.length} overdue invoices`, sub: aed(overdue.reduce((s, i) => s + invoiceTotal(i), 0)) + " outstanding", href: "/admin/billing" },
              { icon: AlertTriangle, tone: "text-warn bg-warn-soft", title: "6 companies missing a TRN", sub: "Needed before e-invoicing goes live", href: "/admin/data-hygiene" },
              { icon: MailWarning, tone: "text-info bg-info-soft", title: "Mailchimp sync needs a look", sub: "4 bounced addresses", href: "/admin/integrations" },
            ].map((x) => (
              <Link key={x.title} href={x.href} className="group flex items-center gap-3.5 px-6 py-4 transition hover:bg-paper/60">
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${x.tone}`}>
                  <x.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-navy">{x.title}</div>
                  <div className="truncate text-[12px] text-muted">{x.sub}</div>
                </div>
                <ArrowUpRight size={15} className="text-faint transition group-hover:text-navy" />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Events" title="Next four weeks" action={<Link href="/admin/events" className="text-[13px] font-medium text-navy hover:text-red">All →</Link>} />
          <div className="space-y-4 px-6 pb-6">
            {upcoming.map((e) => {
              const reg = e.registered + (extra[e.id] ?? 0);
              return (
                <Link key={e.id} href={`/admin/events/${e.id}`} className="flex items-center gap-3.5 rounded-xl transition hover:opacity-80">
                  <DateBlock iso={e.start} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-navy">{e.title}</div>
                    <div className="mb-1.5 text-[11.5px] text-faint">
                      {fmtTime(e.start)} · {reg}/{e.capacity}
                    </div>
                    <ProgressBar value={reg / e.capacity} color={reg >= e.capacity ? "bg-copper" : "bg-navy"} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Joining" title="Applications pipeline" action={<Link href="/admin/applications" className="text-[13px] font-medium text-navy hover:text-red">Board →</Link>} />
          <div className="px-6 pb-6">
            <Funnel stages={APP_STAGES.map((s, i) => ({ label: s, value: apps.filter((a) => APP_STAGES.indexOf(a.stage) >= i).length }))} />
            <div className="mt-5 rounded-xl bg-paper px-4 py-3 text-[12.5px] text-muted">
              Founding status closes at the launch evening — <span className="font-semibold text-navy">{apps.filter((a) => a.founding && a.stage !== "Paid").length} founding applications</span> still in progress.
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader eyebrow="Live" title="Recent activity" />
        <Stagger className="grid border-t border-hair md:grid-cols-2">
          {[
            { icon: CreditCard, who: "Dr. Aisha Bello", what: "paid Individual membership with Google Pay", amt: "AED 1,575", time: rel(0, 10, 12) },
            { icon: FileCheck2, who: "Zoho Books", what: "e-invoice BCC-2026-0219 delivered to Meridian Bank RAK via Peppol", time: rel(0, 9, 48) },
            { icon: Ticket, who: "Tom Ashworth", what: "booked 3 places for British business breakfast", amt: "AED 449", time: rel(0, 9, 2) },
            { icon: UserPlus, who: "Ben Hartley", what: "registered interest — Cotswold Coffee Roasters", time: rel(-1, 17, 40) },
            { icon: ShieldAlert, who: "Screening", what: "flagged a possible match for Atlas Freight Forwarding", time: rel(-1, 15, 5) },
            { icon: CalendarPlus, who: "Calendly", what: "intro call booked with Oakridge Capital", time: rel(-1, 11, 30) },
          ].map((a, i) => (
            <Item key={i} className={`flex items-start gap-3.5 border-hair px-6 py-4 ${i % 2 === 0 ? "md:border-r" : ""} ${i < 4 ? "border-b" : ""}`}>
              <Avatar name={a.who} size={32} />
              <div className="min-w-0 flex-1 text-[13px] leading-snug">
                <span className="font-semibold text-navy">{a.who}</span> <span className="text-muted">{a.what}</span>
                <div className="mt-1 flex items-center gap-2 text-[11.5px] text-faint">
                  <a.icon size={12} /> {relLabel(a.time)} · {fmtTime(a.time)}
                </div>
              </div>
              {a.amt && <Badge tone="ok">{a.amt}</Badge>}
            </Item>
          ))}
        </Stagger>
      </Card>
    </div>
  );
}
