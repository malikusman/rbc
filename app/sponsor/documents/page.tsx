"use client";

import { useState } from "react";
import { FileText, Download, FileSignature, Image as ImageIcon } from "lucide-react";
import { Badge, Card, CardHeader, PageHeader, statusTone } from "@/components/ui";
import { InvoiceSheet } from "@/components/invoice";
import { DocUpload } from "@/components/doc-upload";
import { invoiceTotal, type Invoice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, fmtDate } from "@/lib/utils";

const DOCS = [
  { name: "Platinum sponsorship agreement", meta: "Signed via Zoho Sign · 2 parties", icon: FileSignature, tag: "Signed" },
  { name: "Brand guidelines — Meridian Bank", meta: "PDF · 4.2 MB · uploaded by you", icon: FileText, tag: "Shared" },
  { name: "Logo pack (white, navy, colour)", meta: "ZIP · SVG + PNG", icon: ImageIcon, tag: "Shared" },
  { name: "Launch evening — stage backdrop proof v2", meta: "PDF · from BCC RAK", icon: FileText, tag: "For approval" },
];

export default function Documents() {
  const invoices = useStore((s) => s.invoices).filter((i) => i.companyId === "c13");
  const toast = useStore((s) => s.toast);
  const [open, setOpen] = useState<Invoice | null>(null);

  return (
    <div>
      <PageHeader eyebrow="Documents & billing" title="Contracts, assets and invoices" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Documents" />
          <div className="divide-y divide-hair border-t border-hair">
            {DOCS.map((d) => (
              <div key={d.name} className="flex items-center gap-4 px-6 py-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-navy">
                  <d.icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-navy">{d.name}</div>
                  <div className="text-[12px] text-faint">{d.meta}</div>
                </div>
                <Badge tone={d.tag === "For approval" ? "warn" : d.tag === "Signed" ? "ok" : "neutral"}>{d.tag}</Badge>
                <button onClick={() => toast({ title: "Downloading", body: d.name, tone: "info" })} className="text-faint hover:text-navy" aria-label="Download">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-6">
            <DocUpload owner={{ type: "sponsor", id: "s1", name: "Meridian Bank RAK" }} by="James Okafor" hint="Logos, brand guidelines, event artwork or signed documents" />
          </div>
        </Card>

        <Card className="self-start overflow-hidden">
          <CardHeader title="Invoices" sub="Sent as UAE e-invoices to your accounts team." />
          <div className="divide-y divide-hair border-t border-hair">
            {invoices.map((inv) => (
              <button key={inv.id} onClick={() => setOpen(inv)} className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-paper/60">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-navy">{inv.lines[0].label}</div>
                  <div className="font-mono text-[11.5px] text-faint">
                    {inv.number} · {fmtDate(inv.issued)}
                  </div>
                </div>
                <Badge tone={statusTone(inv.einvoice)}>{inv.einvoice}</Badge>
                <Badge tone={statusTone(inv.status)} dot>
                  {inv.status}
                </Badge>
                <span className="w-28 text-right text-[14px] font-semibold text-navy tabular">{aed(invoiceTotal(inv))}</span>
              </button>
            ))}
          </div>
          <div className="bg-paper/60 px-6 py-4 text-[12.5px] text-muted">Prefer to pay by bank transfer? Use the invoice number as your reference.</div>
        </Card>
      </div>
      <InvoiceSheet inv={open} onClose={() => setOpen(null)} />
    </div>
  );
}
