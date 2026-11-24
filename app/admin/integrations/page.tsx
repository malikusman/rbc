"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, RefreshCw, Settings2 } from "lucide-react";
import { Badge, Button, Card, CloseButton, Item, Modal, PageHeader, Stagger, statusTone } from "@/components/ui";
import { INTEGRATIONS, type Integration } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, fmtTime, relLabel } from "@/lib/utils";

const LOGS: Record<string, string[]> = {
  zoho: ["Invoice BCC-2026-0221 created in Zoho Books", "Payment AED 1,575.00 matched to BCC-2026-0221", "E-invoice BCC-2026-0219 accepted by buyer (Peppol)", "Customer ‘Yorkstone Construction’ created"],
  rakbank: ["Payment captured · Google Pay · AED 1,575.00", "Payout AED 41,290.00 to account •• 0193", "3-D Secure challenge passed · Visa", "Refund AED 175.00 processed"],
  mailchimp: ["Audience sync: 412 contacts", "4 hard bounces flagged", "Campaign ‘Weekly Update’ scheduled", "Segment ‘Founding members’ updated"],
};

export default function Integrations() {
  const status = useStore((s) => s.integrationStatus);
  const connect = useStore((s) => s.connectIntegration);
  const toast = useStore((s) => s.toast);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<Integration | null>(null);
  const cats = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));
  const connected = INTEGRATIONS.filter((i) => status[i.id] === "Connected").length;

  const doConnect = (i: Integration) => {
    setBusy(i.id);
    setTimeout(() => {
      connect(i.id);
      setBusy(null);
      toast({ title: `${i.name} connected`, body: "First sync complete." });
    }, 1400);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="Connected apps"
        description={`${connected} of ${INTEGRATIONS.length} connected. The platform talks to each service through its own adapter, so any one can be swapped without touching the rest.`}
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((i) => {
          const s = status[i.id] ?? i.status;
          return (
            <Item key={i.id}>
              <Card className="group flex h-full flex-col p-5 transition hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold tracking-wide text-white" style={{ background: i.hue }}>
                    {i.mark}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-navy">{i.name}</div>
                    <div className="text-[12px] text-faint">{i.category}</div>
                  </div>
                  <Badge tone={statusTone(s)} dot>
                    {s === "Available" ? "Not connected" : s}
                  </Badge>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{i.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <span className="truncate text-[11.5px] text-faint">{s !== "Available" ? i.detail ?? (i.lastSync ? `Synced ${relLabel(i.lastSync).toLowerCase()}` : "") : "Ready to connect"}</span>
                  {s === "Available" ? (
                    <Button size="sm" variant="dark" onClick={() => doConnect(i)} disabled={busy === i.id}>
                      {busy === i.id ? <Loader2 size={14} className="animate-spin" /> : "Connect"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setOpen(i)}>
                      <Settings2 size={13} /> Manage
                    </Button>
                  )}
                </div>
              </Card>
            </Item>
          );
        })}
      </Stagger>

      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[15px] font-semibold text-navy">How the pieces fit</div>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
              The public website stays on WordPress + Elementor at GoDaddy. This platform runs alongside it at portal.britishchamberrak.net, shares the same login button and events feed, and connects to payments, accounting, email and calendars below.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <span key={c} className="rounded-full border border-hair bg-paper px-2.5 py-1 text-[11.5px] text-muted">
                {c}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} side>
        {open && (
          <div>
            <div className="flex items-center justify-between border-b border-hair px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ background: open.hue }}>
                  {open.mark}
                </span>
                <span className="text-[15px] font-semibold text-navy">{open.name}</span>
              </div>
              <CloseButton onClick={() => setOpen(null)} />
            </div>
            <div className="space-y-6 p-6">
              <p className="text-[14px] leading-relaxed text-muted">{open.description}</p>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-xl bg-paper p-4">
                  <div className="text-faint">Status</div>
                  <div className="mt-0.5 font-semibold text-navy">{status[open.id]}</div>
                </div>
                <div className="rounded-xl bg-paper p-4">
                  <div className="text-faint">Last sync</div>
                  <div className="mt-0.5 font-semibold text-navy">{open.lastSync ? `${relLabel(open.lastSync)} ${fmtTime(open.lastSync)}` : "Real-time"}</div>
                </div>
              </div>
              <div>
                <div className="eyebrow mb-3">Sync log</div>
                <ol className="space-y-2.5">
                  <AnimatePresence>
                    {(LOGS[open.id] ?? ["Connection healthy", "Webhook received", "Settings unchanged"]).map((l, idx) => (
                      <motion.li key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className="flex items-start gap-2.5 text-[13px]">
                        <span className={cn("mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full", l.includes("bounce") ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok")}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className="flex-1 text-navy">{l}</span>
                        <span className="text-[11.5px] text-faint">{idx * 7 + 2}m ago</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              </div>
              <Button variant="dark" className="w-full" onClick={() => toast({ title: "Sync started", body: open.name, tone: "info" })}>
                <RefreshCw size={15} /> Sync now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
