"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import QRCode from "qrcode";
import { X, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

/* ---------------------------------- Button --------------------------------- */

type BtnVariant = "primary" | "dark" | "secondary" | "ghost" | "quiet" | "copper";
type BtnSize = "sm" | "md" | "lg" | "icon";

const btnBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-[var(--ease-out-soft)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 select-none";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-red text-white hover:bg-red-h shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_1px_2px_rgba(150,39,32,0.3)]",
  dark: "bg-navy text-white hover:bg-navy-2 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(20,33,58,0.3)]",
  secondary: "bg-white text-navy border border-line hover:border-navy-3/40 hover:bg-paper",
  ghost: "text-navy hover:bg-stone/70",
  quiet: "text-muted hover:text-navy hover:bg-stone/60",
  copper: "bg-copper text-white hover:brightness-95",
};
const btnSizes: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-[15px] rounded-xl",
  icon: "h-9 w-9 rounded-xl",
};

type ButtonProps = ComponentProps<"button"> & { variant?: BtnVariant; size?: BtnSize; href?: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, href, children, ...rest },
  ref,
) {
  const cls = cn(btnBase, btnVariants[variant], btnSizes[size], className);
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
});

/* ---------------------------------- Card ----------------------------------- */

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-2xl border border-hair bg-white shadow-[var(--shadow-card)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  eyebrow,
  action,
  className,
  sub,
}: {
  title: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  sub?: ReactNode;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-6 pt-5 pb-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h3 className="text-[15px] font-semibold tracking-tight text-navy">{title}</h3>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "copper" | "navy" | "outline";
const toneCls: Record<Tone, string> = {
  neutral: "bg-stone text-navy-2",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  copper: "bg-copper-soft text-copper-ink",
  navy: "bg-navy text-white",
  outline: "border border-line text-muted bg-white",
};

export function Badge({ tone = "neutral", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap", toneCls[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export const statusTone = (s: string): Tone => {
  const map: Record<string, Tone> = {
    Paid: "ok",
    Accepted: "ok",
    Active: "ok",
    Clear: "ok",
    Connected: "ok",
    Signed: "ok",
    Low: "ok",
    Due: "info",
    "Sent via Peppol": "info",
    "Renewal due": "warn",
    Queued: "neutral",
    "In review": "warn",
    "Awaiting documents": "warn",
    Attention: "warn",
    Medium: "warn",
    "Renewal talks": "warn",
    Proposal: "info",
    Overdue: "bad",
    Rejected: "bad",
    Escalated: "bad",
    High: "bad",
    Lapsed: "bad",
    Sponsor: "copper",
    Prospect: "outline",
    "Not required": "outline",
    Available: "outline",
    Draft: "outline",
  };
  return map[s] ?? "neutral";
};

/* ---------------------------------- Avatar --------------------------------- */

const avatarHues = ["#14213A", "#2B3A57", "#8C5A2E", "#44536F", "#7A4B2A", "#2F5D6B", "#5B4B7A", "#8A3A33"];

export function Avatar({ name, size = 36, className, ring }: { name: string; size?: number; className?: string; ring?: boolean }) {
  const hue = avatarHues[Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % avatarHues.length];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", ring && "ring-2 ring-white", className)}
      style={{ width: size, height: size, background: hue, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ---------------------------------- Logo ----------------------------------- */

export function Logo({ className, width = 132 }: { className?: string; width?: number }) {
  return (
    <Image src="/logo.png" alt="British Chamber of Commerce Ras Al Khaimah" width={width} height={Math.round((width * 194) / 432)} className={className} priority />
  );
}

/* Small crest: the mountain ridge in brand colours */
export function Crest({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#14213A" />
      <path d="M4 23 L11.5 12.5 L15 16.5 L19.5 9 L28 23 Z" fill="#fff" />
      <path d="M11.5 12.5 L15 16.5 L19.5 9 L22.5 14 L17 19 L13 15.8 L8 21 Z" fill="#B8322A" />
      <path d="M4 23 H28" stroke="#B5713E" strokeWidth="1.5" />
    </svg>
  );
}

/* --------------------------------- Page header ----------------------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-display text-[34px] leading-[1.1] text-navy md:text-[40px]">{title}</h1>
        {description && <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------------------------- CountUp -------------------------------- */

export function CountUp({ value, format = (n) => Math.round(n).toLocaleString("en-GB"), duration = 1.1 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const [text, setText] = useState(format(0));
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setText(format(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);
  return (
    <span ref={ref} className="tabular">
      {text}
    </span>
  );
}

/* ------------------------------- Progress ring ----------------------------- */

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  color = "#14213A",
  track = "#ECE8DF",
  children,
  delay = 0.1,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  delay?: number;
}) {
  const r = (size - stroke) / 2;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.001, Math.min(1, value)) }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, color = "bg-navy", className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-stone", className)}>
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  );
}

/* ---------------------------------- Charts --------------------------------- */

export function Sparkline({ data, color = "#14213A", width = 96, height = 32, fill = true }: { data: number[]; color?: string; width?: number; height?: number; fill?: boolean }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - 2 - ((v - min) / (max - min || 1)) * (height - 4)] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const id = `sg${useId().replace(/:/g, "")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.16" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L${width} ${height} L0 ${height} Z`} fill={`url(#${id})`} />}
      <motion.path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ------------------------------ Segmented tabs ----------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  id = "seg",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-xl border border-hair bg-stone/60 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn("relative h-8 rounded-lg px-3.5 text-[13px] font-medium transition-colors", value === o.value ? "text-navy" : "text-muted hover:text-navy")}
        >
          {value === o.value && (
            <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(20,33,58,0.08),0_0_0_1px_rgba(20,33,58,0.04)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
          )}
          <span className="relative z-10 flex items-center gap-1.5">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- Inputs --------------------------------- */

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-navy-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-faint">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-navy placeholder:text-faint transition-shadow outline-none focus:border-navy-3 focus:shadow-[0_0_0_4px_rgba(20,33,58,0.06)]";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputCls, "h-auto min-h-24 py-3 leading-relaxed", props.className)} />;
}

export function Select({ children, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235B6475%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_14px_center] bg-no-repeat pr-9", props.className)}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-navy" : "bg-line")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow", checked ? "right-0.5" : "left-0.5")} />
    </button>
  );
}

/* ----------------------------------- Modal --------------------------------- */

export function Modal({ open, onClose, children, className, side }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; side?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-navy/30 backdrop-blur-[3px]" onClick={onClose} aria-hidden />
          {side ? (
            <motion.div
              className={cn("absolute top-0 right-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-[var(--shadow-pop)]", className)}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              className={cn("relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-pop)]", className)}
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 8, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-stone hover:text-navy", className)} aria-label="Close">
      <X size={16} />
    </button>
  );
}

/* ---------------------------------- Toaster -------------------------------- */

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed right-5 bottom-24 z-[60] lg:bottom-5 flex w-[360px] max-w-[calc(100vw-40px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = t.tone === "warn" ? AlertTriangle : t.tone === "info" ? Info : CheckCircle2;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-hair bg-white p-4 shadow-[var(--shadow-lift)]"
            >
              <Icon size={18} className={cn("mt-0.5 shrink-0", t.tone === "warn" ? "text-warn" : t.tone === "info" ? "text-info" : "text-ok")} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-navy">{t.title}</div>
                {t.body && <div className="mt-0.5 text-[13px] leading-snug text-muted">{t.body}</div>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-faint hover:text-navy" aria-label="Dismiss">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- Stagger --------------------------------- */

export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } },
  item: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } } },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger.container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function Item({ children, className, ...rest }: ComponentProps<typeof motion.div>) {
  return (
    <motion.div variants={stagger.item} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------ QR ----------------------------------- */

export function QR({ value, size = 160, fg = "#14213A", className }: { value: string; size?: number; fg?: string; className?: string }) {
  const { cells, n } = useMemo(() => {
    const q = QRCode.create(value, { errorCorrectionLevel: "M" });
    const n = q.modules.size;
    const cells: [number, number][] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.modules.get(x, y)) cells.push([x, y]);
    return { cells, n };
  }, [value]);
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={className} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fg} />
      ))}
    </svg>
  );
}

/* --------------------------------- Event art ------------------------------- */

const ART: Record<string, { from: string; to: string; ridge: string; sun: string }> = {
  dusk: { from: "#14213A", to: "#3A2F4F", ridge: "#B8322A", sun: "#E8B07A" },
  dawn: { from: "#2B3A57", to: "#B5713E", ridge: "#F3D9BE", sun: "#FBE7CF" },
  sea: { from: "#1D3A4F", to: "#2F5D6B", ridge: "#9CC5C9", sun: "#F1E6D2" },
  stone: { from: "#44536F", to: "#8A92A1", ridge: "#ECE8DF", sun: "#F8F6F1" },
  ember: { from: "#3A1F22", to: "#B8322A", ridge: "#F0B48A", sun: "#FCE3C8" },
};

export function EventArt({
  art,
  className,
  label,
  photo,
  width = 900,
  priority,
  overlay = "bottom",
}: {
  art: string;
  className?: string;
  label?: ReactNode;
  photo?: PhotoKey;
  width?: number;
  priority?: boolean;
  overlay?: "bottom" | "full" | "none";
}) {
  const a = ART[art] ?? ART.dusk;
  const gid = `ea${useId().replace(/:/g, "")}`;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const p = photo ? PHOTOS[photo] : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-navy", className)}>
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a.from} />
            <stop offset="1" stopColor={a.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="220" fill={`url(#${gid})`} />
        <circle cx="318" cy="64" r="20" fill={a.sun} opacity="0.8" />
        <path d="M0 170 L70 118 L110 142 L170 82 L230 136 L270 112 L330 150 L400 120 L400 220 L0 220 Z" fill={a.ridge} opacity="0.28" />
        <path d="M0 190 L60 150 L120 176 L190 120 L250 168 L310 140 L400 178 L400 220 L0 220 Z" fill={a.from} opacity="0.75" />
        <path d="M0 190 L60 150 L120 176 L190 120 L250 168 L310 140 L400 178" fill="none" stroke={a.ridge} strokeOpacity="0.6" strokeWidth="1" />
      </svg>
      {p && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.src(width)}
          srcSet={`${p.src(Math.round(width / 2))} ${Math.round(width / 2)}w, ${p.src(width)} ${width}w, ${p.src(width * 2)} ${width * 2}w`}
          sizes={`${width}px`}
          alt={label ? "" : p.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)]", loaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0")}
        />
      )}
      {label && overlay === "bottom" && <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5" />}
      {label && overlay === "full" && <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-navy/10" />}
      {label && <div className="relative z-10 h-full">{label}</div>}
    </div>
  );
}

/* ------------------------------- Misc helpers ------------------------------ */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-hair", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line bg-white px-1 font-sans text-[11px] font-medium text-muted">{children}</kbd>;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    setM(true);
  }, []);
  return m;
}

export function AnimatedNumberText({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString("en-GB"));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.6 });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span className="tabular">{rounded}</motion.span>;
}

/* --------------------------- Payment brand marks --------------------------- */

export function AppleMark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" className={className} aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export function ApplePayBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-md bg-black px-2 py-1 text-[11px] font-semibold text-white", className)}>
      <AppleMark size={11} /> Pay
    </span>
  );
}

export function GooglePayBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[11px] font-semibold text-navy", className)}>
      <span className="font-bold">
        <span className="text-[#4285F4]">G</span>
      </span>
      Pay
    </span>
  );
}
