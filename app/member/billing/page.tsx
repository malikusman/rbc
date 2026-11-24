"use client";

import { useState } from "react";
import { CreditCard, Plus, Building2 } from "lucide-react";
import { AppleMark, Badge, Button, Card, CardHeader, CountUp, PageHeader, Toggle, statusTone } from "@/components/ui";
import { InvoiceSheet } from "@/components/invoice";
import { COMPANIES, ME_MEMBER, invoiceTotal, type Invoice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, fmtDate } from "@/lib/utils";

export default function Billing() {
  const invoices = useStore((s) => s.invoices).filter((i) => i.companyId === "c1");
  const autoRenew = useStore((s) => s.autoRenew);
  const setAutoRenew = useStore((s) => s.setAutoRenew);
  const toast = useStore((s) => s.toast);
  const [open, setOpen] = useState<Invoice | null>(null);
  const company = COMPANIES.find((c) => c.id === ME_MEMBER.companyId)!;
  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + invoiceTotal(i), 0);
  const paidYear = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + invoiceTotal(i), 0);

  return (
    <div>
      <PageHeader eyebrow="Billing" title="Invoices & payments" description="Pay securely through the Chamber’s RAK payment gateway. Business invoices are sent as UAE e-invoices automatically." />

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-[12.5px] text-muted">Outstanding</div>
          <div className="font-display mt-2 text-[36px] leading-none text-navy">
            <CountUp value={outstanding} format={(n) => aed(n, { decimals: true })} />
          </div>
          {outstanding > 0 && (
            <Button variant="primary" size="sm" className="mt-4" href={`/pay/${invoices.find((i) => i.status !== "Paid")?.id}`}>
              Pay now
            </Button>
          )}
        </Card>
        <Card className="p-6">
          <div className="text-[12.5px] text-muted">Paid this year</div>
          <div className="font-display mt-2 text-[36px] leading-none text-navy">
            <CountUp value={paidYear} format={(n) => aed(n, { decimals: true })} />
          </div>
          <div className="mt-4 text-[12.5px] text-faint">{invoices.filter((i) => i.status === "Paid").length} invoices settled</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[12.5px] text-muted">Membership auto-renew</div>
            <Toggle checked={autoRenew} onChange={setAutoRenew} label="Auto-renew" />
          </div>
          <div className="mt-3 text-[15px] font-semibold text-navy">{autoRenew ? `Renews ${fmtDate(company.renews!)}` : "Manual renewal"}</div>
          <div className="mt-1 text-[12.5px] text-faint">We’ll remind you 30, 14 and 3 days before.</div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <CardHeader title="Invoices" sub="Click an invoice to see the full document and e-invoice status." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13.5px]">
            <thead>
              <tr className="border-y border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                <th className="px-6 py-3">Invoice</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Issued</th>
                <th className="px-3 py-3">E-invoice</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} onClick={() => setOpen(inv)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                  <td className="px-6 py-4 font-mono text-[12.5px] text-navy">{inv.number}</td>
                  <td className="max-w-[280px] truncate px-3 py-4 text-navy">{inv.lines[0].label}</td>
                  <td className="px-3 py-4 text-muted">{fmtDate(inv.issued)}</td>
                  <td className="px-3 py-4">
                    <Badge tone={statusTone(inv.einvoice)}>{inv.einvoice}</Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Badge tone={statusTone(inv.status)} dot>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-navy tabular">{aed(invoiceTotal(inv), { decimals: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader
            title="Payment methods"
            action={
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Card form opened", tone: "info" })}>
                <Plus size={14} /> Add
              </Button>
            }
          />
          <div className="space-y-2.5 px-6 pb-6">
            <div className="flex items-center gap-3 rounded-xl border border-hair p-3.5">
              <span className="inline-flex h-9 w-12 items-center justify-center rounded-md bg-navy text-[10px] font-bold tracking-wider text-white">VISA</span>
              <div className="flex-1 text-[13.5px]">
                <div className="font-medium text-navy">Visa •• 4417</div>
                <div className="text-[12px] text-faint">Expires 08/28 · used for renewals</div>
              </div>
              <Badge tone="navy">Default</Badge>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-hair p-3.5">
              <span className="inline-flex h-9 w-12 items-center justify-center rounded-md bg-black text-[11px] font-semibold text-white"><AppleMark size={12} /><span className="ml-0.5">Pay</span></span>
              <div className="flex-1 text-[13.5px]">
                <div className="font-medium text-navy">Apple Pay</div>
                <div className="text-[12px] text-faint">Available on iPhone and Mac</div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Billing details" sub="Used on tax invoices and e-invoices." action={<CreditCard size={16} className="text-faint" />} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 pb-4 text-[13.5px]">
            <div>
              <dt className="text-[12px] text-faint">Company</dt>
              <dd className="font-medium text-navy">{company.name}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-faint">TRN</dt>
              <dd className="font-mono text-[12.5px] text-navy">{company.trn}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-faint">Licence</dt>
              <dd className="text-navy">{company.licence}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-faint">Invoices to</dt>
              <dd className="text-navy">accounts@thameshajar.ae</dd>
            </div>
          </dl>
          <div className="mx-6 mb-6 flex items-center gap-2 rounded-xl bg-paper px-3 py-2.5 text-[12.5px] text-muted">
            <Building2 size={14} /> Registered on Peppol — e-invoices arrive in your accounting system.
          </div>
        </Card>
      </div>

      <InvoiceSheet inv={open} onClose={() => setOpen(null)} />
    </div>
  );
}
