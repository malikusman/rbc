"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUp, FileText, Mic, Square, Volume2, VolumeX, X, Maximize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { askLana, GREETING, suggestionsFor, type LanaAnswer, type LanaBlock, type LanaContext } from "@/lib/lana";

/* ---------------------------------- Brand --------------------------------- */

export const LANA_GRADIENT = "linear-gradient(90deg, #27D7F4 0%, #8A7BE8 50%, #E52BDC 100%)";

export function LanaMark({ size = 28, className }: { size?: number; className?: string }) {
  const w = Math.round(size * 0.685);
  return <Image src="/lana.png" alt="" width={w} height={size} style={{ width: w, height: size }} className={cn("shrink-0 self-start select-none", className)} aria-hidden />;
}

/** The Lana mark on a clean white tile — the default way to show Lana. */
export function LanaTile({ size = 40, className, ring = true }: { size?: number; className?: string; ring?: boolean }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center bg-white", ring && "border border-hair shadow-[0_1px_2px_rgba(15,23,42,0.06)]", className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
      aria-hidden
    >
      <LanaMark size={Math.round(size * 0.72)} className="!self-center" />
    </span>
  );
}

export function LanaSparkle({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path fill="currentColor" d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" />
    </svg>
  );
}

export function LanaPill({ className, children = "Ask Lana" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white", className)} style={{ background: LANA_GRADIENT }}>
      <LanaSparkle size={9} /> {children}
    </span>
  );
}

/* ------------------------------ Panel open state -------------------------- */

export const useLanaUI = create<{ open: boolean; prompt?: string; setOpen: (v: boolean, prompt?: string) => void }>((set) => ({
  open: false,
  setOpen: (open, prompt) => set({ open, prompt }),
}));

/* ---------------------------------- Voice --------------------------------- */

type Recog = { start: () => void; stop: () => void; abort: () => void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null };

function useVoice(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(false);
  const rec = useRef<Recog | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    setSupported(!!Ctor);
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-GB";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e: any) => {
      let text = "";
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      setInterim(text);
      if (final) {
        finalRef.current(text);
        setInterim("");
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    return () => r.abort();
  }, []);

  const start = useCallback(() => {
    if (!rec.current) return;
    setInterim("");
    try {
      rec.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);
  const stop = useCallback(() => rec.current?.stop(), []);
  return { listening, interim, supported, start, stop };
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 1.02;
  const v = window.speechSynthesis.getVoices().find((x) => /en-GB/i.test(x.lang) && /female|libby|sonia|serena|kate|martha/i.test(x.name)) ?? window.speechSynthesis.getVoices().find((x) => /en-GB/i.test(x.lang));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

/* ---------------------------------- Chat ---------------------------------- */

type Msg = { id: number; role: "user" | "lana"; text: string; answer?: LanaAnswer; shown: number; voice?: boolean };

export function LanaChat({ ctx, variant = "panel", initialPrompt, onClose }: { ctx: LanaContext; variant?: "panel" | "page"; initialPrompt?: string; onClose?: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const toast = useStore((s) => s.toast);
  const usedInitial = useRef(false);

  const ask = useCallback(
    (text: string, viaVoice = false) => {
      const q = text.trim();
      if (!q || thinking) return;
      setDraft("");
      const uid = idRef.current++;
      setMsgs((m) => [...m, { id: uid, role: "user", text: q, shown: q.length, voice: viaVoice }]);
      setThinking(true);
      setTimeout(() => {
        const answer = askLana(q, ctx, useStore.getState());
        const lid = idRef.current++;
        setThinking(false);
        setMsgs((m) => [...m, { id: lid, role: "lana", text: answer.text, answer, shown: 0 }]);
        if (voiceOut || viaVoice) speak(answer.text);
      }, 650 + Math.random() * 450);
    },
    [ctx, thinking, voiceOut],
  );

  const voice = useVoice((t) => ask(t, true));

  // Typewriter reveal of the latest answer
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "lana" || last.shown >= last.text.length) return;
    const t = setTimeout(() => setMsgs((m) => m.map((x) => (x.id === last.id ? { ...x, shown: Math.min(x.text.length, x.shown + 4) } : x))), 12);
    return () => clearTimeout(t);
  }, [msgs]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking, voice.interim]);

  useEffect(() => {
    if (initialPrompt && !usedInitial.current) {
      usedInitial.current = true;
      ask(initialPrompt);
    }
  }, [initialPrompt, ask]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const page = variant === "page";
  const empty = msgs.length === 0 && !thinking;

  return (
    <div className={cn("flex h-full min-h-0 flex-col", page ? "" : "")}>
      {/* Header */}
      {!page && (
        <div className="relative flex items-center gap-3 border-b border-hair px-5 py-3.5">
          <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: LANA_GRADIENT }} />
          <LanaTile size={44} />
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-navy">Lana</div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Knows the Chamber’s data
            </div>
          </div>
          <IconBtn label={voiceOut ? "Stop reading answers aloud" : "Read answers aloud"} onClick={() => { setVoiceOut((v) => !v); if (voiceOut) window.speechSynthesis?.cancel(); }}>
            {voiceOut ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </IconBtn>
          {ctx === "admin" && (
            <Link href="/admin/lana" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-stone hover:text-navy" aria-label="Open full page">
              <Maximize2 size={15} />
            </Link>
          )}
          {onClose && (
            <IconBtn label="Close Lana" onClick={onClose}>
              <X size={16} />
            </IconBtn>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scroller} className={cn("scrollbar-thin flex-1 overflow-y-auto", page ? "px-1 py-2" : "px-5 py-5")} aria-live="polite">
        {empty ? (
          <div className={cn(page ? "py-10 text-center" : "")}>
            {page && <LanaOrb />}
            <p className={cn("text-navy", page ? "font-display mx-auto mt-6 max-w-xl text-[28px] leading-snug" : "text-[14.5px] leading-relaxed")}>{GREETING[ctx]}</p>
            <div className={cn("mt-5 flex flex-wrap gap-2", page && "mx-auto max-w-3xl justify-center")}>
              {suggestionsFor(ctx).slice(0, page ? 8 : 4).map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-hair bg-white px-3.5 py-2 text-left text-[13px] text-navy-2 transition hover:border-[#8A7BE8] hover:text-navy">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("space-y-5", page && "mx-auto max-w-3xl")}>
            {msgs.map((m) =>
              m.role === "user" ? (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-[14px] text-white">
                    {m.voice && <Mic size={12} className="mr-1.5 mb-0.5 inline text-white/60" />}
                    {m.text}
                  </div>
                </motion.div>
              ) : (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <LanaTile size={34} className="mt-[-2px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] leading-relaxed text-navy">
                      {m.text.slice(0, m.shown)}
                      {m.shown < m.text.length && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-[#8A7BE8]" />}
                    </p>
                    {m.answer && m.shown >= m.text.length && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        {m.answer.blocks.map((b, i) => (
                          <Block key={i} b={b} compact={!page} onToast={(t) => toast({ title: t })} />
                        ))}
                        {m.answer.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-faint">
                            <span>Sources</span>
                            {m.answer.sources.map((src) => (
                              <span key={src} className="rounded-md border border-hair bg-paper px-1.5 py-0.5 text-muted">
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                        {m.id === msgs[msgs.length - 1]?.id && m.answer.follow.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {m.answer.follow.map((f) => (
                              <button key={f} onClick={() => ask(f)} className="rounded-full border border-hair bg-white px-3 py-1.5 text-[12.5px] text-navy-2 transition hover:border-[#8A7BE8]">
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ),
            )}
            {thinking && (
              <div className="flex items-center gap-3">
                <LanaTile size={34} />
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-2 w-2 rounded-full" style={{ background: ["#27D7F4", "#8A7BE8", "#E52BDC"][i] }} animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className={cn(page ? "mx-auto w-full max-w-3xl pt-3" : "border-t border-hair p-3")}>
        <AnimatePresence>
          {voice.listening && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2 flex items-center gap-3 overflow-hidden rounded-xl bg-paper px-4 py-2.5">
              <Wave />
              <span className="flex-1 truncate text-[13.5px] text-navy">{voice.interim || "Listening…"}</span>
              <button onClick={voice.stop} className="text-[12.5px] font-semibold text-navy hover:text-red">
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
          className={cn("flex items-end gap-2 rounded-2xl border bg-white p-1.5 transition focus-within:border-[#8A7BE8] focus-within:shadow-[0_0_0_4px_rgba(138,123,232,0.12)]", page ? "border-line shadow-[var(--shadow-lift)]" : "border-line")}
        >
          <label htmlFor={`lana-input-${variant}`} className="sr-only">
            Ask Lana
          </label>
          <textarea
            id={`lana-input-${variant}`}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
              }
            }}
            placeholder={voice.listening ? "Listening…" : ctx === "admin" ? "Ask about members, events, payments, documents…" : "Ask Lana anything…"}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14.5px] text-navy outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={() => (voice.listening ? voice.stop() : voice.supported ? voice.start() : toast({ title: "Voice needs Chrome, Edge or Safari", body: "Your browser doesn’t support speech input.", tone: "info" }))}
            aria-label={voice.listening ? "Stop listening" : "Ask by voice"}
            className={cn("relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition", voice.listening ? "text-white" : "text-navy hover:bg-stone")}
            style={voice.listening ? { background: LANA_GRADIENT } : undefined}
          >
            {voice.listening && <motion.span className="absolute inset-0 rounded-xl" style={{ background: LANA_GRADIENT }} animate={{ scale: [1, 1.25], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} />}
            {voice.listening ? <Square size={14} className="relative" fill="currentColor" /> : <Mic size={18} />}
          </button>
          <button type="submit" disabled={!draft.trim() || thinking} aria-label="Send" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white transition disabled:opacity-30">
            <ArrowUp size={17} />
          </button>
        </form>
        {page && (
          <div className="mt-2 flex items-center justify-between px-1 text-[11.5px] text-faint">
            <span>Answers use live Chamber data and indexed documents. Lana can make mistakes — check before acting.</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setVoiceOut((v) => !v)} className="flex items-center gap-1 hover:text-navy">
                {voiceOut ? <Volume2 size={13} /> : <VolumeX size={13} />} {voiceOut ? "Reading aloud" : "Read aloud"}
              </button>
              {msgs.length > 0 && (
                <button onClick={() => setMsgs([])} className="flex items-center gap-1 hover:text-navy">
                  <RotateCcw size={12} /> New chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-stone hover:text-navy">
      {children}
    </button>
  );
}

function Wave() {
  return (
    <span className="flex h-5 items-center gap-[3px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span key={i} className="w-[3px] rounded-full" style={{ background: ["#27D7F4", "#5FA8EE", "#8A7BE8", "#B85DE2", "#E52BDC"][i] }} animate={{ height: [6, 18, 8, 14, 6] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.1 }} />
      ))}
    </span>
  );
}

export function LanaOrb({ size = 96 }: { size?: number }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full blur-2xl" style={{ background: LANA_GRADIENT, opacity: 0.14 }} animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} />
      <div className="relative flex h-full w-full items-center justify-center rounded-full border border-hair bg-white shadow-[var(--shadow-lift)]">
        <LanaMark size={Math.round(size * 0.64)} className="!self-center" />
      </div>
    </div>
  );
}

/* --------------------------------- Blocks --------------------------------- */

function Block({ b, compact, onToast }: { b: LanaBlock; compact: boolean; onToast: (t: string) => void }) {
  if (b.kind === "stats")
    return (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {b.items.map((x) => (
          <div key={x.label} className="rounded-xl border border-hair bg-paper/60 px-3 py-2.5">
            <div className="text-[11px] text-faint">{x.label}</div>
            <div className="text-[15px] font-semibold text-navy tabular">{x.value}</div>
          </div>
        ))}
      </div>
    );
  if (b.kind === "bars") {
    const max = Math.max(...b.items.map((x) => x.value), 1);
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-hair bg-white p-3">
        {b.items.map((x, i) => (
          <div key={x.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-[12.5px] text-navy-2">{x.label}</span>
            <span className="text-[12px] font-semibold text-navy tabular">{x.display}</span>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-stone">
              <motion.div className="h-full rounded-full" style={{ background: LANA_GRADIENT }} initial={{ width: 0 }} animate={{ width: `${(x.value / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.06 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (b.kind === "table")
    return (
      <div className="mt-3 overflow-x-auto rounded-xl border border-hair bg-white">
        <table className={cn("w-full", compact ? "text-[12px]" : "text-[13px]")}>
          <thead>
            <tr className="border-b border-hair bg-paper/60 text-left text-faint">
              {b.columns.map((c, i) => (
                <th key={c} className={cn("px-3 py-2 font-medium whitespace-nowrap", b.align?.[i] === "right" && "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={ri} className="border-b border-hair/60 last:border-0">
                {r.map((cell, ci) => (
                  <td key={ci} className={cn("px-3 py-2 text-navy", ci === 0 && "font-medium", b.align?.[ci] === "right" && "text-right tabular", cell === "Overdue" && "text-red", compact && ci > 0 && ci < r.length - 1 && "whitespace-nowrap")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (b.kind === "doc")
    return (
      <div className="mt-3 rounded-xl border border-hair bg-white p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-navy">
            <FileText size={15} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-navy">{b.title}</div>
            <div className="text-[11.5px] text-faint">{b.summary}</div>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {b.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] text-faint">{f.label}</dt>
              <dd className="text-[12.5px] font-medium text-navy">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {b.items.map((a) =>
        a.href ? (
          <Link key={a.label} href={a.href} className="inline-flex h-8 items-center rounded-lg bg-navy px-3 text-[12.5px] font-medium text-white hover:bg-navy-2">
            {a.label}
          </Link>
        ) : (
          <button key={a.label} onClick={() => a.toast && onToast(a.toast)} className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-[12.5px] font-medium text-navy hover:bg-paper">
            {a.label}
          </button>
        ),
      )}
    </div>
  );
}

/* -------------------------------- Launcher -------------------------------- */

export function LanaLauncher({ ctx, nudge, className }: { ctx: LanaContext; nudge?: string; className?: string }) {
  const { open, prompt, setOpen } = useLanaUI();
  const pathname = usePathname();
  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    if (!nudge) return;
    const seen = (() => {
      try {
        return sessionStorage.getItem("lana-nudge") === "1";
      } catch {
        return true;
      }
    })();
    if (seen) return;
    const t = setTimeout(() => setBubble(true), 2500);
    return () => clearTimeout(t);
  }, [nudge]);

  const dismissBubble = () => {
    setBubble(false);
    try {
      sessionStorage.setItem("lana-nudge", "1");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask Lana"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-4 bottom-4 z-[55] flex h-[min(640px,calc(100vh-32px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-hair bg-white shadow-[var(--shadow-pop)] sm:right-6 sm:bottom-6"
          >
            <LanaChat key={prompt ?? "chat"} ctx={ctx} initialPrompt={prompt} onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={cn("fixed right-4 bottom-4 z-[45] flex flex-col items-end gap-2 sm:right-6 sm:bottom-6", className)}>
            <AnimatePresence>
              {bubble && nudge && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="relative max-w-[260px] rounded-2xl rounded-br-md border border-hair bg-white px-4 py-3 text-[13.5px] leading-snug text-navy shadow-[var(--shadow-lift)]">
                  <button onClick={dismissBubble} aria-label="Dismiss" className="absolute top-1.5 right-1.5 text-faint hover:text-navy">
                    <X size={13} />
                  </button>
                  <button
                    onClick={() => {
                      dismissBubble();
                      setOpen(true);
                    }}
                    className="pr-3 text-left"
                  >
                    {nudge}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                dismissBubble();
                setOpen(true);
              }}
              className="group relative flex h-16 items-center gap-2.5 rounded-full bg-white py-2 pr-6 pl-3 shadow-[var(--shadow-lift)] transition hover:shadow-[var(--shadow-pop)]"
              aria-label="Ask Lana"
            >
              <span className="absolute -inset-[1.5px] -z-10 rounded-full" style={{ background: LANA_GRADIENT } as CSSProperties} />
              <span className="absolute inset-0 rounded-full bg-white" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white">
                <LanaMark size={34} className="!self-center" />
              </span>
              <span className="relative text-[14px] font-semibold text-navy">Ask Lana</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Small header button (website) — the Lana mark with its gradient pill, like the original site. */
export function LanaHeaderButton() {
  const setOpen = useLanaUI((s) => s.setOpen);
  return (
    <button onClick={() => setOpen(true)} aria-label="Ask Lana" className="group relative flex h-12 items-center gap-2.5 rounded-2xl border border-hair bg-white pr-2 pl-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#8A7BE8] xl:pr-4">
      <LanaTile size={38} ring={false} />
      <span className="hidden text-[14px] font-semibold text-navy xl:inline">Ask Lana</span>
    </button>
  );
}
