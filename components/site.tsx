"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Menu, X, Mail, MapPin, Phone } from "lucide-react";
import { Button, EventArt, Logo, Toaster, useMounted } from "./ui";
import { LanaHeaderButton, LanaLauncher } from "./lana";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/membership", label: "Membership" },
  { href: "/sponsorship", label: "Partnerships" },
  { href: "/events", label: "Events" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={cn("sticky top-0 z-40 transition-[background,box-shadow,border-color] duration-300", scrolled ? "border-b border-hair bg-paper/85 backdrop-blur-xl" : "border-b border-transparent bg-paper")}>
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center gap-6 px-5 md:px-8">
        <Link href="/" aria-label="BCC RAK home" className="shrink-0">
          <Logo width={150} />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href} className={cn("relative rounded-lg px-3.5 py-2 text-[14px] transition-colors", active ? "font-semibold text-navy" : "text-muted hover:text-navy")}>
                {n.label}
                {active && <motion.span layoutId="site-nav" className="absolute right-3.5 -bottom-[3px] left-3.5 h-[2px] rounded-full bg-red" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button variant="ghost" href="/login" size="md">
            Member login
          </Button>
          <Button variant="primary" href="/join" size="md">
            Join the Chamber
          </Button>
          <LanaHeaderButton />
        </div>
        <button onClick={() => setOpen((v) => !v)} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-navy hover:bg-stone lg:hidden" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-hair bg-paper lg:hidden" aria-label="Mobile">
            <div className="space-y-1 px-5 py-4">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-3 text-[16px] text-navy hover:bg-stone/60">
                  {n.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Button variant="secondary" href="/login">
                  Member login
                </Button>
                <Button variant="primary" href="/join">
                  Join
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  const toast = useStore((s) => s.toast);
  const [email, setEmail] = useState("");
  return (
    <footer className="mt-24 border-t border-hair bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 md:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <Logo width={170} />
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-muted">The first British business platform in Ras Al Khaimah — connecting, representing and supporting British business in the emirate.</p>
        </div>
        <div>
          <div className="eyebrow mb-4">The Chamber</div>
          <ul className="space-y-2.5 text-[14px]">
            {NAV.slice(0, 4).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-navy-2 hover:text-red">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="text-navy-2 hover:text-red">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Contact</div>
          <ul className="space-y-3 text-[14px] text-navy-2">
            <li className="flex gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-faint" /> RAK Business Centre, Level 12, Al Nakheel, Ras Al Khaimah
            </li>
            <li className="flex gap-2.5">
              <Mail size={15} className="mt-0.5 shrink-0 text-faint" /> hello@britishchamberrak.net
            </li>
            <li className="flex gap-2.5">
              <Phone size={15} className="mt-0.5 shrink-0 text-faint" /> +971 7 204 1100
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">The Weekly Update</div>
          <p className="text-[14px] text-muted">Events, member news and policy in a five-minute read, every Tuesday.</p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) return;
              toast({ title: "You’re subscribed", body: `${email} added to the Weekly Update (Mailchimp)` });
              setEmail("");
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input id="footer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[14px] outline-none focus:border-navy-3" />
            <Button variant="dark" type="submit">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-hair">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-6 text-[12px] text-faint md:flex-row md:items-center md:justify-between md:px-8">
          <span>© {new Date().getFullYear()} British Chamber of Commerce Ras Al Khaimah · Demo build by Pebble Intelligent Solutions</span>
          <span>Photography: Unsplash and Pexels contributors (free licences)</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div className="min-h-screen bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{mounted ? <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>{children}</motion.div> : <div className="min-h-[70vh]" />}</main>
      <SiteFooter />
      <LanaLauncher ctx="public" nudge="Hi, I’m Lana. Ask me about membership, events or partnering with the Chamber." />
      <Toaster />
    </div>
  );
}

/* ------------------------------ Building blocks ---------------------------- */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1280px] px-5 md:px-8", className)}>{children}</div>;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export function SectionHead({ eyebrow, title, intro, action, center }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; action?: ReactNode; center?: boolean }) {
  return (
    <div className={cn("mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", center && "items-center text-center md:flex-col md:items-center")}>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow && <div className="eyebrow mb-3 !text-red">{eyebrow}</div>}
        <h2 className="font-display text-[34px] leading-[1.08] text-navy md:text-[46px]">{title}</h2>
        {intro && <p className="mt-4 text-[16px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy hover:text-red">
      {children} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function PageHero({ eyebrow, title, intro, photo, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; photo?: Parameters<typeof EventArt>[0]["photo"]; children?: ReactNode }) {
  return (
    <Container className="pt-6">
      <EventArt
        art="dusk"
        photo={photo}
        width={1600}
        priority
        overlay="full"
        className="rounded-[28px]"
        label={
          <div className="flex min-h-[380px] flex-col justify-end p-8 text-white md:min-h-[440px] md:p-14">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3 text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                <span className="h-px w-8 bg-[#E9C7A8]" /> {eyebrow}
              </div>
              <h1 className="font-display text-[42px] leading-[1.04] md:text-[60px]">{title}</h1>
              {intro && <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/80">{intro}</p>}
              {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
            </motion.div>
          </div>
        }
      />
    </Container>
  );
}
