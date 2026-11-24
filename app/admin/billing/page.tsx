"use client";

import { useState } from "react";
import { Link2, Plus, ShieldCheck, Check } from "lucide-react";
import { motion } from "motion/react";
import { Badge, Button, Card, CardHeader, CountUp, Field, Input, Item, Modal, PageHeader, Segmented, Select, Stagger, statusTone } from "@/components/ui";
import { InvoiceSheet } from "@/components/invoice";
import { invoiceTotal, type Invoice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, daysFromNow, fmtDate } from "@/lib/utils";

const FILTERS = ["All", "Due", "Overdue", "Paid"] as const;

export default function AdminBilling() {
  const invoices = useStore((s) => s.invoices);
  const COMPANIES = useStore((s) => s.companies);
  const toast = useStore((s) => s.toast);
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<Invoice | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkMade, setLinkMade] = useState(false);

  const list = invoices.filter((i) => f === "All" || i.status === f).sort((a, b) => +new Date(b.issued) - +new Date(a.issued));
  const sum = (xs: Invoice[]) => xs.reduce((s, i) => s + invoiceTotal(i), 0);
  const paid30 = invoices.filter((i) => i.status === "Paid" && daysFromNow(i.issued) > -60);
  const due = invoices.filter((i) => i.status === "Due");
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const b2b = invoices.filter((i) => i.b2b);
  const accepted = b2b.filter((i) => i.einvoice === "Accepted").length;
  const goLive = daysFromNow(new Date("2027-07-01T09:00:00").toISOString());
  const asp = daysFromNow(new Date("2027-03-31T09:00:00").toISOString());

  const ageing = [
    { label: "Not yet due", v: sum(due), c: "bg-navy" },
    { label: "1–30 days", v: sum(overdue.filter((i) => daysFromNow(i.due) >= -30)), c: "bg-copper" },
    { label: "31–60 days", v: 0, c: "bg-red/70" },
    { label: "60+ days", v: 0, c: "bg-red" },
  ];
  const ageTotal = ageing.reduce((s, a) => s + a.v, 0) || 1;

  return (
    <div>
      <PageHeader
        eyebrow="Billing"
        title="Invoices, payments & e-invoicing"
        description="Every invoice syncs with Zoho Books. Card payments settle through RAKBANK; business invoices go out over Peppol as UAE e-invoices."
        actions={
          <>
            <Button variant="secondary" onClick={() => { setLinkOpen(true); setLinkMade(false); }}>
              <Link2 size={15} /> Payment link
            </Button>
            <Button variant="dark" onClick={() => toast({ title: "New invoice", body: "Draft created and synced to Zoho Books.", tone: "info" })}>
              <Plus size={15} /> New invoice
            </Button>
          </>
        }
      />

      <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { l: "Collected (last 60 days)", v: sum(paid30), sub: `${paid30.length} payments` },
          { l: "Due", v: sum(due), sub: `${due.length} invoices` },
          { l: "Overdue", v: sum(overdue), sub: `${overdue.length} invoices · reminders on`, bad: true },
          { l: "E-invoices accepted", v: Math.round((accepted / b2b.length) * 100), sub: `${accepted} of ${b2b.length} B2B invoices`, pct: true },
        ].map((k) => (
          <Item key={k.l}>
            <Card className="p-5">
              <div className="text-[12.5px] text-muted">{k.l}</div>
              <div className={cn("font-display mt-2 text-[30px] leading-none", k.bad ? "text-red" : "text-navy")}>
                <CountUp value={k.v} format={(n) => (k.pct ? `${Math.round(n)}%` : aed(Math.round(n)))} />
              </div>
              <div className="mt-2 text-[12px] text-faint">{k.sub}</div>
            </Card>
          </Item>
        ))}
      </Stagger>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Receivables ageing" sub="Outstanding balances by days past due" />
          <div className="px-6 pb-6">
            <div className="flex h-4 overflow-hidden rounded-full bg-stone">
              {ageing.map((a, i) => (
                <motion.div key={a.label} className={a.c} initial={{ width: 0 }} animate={{ width: `${(a.v / ageTotal) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.1 }} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ageing.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted">
                    <span className={cn("h-2 w-2 rounded-full", a.c)} /> {a.label}
                  </div>
                  <div className="mt-0.5 text-[15px] font-semibold text-navy tabular">{aed(Math.round(a.v))}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="!border-navy !bg-navy text-white">
          <div className="p-6">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-white/60 uppercase">
              <ShieldCheck size={14} /> UAE e-invoicing readiness
            </div>
            <div className="font-display mt-3 text-[34px] leading-none">{goLive} days</div>
            <div className="mt-1 text-[13px] text-white/70">until mandatory go-live on 1 July 2027 (Phase 2, under AED 50m revenue)</div>
            <ul className="mt-5 space-y-2 text-[13px]">
              {[
                { t: "Zoho Books selected as ASP", ok: true },
                { t: `Register ASP in EmaraTax — by 31 Mar 2027 (${asp} days)`, ok: false },
                { t: "Pilot: B2B invoices already sent over Peppol", ok: true },
                { t: "6 companies still missing a TRN", ok: false },
              ].map((x) => (
                <li key={x.t} className="flex items-start gap-2.5">
                  <span className={cn("mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full", x.ok ? "bg-ok text-white" : "border border-white/30")}>{x.ok && <Check size={11} strokeWidth={3} />}</span>
                  <span className={x.ok ? "text-white" : "text-white/70"}>{x.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Segmented id="bf" value={f} onChange={setF} options={FILTERS.map((x) => ({ value: x, label: x }))} />
          <span className="text-[12.5px] text-faint">{list.length} invoices · synced with Zoho Books 2 min ago</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-[13.5px]">
            <thead>
              <tr className="border-y border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                <th className="px-6 py-3">Invoice</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">E-invoice</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr key={inv.id} onClick={() => setOpen(inv)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                  <td className="px-6 py-3.5 font-mono text-[12.5px] text-navy">{inv.number}</td>
                  <td className="px-3 py-3.5">
                    <div className="font-medium text-navy">{inv.billTo}</div>
                    <div className="text-[11.5px] text-faint">{inv.b2b ? "Business (B2B)" : "Individual (B2C)"}</div>
                  </td>
                  <td className="px-3 py-3.5 text-muted">{inv.kind}</td>
                  <td className={cn("px-3 py-3.5", inv.status === "Overdue" ? "font-medium text-red" : "text-muted")}>{fmtDate(inv.due)}</td>
                  <td className="px-3 py-3.5">
                    <Badge tone={statusTone(inv.einvoice)}>{inv.einvoice}</Badge>
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge tone={statusTone(inv.status)} dot>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-navy tabular">{aed(invoiceTotal(inv), { decimals: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InvoiceSheet inv={open} onClose={() => setOpen(null)} admin />

      <Modal open={linkOpen} onClose={() => setLinkOpen(false)}>
        <div className="p-7">
          <h3 className="font-display text-[26px] text-navy">Create a payment link</h3>
          <p className="mt-1 text-[13.5px] text-muted">Send by email or WhatsApp. The payer sees the secure BCC RAK checkout.</p>
          {!linkMade ? (
            <div className="mt-6 space-y-4">
              <Field label="Customer">
                <Select defaultValue="c5">
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Amount (AED, excl. VAT)">
                  <Input defaultValue="5000" />
                </Field>
                <Field label="Expires">
                  <Select defaultValue="14">
                    <option value="7">In 7 days</option>
                    <option value="14">In 14 days</option>
                    <option value="30">In 30 days</option>
                  </Select>
                </Field>
              </div>
              <Field label="Description">
                <Input defaultValue="Business membership renewal (12 months)" />
              </Field>
              <Button variant="dark" className="w-full" onClick={() => setLinkMade(true)}>
                Generate link
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="flex items-center gap-2 rounded-xl border border-hair bg-paper px-4 py-3 font-mono text-[13px] text-navy">
                pay.britishchamberrak.net/l/7Q4K-NORTHCOTE
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => toast({ title: "Link copied" })}>
                  Copy link
                </Button>
                <Button variant="dark" onClick={() => { toast({ title: "Sent on WhatsApp", body: "to Fiona Northcote" }); setLinkOpen(false); }}>
                  Send on WhatsApp
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>
    </div>
  );
}
