"use client";

import { useState } from "react";
import { Avatar, Button, Card, CardHeader, Field, Input, PageHeader, Select, Toggle } from "@/components/ui";
import { ME_MEMBER } from "@/lib/data";
import { useStore } from "@/lib/store";

const CHANNELS = ["Email", "Push", "WhatsApp"] as const;
const TOPICS = [
  { id: "events", label: "New events and reminders" },
  { id: "billing", label: "Invoices and renewals" },
  { id: "board", label: "Message board announcements" },
  { id: "weekly", label: "Weekly Update newsletter" },
];

export default function Settings() {
  const toast = useStore((s) => s.toast);
  const [m, setM] = useState<Record<string, boolean>>({
    "events-Email": true,
    "events-Push": true,
    "events-WhatsApp": true,
    "billing-Email": true,
    "billing-Push": false,
    "billing-WhatsApp": true,
    "board-Email": false,
    "board-Push": true,
    "board-WhatsApp": false,
    "weekly-Email": true,
    "weekly-Push": false,
    "weekly-WhatsApp": false,
  });

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Your account" description="Profile, notifications and connected calendars." />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-4 px-6 pb-6">
            <div className="flex items-center gap-4">
              <Avatar name={ME_MEMBER.name} size={56} />
              <Button size="sm" variant="secondary">
                Change photo
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input defaultValue={ME_MEMBER.name} />
              </Field>
              <Field label="Job title">
                <Input defaultValue={ME_MEMBER.role} />
              </Field>
              <Field label="Email">
                <Input defaultValue={ME_MEMBER.email} />
              </Field>
              <Field label="Mobile" hint="Used for WhatsApp reminders">
                <Input defaultValue={ME_MEMBER.phone} />
              </Field>
              <Field label="Dietary requirements">
                <Select defaultValue="none">
                  <option value="none">None</option>
                  <option>Vegetarian</option>
                  <option>Vegan</option>
                  <option>Halal only</option>
                  <option>Gluten free</option>
                </Select>
              </Field>
              <Field label="Language">
                <Select defaultValue="en">
                  <option value="en">English</option>
                  <option value="ar">العربية (coming soon)</option>
                </Select>
              </Field>
            </div>
            <Button variant="dark" onClick={() => toast({ title: "Profile saved" })}>
              Save changes
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Notifications" sub="Choose how each kind of message reaches you." />
            <div className="px-6 pb-6">
              <div className="grid grid-cols-[1fr_repeat(3,64px)] items-center gap-y-4 text-[13.5px]">
                <span />
                {CHANNELS.map((c) => (
                  <span key={c} className="text-center text-[12px] font-medium text-faint">
                    {c}
                  </span>
                ))}
                {TOPICS.map((t) => (
                  <Row key={t.id} label={t.label}>
                    {CHANNELS.map((c) => (
                      <div key={c} className="flex justify-center">
                        <Toggle checked={m[`${t.id}-${c}`]} onChange={(v) => setM((s) => ({ ...s, [`${t.id}-${c}`]: v }))} label={`${t.label} ${c}`} />
                      </div>
                    ))}
                  </Row>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Connected calendars" sub="Booked events appear in your calendar automatically." />
            <div className="space-y-2.5 px-6 pb-6">
              {[
                { name: "Google Calendar", sub: "sarah.whitfield@gmail.com", on: true, c: "#2F7A55" },
                { name: "Outlook / Microsoft 365", sub: "Not connected", on: false, c: "#2B5EA8" },
                { name: "Apple Calendar (iCal feed)", sub: "Subscribe with a private link", on: false, c: "#14213A" },
              ].map((x) => (
                <div key={x.name} className="flex items-center gap-3 rounded-xl border border-hair p-3.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.c }} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-medium text-navy">{x.name}</div>
                    <div className="text-[12px] text-faint">{x.sub}</div>
                  </div>
                  <Button size="sm" variant={x.on ? "quiet" : "secondary"} onClick={() => toast({ title: x.on ? "Calendar is syncing" : `${x.name} connected`, tone: "info" })}>
                    {x.on ? "Connected" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-navy">{label}</span>
      {children}
    </>
  );
}
