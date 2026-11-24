"use client";

import { Check, Plus, Mail, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, Badge, Button, Card, CardHeader, Item, PageHeader, ProgressRing, Stagger, Toggle } from "@/components/ui";
import { MembershipCard } from "@/components/member";
import { COMPANIES, ME_MEMBER, PEOPLE, TIERS, tierById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, daysFromNow, fmtDate } from "@/lib/utils";

export default function Membership() {
  const company = COMPANIES.find((c) => c.id === ME_MEMBER.companyId)!;
  const tier = tierById(company.tier)!;
  const autoRenew = useStore((s) => s.autoRenew);
  const setAutoRenew = useStore((s) => s.setAutoRenew);
  const toast = useStore((s) => s.toast);
  const team = PEOPLE.filter((p) => p.companyId === company.id);
  const renewIn = daysFromNow(company.renews!);

  return (
    <div>
      <PageHeader eyebrow="Membership" title="Founding Business member" description={`${company.name} has been a member since ${fmtDate(company.since)}. Founding status stays with you for life.`} />

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <MembershipCard tilt />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="dark" onClick={() => toast({ title: "Membership card added to Apple Wallet" })}>
              Add to Apple Wallet
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Membership card added to Google Wallet" })}>
              Google Wallet
            </Button>
          </div>
        </div>

        <Stagger className="space-y-5">
          <Item>
            <Card className="flex items-center gap-6 p-6">
              <ProgressRing value={renewIn / 365} size={104} stroke={7} color="#B5713E">
                <div className="font-display text-[26px] leading-none text-navy">{renewIn}</div>
                <div className="mt-0.5 text-[11px] text-faint">days left</div>
              </ProgressRing>
              <div className="flex-1">
                <div className="eyebrow mb-1">Renewal</div>
                <div className="text-[17px] font-semibold text-navy">{fmtDate(company.renews!, "long")}</div>
                <div className="mt-1 text-[13px] text-muted">{aed(tier.price)} + VAT, charged to Visa •• 4417</div>
                <div className="mt-4 flex items-center gap-3">
                  <Toggle checked={autoRenew} onChange={(v) => { setAutoRenew(v); toast({ title: v ? "Auto-renew switched on" : "Auto-renew switched off", tone: "info" }); }} label="Auto-renew" />
                  <span className="text-[13.5px] text-navy">Renew automatically</span>
                </div>
              </div>
            </Card>
          </Item>

          <Item>
            <Card>
              <CardHeader eyebrow="Included" title={`${tier.name} benefits`} />
              <ul className="space-y-3 px-6 pb-6">
                {tier.benefits.map((b, i) => (
                  <motion.li key={b} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="flex items-start gap-3 text-[14px] text-navy-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {b}
                  </motion.li>
                ))}
              </ul>
            </Card>
          </Item>
        </Stagger>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Team seats"
            title={`${team.length} of ${tier.seats} seats used`}
            sub="Colleagues on your membership get member pricing and their own login."
            action={
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Invitation sent", body: "We’ve emailed a sign-up link.", tone: "info" })}>
                <Plus size={14} /> Invite
              </Button>
            }
          />
          <div className="divide-y divide-hair border-t border-hair">
            {team.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                <Avatar name={p.name} size={34} />
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-navy">{p.name}</div>
                  <div className="text-[12.5px] text-muted">{p.role}</div>
                </div>
                {p.id === "p1" ? <Badge tone="navy">Admin</Badge> : <Badge>Member</Badge>}
              </div>
            ))}
            {Array.from({ length: tier.seats - team.length }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5 text-[13.5px] text-faint">
                <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dashed border-line">
                  <Mail size={14} />
                </span>
                Empty seat
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Tiers" title="Compare membership" sub="Upgrades are pro-rated to your renewal date." />
          <div className="grid gap-3 px-6 pb-6 sm:grid-cols-3">
            {TIERS.map((t) => {
              const current = t.id === tier.id;
              return (
                <div key={t.id} className={cn("relative rounded-xl border p-4", current ? "border-navy bg-paper" : "border-hair")}>
                  {current && <Badge tone="navy" className="absolute -top-2.5 left-4">Current</Badge>}
                  <div className="text-[14px] font-semibold text-navy">{t.name}</div>
                  <div className="font-display mt-1 text-[22px] text-navy">{aed(t.price)}</div>
                  <div className="text-[11.5px] text-faint">per year · {t.seats} seat{t.seats > 1 ? "s" : ""}</div>
                  {t.id === "corporate" && (
                    <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ title: "Upgrade request sent", body: "Priya from the membership team will be in touch.", tone: "info" })}>
                      <Sparkles size={13} /> Upgrade
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
