"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutGrid,
  CalendarDays,
  Ticket,
  IdCard,
  MessagesSquare,
  Receipt,
  Settings,
  Sparkles,
  Gift,
  FileText,
  Users,
  Inbox,
  Handshake,
  CalendarRange,
  Megaphone,
  ShieldCheck,
  Plug,
  Bell,
  Search,
  Menu,
  ChevronsUpDown,
  RotateCcw,
  ExternalLink,
  Check,
  Wand2,
  ArrowRight,
  LogOut,
  BookOpen,
} from "lucide-react";
import { cn, rel, relLabel } from "@/lib/utils";
import { Avatar, Crest, Kbd, Logo, Toaster, useMounted } from "./ui";
import { LanaLauncher, LanaMark, LanaPill, useLanaUI } from "./lana";
import { useStore } from "@/lib/store";
import { EVENTS, ME_MEMBER, ME_SPONSOR, NOTIFICATIONS, PEOPLE, STAFF } from "@/lib/data";

export type Portal = "member" | "sponsor" | "admin";

type NavItem = { href: string; label: string; icon: typeof LayoutGrid; badge?: string; live?: "applications" | "kyc"; lana?: boolean };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: Record<Portal, NavGroup[]> = {
  member: [
    {
      items: [
        { href: "/member", label: "Home", icon: LayoutGrid },
        { href: "/member/events", label: "Events", icon: CalendarDays },
        { href: "/member/tickets", label: "My tickets", icon: Ticket },
        { href: "/member/membership", label: "Membership", icon: IdCard },
        { href: "/member/messages", label: "Message board", icon: MessagesSquare, badge: "2" },
        { href: "/member/billing", label: "Billing", icon: Receipt },
        { href: "/member/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
  sponsor: [
    {
      items: [
        { href: "/sponsor", label: "Overview", icon: LayoutGrid },
        { href: "/sponsor/events", label: "Sponsored events", icon: Sparkles },
        { href: "/sponsor/benefits", label: "Benefits", icon: Gift },
        { href: "/sponsor/messages", label: "Messages", icon: MessagesSquare, badge: "1" },
        { href: "/sponsor/documents", label: "Documents & billing", icon: FileText },
      ],
    },
  ],
  admin: [
    {
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutGrid },
        { href: "/admin/lana", label: "Ask Lana", icon: LayoutGrid, lana: true },
        { href: "/admin/calendar", label: "Calendar", icon: CalendarRange },
      ],
    },
    {
      label: "Relationships",
      items: [
        { href: "/admin/crm", label: "Members & contacts", icon: Users },
        { href: "/admin/applications", label: "Applications", icon: Inbox, live: "applications" },
        { href: "/admin/sponsors", label: "Sponsors & partners", icon: Handshake },
      ],
    },
    {
      label: "Operations",
      items: [
        { href: "/admin/events", label: "Events", icon: CalendarDays },
        { href: "/admin/billing", label: "Billing", icon: Receipt },
        { href: "/admin/communications", label: "Communications", icon: Megaphone },
      ],
    },
    {
      label: "Trust",
      items: [
        { href: "/admin/data-hygiene", label: "Data hygiene", icon: Wand2 },
        { href: "/admin/compliance", label: "AML & KYC", icon: ShieldCheck, live: "kyc" },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/admin/lana/knowledge", label: "Knowledge base", icon: BookOpen },
        { href: "/admin/integrations", label: "Integrations", icon: Plug },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
};

const PORTAL_META: Record<Portal, { label: string; user: { name: string; sub: string } }> = {
  member: { label: "Member portal", user: { name: ME_MEMBER.name, sub: "Thames & Hajar · Founding" } },
  sponsor: { label: "Sponsor portal", user: { name: ME_SPONSOR.name, sub: "Meridian Bank RAK · Platinum" } },
  admin: { label: "BCC RAK console", user: { name: STAFF.admin.name, sub: STAFF.admin.role } },
};

function isActive(pathname: string, href: string) {
  if (href === "/member" || href === "/sponsor" || href === "/admin" || href === "/admin/lana") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/* ---------------------------------- Sidebar -------------------------------- */

function Sidebar({ portal, onNavigate }: { portal: Portal; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [switcher, setSwitcher] = useState(false);
  const reset = useStore((s) => s.reset);
  const toast = useStore((s) => s.toast);
  const meta = PORTAL_META[portal];
  const openApps = useStore((s) => s.applications.filter((a) => a.stage !== "Paid").length);
  const openKyc = useStore((s) => s.kyc.filter((k) => k.status !== "Clear").length);
  const badgeFor = (it: NavItem) => (it.live === "applications" ? (openApps ? String(openApps) : undefined) : it.live === "kyc" ? (openKyc ? String(openKyc) : undefined) : it.badge);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link href={`/${portal === "admin" ? "admin" : portal}`} onClick={onNavigate} className="block">
          <Logo width={150} />
        </Link>
      </div>

      <div className="relative px-3">
        <button
          onClick={() => setSwitcher((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-hair bg-white px-3 py-2.5 text-left shadow-[var(--shadow-card)] transition hover:border-line"
        >
          <Crest size={26} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-navy">{meta.label}</div>
            <div className="truncate text-[11.5px] text-faint">Demo · switch view</div>
          </div>
          <ChevronsUpDown size={15} className="text-faint" />
        </button>
        <AnimatePresence>
          {switcher && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute top-full right-3 left-3 z-30 mt-1.5 overflow-hidden rounded-xl border border-hair bg-white p-1 shadow-[var(--shadow-lift)]"
            >
              {(Object.keys(PORTAL_META) as Portal[]).map((p) => (
                <Link
                  key={p}
                  href={`/${p}`}
                  onClick={() => {
                    setSwitcher(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] hover:bg-paper"
                >
                  <Avatar name={PORTAL_META[p].user.name} size={26} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-navy">{PORTAL_META[p].label}</div>
                    <div className="truncate text-[11.5px] text-faint">{PORTAL_META[p].user.name}</div>
                  </div>
                  {p === portal && <Check size={14} className="text-navy" />}
                </Link>
              ))}
              <div className="my-1 h-px bg-hair" />
              <button
                onClick={() => {
                  reset();
                  setSwitcher(false);
                  toast({ title: "Demo data reset", body: "Everything is back to the starting point.", tone: "info" });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-paper hover:text-navy"
              >
                <RotateCcw size={14} /> Reset demo data
              </button>
              <Link href="/" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-paper hover:text-navy">
                <LogOut size={14} /> Sign out
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="scrollbar-thin mt-5 flex-1 overflow-y-auto px-3 pb-4">
        {NAV[portal].map((g, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-5")}>
            {g.label && <div className="eyebrow mb-1.5 px-3 !text-[10.5px]">{g.label}</div>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                const Icon = it.icon;
                const badge = badgeFor(it);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-xl px-3 text-[13.5px] transition-colors",
                        active ? "font-semibold text-navy" : "text-muted hover:bg-stone/50 hover:text-navy",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(20,33,58,0.06),0_0_0_1px_rgba(20,33,58,0.05)]"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      {active && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-red" />}
                      {it.lana ? <LanaMark size={18} className="relative z-10 mx-[-1px]" /> : <Icon size={16} strokeWidth={active ? 2 : 1.6} className="relative z-10 shrink-0" />}
                      <span className="relative z-10 flex-1 truncate">{it.label}</span>
                      {it.lana && !active && <LanaPill className="relative z-10 !px-1.5">AI</LanaPill>}
                      {badge && (
                        <span className={cn("relative z-10 rounded-full px-1.5 text-[11px] font-semibold tabular", active ? "bg-navy text-white" : "bg-stone text-navy-2")}>{badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-hair p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={meta.user.name} size={34} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-navy">{meta.user.name}</div>
            <div className="truncate text-[11.5px] text-faint">{meta.user.sub}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Command palette ---------------------------- */

type Cmd = { id: string; label: string; sub?: string; href: string; group: string };

function CommandPalette({ open, onClose, portal }: { open: boolean; onClose: () => void; portal: Portal }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const COMPANIES = useStore((s) => s.companies);
  const all: Cmd[] = useMemo(() => {
    const pages: Cmd[] = NAV[portal].flatMap((g) => g.items.map((i) => ({ id: i.href, label: i.label, href: i.href, group: "Go to" })));
    const events: Cmd[] = EVENTS.map((e) => ({
      id: e.id,
      label: e.title,
      sub: relLabel(e.start),
      href: portal === "admin" ? `/admin/events/${e.id}` : portal === "sponsor" ? `/sponsor/events` : `/member/events/${e.id}`,
      group: "Events",
    }));
    const extra: Cmd[] =
      portal === "admin"
        ? [
            ...COMPANIES.map((c) => ({ id: c.id, label: c.name, sub: c.sector, href: `/admin/crm/${c.id}`, group: "Companies" })),
            ...PEOPLE.map((p) => ({ id: p.id, label: p.name, sub: p.role, href: `/admin/crm/${p.companyId}`, group: "People" })),
            { id: "new-event", label: "Create an event", href: "/admin/events/new", group: "Actions" },
            { id: "check-in", label: "Open check-in for the breakfast", href: "/admin/events/e2/check-in", group: "Actions" },
          ]
        : [];
    return [...pages, ...extra, ...events];
  }, [portal, COMPANIES]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = s ? all.filter((c) => (c.label + " " + (c.sub ?? "")).toLowerCase().includes(s)) : all.filter((c) => c.group === "Go to" || c.group === "Actions");
    return r.slice(0, 9);
  }, [q, all]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
    }
  }, [open]);

  const go = (c?: Cmd) => {
    if (!c) return;
    router.push(c.href);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy/25 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            initial={{ y: -8, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -6, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-hair bg-white shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center gap-3 border-b border-hair px-5">
              <Search size={17} className="text-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdx((i) => Math.min(results.length - 1, i + 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdx((i) => Math.max(0, i - 1));
                  }
                  if (e.key === "Enter") go(results[idx]);
                  if (e.key === "Escape") onClose();
                }}
                placeholder={portal === "admin" ? "Search members, companies, events…" : "Search pages and events…"}
                className="h-14 flex-1 bg-transparent text-[15px] text-navy outline-none placeholder:text-faint"
              />
              <Kbd>esc</Kbd>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              {results.length === 0 && <div className="px-3 py-10 text-center text-[14px] text-muted">No results for “{q}”</div>}
              {results.map((r, i) => (
                <button
                  key={r.group + r.id}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => go(r)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === idx ? "bg-paper" : "")}
                >
                  <span className="w-20 shrink-0 text-[11px] font-medium tracking-wide text-faint uppercase">{r.group}</span>
                  <span className="flex-1 truncate text-[14px] text-navy">{r.label}</span>
                  {r.sub && <span className="truncate text-[12px] text-faint">{r.sub}</span>}
                  {i === idx && <ArrowRight size={14} className="text-muted" />}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Top bar --------------------------------- */

const PORTAL_NOTES: Record<Portal, { id: string; title: string; body: string; time: string; unread: boolean }[]> = {
  member: NOTIFICATIONS,
  sponsor: [
    { id: "s1", title: "Omar sent you a message", body: "Keynote slot: launch evening or the lunch?", time: rel(-1, 16, 48), unread: true },
    { id: "s2", title: "Backdrop proof ready for approval", body: "Launch evening · stage backdrop v2", time: rel(-3, 9, 15), unread: true },
    { id: "s3", title: "Invoice BCC-2026-0219 issued", body: "Platinum sponsorship · instalment 2 of 2", time: rel(-2, 10, 0), unread: false },
  ],
  admin: [
    { id: "a1", title: "Possible sanctions match", body: "Atlas Freight Forwarding needs a review", time: rel(-1, 15, 5), unread: true },
    { id: "a2", title: "New application", body: "Cotswold Coffee Roasters registered interest", time: rel(-1, 17, 40), unread: true },
    { id: "a3", title: "Mailchimp sync warning", body: "4 bounced addresses", time: rel(-1, 6, 0), unread: false },
  ],
};

function Notifications({ portal }: { portal: Portal }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-white hover:text-navy"
        aria-label="Notifications"
      >
        <Bell size={17} />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-paper bg-red" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute top-full right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-2xl border border-hair bg-white shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="text-[14px] font-semibold text-navy">Notifications</div>
                <span className="text-[12px] text-faint">Push + email</span>
              </div>
              {PORTAL_NOTES[portal].map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-paper">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-red" : "bg-line")} />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-navy">{n.title}</div>
                    <div className="text-[12.5px] text-muted">{n.body}</div>
                    <div className="mt-1 text-[11.5px] text-faint">{relLabel(n.time)}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopBar({ portal, onMenu, onSearch }: { portal: Portal; onMenu: () => void; onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-transparent bg-paper/80 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-5 md:px-10">
        <button onClick={onMenu} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-navy hover:bg-white lg:hidden" aria-label="Open menu">
          <Menu size={18} />
        </button>
        <button
          onClick={onSearch}
          className="group flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-hair bg-white/80 px-3.5 text-[13.5px] text-faint shadow-[var(--shadow-card)] transition hover:border-line hover:text-muted"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Search or jump to…</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="hidden h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] text-muted transition hover:bg-white hover:text-navy md:inline-flex"
            title="Public website (WordPress + Elementor in production)"
          >
            Public website <ExternalLink size={13} />
          </Link>
          {portal === "admin" && <TopLanaButton />}
          <Notifications portal={portal} />
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- Shell ---------------------------------- */

export function Shell({ portal, children }: { portal: Portal; children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [cmd, setCmd] = useState(false);
  const mounted = useMounted();
  const pathname = usePathname();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        useLanaUI.getState().setOpen(!useLanaUI.getState().open);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-hair bg-paper lg:block">
        <Sidebar portal={portal} />
      </aside>

      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy/30 backdrop-blur-[2px]" onClick={() => setMenu(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="absolute inset-y-0 left-0 w-[280px] bg-paper shadow-[var(--shadow-pop)]"
            >
              <Sidebar portal={portal} onNavigate={() => setMenu(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        <TopBar portal={portal} onMenu={() => setMenu(true)} onSearch={() => setCmd(true)} />
        <main className="mx-auto max-w-[1280px] px-5 pt-6 pb-24 md:px-10 md:pt-8">
          {mounted ? (
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {children}
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="h-10 w-72 animate-pulse rounded-xl bg-stone/70" />
              <div className="h-40 animate-pulse rounded-2xl bg-stone/50" />
            </div>
          )}
        </main>
      </div>

      {portal === "member" && <MobileTabBar />}
      {!(portal === "admin" && pathname === "/admin/lana") && (
        <LanaLauncher ctx={portal} className={portal === "member" ? "bottom-20 lg:bottom-6" : undefined} />
      )}
      <CommandPalette open={cmd} onClose={() => setCmd(false)} portal={portal} />
      <Toaster />
    </div>
  );
}

function MobileTabBar() {
  const pathname = usePathname();
  const items = NAV.member[0].items.filter((i) => ["/member", "/member/events", "/member/tickets", "/member/membership", "/member/billing"].includes(i.href));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link href={it.href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10.5px]", active ? "font-semibold text-navy" : "text-faint")}>
                <Icon size={19} strokeWidth={active ? 2 : 1.6} />
                {it.label.replace("My ", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TopLanaButton() {
  const setOpen = useLanaUI((s) => s.setOpen);
  return (
    <button onClick={() => setOpen(true)} className="hidden h-9 items-center gap-2 rounded-xl border border-hair bg-white px-3 text-[13px] font-medium text-navy shadow-[var(--shadow-card)] transition hover:border-[#8A7BE8] md:inline-flex">
      <LanaMark size={18} /> Ask Lana
      <span className="hidden items-center gap-0.5 lg:flex">
        <Kbd>⌘</Kbd>
        <Kbd>J</Kbd>
      </span>
    </button>
  );
}
