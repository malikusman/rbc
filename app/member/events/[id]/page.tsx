"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CalendarPlus, Clock, MapPin, ShieldCheck, Users, Video, Wallet, Check, Share2 } from "lucide-react";
import { Avatar, Badge, Button, Card, EventArt, Modal, ProgressBar, QR } from "@/components/ui";
import { Stepper, TicketStub } from "@/components/member";
import { eventById, sponsorById } from "@/lib/data";
import { useRegistered, useStore } from "@/lib/store";
import { aed, daysFromNow, fmtDate, fmtTime, relLabel } from "@/lib/utils";
import { downloadIcs, googleCalUrl } from "@/lib/ics";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const e = eventById(id);
  const tickets = useStore((s) => s.tickets);
  const bookEvent = useStore((s) => s.bookEvent);
  const toast = useStore((s) => s.toast);
  const registered = useRegistered(id, e?.registered ?? 0);
  const [qty, setQty] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);

  if (!e) return <div className="p-10 text-muted">Event not found.</div>;
  const ticket = tickets.find((t) => t.eventId === e.id);
  const sponsor = sponsorById(e.sponsorId);
  const past = daysFromNow(e.start) < 0;
  const full = registered >= e.capacity;
  const subtotal = e.memberPrice + (qty - 1) * e.guestPrice;
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const [waitlisted, setWaitlisted] = useState(false);
  const book = () => {
    if (full) {
      setWaitlisted(true);
      toast({ title: "You’re on the waitlist", body: "We’ll email and WhatsApp you if a place opens up.", tone: "info" });
      return;
    }
    const r = bookEvent(e.id, qty);
    if (r.invoiceId) router.push(`/pay/${r.invoiceId}`);
    else if (r.ticketId) setSuccess(r.ticketId);
  };

  const successTicket = tickets.find((t) => t.id === success);

  return (
    <div>
      <Link href="/member/events" className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
        <ArrowLeft size={15} /> All events
      </Link>

      <EventArt
        art={e.art}
        photo={e.photo}
        width={1400}
        priority
        className="rounded-3xl shadow-[var(--shadow-lift)]"
        label={
          <div className="flex min-h-[320px] flex-col justify-end p-7 text-white md:min-h-[360px] md:p-10">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium backdrop-blur">{e.type}</span>
              {e.hybrid && <span className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium backdrop-blur">In person + online</span>}
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-navy">{relLabel(e.start)}</span>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display max-w-3xl text-[38px] leading-[1.05] md:text-[52px]">
              {e.title}
            </motion.h1>
            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[14.5px] text-white/85">
              <span className="flex items-center gap-2">
                <Clock size={15} /> {fmtDate(e.start, "long")} · {fmtTime(e.start)}–{fmtTime(e.end)}
              </span>
              <span className="flex items-center gap-2">
                {e.area === "Online" ? <Video size={15} /> : <MapPin size={15} />} {e.venue}
              </span>
            </div>
          </div>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {ticket && !past && (
            <div>
              <div className="eyebrow mb-3">Your ticket</div>
              <TicketStub t={ticket} e={e} />
            </div>
          )}

          <section>
            <h2 className="font-display mb-3 text-[26px] text-navy">About this event</h2>
            <p className="max-w-2xl text-[15.5px] leading-[1.75] text-navy-2">{e.description}</p>
          </section>

          {e.agenda && (
            <section>
              <h2 className="font-display mb-4 text-[26px] text-navy">Running order</h2>
              <ol className="relative ml-2 border-l border-line">
                {e.agenda.map((a, i) => (
                  <motion.li key={a.time} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="relative pb-5 pl-7 last:pb-0">
                    <span className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full border-2 border-paper bg-red" />
                    <div className="font-mono text-[12.5px] text-faint">{a.time}</div>
                    <div className="text-[15px] font-medium text-navy">{a.item}</div>
                  </motion.li>
                ))}
              </ol>
            </section>
          )}

          {e.speakers && (
            <section>
              <h2 className="font-display mb-4 text-[26px] text-navy">Speakers</h2>
              <div className="grid gap-3 sm:grid-cols-2">
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
            </section>
          )}

          <section>
            <h2 className="font-display mb-4 text-[26px] text-navy">Venue</h2>
            <Card className="overflow-hidden">
              <VenueMap />
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-[14.5px] font-semibold text-navy">{e.venue}</div>
                  <div className="text-[13px] text-muted">{e.area}, Ras Al Khaimah</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => toast({ title: "Opening Google Maps", body: e.venue, tone: "info" })}>
                  Directions
                </Button>
              </div>
            </Card>
          </section>
        </div>

        {/* Booking card */}
        <div>
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="eyebrow mb-1">Member price</div>
                    <div className="font-display text-[34px] leading-none text-navy">{e.memberPrice === 0 ? "Free" : aed(e.memberPrice)}</div>
                  </div>
                  <div className="text-right text-[12.5px] text-muted">
                    Guests
                    <div className="font-semibold text-navy">{e.guestPrice === 0 ? "Free" : aed(e.guestPrice)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-1.5 flex justify-between text-[12.5px]">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Users size={13} /> {registered} registered
                    </span>
                    <span className="text-faint">{Math.max(0, e.capacity - registered)} places left</span>
                  </div>
                  <ProgressBar value={registered / e.capacity} color={full ? "bg-copper" : "bg-navy"} />
                </div>

                {ticket ? (
                  <div className="mt-6 space-y-2.5">
                    <div className="flex items-center gap-2.5 rounded-xl bg-ok-soft px-4 py-3 text-[13.5px] font-medium text-ok">
                      <Check size={16} /> You’re booked · {ticket.qty} place{ticket.qty > 1 ? "s" : ""}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={googleCalUrl(e)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white text-[13px] font-medium text-navy hover:bg-paper">
                        <CalendarPlus size={14} /> Google
                      </a>
                      <button onClick={() => downloadIcs(e)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white text-[13px] font-medium text-navy hover:bg-paper">
                        <CalendarPlus size={14} /> Outlook
                      </button>
                    </div>
                  </div>
                ) : past ? (
                  <div className="mt-6 rounded-xl bg-stone px-4 py-3 text-[13.5px] text-muted">This event has taken place.</div>
                ) : (
                  <>
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <div className="text-[14px] font-medium text-navy">Places</div>
                        <div className="text-[12px] text-faint">You + {qty - 1} guest{qty - 1 === 1 ? "" : "s"}</div>
                      </div>
                      <Stepper value={qty} onChange={setQty} max={4} />
                    </div>
                    <div className="mt-5 space-y-2 border-t border-hair pt-4 text-[13.5px]">
                      <Row label="Your place" value={e.memberPrice === 0 ? "Free" : aed(e.memberPrice, { decimals: true })} />
                      {qty > 1 && <Row label={`Guests × ${qty - 1}`} value={e.guestPrice === 0 ? "Free" : aed((qty - 1) * e.guestPrice, { decimals: true })} />}
                      {subtotal > 0 && <Row label="VAT (5%)" value={aed(vat, { decimals: true })} />}
                      <div className="flex justify-between pt-1 text-[15px] font-semibold text-navy">
                        <span>Total</span>
                        <span className="tabular">{subtotal === 0 ? "Free" : aed(total, { decimals: true })}</span>
                      </div>
                    </div>
                    <Button variant="primary" size="lg" className="mt-5 w-full" onClick={book} disabled={waitlisted}>
                      {full ? (waitlisted ? "On the waitlist" : "Join waitlist") : subtotal === 0 ? "Reserve my place" : "Book and pay"}
                    </Button>
                    {subtotal > 0 && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-faint">
                        <ShieldCheck size={13} /> Secure payment via RAKBANK · Apple Pay accepted
                      </div>
                    )}
                  </>
                )}
              </div>
              {sponsor && (
                <div className="flex items-center gap-3 border-t border-hair bg-paper/60 px-6 py-4">
                  <Avatar name={sponsor.name} size={32} />
                  <div className="text-[12.5px]">
                    <div className="text-faint">Supported by</div>
                    <div className="font-semibold text-navy">{sponsor.name}</div>
                  </div>
                  <Badge tone={sponsor.level === "Gold" ? "copper" : "neutral"} className="ml-auto">
                    {sponsor.level}
                  </Badge>
                </div>
              )}
            </Card>
            <button onClick={() => toast({ title: "Link copied", body: "Share it with a colleague who should attend.", tone: "info" })} className="mt-3 flex w-full items-center justify-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
              <Share2 size={14} /> Share this event
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!successTicket} onClose={() => setSuccess(null)}>
        {successTicket && (
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-soft text-ok">
              <Check size={26} />
            </motion.div>
            <h3 className="font-display text-[28px] text-navy">You’re on the list</h3>
            <p className="mt-1.5 text-[14px] text-muted">{e.title} · {fmtDate(e.start, "weekday")}</p>
            <div className="mt-6 inline-block rounded-2xl border border-hair p-3">
              <QR value={successTicket.code} size={150} />
            </div>
            <div className="mt-2 font-mono text-[12px] text-faint">{successTicket.code}</div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button variant="dark" onClick={() => toast({ title: "Added to Apple Wallet", body: e.title })}>
                <Wallet size={15} /> Add to Wallet
              </Button>
              <Button variant="secondary" onClick={() => downloadIcs(e)}>
                <CalendarPlus size={15} /> Add to calendar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="text-navy tabular">{value}</span>
    </div>
  );
}

function VenueMap() {
  return (
    <svg viewBox="0 0 600 200" className="h-48 w-full bg-[#EEF0EC]" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d="M0 140 C120 120 180 170 300 150 S480 110 600 130 L600 200 L0 200 Z" fill="#CFE0E3" />
      <path d="M0 150 C120 130 180 180 300 160 S480 120 600 140" fill="none" stroke="#B9D0D4" strokeWidth="2" />
      {[60, 150, 250, 350, 450, 540].map((x, i) => (
        <path key={x} d={`M${x} 0 L${x + (i % 2 ? 30 : -20)} 140`} stroke="#fff" strokeWidth={i === 2 ? 7 : 4} />
      ))}
      {[30, 75, 110].map((y, i) => (
        <path key={y} d={`M0 ${y} L600 ${y + (i - 1) * 14}`} stroke="#fff" strokeWidth={i === 1 ? 7 : 4} />
      ))}
      <rect x="380" y="20" width="80" height="40" rx="6" fill="#DDE6D8" />
      <rect x="90" y="85" width="60" height="30" rx="6" fill="#DDE6D8" />
      <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}>
        <circle cx="300" cy="88" r="22" fill="#B8322A" opacity="0.15" />
        <path d="M300 96 C290 84 286 78 286 72 a14 14 0 0 1 28 0 c0 6 -4 12 -14 24 Z" fill="#B8322A" />
        <circle cx="300" cy="72" r="5" fill="#fff" />
      </motion.g>
    </svg>
  );
}
