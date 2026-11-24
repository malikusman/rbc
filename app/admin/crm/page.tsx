"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Search } from "lucide-react";
import { Avatar, Badge, Button, Card, CloseButton, Field, Input, Modal, PageHeader, Segmented, Select, Toggle, statusTone } from "@/components/ui";
import { TIERS, type TierId } from "@/lib/data";
import { PEOPLE, companyById, tierById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, fmtDate, relLabel } from "@/lib/utils";

const STATUSES = ["All", "Active", "Renewal due", "Sponsor", "Prospect", "Lapsed"] as const;

export default function Crm() {
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const COMPANIES = useStore((s) => s.companies);
  const addCompany = useStore((s) => s.addCompany);
  const [adding, setAdding] = useState(false);
  const blank = { name: "", sector: "", emirate: "RAK Mainland", tier: "business" as TierId, founding: true, contact: "", email: "", trn: "" };
  const [form, setForm] = useState(blank);
  const [tab, setTab] = useState<"companies" | "people">("companies");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const companies = useMemo(
    () =>
      COMPANIES.filter((c) => status === "All" || c.status === status).filter((c) => (c.name + c.sector + c.emirate).toLowerCase().includes(q.toLowerCase())),
    [q, status, COMPANIES],
  );
  const people = useMemo(() => PEOPLE.filter((p) => (p.name + p.role + p.email + (companyById(p.companyId)?.name ?? "")).toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Members & contacts"
        description="Every company and person the Chamber works with, with their membership, payments and event history in one record."
        actions={
          <>
            <Button variant="secondary" onClick={() => toast({ title: "Export ready", body: "members.csv downloaded", tone: "info" })}>
              <Download size={15} /> Export
            </Button>
            <Button variant="dark" onClick={() => setAdding(true)}>
              <Plus size={15} /> Add member
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented
          id="crm"
          value={tab}
          onChange={setTab}
          options={[
            { value: "companies", label: `Companies · ${COMPANIES.length}` },
            { value: "people", label: `People · ${PEOPLE.length}` },
          ]}
        />
        <div className="relative lg:ml-3 lg:w-80">
          <Search size={15} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, sector, email…" className="h-10 w-full rounded-xl border border-hair bg-white pr-3 pl-10 text-[13.5px] outline-none focus:border-line" />
        </div>
        {tab === "companies" && (
          <div className="flex flex-wrap gap-1.5 lg:ml-auto">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium transition", status === s ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:text-navy")}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "companies" ? (
            <table className="w-full min-w-[920px] text-[13.5px]">
              <thead>
                <tr className="border-b border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-3 py-3">Membership</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Renews</th>
                  <th className="px-3 py-3">Contacts</th>
                  <th className="px-3 py-3">Data quality</th>
                  <th className="px-6 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} onClick={() => router.push(`/admin/crm/${c.id}`)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size={34} className="!rounded-xl" />
                        <div>
                          <div className="font-semibold text-navy">{c.name}</div>
                          <div className="text-[12px] text-faint">
                            {c.sector} · {c.emirate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-navy">{tierById(c.tier)?.name ?? "—"}</span>
                        {c.founding && <Badge tone="copper">Founding</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge tone={statusTone(c.status)} dot>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-muted">{c.renews ? fmtDate(c.renews) : "—"}</td>
                    <td className="px-3 py-3.5 text-muted tabular">{c.contacts}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone">
                          <div className={cn("h-full rounded-full", c.quality >= 85 ? "bg-ok" : c.quality >= 65 ? "bg-copper" : "bg-red")} style={{ width: `${c.quality}%` }} />
                        </div>
                        <span className="text-[12px] text-muted tabular">{c.quality}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-muted">
                        <Avatar name={c.owner} size={22} /> {c.owner.split(" ")[0]}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[860px] text-[13.5px]">
              <thead>
                <tr className="border-b border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Tags</th>
                  <th className="px-6 py-3">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} onClick={() => router.push(`/admin/crm/${p.companyId}`)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} size={32} />
                        <div>
                          <div className="font-semibold text-navy">{p.name}</div>
                          <div className="text-[12px] text-faint">{p.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-navy">{companyById(p.companyId)?.name}</td>
                    <td className="px-3 py-3.5 text-muted">{p.email}</td>
                    <td className="px-3 py-3.5 font-mono text-[12.5px] text-muted">{p.phone}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((t) => (
                          <Badge key={t} tone={t === "Sponsor" ? "copper" : t === "Founding" ? "navy" : "neutral"}>
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-muted">{relLabel(p.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)}>
        <div className="p-7">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-[26px] text-navy">Add a member</h3>
              <p className="mt-1 text-[13.5px] text-muted">For members who joined offline. Website applications arrive in Applications automatically.</p>
            </div>
            <CloseButton onClick={() => setAdding(false)} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Company" className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Harrow & Gulf Consulting" />
            </Field>
            <Field label="Sector">
              <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="e.g. Consulting" />
            </Field>
            <Field label="Emirate / zone">
              <Select value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value })}>
                {["RAK Mainland", "RAKEZ", "RAK ICC", "RAK Maritime City", "Other emirate"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Field>
            <Field label="Membership tier">
              <Select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as TierId })}>
                {TIERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · AED {t.price.toLocaleString("en-GB")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="TRN (optional)" hint="Needed for business e-invoices">
              <Input value={form.trn} onChange={(e) => setForm({ ...form, trn: e.target.value })} className="font-mono" />
            </Field>
            <Field label="Main contact">
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-hair px-4 py-3 sm:col-span-2">
              <span className="text-[13.5px] text-navy">Founding member</span>
              <Toggle checked={form.founding} onChange={(v) => setForm({ ...form, founding: v })} label="Founding member" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="quiet" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              disabled={!form.name.trim()}
              onClick={() => {
                const id = addCompany({ name: form.name.trim(), sector: form.sector || "Other", emirate: form.emirate, tier: form.tier, founding: form.founding, trn: form.trn || undefined });
                toast({ title: `${form.name} added`, body: form.email ? `Welcome email and invoice sent to ${form.email}` : "Member record created" });
                setForm(blank);
                setAdding(false);
                router.push(`/admin/crm/${id}`);
              }}
            >
              Add member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
