"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Paperclip, Send } from "lucide-react";
import { Avatar, Button, Card, PageHeader, Badge } from "@/components/ui";
import { ME_SPONSOR, STAFF, POSTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, fmtTime, relLabel } from "@/lib/utils";

export default function SponsorMessages() {
  const thread = useStore((s) => s.thread);
  const send = useStore((s) => s.sendThread);
  const toast = useStore((s) => s.toast);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [thread.length, typing]);

  const submit = () => {
    if (!draft.trim()) return;
    send(draft.trim(), ME_SPONSOR.name);
    setDraft("");
    setTyping(true);
    setTimeout(() => setTyping(false), 2200);
  };

  return (
    <div>
      <PageHeader eyebrow="Messages" title="Talk to the Chamber" description="A private thread with your relationship manager, plus announcements for all partners." />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[620px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-hair px-6 py-4">
            <div className="relative">
              <Avatar name={STAFF.rm.name} size={40} />
              <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-ok" />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold text-navy">{STAFF.rm.name}</div>
              <div className="text-[12px] text-ok">Online · usually replies within an hour</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => toast({ title: "Calendly opened", body: "Choose a time with Omar.", tone: "info" })}>
              <CalendarClock size={14} /> Book a meeting
            </Button>
          </div>
          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto bg-paper/40 px-6 py-6">
            <AnimatePresence initial={false}>
              {thread.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", m.me && "flex-row-reverse")}>
                  {!m.me && <Avatar name={m.from} size={30} />}
                  <div className={cn("max-w-[75%]", m.me && "text-right")}>
                    <div className={cn("inline-block rounded-2xl px-4 py-2.5 text-left text-[14px] leading-relaxed", m.me ? "rounded-br-md bg-navy text-white" : "rounded-bl-md border border-hair bg-white text-navy")}>{m.body}</div>
                    <div className="mt-1 text-[11px] text-faint">
                      {relLabel(m.time)} · {fmtTime(m.time)}
                    </div>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <Avatar name={STAFF.rm.name} size={30} />
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-hair bg-white px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-faint" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={end} />
          </div>
          <div className="flex items-center gap-2 border-t border-hair p-4">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-stone" aria-label="Attach">
              <Paperclip size={17} />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Write a message…"
              className="h-11 flex-1 rounded-xl border border-line bg-white px-4 text-[14px] outline-none focus:border-navy-3"
            />
            <Button variant="dark" onClick={submit} disabled={!draft.trim()} aria-label="Send message">
              <Send size={15} />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="eyebrow">Partner announcements</div>
          {POSTS.slice(0, 2).map((p) => (
            <Card key={p.id} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge tone="navy">{p.topic}</Badge>
                <span className="text-[11.5px] text-faint">{relLabel(p.time)}</span>
              </div>
              <div className="text-[14px] font-semibold text-navy">{p.title}</div>
              <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-muted">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
