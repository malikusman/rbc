"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Item, PageHeader, Segmented, Stagger } from "@/components/ui";
import { EventCard } from "@/components/member";
import { MonthCalendar } from "@/components/calendar";
import { EVENTS, type EventType } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn, daysFromNow } from "@/lib/utils";

const TYPES: ("All" | EventType)[] = ["All", "Networking", "Briefing", "Social", "Leadership", "Trade"];

export default function MemberEvents() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const tickets = useStore((s) => s.tickets);
  const booked = new Set(tickets.map((t) => t.eventId));

  const list = useMemo(
    () =>
      EVENTS.filter((e) => (when === "upcoming" ? daysFromNow(e.start) >= 0 : daysFromNow(e.start) < 0))
        .filter((e) => type === "All" || e.type === type)
        .sort((a, b) => (when === "upcoming" ? 1 : -1) * (+new Date(a.start) - +new Date(b.start))),
    [type, when],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Events"
        title="What’s on at the Chamber"
        description="Breakfasts, briefings and evenings across Ras Al Khaimah. Members book in one tap and pay member prices."
        actions={
          <Segmented
            id="ev-view"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: <><LayoutGrid size={14} /> List</> },
              { value: "calendar", label: <><CalendarDays size={14} /> Calendar</> },
            ]}
          />
        }
      />

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "h-8 rounded-full border px-3.5 text-[13px] font-medium transition",
                    type === t ? "border-navy bg-navy text-white" : "border-hair bg-white text-muted hover:border-line hover:text-navy",
                  )}
                >
                  {t}
                </button>
              ))}
              <div className="ml-auto">
                <Segmented
                  id="ev-when"
                  value={when}
                  onChange={setWhen}
                  options={[
                    { value: "upcoming", label: "Upcoming" },
                    { value: "past", label: "Past" },
                  ]}
                />
              </div>
            </div>
            <Stagger key={type + when} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((e) => (
                <Item key={e.id}>
                  <EventCard e={e} href={`/member/events/${e.id}`} booked={booked.has(e.id)} />
                </Item>
              ))}
              {list.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-line p-12 text-center text-muted">No events match this filter yet.</div>}
            </Stagger>
          </motion.div>
        ) : (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MonthCalendar
              items={EVENTS.map((e) => ({ id: e.id, title: e.title, start: e.start, tone: booked.has(e.id) ? "navy" : "red", href: `/member/events/${e.id}` }))}
            />
            <div className="mt-3 flex items-center gap-5 text-[12px] text-muted">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-navy" /> Booked
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-red/30" /> Open for booking
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
