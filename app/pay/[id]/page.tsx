"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck, Loader2, Smartphone, Ticket, FileCheck2 } from "lucide-react";
import { AppleMark, Badge, Button, Crest, Input, Logo, QR, Toaster, useMounted } from "@/components/ui";
import { EInvoiceTrack } from "@/components/invoice";
import { ORG, eventById, invoiceSubtotal, invoiceTotal, invoiceVat } from "@/lib/data";
import { useStore } from "@/lib/store";
import { aed, cn, fmtDate } from "@/lib/utils";

type Method = "apple" | "card" | "google" | "aani";
type Phase = "form" | "processing" | "3ds" | "success" | "declined";

export default function Checkout() {
  const mounted = useMounted();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const inv = useStore((s) => s.invoices.find((i) => i.id === id));
  const payInvoice = useStore((s) => s.payInvoice);
  const settle = useStore((s) => s.settleEInvoice);
  const tickets = useStore((s) => s.tickets);
  const [method, setMethod] = useState<Method>("apple");
  const [phase, setPhase] = useState<Phase>("form");
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", name: "Sarah Whitfield", exp: "08/28", cvc: "123" });
  const [otp, setOtp] = useState("");
  const [pendingEvent] = useState(() => inv?.pending?.eventId);
  const [alreadyPaid] = useState(() => inv?.status === "Paid");

  useEffect(() => {
    if (phase === "success" && inv?.einvoice === "Sent via Peppol") {
      const t = setTimeout(() => settle(inv.id), 2600);
      return () => clearTimeout(t);
    }
  }, [phase, inv, settle]);

  if (!mounted) return <div className="min-h-screen bg-paper" />;
  if (!inv)
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-muted">
        Invoice not found. <Link href="/member/billing" className="ml-2 text-navy underline">Back to billing</Link>
      </div>
    );

  const total = invoiceTotal(inv);
  const ev = eventById(pendingEvent);
  const newTicket = pendingEvent ? tickets.find((t) => t.eventId === pendingEvent) : undefined;

  const submit = () => {
    setPhase("processing");
    const declined = method === "card" && card.number.replace(/\s/g, "").startsWith("4000");
    setTimeout(() => {
      if (declined) setPhase("declined");
      else if (method === "card") setPhase("3ds");
      else finish();
    }, 1400);
  };
  const finish = () => {
    setPhase("processing");
    setTimeout(() => {
      payInvoice(inv.id, method === "apple" ? "Apple Pay" : method === "google" ? "Google Pay" : method === "aani" ? "Aani instant payment" : `Visa •• ${card.number.slice(-4)}`);
      setPhase("success");
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#F3F1EC]">
      {/* Gateway top bar */}
      <div className="border-b border-hair bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Crest size={26} />
            <span className="text-[14px] font-semibold text-navy">BCC RAK Checkout</span>
            <span className="hidden text-[12px] text-faint sm:inline">· Demo gateway — processed by RAKBANKpay in production</span>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] text-ok">
            <Lock size={13} /> Encrypted
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 md:grid-cols-[1fr_1.1fr] md:py-14">
        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {phase !== "success" && (
            <button onClick={() => (window.history.length > 1 ? router.back() : router.push("/member/billing"))} className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-navy">
              <ArrowLeft size={15} /> Back to {ORG.short}
            </button>
          )}
          <div className="flex items-center gap-3">
            <Crest size={36} />
            <div>
              <div className="text-[13px] text-muted">Pay</div>
              <div className="text-[15px] font-semibold text-navy">{ORG.name}</div>
            </div>
          </div>
          <div className="font-display mt-6 text-[44px] leading-none text-navy tabular">{aed(total, { decimals: true })}</div>
          <div className="mt-2 font-mono text-[12px] text-faint">Invoice {inv.number} · due {fmtDate(inv.due)}</div>

          <div className="mt-8 space-y-3 text-[13.5px]">
            {inv.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="text-navy">
                  {l.label} {l.qty > 1 && <span className="text-faint">× {l.qty}</span>}
                </span>
                <span className="text-navy tabular">{aed(l.qty * l.unit, { decimals: true })}</span>
              </div>
            ))}
            <div className="h-px bg-line/70" />
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="tabular">{aed(invoiceSubtotal(inv), { decimals: true })}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>VAT (5%) · TRN {ORG.trn}</span>
              <span className="tabular">{aed(invoiceVat(inv), { decimals: true })}</span>
            </div>
            <div className="flex justify-between pt-1 text-[15px] font-semibold text-navy">
              <span>Total due</span>
              <span className="tabular">{aed(total, { decimals: true })}</span>
            </div>
          </div>

          <div className="mt-10 hidden items-center gap-4 text-[11.5px] text-faint md:flex">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} /> 3-D Secure
            </span>
            <span>PCI DSS Level 1</span>
            <span>AED settlement</span>
          </div>
        </motion.div>

        {/* Payment panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="relative overflow-hidden rounded-3xl border border-hair bg-white p-6 shadow-[var(--shadow-lift)] md:p-8">
          <AnimatePresence mode="wait">
            {alreadyPaid && phase !== "success" ? (
              <motion.div key="paid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ok-soft text-ok">
                  <Check size={22} />
                </div>
                <h2 className="font-display text-[26px] text-navy">This invoice is already paid</h2>
                <p className="mt-1 text-[14px] text-muted">Paid with {inv.method ?? "card"}. Nothing more to do.</p>
                <Button variant="dark" className="mt-6" href="/member/billing">
                  Back to billing
                </Button>
              </motion.div>
            ) : phase === "success" ? (
              <Success key="s" invNumber={inv.number} method={inv.method ?? ""} total={total} ev={ev} code={newTicket?.code} einvoice={inv.einvoice} b2b={inv.b2b} />
            ) : (
              <motion.div key="f" exit={{ opacity: 0, y: -8 }}>
                <div className="text-[15px] font-semibold text-navy">Payment method</div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      { id: "apple", label: "Apple Pay", icon: <AppleMark size={16} /> },
                      { id: "card", label: "Card", icon: <CreditCard size={16} /> },
                      { id: "google", label: "Google Pay", icon: <span className="text-[15px] font-bold text-[#4285F4]">G</span> },
                      { id: "aani", label: "Pay by bank", icon: <span className="text-[11px] font-bold tracking-wide text-navy">AANI</span> },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "relative flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[12.5px] font-medium transition",
                        method === m.id ? "border-navy text-navy" : "border-line text-muted hover:border-navy-3/40",
                      )}
                    >
                      {method === m.id && <motion.span layoutId="pm" className="absolute inset-0 rounded-xl ring-2 ring-navy/90" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {method === "card" ? (
                    <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="space-y-3 pt-6">
                        <div>
                          <label className="mb-1.5 block text-[12.5px] font-medium text-navy-2">Card number</label>
                          <div className="relative">
                            <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="pr-16 font-mono tracking-wide" inputMode="numeric" />
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-navy px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider text-white">VISA</span>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[12.5px] font-medium text-navy-2">Name on card</label>
                          <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-[12.5px] font-medium text-navy-2">Expiry</label>
                            <Input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="font-mono" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[12.5px] font-medium text-navy-2">CVC</label>
                            <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className="font-mono" />
                          </div>
                        </div>
                        <div className="rounded-lg bg-paper px-3 py-2 text-[11.5px] text-muted">
                          Test cards: <span className="font-mono">4242…</span> succeeds with 3-D Secure · <span className="font-mono">4000…</span> is declined
                        </div>
                      </div>
                    </motion.div>
                  ) : method === "aani" ? (
                    <motion.div key="aani" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6">
                      <div className="flex items-center gap-4 rounded-xl bg-paper p-4">
                        <div className="shrink-0 rounded-lg bg-white p-1.5"><QR value={`aani://pay/${inv.number}/${total.toFixed(2)}`} size={88} /></div>
                        <div className="text-[13px] leading-relaxed text-muted">
                          <div className="font-semibold text-navy">Instant bank payment (Aani)</div>
                          Scan with your UAE banking app to pay straight from your account. Funds settle instantly — no card fees.
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6">
                      <div className="flex items-center gap-3 rounded-xl bg-paper p-4 text-[13px] text-muted">
                        <Smartphone size={18} className="shrink-0 text-navy" />
                        Confirm with Face ID or your fingerprint. Your card details are never shared with the Chamber.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {phase === "declined" && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-[13px] text-bad">
                    Your bank declined this payment. Try another card or Apple Pay.
                  </motion.div>
                )}

                <div className="mt-6">
                  {method === "apple" ? (
                    <button onClick={submit} disabled={phase === "processing"} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-black text-[16px] font-medium text-white transition hover:bg-black/85">
                      {phase === "processing" ? <Loader2 size={18} className="animate-spin" /> : <><span>Pay with</span><AppleMark size={16} /><span className="font-semibold">Pay</span></>}
                    </button>
                  ) : (
                    <Button variant={method === "card" ? "primary" : "dark"} size="lg" className="w-full" onClick={submit} disabled={phase === "processing"}>
                      {phase === "processing" ? <Loader2 size={18} className="animate-spin" /> : method === "aani" ? <>I’ve approved it in my bank app</> : <>Pay {aed(total, { decimals: true })}</>}
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-center text-[11.5px] leading-relaxed text-faint">
                  By paying you agree to the Chamber’s terms. A tax invoice is emailed to you, and business invoices are filed as UAE e-invoices.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3-D Secure */}
          <AnimatePresence>
            {phase === "3ds" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-6 backdrop-blur-sm">
                <motion.div initial={{ y: 12, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-sm rounded-2xl border border-hair bg-white p-6 text-center shadow-[var(--shadow-pop)]">
                  <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="text-[15px] font-semibold text-navy">Verify it’s you</div>
                  <p className="mt-1 text-[13px] text-muted">We sent a 6-digit code to +971 •• ••• 7781</p>
                  <Input autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" className="mt-4 text-center font-mono text-[20px] tracking-[0.5em]" />
                  <button onClick={() => setOtp("482913")} className="mt-2 text-[12px] text-faint underline-offset-2 hover:underline">
                    Demo: fill the code
                  </button>
                  <Button variant="dark" className="mt-4 w-full" disabled={otp.length < 6} onClick={finish}>
                    Confirm payment
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="pb-10 text-center">
        <Logo width={110} className="mx-auto opacity-70" />
      </div>
      <Toaster />
    </div>
  );
}

function Success({
  invNumber,
  method,
  total,
  ev,
  code,
  einvoice,
  b2b,
}: {
  invNumber: string;
  method: string;
  total: number;
  ev?: ReturnType<typeof eventById>;
  code?: string;
  einvoice: Parameters<typeof EInvoiceTrack>[0]["status"];
  b2b: boolean;
}) {
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFlip(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
      <svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto">
        <motion.circle cx="36" cy="36" r="32" fill="none" stroke="#2F7A55" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M23 37 L32 46 L50 27" fill="none" stroke="#2F7A55" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5 }} />
      </svg>
      <h2 className="font-display mt-4 text-[30px] text-navy">Payment received</h2>
      <p className="mt-1 text-[14px] text-muted">
        {aed(total, { decimals: true })} · {method} · {invNumber}
      </p>

      {ev && code && (
        <div className="mx-auto mt-6 max-w-xs" style={{ perspective: 900 }}>
          <motion.div animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: "preserve-3d" }} className="relative h-44">
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-navy p-5 text-white [backface-visibility:hidden]">
              <Ticket size={22} className="text-[#F0C9A6]" />
              <div className="font-display mt-2 text-[19px] leading-snug">{ev.title}</div>
              <div className="mt-1 text-[12px] text-white/60">{fmtDate(ev.start, "weekday")}</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-4 rounded-2xl border border-hair bg-white p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <QR value={code} size={120} />
              <div className="text-left">
                <Badge tone="ok">Ticket ready</Badge>
                <div className="mt-2 font-mono text-[11px] text-faint">{code}</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-6 text-left">
        {b2b ? (
          <EInvoiceTrack status={einvoice} />
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-paper px-4 py-3 text-[12.5px] text-muted">
            <FileCheck2 size={15} /> Receipt emailed. Synced to Zoho Books.
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" href="/member/billing">
          View invoices
        </Button>
        <Button variant="dark" href={ev ? "/member/tickets" : "/member"}>
          {ev ? "My tickets" : "Done"} <Check size={15} />
        </Button>
      </div>
    </motion.div>
  );
}
