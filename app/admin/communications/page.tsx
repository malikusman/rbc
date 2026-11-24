"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bell, Mail, MessageCircle, Send, Users } from "lucide-react";
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Textarea, Toggle } from "@/components/ui";
import { STAFF } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, relLabel } from "@/lib/utils";

const SEGMENTS = [
  { id: "all", label: "All members", count: 41 },
  { id: "founding", label: "Founding members", count: 23 },
  { id: "sponsors", label: "Sponsors & partners", count: 26 },
  { id: "prospects", label: "Prospects", count: 58 },
  { id: "new", label: "Joined in last 30 days", count: 9 },
];

const CAMPAIGNS = [
  { name: "Weekly Update — launch countdown", sent: "Tue 09:00", audience: 412, open: 61, click: 18, status: "Sent" },
  { name: "Founding status closes at launch", sent: "3 days ago", audience: 58, open: 72, click: 31, status: "Sent" },
  { name: "Weekly Update — e-invoicing explainer", sent: "Next Tue 09:00", audience: 419, open: 0, click: 0, status: "Scheduled" },
];

export default function Communications() {
  const toast = useStore((s) => s.toast);
  const addPost = useStore((s) => s.addPost);
  const posts = useStore((s) => s.posts);
  const [seg, setSeg] = useState("all");
  const [title, setTitle] = useState("Parking at the launch evening");
  const [body, setBody] = useState("Valet parking is available at The Harbour Club from 18:45. If you’re coming by taxi, ask for the Al Hamra Village marina entrance.");
  const [ch, setCh] = useState({ board: true, push: true, email: true, whatsapp: false });
  const reach = SEGMENTS.find((s) => s.id === seg)!.count;

  const send = () => {
    addPost({ author: STAFF.admin.name, role: STAFF.admin.role, title, body, topic: "Announcement" });
    toast({ title: "Announcement sent", body: `${reach} recipients · ${Object.entries(ch).filter(([, v]) => v).map(([k]) => k).join(", ")}` });
  };

  return (
    <div>
      <PageHeader eyebrow="Communications" title="Announcements & newsletter" description="Post to the message board, push to phones, and sync audiences to Mailchimp for the Weekly Update." />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="New announcement" />
          <div className="space-y-4 px-6 pb-6">
            <Field label="Audience">
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((s) => (
                  <button key={s.id} onClick={() => setSeg(s.id)} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium transition", seg === s.id ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:text-navy")}>
                    {s.label} <span className="font-normal">· {s.count}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Message">
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-28" />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { k: "board" as const, l: "Message board", i: Users },
                { k: "push" as const, l: "Push notification", i: Bell },
                { k: "email" as const, l: "Email", i: Mail },
                { k: "whatsapp" as const, l: "WhatsApp", i: MessageCircle },
              ].map((x) => (
                <div key={x.k} className="flex items-center justify-between rounded-xl border border-hair px-3.5 py-3">
                  <span className="flex items-center gap-2 text-[13.5px] text-navy">
                    <x.i size={15} className="text-muted" /> {x.l}
                  </span>
                  <Toggle checked={ch[x.k]} onChange={(v) => setCh((c) => ({ ...c, [x.k]: v }))} label={x.l} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-hair pt-4">
              <span className="text-[13px] text-muted">
                Reaches <span className="font-semibold text-navy">{reach} people</span>
              </span>
              <Button variant="primary" onClick={send}>
                <Send size={15} /> Send now
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <div>
            <div className="eyebrow mb-3">Phone preview</div>
            <div className="rounded-[28px] bg-gradient-to-b from-[#2B3A57] to-[#14213A] p-4">
              <div className="mb-10 text-center text-[42px] font-light text-white/90 tabular">09:41</div>
              <motion.div key={title + body} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl bg-white/85 p-3.5 backdrop-blur">
                <div className="flex items-center gap-2 text-[11.5px] text-muted">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-navy text-[8px] font-bold text-white">BCC</span>
                  BCC RAK Hub · now
                </div>
                <div className="mt-1.5 text-[13.5px] font-semibold text-navy">{title}</div>
                <div className="line-clamp-2 text-[12.5px] text-navy-2">{body}</div>
              </motion.div>
            </div>
          </div>
          <Card>
            <CardHeader title="Mailchimp" sub="Audience synced hourly from the CRM" action={<Badge tone="warn" dot>4 bounces</Badge>} />
            <div className="divide-y divide-hair border-t border-hair">
              {CAMPAIGNS.map((c) => (
                <div key={c.name} className="px-6 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[13.5px] font-medium text-navy">{c.name}</span>
                    <Badge tone={c.status === "Sent" ? "ok" : "info"}>{c.status}</Badge>
                  </div>
                  <div className="mt-1 flex gap-4 text-[12px] text-muted">
                    <span>{c.sent}</span>
                    <span>{c.audience} recipients</span>
                    {c.open > 0 && <span className="text-navy">{c.open}% opened</span>}
                    {c.click > 0 && <span>{c.click}% clicked</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader title="Recent posts" />
        <div className="divide-y divide-hair border-t border-hair">
          {posts.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
              <Badge tone={p.topic === "Announcement" ? "navy" : "neutral"}>{p.topic}</Badge>
              <span className="flex-1 truncate text-[13.5px] text-navy">{p.title}</span>
              <span className="text-[12px] text-faint">{p.author}</span>
              <span className="w-24 text-right text-[12px] text-faint">{relLabel(p.time)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
