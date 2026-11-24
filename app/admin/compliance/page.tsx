"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, Clock, FileUp, Flag, ShieldCheck, X, History } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, CountUp, Item, PageHeader, Stagger, statusTone } from "@/components/ui";
import { STAFF } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, fmtDate, relLabel, rel, fmtTime } from "@/lib/utils";

const RESULT = {
  pass: { icon: Check, cls: "bg-ok-soft text-ok", label: "Pass" },
  review: { icon: AlertTriangle, cls: "bg-warn-soft text-warn", label: "Review" },
  pending: { icon: Clock, cls: "bg-stone text-muted", label: "Pending" },
  fail: { icon: X, cls: "bg-bad-soft text-bad", label: "Fail" },
};

export default function Compliance() {
  const kyc = useStore((s) => s.kyc);
  const setStatus = useStore((s) => s.setKycStatus);
  const toast = useStore((s) => s.toast);
  const [sel, setSel] = useState(kyc[0].id);
  const c = kyc.find((k) => k.id === sel)!;

  const counts = {
    Clear: kyc.filter((k) => k.status === "Clear").length,
    Open: kyc.filter((k) => k.status !== "Clear").length,
    High: kyc.filter((k) => k.risk === "High").length,
    Monitored: 64,
  };

  return (
    <div>
      <PageHeader
        eyebrow="AML & KYC"
        title="Compliance"
        description="Every new member and sponsor is checked before they’re approved: trade licence, identity, beneficial owners, sanctions, PEP and adverse media. Members are then re-screened automatically."
      />

      <Stagger className="mb-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { l: "Open cases", v: counts.Open, tone: "text-warn" },
          { l: "High risk", v: counts.High, tone: "text-red" },
          { l: "Cleared this quarter", v: counts.Clear + 31, tone: "text-ok" },
          { l: "Under ongoing monitoring", v: counts.Monitored, tone: "text-navy" },
        ].map((k) => (
          <Item key={k.l}>
            <Card className="p-5">
              <div className="text-[12.5px] text-muted">{k.l}</div>
              <div className={cn("font-display mt-2 text-[32px] leading-none", k.tone)}>
                <CountUp value={k.v} />
              </div>
            </Card>
          </Item>
        ))}
      </Stagger>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card className="self-start overflow-hidden">
          <CardHeader title="Cases" />
          <div className="divide-y divide-hair border-t border-hair">
            {kyc.map((k) => (
              <button key={k.id} onClick={() => setSel(k.id)} className={cn("relative flex w-full items-center gap-3 px-5 py-4 text-left transition", sel === k.id ? "bg-paper" : "hover:bg-paper/60")}>
                {sel === k.id && <motion.span layoutId="kyc-sel" className="absolute top-0 bottom-0 left-0 w-[3px] bg-red" />}
                <Avatar name={k.company} size={34} className="!rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-navy">{k.company}</div>
                  <div className="text-[12px] text-faint">Opened {relLabel(k.opened).toLowerCase()}</div>
                </div>
                <Badge tone={statusTone(k.status)}>{k.status}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div key={c.id + c.status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone={statusTone(c.risk)} dot>
                      {c.risk} risk
                    </Badge>
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                  </div>
                  <h2 className="font-display text-[30px] leading-tight text-navy">{c.company}</h2>
                  <div className="text-[13px] text-muted">
                    Applicant: {c.contact} · next review {fmtDate(c.nextReview)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.status !== "Clear" && (
                    <>
                      <Button variant="secondary" onClick={() => { setStatus(c.id, "Awaiting documents"); toast({ title: "Documents requested", body: `Secure upload link sent to ${c.contact}`, tone: "info" }); }}>
                        <FileUp size={15} /> Request documents
                      </Button>
                      {c.risk === "High" && (
                        <Button variant="secondary" onClick={() => toast({ title: "Escalated to the MLRO", body: "Prepared for a goAML report if needed.", tone: "warn" })}>
                          <Flag size={15} /> Escalate
                        </Button>
                      )}
                      <Button variant="dark" onClick={() => { setStatus(c.id, "Clear"); toast({ title: `${c.company} cleared`, body: "The application can now be approved." }); }}>
                        <ShieldCheck size={15} /> Mark as clear
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
              <Card>
                <CardHeader title="Checks" sub="Results from the screening provider and staff review" />
                <ul className="divide-y divide-hair border-t border-hair">
                  {c.checks.map((ch, i) => {
                    const r = RESULT[ch.result];
                    return (
                      <motion.li key={ch.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3.5 px-6 py-3.5">
                        <span className={cn("mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full", r.cls)}>
                          <r.icon size={14} strokeWidth={2.5} />
                        </span>
                        <div className="flex-1">
                          <div className="text-[14px] font-medium text-navy">{ch.label}</div>
                          <div className="text-[12.5px] text-muted">{ch.note}</div>
                        </div>
                        <span className={cn("text-[12px] font-semibold", ch.result === "pass" ? "text-ok" : ch.result === "review" ? "text-warn" : "text-faint")}>{r.label}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </Card>

              <div className="space-y-5">
                <Card>
                  <CardHeader title="Beneficial owners" />
                  <div className="space-y-4 px-6 pb-6">
                    {c.owners.map((o) => (
                      <div key={o.name}>
                        <div className="mb-1.5 flex justify-between text-[13.5px]">
                          <span className="font-medium text-navy">{o.name}</span>
                          <span className="text-muted tabular">{o.share}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-stone">
                          <motion.div className="h-full rounded-full bg-navy" initial={{ width: 0 }} animate={{ width: `${o.share}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <div className="mt-1 text-[11.5px] text-faint">Nationality: {o.nationality}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Audit trail" action={<History size={15} className="text-faint" />} />
                  <ol className="space-y-3 px-6 pb-6 text-[12.5px]">
                    {[
                      { t: "Case opened from application", who: "System", time: c.opened },
                      { t: "Licence and ID verified", who: "Screening provider", time: rel(-Math.abs(Math.round((Date.now() - +new Date(c.opened)) / 864e5)) + 1, 10, 4) },
                      { t: c.risk === "High" ? "Possible sanctions match flagged" : "Screening returned clear", who: "Screening provider", time: rel(-2, 15, 5) },
                      { t: "Reviewed", who: STAFF.admin.name, time: rel(-1, 9, 40) },
                    ].map((a, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-3" />
                        <div className="flex-1">
                          <div className="text-navy">{a.t}</div>
                          <div className="text-faint">
                            {a.who} · {fmtDate(a.time)} {fmtTime(a.time)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
