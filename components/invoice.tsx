"use client";

import { motion } from "motion/react";
import { Download, Link2, Send, Check } from "lucide-react";
import { Badge, Button, CloseButton, Logo, Modal, statusTone } from "./ui";
import { ORG, invoiceSubtotal, invoiceTotal, invoiceVat, type Invoice, type EInvoiceStatus } from "@/lib/data";
import { aed, cn, fmtDate } from "@/lib/utils";
import { useStore } from "@/lib/store";

const STEPS: EInvoiceStatus[] = ["Queued", "Sent via Peppol", "Accepted"];

export function EInvoiceTrack({ status }: { status: EInvoiceStatus }) {
  if (status === "Not required")
    return <div className="rounded-xl bg-paper px-4 py-3 text-[12.5px] text-muted">Invoice to an individual (B2C) — not part of the UAE e-invoicing mandate.</div>;
  const idx = STEPS.indexOf(status);
  return (
    <div className="rounded-xl border border-hair p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-navy">UAE e-invoice · via Zoho Books</span>
        <span className="font-mono text-[11px] text-faint">PINT-AE · Peppol</span>
      </div>
      <div className="flex items-center">
        {["Issued", "Sent via Peppol", "Accepted by buyer"].map((s, i) => {
          const done = i <= idx;
          return (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full border-2", done ? "border-ok bg-ok text-white" : "border-line bg-white text-faint")}
                >
                  {done && <Check size={12} strokeWidth={3} />}
                </motion.span>
                <span className={cn("text-[11px] whitespace-nowrap", done ? "font-medium text-navy" : "text-faint")}>{s}</span>
              </div>
              {i < 2 && (
                <div className="mx-1 mb-5 h-0.5 flex-1 overflow-hidden rounded bg-line">
                  <motion.div className="h-full bg-ok" initial={{ width: 0 }} animate={{ width: i < idx ? "100%" : "0%" }} transition={{ duration: 0.6, delay: 0.2 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InvoiceSheet({ inv, onClose, admin }: { inv: Invoice | null; onClose: () => void; admin?: boolean }) {
  const toast = useStore((s) => s.toast);
  return (
    <Modal open={!!inv} onClose={onClose} side>
      {inv && (
        <div className="flex min-h-full flex-col">
          <div className="flex items-center justify-between border-b border-hair px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[13px] text-navy">{inv.number}</span>
              <Badge tone={statusTone(inv.status)} dot>
                {inv.status}
              </Badge>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex-1 space-y-6 p-6">
            <div className="rounded-2xl border border-hair bg-white p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <Logo width={120} />
                <div className="text-right">
                  <div className="font-display text-[22px] text-navy">Tax invoice</div>
                  <div className="text-[11.5px] text-faint">TRN {ORG.trn}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-[12.5px]">
                <div>
                  <div className="eyebrow mb-1">Bill to</div>
                  <div className="font-semibold text-navy">{inv.billTo}</div>
                  {inv.b2b && <div className="text-muted">Business customer</div>}
                </div>
                <div className="text-right">
                  <div className="eyebrow mb-1">Dates</div>
                  <div className="text-navy">Issued {fmtDate(inv.issued)}</div>
                  <div className="text-muted">Due {fmtDate(inv.due)}</div>
                </div>
              </div>
              <table className="mt-6 w-full text-[13px]">
                <thead>
                  <tr className="border-b border-hair text-left text-[11.5px] text-faint">
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.lines.map((l, i) => (
                    <tr key={i} className="border-b border-hair/70">
                      <td className="py-2.5 pr-3 text-navy">{l.label}</td>
                      <td className="py-2.5 text-right text-muted tabular">{l.qty}</td>
                      <td className="py-2.5 text-right text-navy tabular">{aed(l.qty * l.unit, { decimals: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 ml-auto w-56 space-y-1.5 text-[13px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="tabular">{aed(invoiceSubtotal(inv), { decimals: true })}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>VAT 5%</span>
                  <span className="tabular">{aed(invoiceVat(inv), { decimals: true })}</span>
                </div>
                <div className="flex justify-between border-t border-hair pt-2 text-[15px] font-semibold text-navy">
                  <span>Total</span>
                  <span className="tabular">{aed(invoiceTotal(inv), { decimals: true })}</span>
                </div>
              </div>
            </div>

            <EInvoiceTrack status={inv.einvoice} />

            {inv.status === "Paid" && inv.method && (
              <div className="flex items-center justify-between rounded-xl bg-ok-soft px-4 py-3 text-[13px] text-ok">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={15} /> Paid with {inv.method}
                </span>
                <span>via RAKBANKpay</span>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-hair bg-white px-6 py-4">
            <Button variant="secondary" onClick={() => toast({ title: "PDF downloaded", body: `${inv.number}.pdf`, tone: "info" })}>
              <Download size={15} /> PDF
            </Button>
            {admin && inv.status !== "Paid" && (
              <>
                <Button variant="secondary" onClick={() => toast({ title: "Payment link copied", body: `pay.britishchamberrak.net/${inv.number}` })}>
                  <Link2 size={15} /> Payment link
                </Button>
                <Button variant="dark" onClick={() => toast({ title: "Reminder sent", body: `Email and WhatsApp to ${inv.billTo}` })}>
                  <Send size={15} /> Send reminder
                </Button>
              </>
            )}
            {!admin && inv.status !== "Paid" && (
              <Button variant="primary" href={`/pay/${inv.id}`} className="ml-auto">
                Pay {aed(invoiceTotal(inv), { decimals: true })}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
