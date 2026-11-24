"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, MessageCircle, Pin, Send } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, Textarea, Toggle } from "@/components/ui";
import { ME_MEMBER } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, relLabel } from "@/lib/utils";

const TOPICS = ["All", "Announcement", "Events", "Policy", "Community"] as const;

export default function Messages() {
  const posts = useStore((s) => s.posts);
  const addPost = useStore((s) => s.addPost);
  const toast = useStore((s) => s.toast);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [prefs, setPrefs] = useState({ Announcement: true, Events: true, Policy: true, Community: false });

  const list = posts.filter((p) => topic === "All" || p.topic === topic).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  return (
    <div>
      <PageHeader eyebrow="Message board" title="News from the Chamber" description="Announcements from the team, and a place for members to ask, share and introduce." />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Card className="mb-5 p-4">
            <div className="flex gap-3">
              <Avatar name={ME_MEMBER.name} size={38} />
              <div className="flex-1">
                <Textarea placeholder="Share something with members…" value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[72px] border-hair" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[12px] text-faint">Posts go to the Community topic</span>
                  <Button
                    size="sm"
                    variant="dark"
                    disabled={!draft.trim()}
                    onClick={() => {
                      addPost({ author: ME_MEMBER.name, role: "Thames & Hajar Engineering", title: draft.split("\n")[0].slice(0, 80), body: draft, topic: "Community" });
                      setDraft("");
                      toast({ title: "Posted to the message board" });
                    }}
                  >
                    <Send size={13} /> Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-4 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => setTopic(t)} className={cn("h-8 rounded-full border px-3.5 text-[13px] font-medium transition", topic === t ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:text-navy")}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {list.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.author} size={38} />
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold text-navy">{p.author}</div>
                        <div className="text-[12px] text-faint">
                          {p.role} · {relLabel(p.time)}
                        </div>
                      </div>
                      {p.pinned && (
                        <span className="flex items-center gap-1 text-[12px] font-medium text-red">
                          <Pin size={12} /> Pinned
                        </span>
                      )}
                      <Badge tone={p.topic === "Announcement" ? "navy" : p.topic === "Policy" ? "info" : "neutral"}>{p.topic}</Badge>
                    </div>
                    <h3 className="font-display mt-4 text-[22px] leading-snug text-navy">{p.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-navy-2">{p.body}</p>
                    <div className="mt-4 flex gap-5 text-[13px] text-muted">
                      <button onClick={() => setLiked((l) => (l.includes(p.id) ? l.filter((x) => x !== p.id) : [...l, p.id]))} className={cn("flex items-center gap-1.5 transition hover:text-red", liked.includes(p.id) && "text-red")}>
                        <Heart size={15} fill={liked.includes(p.id) ? "currentColor" : "none"} /> {p.reactions + (liked.includes(p.id) ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle size={15} /> {p.replies} replies
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader eyebrow="Notifications" title="What reaches you" sub="Push on your phone, plus email." />
            <div className="space-y-4 px-6 pb-6">
              {(Object.keys(prefs) as (keyof typeof prefs)[]).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[14px] text-navy">{k}</span>
                  <Toggle checked={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} label={k} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="!border-navy !bg-navy p-6 text-white">
            <div className="eyebrow !text-white/50">Weekly Update</div>
            <div className="font-display mt-2 text-[22px] leading-snug">Every Tuesday at 9:00</div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">Events, member news and policy in a five-minute read. You’re subscribed as {ME_MEMBER.email}.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
