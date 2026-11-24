"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Avatar, Badge, Button, Card, CloseButton, CountUp, Field, Input, Item, Modal, PageHeader, ProgressBar, ProgressRing, Select, Stagger, Textarea, statusTone } from "@/components/ui";
import { STAFF } from "@/lib/data";
import { BENEFITS, LEVEL_STYLE, type Benefit, type Sponsor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, compactAed, daysFromNow, fmtDate } from "@/lib/utils";

function benefitsFor(sp: Sponsor): Benefit[] {
  const own = BENEFITS.filter((b) => b.sponsorId === sp.id);
  if (own.length) return own;
  const scale = sp.level === "Gold" ? 1 : sp.level === "Silver" ? 0.5 : 0.4;
  const done = Math.max(0, -daysFromNow(sp.start)) / 365;
  return [
    { id: `${sp.id}-1`, sponsorId: sp.id, label: "Event branding", detail: "", total: Math.max(1, Math.round(3 * scale)), delivered: Math.round(3 * scale * done) },
    { id: `${sp.id}-2`, sponsorId: sp.id, label: "Complimentary tickets", detail: "", total: Math.round(24 * scale), delivered: Math.round(24 * scale * done * 1.1) },
    { id: `${sp.id}-3`, sponsorId: sp.id, label: "Weekly Update features", detail: "", total: Math.max(1, Math.round(8 * scale)), delivered: Math.round(8 * scale * done) },
    { id: `${sp.id}-4`, sponsorId: sp.id, label: "Website logo placement", detail: "", total: 1, delivered: daysFromNow(sp.start) < 0 ? 1 : 0 },
  ];
}

export default function Sponsors() {
  const toast = useStore((s) => s.toast);
  const [open, setOpen] = useState<Sponsor | null>(null);
  const [bumped, setBumped] = useState<Record<string, number>>({});
  const SPONSORS = useStore((s) => s.sponsors);
  const addSponsor = useStore((s) => s.addSponsor);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", sector: "", level: "Gold" as Sponsor["level"], contact: "", email: "", rm: STAFF.rm.name, note: "" });
  const LEVEL_PRICE: Record<Sponsor["level"], number> = { Platinum: 150000, Gold: 75000, Silver: 35000, Partner: 20000 };

  const groups = [
    { label: "Active & signed", list: SPONSORS.filter((s) => s.stage === "Active" || s.stage === "Signed") },
    { label: "In negotiation", list: SPONSORS.filter((s) => s.stage === "Renewal talks" || s.stage === "Proposal") },
  ];
  const booked = groups[0].list.reduce((s, x) => s + x.amount, 0);
  const pipe = groups[1].list.reduce((s, x) => s + x.amount, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Sponsors & partners"
        title="Partnerships"
        description="Contracts, value, validity and benefit delivery for every sponsor — and what each relationship manager owes them next."
        actions={
          <Button variant="dark" onClick={() => setCreating(true)}>
            <Plus size={15} /> New sponsorship
          </Button>
        }
      />

      <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { l: "Booked this year", v: booked, f: compactAed },
          { l: "In negotiation", v: pipe, f: compactAed },
          { l: "Active partners", v: groups[0].list.length, f: (n: number) => Math.round(n).toString() },
          { l: "Avg. benefits delivered", v: 41, f: (n: number) => `${Math.round(n)}%` },
        ].map((k) => (
          <Item key={k.l}>
            <Card className="p-5">
              <div className="text-[12.5px] text-muted">{k.l}</div>
              <div className="font-display mt-2 text-[32px] leading-none text-navy">
                <CountUp value={k.v} format={k.f} />
              </div>
            </Card>
          </Item>
        ))}
      </Stagger>

      {groups.map((g) => (
        <div key={g.label} className="mt-8">
          <div className="eyebrow mb-3">{g.label}</div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[13.5px]">
                <thead>
                  <tr className="border-b border-hair bg-paper/60 text-left text-[11.5px] font-semibold tracking-wide text-faint uppercase">
                    <th className="px-6 py-3">Partner</th>
                    <th className="px-3 py-3">Level</th>
                    <th className="px-3 py-3 text-right">Value</th>
                    <th className="px-3 py-3">Validity</th>
                    <th className="px-3 py-3">Benefits</th>
                    <th className="px-3 py-3">Stage</th>
                    <th className="px-6 py-3">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {g.list.map((s) => {
                    const total = (+new Date(s.end) - +new Date(s.start)) / 86_400_000;
                    const el = Math.max(0, -daysFromNow(s.start)) / total;
                    const bs = benefitsFor(s);
                    const del = bs.reduce((a, b) => a + Math.min(1, b.delivered / b.total), 0) / bs.length;
                    return (
                      <tr key={s.id} onClick={() => setOpen(s)} className="cursor-pointer border-b border-hair/70 transition last:border-0 hover:bg-paper/60">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} size={34} className="!rounded-xl" />
                            <div>
                              <div className="flex items-center gap-2 font-semibold text-navy">
                                {s.name}
                                {"source" in s && s.source === "Website" && <Badge tone="info">Website enquiry</Badge>}
                              </div>
                              <div className="text-[12px] text-faint">{s.sector}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${LEVEL_STYLE[s.level].bg} ${LEVEL_STYLE[s.level].text}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: LEVEL_STYLE[s.level].ring }} /> {s.level}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right font-semibold text-navy tabular">{aed(s.amount)}</td>
                        <td className="w-44 px-3 py-4">
                          <ProgressBar value={el} />
                          <div className="mt-1 text-[11.5px] text-faint">
                            {fmtDate(s.start, "day")} – {fmtDate(s.end)}
                          </div>
                        </td>
                        <td className="w-36 px-3 py-4">
                          <ProgressBar value={del} color="bg-copper" />
                          <div className="mt-1 text-[11.5px] text-faint">{Math.round(del * 100)}% delivered</div>
                        </td>
                        <td className="px-3 py-4">
                          <Badge tone={statusTone(s.stage)} dot>
                            {s.stage}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted">
                            <Avatar name={s.rm} size={22} /> {s.rm.split(" ")[0]}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}

      <Modal open={creating} onClose={() => setCreating(false)}>
        <div className="p-7">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-[26px] text-navy">New sponsorship</h3>
              <p className="mt-1 text-[13.5px] text-muted">Starts as a proposal. Send the contract from Zoho Sign once it’s agreed.</p>
            </div>
            <CloseButton onClick={() => setCreating(false)} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Company" className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gulfside Shipping" />
            </Field>
            <Field label="Sector">
              <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="e.g. Logistics" />
            </Field>
            <Field label="Level" hint={`Default value ${aed(LEVEL_PRICE[form.level])}`}>
              <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Sponsor["level"] })}>
                {(Object.keys(LEVEL_PRICE) as Sponsor["level"][]).map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Contact name">
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Relationship manager" className="sm:col-span-2">
              <Select value={form.rm} onChange={(e) => setForm({ ...form, rm: e.target.value })}>
                <option>{STAFF.rm.name}</option>
                <option>{STAFF.admin.name}</option>
              </Select>
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Objectives, events of interest…" />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="quiet" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              disabled={!form.name.trim()}
              onClick={() => {
                addSponsor({ name: form.name.trim(), sector: form.sector || "Other", level: form.level, amount: LEVEL_PRICE[form.level], rm: form.rm, contact: form.contact, email: form.email, note: form.note, source: "Admin" });
                toast({ title: `${form.name} added`, body: `${form.level} proposal · ${aed(LEVEL_PRICE[form.level])}` });
                setForm({ name: "", sector: "", level: "Gold", contact: "", email: "", rm: STAFF.rm.name, note: "" });
                setCreating(false);
              }}
            >
              Add sponsor
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!open} onClose={() => setOpen(null)} side>
        {open && (
          <div>
            <div className="flex items-center justify-between border-b border-hair px-6 py-4">
              <Badge tone="navy">{open.level}</Badge>
              <CloseButton onClick={() => setOpen(null)} />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-5">
                <ProgressRing value={Math.max(0, -daysFromNow(open.start)) / ((+new Date(open.end) - +new Date(open.start)) / 86_400_000)} size={96} stroke={7}>
                  <div className="font-display text-[22px] text-navy">{Math.max(0, daysFromNow(open.end))}</div>
                  <div className="text-[10.5px] text-faint">days left</div>
                </ProgressRing>
                <div>
                  <h2 className="font-display text-[26px] leading-tight text-navy">{open.name}</h2>
                  <div className="text-[14px] text-navy">{aed(open.amount)}</div>
                  <div className="text-[12.5px] text-muted">RM: {open.rm}</div>
                </div>
              </div>
              <div className="eyebrow mt-8 mb-3">Benefit delivery</div>
              <div className="space-y-3">
                {benefitsFor(open).map((b) => {
                  const d = Math.min(b.total, b.delivered + (bumped[b.id] ?? 0));
                  return (
                    <div key={b.id} className="rounded-xl border border-hair p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[13.5px] font-medium text-navy">{b.label}</span>
                        <span className="text-[13px] font-semibold text-navy tabular">
                          {d}/{b.total}
                        </span>
                      </div>
                      <ProgressBar value={d / b.total} color={d >= b.total ? "bg-ok" : "bg-copper"} />
                      {d < b.total && (
                        <button
                          onClick={() => {
                            setBumped((x) => ({ ...x, [b.id]: (x[b.id] ?? 0) + 1 }));
                            toast({ title: "Benefit logged", body: `${b.label} · the sponsor sees this in their portal` });
                          }}
                          className="mt-2.5 flex items-center gap-1 text-[12.5px] font-semibold text-navy hover:text-red"
                        >
                          <Check size={13} /> Log one delivered
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
