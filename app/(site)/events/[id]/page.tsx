"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Users, Video, CalendarPlus } from "lucide-react";
import { Avatar, Button, Card, EventArt, ProgressBar } from "@/components/ui";
import { Container } from "@/components/site";
import { eventById, sponsorById } from "@/lib/data";
import { useRegistered } from "@/lib/store";
import { aed, daysFromNow, fmtDate, fmtTime, relLabel } from "@/lib/utils";
import { downloadIcs } from "@/lib/ics";

export default function PublicEvent() {
  const { id } = useParams<{ id: string }>();
  const e = eventById(id);
  const reg = useRegistered(id, e?.registered ?? 0);
  if (!e) return <Container className="py-24 text-muted">Event not found.</Container>;
  const sp = sponsorById(e.sponsorId);
  const past = daysFromNow(e.start) < 0;
  return (
    <Container className="pt-6">
      <Link href="/events" className="mb-5 inline-flex items-center gap-2 text-[13.5px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> All events
      </Link>
      <EventArt
        art={e.art}
        photo={e.photo}
        width={1600}
        priority
        className="rounded-[28px]"
        label={
          <div className="flex min-h-[380px] flex-col justify-end p-8 text-white md:min-h-[440px] md:p-12">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] backdrop-blur">{e.type}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-navy">{relLabel(e.start)}</span>
            </div>
            <h1 className="font-display max-w-3xl text-[40px] leading-[1.05] md:text-[56px]">{e.title}</h1>
            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-white/85">
              <span className="flex items-center gap-2"><Clock size={15} /> {fmtDate(e.start, "long")} · {fmtTime(e.start)}</span>
              <span className="flex items-center gap-2">{e.area === "Online" ? <Video size={15} /> : <MapPin size={15} />} {e.venue}</span>
            </div>
          </div>
        }
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-display text-[30px] text-navy">About this event</h2>
          <p className="mt-3 max-w-2xl text-[16.5px] leading-[1.75] text-navy-2">{e.description}</p>
          {e.agenda && (
            <>
              <h2 className="font-display mt-10 text-[30px] text-navy">Running order</h2>
              <ol className="mt-4 ml-2 border-l border-line">
                {e.agenda.map((a) => (
                  <li key={a.time} className="relative pb-5 pl-7 last:pb-0">
                    <span className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full border-2 border-paper bg-red" />
                    <div className="font-mono text-[12.5px] text-faint">{a.time}</div>
                    <div className="text-[15.5px] font-medium text-navy">{a.item}</div>
                  </li>
                ))}
              </ol>
            </>
          )}
          {e.speakers && (
            <>
              <h2 className="font-display mt-10 text-[30px] text-navy">Speakers</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {e.speakers.map((s) => (
                  <Card key={s.name} className="flex items-center gap-3.5 p-4">
                    <Avatar name={s.name} size={44} />
                    <div>
                      <div className="text-[14.5px] font-semibold text-navy">{s.name}</div>
                      <div className="text-[12.5px] text-muted">{s.role}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card className="p-7">
            <div className="flex justify-between gap-4">
              <div>
                <div className="eyebrow mb-1">Members</div>
                <div className="font-display text-[30px] leading-none text-navy">{e.memberPrice ? aed(e.memberPrice) : "Free"}</div>
              </div>
              <div className="text-right">
                <div className="eyebrow mb-1">Guests</div>
                <div className="font-display text-[30px] leading-none text-navy">{e.guestPrice ? aed(e.guestPrice) : "Free"}</div>
              </div>
            </div>
            <div className="mt-6 mb-1.5 flex justify-between text-[12.5px] text-muted">
              <span className="flex items-center gap-1.5"><Users size={13} /> {reg} registered</span>
              <span>{Math.max(0, e.capacity - reg)} places left</span>
            </div>
            <ProgressBar value={reg / e.capacity} />
            {past ? (
              <div className="mt-6 rounded-xl bg-stone px-4 py-3 text-[14px] text-muted">This event has taken place.</div>
            ) : (
              <div className="mt-6 space-y-2.5">
                <Button variant="primary" size="lg" className="w-full" href={`/login?next=/member/events/${e.id}`}>
                  Members: sign in to book
                </Button>
                <Button variant="secondary" size="lg" className="w-full" href="/join">
                  Not a member? Join the Chamber
                </Button>
                <button onClick={() => downloadIcs(e)} className="flex w-full items-center justify-center gap-2 pt-2 text-[13px] font-medium text-muted hover:text-navy">
                  <CalendarPlus size={14} /> Add to calendar
                </button>
              </div>
            )}
          </Card>
          {sp && <div className="mt-4 text-center text-[12.5px] text-faint">Supported by <span className="font-semibold text-navy">{sp.name}</span></div>}
        </div>
      </div>
    </Container>
  );
}
