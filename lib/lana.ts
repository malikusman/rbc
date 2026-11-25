/**
 * Lana — the assistant built into the platform.
 * In the demo, answers are computed from the live demo data (invoices, events, members,
 * sponsors, documents). In production the same interface is backed by Lana's language
 * model with retrieval over the Chamber's data and ingested documents.
 */
import { APP_STAGES, EVENTS, ME_MEMBER, ME_SPONSOR, TIERS, BENEFITS, eventById, eventRevenue, invoiceTotal, sponsorById, tierById, type ChamberEvent } from "./data";
import { aed, daysFromNow, fmtDate, fmtTime, relLabel } from "./utils";
import type { useStore } from "./store";

export type LanaContext = "admin" | "member" | "sponsor" | "public";

export type LanaBlock =
  | { kind: "table"; columns: string[]; rows: (string | number)[][]; align?: ("left" | "right")[] }
  | { kind: "bars"; items: { label: string; value: number; display: string }[] }
  | { kind: "stats"; items: { label: string; value: string }[] }
  | { kind: "actions"; items: { label: string; href?: string; toast?: string }[] }
  | { kind: "doc"; title: string; summary: string; facts: { label: string; value: string }[] };

export type LanaAnswer = { text: string; blocks: LanaBlock[]; sources: string[]; follow: string[] };

type S = ReturnType<typeof useStore.getState>;

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

function windowDays(q: string, fallback: number) {
  const m = q.match(/(last|past)\s+(\d+)\s+(day|week|month)/);
  if (m) return Number(m[2]) * (m[3] === "day" ? 1 : m[3] === "week" ? 7 : 30);
  if (has(q, "last week", "past week")) return 7;
  if (has(q, "last month", "past month", "this month")) return 30;
  if (has(q, "last quarter", "this quarter")) return 90;
  if (has(q, "this year", "last year")) return 365;
  return fallback;
}

const pastEvents = (days: number) =>
  EVENTS.filter((e) => daysFromNow(e.start) < 0 && daysFromNow(e.start) >= -days).sort((a, b) => +new Date(b.start) - +new Date(a.start));
const upcomingEvents = () => EVENTS.filter((e) => daysFromNow(e.start) >= 0).sort((a, b) => +new Date(a.start) - +new Date(b.start));

const SUGGEST: Record<LanaContext, string[]> = {
  admin: [
    "Which members haven’t paid?",
    "Most profitable events in the last 3 weeks",
    "What events happened last month?",
    "Whose membership renews in the next 30 days?",
    "How is the sponsorship pipeline looking?",
    "Any compliance cases I should look at?",
    "What does the Meridian contract say about renewal?",
    "Summarise feedback from the soft launch",
  ],
  member: ["When is my next event?", "Do I owe anything?", "What’s included in my membership?", "What’s on this month?"],
  sponsor: ["Which benefits are still to be delivered?", "How did our events perform?", "When does our contract end?", "When is our next sponsored event?"],
  public: ["How much is membership?", "How do I join?", "What events are coming up?", "How can my company become a partner?", "Where is the Chamber based?"],
};

export const suggestionsFor = (ctx: LanaContext) => SUGGEST[ctx];

export const GREETING: Record<LanaContext, string> = {
  admin: "Ask me anything about members, events, money, partners or documents. I’ll answer from the Chamber’s live data.",
  member: "Hi Sarah — ask me about your bookings, invoices or membership.",
  sponsor: "Hi James — ask me how your partnership is performing.",
  public: "Hi, I’m Lana. Ask me about membership, events or partnering with the Chamber.",
};

/* -------------------------------------------------------------------------- */

export function askLana(raw: string, ctx: LanaContext, s: S): LanaAnswer {
  const q = raw.toLowerCase().replace(/[’']/g, "'").trim();

  // Documents first (any context with staff access)
  if (ctx === "admin" && has(q, "contract", "agreement", "minutes", "document", "doc ", "feedback", "licence", "license", "ubo", "guideline", "brand", "says", "say about")) {
    const docAns = answerFromDocs(q, s);
    if (docAns) return docAns;
  }

  if (ctx === "admin") return admin(q, s);
  if (ctx === "member") return member(q, s);
  if (ctx === "sponsor") return sponsor(q, s);
  return publicSite(q);
}

/* --------------------------------- Admin ---------------------------------- */

function admin(q: string, s: S): LanaAnswer {
  // Unpaid / overdue
  if (has(q, "paid", "pay", "owe", "overdue", "outstanding", "unpaid", "debt", "chase")) {
    const open = s.invoices.filter((i) => i.status === "Due" || i.status === "Overdue").sort((a, b) => +new Date(a.due) - +new Date(b.due));
    const overdue = open.filter((i) => i.status === "Overdue");
    const total = open.reduce((t, i) => t + invoiceTotal(i), 0);
    return {
      text: `${open.length} invoices are unpaid, worth ${aed(total, { decimals: true })} in total. ${overdue.length} ${overdue.length === 1 ? "is" : "are"} overdue: ${overdue.map((i) => i.billTo).join(" and ") || "none"}.`,
      blocks: [
        {
          kind: "table",
          columns: ["Customer", "Invoice", "Due", "Status", "Amount"],
          align: ["left", "left", "left", "left", "right"],
          rows: open.map((i) => [i.billTo, i.number, `${fmtDate(i.due)} (${relLabel(i.due).toLowerCase()})`, i.status, aed(invoiceTotal(i), { decimals: true })]),
        },
        { kind: "actions", items: [{ label: "Send reminders to overdue", toast: `Reminders sent by email and WhatsApp to ${overdue.length} customers` }, { label: "Open billing", href: "/admin/billing" }] },
      ],
      sources: ["Billing (Zoho Books)", "RAKBANKpay"],
      follow: ["Whose membership renews in the next 30 days?", "How much did we collect this quarter?"],
    };
  }

  // Profitable / revenue by event
  if (has(q, "profit", "revenue", "best event", "top event", "earn", "made the most", "money from event")) {
    const days = windowDays(q, 30);
    let list = pastEvents(days);
    let note = `in the last ${days} days`;
    if (list.length === 0) {
      list = pastEvents(60);
      note = "in the last 60 days (nothing ran in the window you asked about)";
    }
    const ranked = list.map((e) => ({ e, rev: eventRevenue(e), att: e.checkedIn ?? e.registered })).sort((a, b) => b.rev - a.rev);
    const top = ranked[0];
    return {
      text: top
        ? `${top.e.title} was the most profitable event ${note}, bringing in about ${aed(top.rev)} from ${top.att} attendees. Across ${ranked.length} events, ticket revenue was ${aed(ranked.reduce((t, r) => t + r.rev, 0))}.`
        : "No paid events have taken place yet.",
      blocks: [
        { kind: "bars", items: ranked.map((r) => ({ label: r.e.title, value: r.rev, display: aed(r.rev) })) },
        {
          kind: "table",
          columns: ["Event", "Date", "Attended", "Revenue / head"],
          align: ["left", "left", "right", "right"],
          rows: ranked.map((r) => [r.e.title, fmtDate(r.e.start), `${r.att}/${r.e.capacity}`, aed(r.att ? Math.round(r.rev / r.att) : 0)]),
        },
      ],
      sources: ["Events", "Ticket sales", "Check-in"],
      follow: ["What events happened last month?", "Which upcoming events are nearly full?"],
    };
  }

  // Events in a period
  if (has(q, "event", "happened", "ran", "held") && !has(q, "upcoming", "next", "coming", "full")) {
    const days = windowDays(q, 30);
    const list = pastEvents(days);
    const att = list.reduce((t, e) => t + (e.checkedIn ?? 0), 0);
    return {
      text: `${list.length} events took place in the last ${days} days, with ${att} people checked in overall.`,
      blocks: [
        {
          kind: "table",
          columns: ["Event", "Date", "Venue", "Checked in", "Show rate"],
          align: ["left", "left", "left", "right", "right"],
          rows: list.map((e) => [e.title, fmtDate(e.start), e.venue, `${e.checkedIn ?? 0}`, `${Math.round(((e.checkedIn ?? 0) / e.registered) * 100)}%`]),
        },
      ],
      sources: ["Events", "Check-in"],
      follow: ["Most profitable events in the last 3 weeks", "Summarise feedback from the soft launch"],
    };
  }

  // Upcoming / nearly full
  if (has(q, "upcoming", "next event", "coming up", "nearly full", "sold out", "full")) {
    const list = upcomingEvents().map((e) => ({ e, reg: e.registered + (s.extraRegistrations[e.id] ?? 0) }));
    const tight = list.filter((x) => x.reg / x.e.capacity >= 0.8);
    return {
      text: `${list.length} events are coming up. ${tight.length} are over 80% full: ${tight.map((x) => x.e.title).join(", ") || "none yet"}.`,
      blocks: [{ kind: "bars", items: list.map((x) => ({ label: x.e.title, value: x.reg / x.e.capacity, display: `${x.reg}/${x.e.capacity}` })) }],
      sources: ["Events", "Bookings"],
      follow: ["Which members haven’t paid?", "How is the sponsorship pipeline looking?"],
    };
  }

  // Renewals
  if (has(q, "renew", "expir", "lapse")) {
    const days = windowDays(q, 30);
    const list = s.companies.filter((c) => c.renews && daysFromNow(c.renews) >= 0 && daysFromNow(c.renews) <= days);
    const lapsed = s.companies.filter((c) => c.status === "Lapsed");
    return {
      text: `${list.length} ${list.length === 1 ? "membership renews" : "memberships renew"} in the next ${days} days, worth ${aed(list.reduce((t, c) => t + (tierById(c.tier)?.price ?? 0), 0))}. ${lapsed.length} lapsed ${lapsed.length === 1 ? "member" : "members"} could be won back.`,
      blocks: [
        { kind: "table", columns: ["Company", "Tier", "Renews", "Owner"], rows: [...list, ...lapsed].map((c) => [c.name, tierById(c.tier)?.name ?? "—", c.status === "Lapsed" ? "Lapsed" : fmtDate(c.renews!), c.owner]) },
        { kind: "actions", items: [{ label: "Send renewal reminders", toast: "Renewal reminders scheduled for 30, 14 and 3 days before" }] },
      ],
      sources: ["CRM", "Membership"],
      follow: ["Which members haven’t paid?", "How many members do we have?"],
    };
  }

  // Sponsors
  if (has(q, "sponsor", "partner", "pipeline")) {
    const active = s.sponsors.filter((x) => x.stage === "Active" || x.stage === "Signed");
    const pipe = s.sponsors.filter((x) => x.stage === "Proposal" || x.stage === "Renewal talks");
    return {
      text: `${active.length} partners are active or signed, worth ${aed(active.reduce((t, x) => t + x.amount, 0))}. Another ${aed(pipe.reduce((t, x) => t + x.amount, 0))} is in negotiation across ${pipe.length} conversations. Meridian Bank RAK has ${BENEFITS.filter((b) => b.sponsorId === "s1" && b.delivered < b.total).length} of ${BENEFITS.filter((b) => b.sponsorId === "s1").length} benefits still in progress, including a private roundtable.`,
      blocks: [
        { kind: "stats", items: [{ label: "Booked", value: aed(active.reduce((t, x) => t + x.amount, 0)) }, { label: "Pipeline", value: aed(pipe.reduce((t, x) => t + x.amount, 0)) }, { label: "Partners", value: String(active.length) }] },
        { kind: "table", columns: ["Partner", "Level", "Stage", "Value"], align: ["left", "left", "left", "right"], rows: [...active, ...pipe].map((x) => [x.name, x.level, x.stage, aed(x.amount)]) },
      ],
      sources: ["Sponsors & partners", "Contracts"],
      follow: ["What does the Meridian contract say about renewal?", "Most profitable events in the last 3 weeks"],
    };
  }

  // Compliance
  if (has(q, "kyc", "aml", "compliance", "risk", "sanction", "screen")) {
    const open = s.kyc.filter((k) => k.status !== "Clear");
    return {
      text: `${open.length} compliance cases need attention. ${open.filter((k) => k.risk === "High").map((k) => k.company).join(", ") || "None"} is high risk because of a possible sanctions match on one owner.`,
      blocks: [
        { kind: "table", columns: ["Company", "Risk", "Status", "Next review"], rows: open.map((k) => [k.company, k.risk, k.status, fmtDate(k.nextReview)]) },
        { kind: "actions", items: [{ label: "Open AML & KYC", href: "/admin/compliance" }] },
      ],
      sources: ["AML & KYC", "Screening provider"],
      follow: ["Show new applications this week", "Which members haven’t paid?"],
    };
  }

  // Applications
  if (has(q, "application", "applied", "new member", "joining", "pipeline of members", "prospect")) {
    const list = s.applications.filter((a) => a.stage !== "Paid");
    return {
      text: `${list.length} applications are in progress. ${list.filter((a) => a.source === "Website").length} came in through the website.`,
      blocks: [{ kind: "bars", items: APP_STAGES.map((st) => ({ label: st, value: s.applications.filter((a) => a.stage === st).length, display: String(s.applications.filter((a) => a.stage === st).length) })) }],
      sources: ["Applications"],
      follow: ["Any compliance cases I should look at?", "How many members do we have?"],
    };
  }

  // Membership numbers
  if (has(q, "how many member", "members do we have", "member count", "membership mix", "tier")) {
    const m = s.companies.filter((c) => c.tier && c.status !== "Lapsed" && c.status !== "Prospect");
    return {
      text: `There are ${m.length} member companies, ${m.filter((c) => c.founding).length} of them founding members.`,
      blocks: [{ kind: "bars", items: TIERS.map((t) => ({ label: t.name, value: m.filter((c) => c.tier === t.id).length, display: String(m.filter((c) => c.tier === t.id).length) })) }],
      sources: ["CRM"],
      follow: ["Whose membership renews in the next 30 days?", "Show new applications this week"],
    };
  }

  // Revenue overall
  if (has(q, "collect", "income", "quarter", "how much", "cash")) {
    const paid = s.invoices.filter((i) => i.status === "Paid");
    const byKind = ["Membership", "Event", "Sponsorship"].map((k) => ({ k, v: paid.filter((i) => i.kind === k).reduce((t, i) => t + invoiceTotal(i), 0) }));
    return {
      text: `Paid invoices total ${aed(paid.reduce((t, i) => t + invoiceTotal(i), 0))}, mostly from sponsorship.`,
      blocks: [{ kind: "bars", items: byKind.map((b) => ({ label: b.k, value: b.v, display: aed(Math.round(b.v)) })) }],
      sources: ["Billing (Zoho Books)"],
      follow: ["Which members haven’t paid?", "Most profitable events in the last 3 weeks"],
    };
  }

  // Data quality
  if (has(q, "data", "duplicate", "clean", "quality", "missing")) {
    return {
      text: "Six B2B companies are missing a TRN, which will block e-invoicing, and there are four likely duplicate contacts to merge.",
      blocks: [{ kind: "actions", items: [{ label: "Open data hygiene", href: "/admin/data-hygiene" }] }],
      sources: ["Data hygiene"],
      follow: ["Which members haven’t paid?"],
    };
  }

  return fallback("admin");
}

function answerFromDocs(q: string, s: S): LanaAnswer | null {
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !["what", "does", "about", "say", "says", "the", "from", "with", "document", "documents", "summarise", "summarize", "tell"].includes(w));
  const scored = s.documents
    .filter((d) => d.status === "Indexed")
    .map((d) => ({ d, score: words.reduce((t, w) => t + (d.text.includes(w) ? 2 : 0) + (d.name.toLowerCase().includes(w) ? 3 : 0) + (d.owner.name.toLowerCase().includes(w) ? 3 : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  const d = scored[0].d;
  let text = d.summary;
  if (has(q, "renew", "notice")) {
    const f = d.facts.find((x) => /renew|notice/i.test(x.label));
    if (f) text = `${f.label}: ${f.value}. ${d.summary}`;
  }
  return {
    text,
    blocks: [{ kind: "doc", title: d.name, summary: `${d.kind} · ${d.pages} page${d.pages > 1 ? "s" : ""} · uploaded by ${d.uploadedBy}`, facts: d.facts }],
    sources: [d.name],
    follow: ["How is the sponsorship pipeline looking?", "Any compliance cases I should look at?"],
  };
}

/* --------------------------------- Member --------------------------------- */

function member(q: string, s: S): LanaAnswer {
  const mine = s.tickets.map((t) => ({ t, e: eventById(t.eventId)! })).filter((x) => x.e && daysFromNow(x.e.start) >= 0).sort((a, b) => +new Date(a.e.start) - +new Date(b.e.start));
  if (has(q, "owe", "pay", "invoice", "bill", "balance")) {
    const due = s.invoices.filter((i) => i.companyId === ME_MEMBER.companyId && i.status !== "Paid");
    return {
      text: due.length ? `You have ${due.length} unpaid invoice${due.length > 1 ? "s" : ""}: ${due.map((i) => `${i.number} for ${aed(invoiceTotal(i), { decimals: true })}, due ${fmtDate(i.due)}`).join("; ")}.` : "You’re all paid up — nothing outstanding.",
      blocks: due.length ? [{ kind: "actions", items: [{ label: `Pay ${aed(invoiceTotal(due[0]), { decimals: true })} now`, href: `/pay/${due[0].id}` }] }] : [],
      sources: ["Your invoices"],
      follow: ["When is my next event?"],
    };
  }
  if (has(q, "include", "benefit", "membership", "renew", "seat")) {
    const t = TIERS[1];
    return {
      text: `You’re a Founding Business member. Your membership includes ${t.benefits.join(", ").toLowerCase()}. It renews automatically next September.`,
      blocks: [{ kind: "actions", items: [{ label: "View membership", href: "/member/membership" }] }],
      sources: ["Your membership"],
      follow: ["Do I owe anything?"],
    };
  }
  if (has(q, "this month", "what's on", "whats on", "events", "coming")) {
    const list = upcomingEvents().filter((e) => daysFromNow(e.start) <= 31);
    return {
      text: `${list.length} events are coming up in the next month.`,
      blocks: [{ kind: "table", columns: ["Event", "When", "Member price"], rows: list.map((e) => [e.title, `${fmtDate(e.start, "weekday")} ${fmtTime(e.start)}`, e.memberPrice ? aed(e.memberPrice) : "Free"]) }],
      sources: ["Events"],
      follow: ["When is my next event?"],
    };
  }
  if (mine[0]) {
    const e = mine[0].e;
    return {
      text: `Your next event is ${e.title}, ${relLabel(e.start).toLowerCase()} — ${fmtDate(e.start, "weekday")} at ${fmtTime(e.start)}, ${e.venue}. You have ${mine[0].t.qty} place${mine[0].t.qty > 1 ? "s" : ""}.`,
      blocks: [{ kind: "actions", items: [{ label: "Show my ticket", href: "/member/tickets" }] }],
      sources: ["Your bookings"],
      follow: ["What’s on this month?", "Do I owe anything?"],
    };
  }
  return fallback("member");
}

/* --------------------------------- Sponsor -------------------------------- */

function sponsor(q: string, s: S): LanaAnswer {
  const sp = sponsorById(ME_SPONSOR.sponsorId)!;
  const benefits = BENEFITS.filter((b) => b.sponsorId === sp.id);
  if (has(q, "benefit", "deliver", "remaining", "left")) {
    const open = benefits.filter((b) => b.delivered < b.total);
    return {
      text: `${open.length} of ${benefits.length} benefits are still being delivered. Next up: ${open.filter((b) => b.due).sort((a, b) => +new Date(a.due!) - +new Date(b.due!))[0]?.label.toLowerCase() ?? "—"}.`,
      blocks: [{ kind: "bars", items: open.map((b) => ({ label: b.label, value: b.delivered / b.total, display: `${b.delivered}/${b.total}` })) }],
      sources: ["Your partnership"],
      follow: ["How did our events perform?"],
    };
  }
  if (has(q, "contract", "end", "expire", "renew")) {
    return {
      text: `Your ${sp.level} partnership runs until ${fmtDate(sp.end)} — ${daysFromNow(sp.end)} days from now. The agreement asks for 60 days’ notice to renew.`,
      blocks: [],
      sources: ["Platinum sponsorship agreement"],
      follow: ["Which benefits are still to be delivered?"],
    };
  }
  if (has(q, "perform", "attend", "result", "lead", "how did")) {
    const evs = EVENTS.filter((e) => e.sponsorId === sp.id && daysFromNow(e.start) < 0);
    return {
      text: `Your sponsored events reached ${evs.reduce((t, e) => t + (e.checkedIn ?? 0), 0)} attendees, with a ${Math.round((evs.reduce((t, e) => t + (e.checkedIn ?? 0), 0) / Math.max(1, evs.reduce((t, e) => t + e.registered, 0))) * 100)}% show rate and 46 opted-in leads.`,
      blocks: [{ kind: "bars", items: evs.map((e) => ({ label: e.title, value: e.checkedIn ?? 0, display: `${e.checkedIn} attended` })) }],
      sources: ["Sponsored events", "Check-in"],
      follow: ["Which benefits are still to be delivered?"],
    };
  }
  const next = upcomingEvents().find((e) => e.sponsorId === sp.id);
  if (next)
    return {
      text: `Your next sponsored event is ${next.title} on ${fmtDate(next.start, "weekday")} — ${next.registered} people have registered so far.`,
      blocks: [],
      sources: ["Sponsored events"],
      follow: ["How did our events perform?"],
    };
  return fallback("sponsor");
}

/* --------------------------------- Public --------------------------------- */

function publicSite(q: string): LanaAnswer {
  if (has(q, "price", "cost", "how much", "fee", "membership")) {
    return {
      text: `Membership is ${TIERS.map((t) => `${aed(t.price)} for ${t.name}`).join(", ")} a year (plus VAT). Join before the launch evening and you keep founding status for life.`,
      blocks: [{ kind: "actions", items: [{ label: "Compare memberships", href: "/membership" }, { label: "Apply now", href: "/join" }] }],
      sources: ["Membership"],
      follow: ["How do I join?", "What events are coming up?"],
    };
  }
  if (has(q, "join", "apply", "sign up", "register")) {
    return {
      text: "It takes about two minutes: choose a tier, tell us about your business, book a short intro call, and we’ll send your invoice after standard company checks.",
      blocks: [{ kind: "actions", items: [{ label: "Start my application", href: "/join" }] }],
      sources: ["Membership"],
      follow: ["How much is membership?"],
    };
  }
  if (has(q, "partner", "sponsor", "advertis", "brand")) {
    return {
      text: "Annual partnerships start from AED 35,000 (Silver), with Gold and Platinum packages and single-event options. Every partner gets a portal to track benefits and results.",
      blocks: [{ kind: "actions", items: [{ label: "See partnerships", href: "/sponsorship" }, { label: "Enquire", href: "/partner" }] }],
      sources: ["Partnerships"],
      follow: ["What events are coming up?"],
    };
  }
  if (has(q, "where", "address", "located", "office", "contact", "phone", "email")) {
    return {
      text: "The Chamber is based at the RAK Business Centre in Al Nakheel, Ras Al Khaimah. You can reach the team at hello@britishchamberrak.net.",
      blocks: [{ kind: "actions", items: [{ label: "Contact us", href: "/contact" }] }],
      sources: ["Contact"],
      follow: ["How do I join?"],
    };
  }
  if (has(q, "event", "coming", "what's on", "whats on", "breakfast", "next")) {
    const list = upcomingEvents().slice(0, 4);
    return {
      text: `Next up is ${list[0].title} on ${fmtDate(list[0].start, "weekday")}. Here’s what’s coming:`,
      blocks: [
        { kind: "table", columns: ["Event", "When", "Where"], rows: list.map((e: ChamberEvent) => [e.title, fmtDate(e.start, "weekday"), e.area]) },
        { kind: "actions", items: [{ label: "All events", href: "/events" }] },
      ],
      sources: ["Events"],
      follow: ["How much is membership?"],
    };
  }
  if (has(q, "rak", "ras al khaimah", "move", "set up", "free zone", "mainland", "tax", "e-invoic")) {
    return {
      text: "Our Insights cover setting up (free zone or mainland), moving to Ras Al Khaimah and the UAE’s new e-invoicing rules, which apply to smaller businesses from 1 July 2027.",
      blocks: [{ kind: "actions", items: [{ label: "Read Insights", href: "/insights" }] }],
      sources: ["Insights"],
      follow: ["How do I join?"],
    };
  }
  return fallback("public");
}

function fallback(ctx: LanaContext): LanaAnswer {
  return {
    text: "I can’t answer that from the Chamber’s data yet. Try one of these:",
    blocks: [],
    sources: [],
    follow: SUGGEST[ctx].slice(0, 4),
  };
}
