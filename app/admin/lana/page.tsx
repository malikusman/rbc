"use client";

import Link from "next/link";
import { ArrowUpRight, Database, FileText, Mic, Receipt, CalendarDays, Users, Handshake, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { LanaChat, LanaMark, LANA_GRADIENT } from "@/components/lana";
import { EVENTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { relLabel } from "@/lib/utils";

export default function AskLanaPage() {
  const companies = useStore((s) => s.companies);
  const invoices = useStore((s) => s.invoices);
  const sponsors = useStore((s) => s.sponsors);
  const docs = useStore((s) => s.documents);
  const kyc = useStore((s) => s.kyc);
  const indexed = docs.filter((d) => d.status === "Indexed");

  const sources = [
    { icon: Users, label: "Members & contacts", value: `${companies.length} companies` },
    { icon: Receipt, label: "Billing · Zoho Books", value: `${invoices.length} invoices` },
    { icon: CalendarDays, label: "Events & check-in", value: `${EVENTS.length} events` },
    { icon: Handshake, label: "Sponsors & contracts", value: `${sponsors.length} partners` },
    { icon: ShieldCheck, label: "AML & KYC", value: `${kyc.length} cases` },
    { icon: FileText, label: "Documents", value: `${indexed.length} indexed` },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className="relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-hair bg-white shadow-[var(--shadow-card)]">
            <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full" style={{ background: LANA_GRADIENT }} />
            <LanaMark size={52} className="!self-center" />
          </span>
          <div>
            <h1 className="font-display text-[36px] leading-tight text-navy md:text-[40px]">Ask Lana</h1>
            <p className="text-[15px] text-muted">Questions about members, money, events, partners and documents — answered from live data. Type or speak.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card className="relative flex h-[calc(100vh-230px)] min-h-[560px] flex-col overflow-hidden p-5 md:p-7">
          <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: LANA_GRADIENT }} />
          <LanaChat ctx="admin" variant="page" />
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold text-navy">
              <Database size={15} /> What Lana can see
            </div>
            <ul className="space-y-2.5">
              {sources.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-[13px]">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-paper text-navy">
                    <s.icon size={14} />
                  </span>
                  <span className="flex-1 text-navy-2">{s.label}</span>
                  <span className="text-[12px] text-faint tabular">{s.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-1.5 text-[11.5px] text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Synced a few minutes ago · staff access only
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-navy">Recently read</span>
              <Link href="/admin/lana/knowledge" className="flex items-center gap-1 text-[12.5px] font-medium text-navy hover:text-red">
                Knowledge base <ArrowUpRight size={13} />
              </Link>
            </div>
            <ul className="space-y-3">
              {docs.slice(0, 4).map((d) => (
                <li key={d.id} className="flex items-start gap-2.5">
                  <FileText size={14} className="mt-0.5 shrink-0 text-faint" />
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium text-navy">{d.name}</div>
                    <div className="text-[11.5px] text-faint">
                      {d.owner.name} · {relLabel(d.uploaded)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-navy">
              <Mic size={15} /> Ask out loud
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">Press the microphone and ask, for example: “Who hasn’t paid yet?” Turn on Read aloud and Lana answers by voice too.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
