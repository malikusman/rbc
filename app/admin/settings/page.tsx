"use client";

import { Plus } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, PageHeader, Select, Toggle } from "@/components/ui";
import { ORG, STAFF, TIERS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed } from "@/lib/utils";

const TEAM = [
  { ...STAFF.admin, access: "Admin" },
  { name: STAFF.membership.name, role: STAFF.membership.role, access: "Membership" },
  { name: STAFF.rm.name, role: STAFF.rm.role, access: "Partnerships" },
  { name: STAFF.finance.name, role: STAFF.finance.role, access: "Finance" },
];

export default function AdminSettings() {
  const toast = useStore((s) => s.toast);
  const reset = useStore((s) => s.reset);
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Chamber settings" description="Team access, membership tiers, tax and branding." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Team & roles"
            sub="Signed in with Microsoft 365"
            action={
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Invite sent", tone: "info" })}>
                <Plus size={14} /> Invite
              </Button>
            }
          />
          <div className="divide-y divide-hair border-t border-hair">
            {TEAM.map((t) => (
              <div key={t.name} className="flex items-center gap-3 px-6 py-3.5">
                <Avatar name={t.name} size={34} />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-navy">{t.name}</div>
                  <div className="text-[12.5px] text-muted">{t.role}</div>
                </div>
                <Select defaultValue={t.access} aria-label={`Role for ${t.name}`} className="!h-9 !w-40 text-[13px]">
                  {["Admin", "Membership", "Partnerships", "Events", "Finance", "Compliance"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Membership tiers" sub="Placeholder prices for the demo — confirm with the board" />
          <div className="divide-y divide-hair border-t border-hair">
            {TIERS.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-navy">{t.name}</div>
                  <div className="text-[12.5px] text-muted">
                    {t.seats} seat{t.seats > 1 ? "s" : ""} · {t.blurb}
                  </div>
                </div>
                <span className="font-display text-[20px] text-navy">{aed(t.price)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="text-[14px] font-medium text-navy">Founding status</div>
                <div className="text-[12.5px] text-muted">Granted to members who join before the launch evening</div>
              </div>
              <Toggle checked onChange={() => toast({ title: "Founding window stays open until launch", tone: "info" })} label="Founding" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Organisation & tax" />
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            <Field label="Legal name" className="sm:col-span-2">
              <Input defaultValue={ORG.name} />
            </Field>
            <Field label="TRN">
              <Input defaultValue={ORG.trn} className="font-mono" />
            </Field>
            <Field label="VAT rate">
              <Input defaultValue="5%" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input defaultValue={ORG.address} />
            </Field>
            <Field label="E-invoicing provider (ASP)">
              <Select defaultValue="zoho">
                <option value="zoho">Zoho Books</option>
                <option value="wafeq">Wafeq</option>
              </Select>
            </Field>
            <Field label="Payment gateway">
              <Select defaultValue="rak">
                <option value="rak">RAKBANKpay</option>
                <option value="ngenius">Network International N-Genius</option>
                <option value="stripe">Stripe UAE</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Brand" sub="BCC RAK Design System v1.0" />
          <div className="px-6 pb-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                ["Navy", "#14213A"],
                ["Red", "#B8322A"],
                ["Copper", "#B5713E"],
                ["Paper", "#F8F6F1"],
              ].map(([n, c]) => (
                <div key={n}>
                  <div className="h-16 rounded-xl border border-hair" style={{ background: c }} />
                  <div className="mt-1.5 text-[12.5px] font-medium text-navy">{n}</div>
                  <div className="font-mono text-[11px] text-faint">{c}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-1 rounded-xl bg-paper p-4">
              <div className="font-display text-[22px] text-navy">Newsreader for headlines</div>
              <div className="text-[14px] text-navy">Hanken Grotesk for interface text</div>
              <div className="font-mono text-[12.5px] text-muted">IBM Plex Mono for numbers & IDs</div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-hair p-4">
              <div>
                <div className="text-[14px] font-medium text-navy">Demo data</div>
                <div className="text-[12.5px] text-muted">Restore every screen to its starting state</div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  reset();
                  toast({ title: "Demo data reset", tone: "info" });
                }}
              >
                Reset
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12px] text-faint">
              <Badge tone="outline">Arabic / RTL</Badge> planned for phase 2
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
