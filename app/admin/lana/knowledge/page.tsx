"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Loader2, Search, UploadCloud } from "lucide-react";
import { Badge, Button, Card, CardHeader, CloseButton, CountUp, Field, Modal, PageHeader, Select } from "@/components/ui";
import { LanaMark, LanaPill, LANA_GRADIENT, useLanaUI } from "@/components/lana";
import { PIPELINE, type KnowledgeDoc } from "@/lib/knowledge";
import { useStore } from "@/lib/store";
import { STAFF } from "@/lib/data";
import { cn, relLabel } from "@/lib/utils";

const OWNER_TYPES = ["All", "Chamber", "Members", "Sponsors"] as const;

export default function Knowledge() {
  const docs = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const companies = useStore((s) => s.companies);
  const sponsors = useStore((s) => s.sponsors);
  const setLana = useLanaUI((s) => s.setOpen);
  const [owner, setOwner] = useState("chamber");
  const [filter, setFilter] = useState<(typeof OWNER_TYPES)[number]>("All");
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const [open, setOpen] = useState<KnowledgeDoc | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const ownerFor = (): KnowledgeDoc["owner"] => {
    if (owner === "chamber") return { type: "chamber", name: "BCC RAK" };
    const [t, id] = owner.split(":");
    if (t === "m") return { type: "member", id, name: companies.find((c) => c.id === id)?.name ?? "Member" };
    return { type: "sponsor", id, name: sponsors.find((x) => x.id === id)?.name ?? "Sponsor" };
  };

  const ingest = (files: FileList | File[]) => {
    Array.from(files).forEach((f) => {
      const kb = f.size / 1024;
      addDocument({ name: f.name, size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`, owner: ownerFor(), by: STAFF.admin.name });
    });
  };

  const demo = () => addDocument({ name: "Clyde Marine Services — trade licence 2027.pdf", size: "412 KB", owner: { type: "member", id: "c11", name: "Clyde Marine Services" }, by: STAFF.admin.name });

  const list = docs
    .filter((d) => filter === "All" || (filter === "Chamber" ? d.owner.type === "chamber" : filter === "Members" ? d.owner.type === "member" : d.owner.type === "sponsor"))
    .filter((d) => (d.name + d.owner.name + d.kind).toLowerCase().includes(q.toLowerCase()));
  const processing = docs.filter((d) => d.status !== "Indexed");
  const factCount = docs.reduce((t, d) => t + (d.status === "Indexed" ? d.facts.length : 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge base"
        title={<span className="flex items-center gap-3">Documents Lana has read</span>}
        description="Upload contracts, trade licences, KYC files, minutes and spreadsheets for any member or sponsor. Lana reads them, pulls out the key facts, links them to the right record and can answer questions about them."
        actions={
          <Button variant="dark" onClick={() => setLana(true, "What does the Meridian contract say about renewal?")}>
            <LanaMark size={18} /> Ask about documents
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { l: "Documents indexed", v: docs.filter((d) => d.status === "Indexed").length },
          { l: "Facts extracted", v: factCount },
          { l: "Members & sponsors covered", v: new Set(docs.filter((d) => d.owner.id).map((d) => d.owner.id)).size },
          { l: "Processing now", v: processing.length },
        ].map((k) => (
          <Card key={k.l} className="p-5">
            <div className="text-[12.5px] text-muted">{k.l}</div>
            <div className="font-display mt-2 text-[32px] leading-none text-navy">
              <CountUp value={k.v} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Who is this document about?">
              <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
                <option value="chamber">The Chamber (internal)</option>
                <optgroup label="Members">
                  {companies.filter((c) => c.tier).map((c) => (
                    <option key={c.id} value={`m:${c.id}`}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sponsors & partners">
                  {sponsors.map((x) => (
                    <option key={x.id} value={`s:${x.id}`}>
                      {x.name}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </Field>
            <Button variant="secondary" onClick={demo}>
              Try a sample file
            </Button>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              ingest(e.dataTransfer.files);
            }}
            onClick={() => input.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload documents"
            className={cn("relative mt-5 flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition", drag ? "border-[#8A7BE8] bg-[#8A7BE8]/5" : "border-line hover:border-[#8A7BE8]/60")}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-paper">
              <UploadCloud size={22} className="text-navy" />
            </span>
            <div className="mt-3 text-[15px] font-semibold text-navy">Drop files here, or click to choose</div>
            <div className="mt-1 text-[12.5px] text-faint">PDF, Word, Excel, CSV and images · up to 50 MB each</div>
            <input ref={input} type="file" multiple className="hidden" onChange={(e) => e.target.files && ingest(e.target.files)} />
          </div>
          <p className="mt-3 text-[12px] text-faint">Files stay private to the Chamber. Members and sponsors can also upload their own documents from their portals.</p>
        </Card>

        <Card>
          <CardHeader title="Processing" sub="Every file goes through the same four steps" action={<LanaPill>Lana</LanaPill>} />
          <div className="space-y-3 px-6 pb-6">
            <AnimatePresence initial={false}>
              {(processing.length ? processing : docs.slice(0, 2)).map((d) => {
                const idx = PIPELINE.findIndex((p) => p.status === d.status);
                return (
                  <motion.div key={d.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-hair p-4">
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="shrink-0 text-navy" />
                      <span className="flex-1 truncate text-[13px] font-medium text-navy">{d.name}</span>
                      {d.status === "Indexed" ? <Badge tone="ok">Ready</Badge> : <Loader2 size={14} className="animate-spin text-[#8A7BE8]" />}
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone">
                      <motion.div className="h-full rounded-full" style={{ background: LANA_GRADIENT }} animate={{ width: `${d.progress}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-1 text-[11px]">
                      {PIPELINE.map((p, i) => (
                        <span key={p.status} className={cn("flex items-center gap-1", i <= idx ? "text-navy" : "text-faint")}>
                          {i < idx || d.status === "Indexed" ? <Check size={11} className="text-ok" /> : i === idx ? <span className="h-1.5 w-1.5 rounded-full bg-[#8A7BE8]" /> : <span className="h-1.5 w-1.5 rounded-full bg-line" />}
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <div className="flex gap-1.5">
            {OWNER_TYPES.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium transition", filter === t ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:text-navy")}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-72">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" aria-label="Search documents" className="h-9 w-full rounded-xl border border-hair bg-white pr-3 pl-9 text-[13px] outline-none focus:border-line" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13.5px]">
            <thead>
              <tr className="border-y border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                <th className="px-6 py-3">Document</th>
                <th className="px-3 py-3">About</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Facts</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-6 py-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} onClick={() => setOpen(d)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                  <td className="max-w-[340px] px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="shrink-0 text-faint" />
                      <span className="truncate font-medium text-navy">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-navy-2">{d.owner.name}</td>
                  <td className="px-3 py-3.5">
                    <Badge>{d.kind}</Badge>
                  </td>
                  <td className="px-3 py-3.5 text-muted tabular">{d.status === "Indexed" ? d.facts.length : "—"}</td>
                  <td className="px-3 py-3.5">
                    <Badge tone={d.status === "Indexed" ? "ok" : "info"} dot>
                      {d.status === "Indexed" ? "Ready" : d.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-muted">
                    {relLabel(d.uploaded)} · {d.uploadedBy.split(" ")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)} side>
        {open && (
          <div>
            <div className="relative flex items-center justify-between border-b border-hair px-6 py-4">
              <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: LANA_GRADIENT }} />
              <Badge>{open.kind}</Badge>
              <CloseButton onClick={() => setOpen(null)} />
            </div>
            <div className="space-y-6 p-6">
              <div>
                <h2 className="font-display text-[24px] leading-snug text-navy">{open.name}</h2>
                <div className="mt-1 text-[12.5px] text-faint">
                  {open.owner.name} · {open.pages} pages · {open.size} · uploaded by {open.uploadedBy}
                </div>
              </div>
              <div className="rounded-xl bg-paper p-4">
                <div className="mb-1.5 flex items-center gap-2 text-[12.5px] font-semibold text-navy">
                  <LanaMark size={16} /> Lana’s summary
                </div>
                <p className="text-[14px] leading-relaxed text-navy-2">{open.summary}</p>
              </div>
              <div>
                <div className="eyebrow mb-3">Facts extracted</div>
                <dl className="grid grid-cols-2 gap-3">
                  {open.facts.map((f) => (
                    <div key={f.label} className="rounded-xl border border-hair p-3">
                      <dt className="text-[11.5px] text-faint">{f.label}</dt>
                      <dd className="text-[14px] font-medium text-navy">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Button
                variant="dark"
                className="w-full"
                onClick={() => {
                  const name = open.owner.name.split(" ")[0];
                  setOpen(null);
                  setLana(true, `What does the ${name} ${open.kind.toLowerCase()} say?`);
                }}
              >
                <LanaMark size={18} /> Ask Lana about this document
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
