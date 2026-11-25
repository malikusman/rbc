"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CreditCard, FileText, Mail, MessageCircle, StickyNote, Ticket, UserPlus, Phone, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, ProgressRing, Segmented, Textarea, statusTone } from "@/components/ui";
import { InvoiceSheet } from "@/components/invoice";
import { LanaMark } from "@/components/lana";
import { EVENTS, PEOPLE, STAFF, invoiceTotal, tierById, type Invoice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, daysFromNow, fmtDate, rel, relLabel } from "@/lib/utils";

type Activity = { id: string; icon: typeof Mail; title: string; sub?: string; time: string; tone: string };

export default function CompanyRecord() {
  const { id } = useParams<{ id: string }>();
  const c = useStore((s) => s.companies.find((x) => x.id === id));
  const sponsors = useStore((s) => s.sponsors);
  const allDocs = useStore((s) => s.documents);
  const allInvoices = useStore((s) => s.invoices);
  const toast = useStore((s) => s.toast);
  const [tab, setTab] = useState<"timeline" | "invoices" | "people">("timeline");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Activity[]>([]);
  const [open, setOpen] = useState<Invoice | null>(null);

  if (!c) return <div className="text-muted">Company not found.</div>;
  const people = PEOPLE.filter((p) => p.companyId === c.id);
  const sponsorRec = sponsors.find((x) => x.name === c.name);
  const docs = allDocs.filter((d) => d.owner.id === c.id || (sponsorRec && d.owner.id === sponsorRec.id) || d.owner.name === c.name);
  const invoices = allInvoices.filter((i) => i.companyId === c.id);
  const sponsor = sponsors.find((s) => s.name === c.name);
  const tier = tierById(c.tier);
  const attended = EVENTS.filter((e) => daysFromNow(e.start) < 0).slice(0, 2);

  const timeline: Activity[] = [
    ...notes,
    ...invoices.map((i) => ({
      id: i.id,
      icon: CreditCard,
      title: i.status === "Paid" ? `Paid ${aed(invoiceTotal(i))}` : `Invoice ${i.number} ${i.status.toLowerCase()}`,
      sub: `${i.lines[0].label}${i.method ? " · " + i.method : ""}`,
      time: i.issued,
      tone: i.status === "Paid" ? "bg-ok-soft text-ok" : i.status === "Overdue" ? "bg-bad-soft text-bad" : "bg-info-soft text-info",
    })),
    ...attended.map((e) => ({ id: e.id, icon: Ticket, title: `Attended ${e.title}`, sub: `${people[0]?.name ?? "Contact"} checked in`, time: e.start, tone: "bg-stone text-navy" })),
    { id: "kyc", icon: ShieldCheck, title: "KYC check completed — low risk", sub: "Trade licence, owners and sanctions screening clear", time: rel(Math.round(-Math.abs(daysFromNow(c.since))) + 2), tone: "bg-ok-soft text-ok" },
    { id: "join", icon: UserPlus, title: `Joined as ${tier?.name ?? "prospect"}${c.founding ? " · founding member" : ""}`, sub: `Welcomed by ${c.owner}`, time: c.since, tone: "bg-copper-soft text-copper-ink" },
    { id: "call", icon: Phone, title: "Intro call", sub: "Booked via Calendly · 30 min", time: rel(Math.round(-Math.abs(daysFromNow(c.since))) - 5), tone: "bg-stone text-navy" },
  ].sort((a, b) => +new Date(b.time) - +new Date(a.time));

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((n) => [{ id: `n${Date.now()}`, icon: StickyNote, title: "Note", sub: note, time: new Date().toISOString(), tone: "bg-warn-soft text-warn" }, ...n]);
    setNote("");
    toast({ title: "Note added to the record" });
  };

  return (
    <div>
      <Link href="/admin/crm" className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> Members & contacts
      </Link>

      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center">
        <Avatar name={c.name} size={64} className="!rounded-2xl" />
        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(c.status)} dot>
              {c.status}
            </Badge>
            {tier && <Badge>{tier.name}</Badge>}
            {c.founding && <Badge tone="copper">Founding</Badge>}
            {sponsor && <Badge tone="navy">{sponsor.level} sponsor</Badge>}
          </div>
          <h1 className="font-display text-[34px] leading-tight text-navy md:text-[40px]">{c.name}</h1>
          <div className="text-[14px] text-muted">
            {c.sector} · {c.emirate} · member since {fmtDate(c.since)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => toast({ title: "Email drafted in Outlook", tone: "info" })}>
            <Mail size={15} /> Email
          </Button>
          <Button variant="secondary" onClick={() => toast({ title: "WhatsApp message sent" })}>
            <MessageCircle size={15} /> WhatsApp
          </Button>
          <Button variant="dark" onClick={() => toast({ title: "Invoice created", body: "Synced to Zoho Books as a draft." })}>
            <FileText size={15} /> New invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-5">
              <ProgressRing value={c.quality / 100} size={84} stroke={6} color={c.quality >= 85 ? "#2F7A55" : c.quality >= 65 ? "#B5713E" : "#B8322A"}>
                <span className="font-display text-[22px] text-navy">{c.quality}</span>
              </ProgressRing>
              <div>
                <div className="text-[14px] font-semibold text-navy">Data quality</div>
                <div className="text-[12.5px] text-muted">{c.quality >= 85 ? "Complete and verified" : c.trn ? "A few fields missing" : "Missing TRN for e-invoicing"}</div>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Details" />
            <dl className="space-y-3 px-6 pb-6 text-[13.5px]">
              {[
                ["Trade licence", c.licence],
                ["TRN", c.trn ?? "Missing"],
                ["Emirate / zone", c.emirate],
                ["Membership", tier ? `${tier.name} · ${aed(tier.price)}/yr` : "—"],
                ["Renews", c.renews ? `${fmtDate(c.renews)} (${relLabel(c.renews).toLowerCase()})` : "—"],
                ["Account owner", c.owner],
                ["Peppol", c.trn ? "Registered" : "Not registered"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-faint">{k}</dt>
                  <dd className={cn("text-right text-navy", v === "Missing" && "font-medium text-red", k === "TRN" && "font-mono text-[12.5px]")}>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <CardHeader title="Documents" sub="Read by Lana" action={<LanaMark size={20} />} />
            <div className="space-y-2.5 px-6 pb-6">
              {docs.length === 0 && <div className="text-[13px] text-muted">No documents yet.</div>}
              {docs.map((d) => (
                <Link key={d.id} href="/admin/lana/knowledge" className="block rounded-xl border border-hair p-3 transition hover:bg-paper/60">
                  <div className="truncate text-[13px] font-medium text-navy">{d.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-faint">{d.facts.slice(0, 2).map((f) => `${f.label}: ${f.value}`).join(" · ")}</div>
                </Link>
              ))}
            </div>
          </Card>
          {sponsor && (
            <Card className="p-6">
              <div className="eyebrow mb-1">Sponsorship</div>
              <div className="font-display text-[26px] text-navy">{aed(sponsor.amount)}</div>
              <div className="text-[12.5px] text-muted">
                {sponsor.level} · to {fmtDate(sponsor.end)} · RM {sponsor.rm}
              </div>
            </Card>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <Segmented
              id="rec"
              value={tab}
              onChange={setTab}
              options={[
                { value: "timeline", label: "Timeline" },
                { value: "invoices", label: `Invoices · ${invoices.length}` },
                { value: "people", label: `People · ${people.length}` },
              ]}
            />
          </div>
          <AnimatePresence mode="wait">
            {tab === "timeline" && (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-6">
                <div className="mb-6 flex gap-3">
                  <Avatar name={STAFF.admin.name} size={34} />
                  <div className="flex-1">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note, e.g. ‘Interested in speaking at the breakfast’…" className="min-h-[64px]" />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="dark" onClick={addNote} disabled={!note.trim()}>
                        Add note
                      </Button>
                    </div>
                  </div>
                </div>
                <ol className="relative ml-4 border-l border-hair">
                  <AnimatePresence initial={false}>
                    {timeline.map((a, i) => (
                      <motion.li key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }} className="relative pb-6 pl-8 last:pb-0">
                        <span className={cn("absolute top-0 -left-4 inline-flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white", a.tone)}>
                          <a.icon size={14} />
                        </span>
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="text-[14px] font-semibold text-navy">{a.title}</div>
                          <div className="shrink-0 text-[12px] text-faint">{fmtDate(a.time)}</div>
                        </div>
                        {a.sub && <div className="mt-0.5 text-[13px] text-muted">{a.sub}</div>}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              </motion.div>
            )}
            {tab === "invoices" && (
              <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-hair border-t border-hair">
                {invoices.length === 0 && <div className="p-10 text-center text-muted">No invoices yet.</div>}
                {invoices.map((inv) => (
                  <button key={inv.id} onClick={() => setOpen(inv)} className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-paper/60">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-navy">{inv.lines[0].label}</div>
                      <div className="font-mono text-[11.5px] text-faint">{inv.number}</div>
                    </div>
                    <Badge tone={statusTone(inv.einvoice)}>{inv.einvoice}</Badge>
                    <Badge tone={statusTone(inv.status)} dot>
                      {inv.status}
                    </Badge>
                    <span className="w-24 text-right font-semibold text-navy tabular">{aed(invoiceTotal(inv))}</span>
                  </button>
                ))}
              </motion.div>
            )}
            {tab === "people" && (
              <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-hair border-t border-hair">
                {people.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-6 py-4">
                    <Avatar name={p.name} size={38} />
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-navy">{p.name}</div>
                      <div className="text-[12.5px] text-muted">
                        {p.role} · {p.email}
                      </div>
                    </div>
                    <span className="font-mono text-[12px] text-faint">{p.phone}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
      <InvoiceSheet inv={open} onClose={() => setOpen(null)} admin />
    </div>
  );
}
