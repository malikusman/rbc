"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  APPLICATIONS,
  INVOICES,
  POSTS,
  SPONSOR_THREAD,
  KYC_CASES,
  INTEGRATIONS,
  COMPANIES,
  SPONSORS,
  eventById,
  ME_MEMBER,
  type AppStage,
  type Application,
  type Company,
  type Sponsor,
  type TierId,
  type Invoice,
  type KycCase,
  type Post,
  type ThreadMessage,
} from "./data";
import { rel, uid } from "./utils";

export type Ticket = {
  id: string;
  eventId: string;
  qty: number;
  holder: string;
  code: string;
  booked: string;
};

type PendingTicket = { eventId: string; qty: number };

export type Toast = { id: string; title: string; body?: string; tone?: "ok" | "info" | "warn" };

export type NewApplication = {
  company: string;
  contact: string;
  email: string;
  tier: TierId;
  sector: string;
  emirate: string;
  note: string;
};

type State = {
  companies: Company[];
  sponsors: (Sponsor & { source?: "Website" | "Admin"; contact?: string; email?: string; note?: string })[];
  invoices: (Invoice & { pending?: PendingTicket })[];
  tickets: Ticket[];
  extraRegistrations: Record<string, number>;
  applications: Application[];
  resolvedDuplicates: string[];
  fixedIssues: string[];
  checkins: string[];
  kyc: KycCase[];
  posts: Post[];
  thread: ThreadMessage[];
  integrationStatus: Record<string, "Connected" | "Attention" | "Available">;
  autoRenew: boolean;
  toasts: Toast[];

  addApplication: (a: NewApplication) => string;
  addCompany: (c: Partial<Company> & { name: string; tier?: TierId }) => string;
  addSponsor: (s: { name: string; level: Sponsor["level"]; amount: number; sector: string; rm?: string; contact?: string; email?: string; note?: string; source: "Website" | "Admin" }) => string;
  bookEvent: (eventId: string, qty: number) => { invoiceId?: string; ticketId?: string };
  payInvoice: (invoiceId: string, method: string) => void;
  settleEInvoice: (invoiceId: string) => void;
  moveApplication: (id: string, stage: AppStage) => void;
  resolveDuplicate: (id: string) => void;
  fixIssue: (id: string) => void;
  toggleCheckin: (id: string) => void;
  setKycStatus: (id: string, status: KycCase["status"]) => void;
  addPost: (p: Omit<Post, "id" | "time" | "reactions" | "replies">) => void;
  sendThread: (body: string, from: string) => void;
  connectIntegration: (id: string) => void;
  setAutoRenew: (v: boolean) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  reset: () => void;
};

const initialTickets: Ticket[] = [
  { id: "t-e1", eventId: "e1", qty: 2, holder: ME_MEMBER.name, code: "BCC-E1-7Q4K", booked: rel(-12) },
  { id: "t-e3", eventId: "e3", qty: 1, holder: ME_MEMBER.name, code: "BCC-E3-2M8D", booked: rel(-5) },
  { id: "t-e8", eventId: "e8", qty: 1, holder: ME_MEMBER.name, code: "BCC-E8-9H1A", booked: rel(-30) },
  { id: "t-e9", eventId: "e9", qty: 2, holder: ME_MEMBER.name, code: "BCC-E9-4T6P", booked: rel(-40) },
];

const initial = () => ({
  companies: COMPANIES.map((c) => ({ ...c })),
  sponsors: SPONSORS.map((x) => ({ ...x })) as State["sponsors"],
  invoices: INVOICES.map((i) => ({ ...i })),
  tickets: initialTickets,
  extraRegistrations: {} as Record<string, number>,
  applications: APPLICATIONS.map((a) => ({ ...a })),
  resolvedDuplicates: [] as string[],
  fixedIssues: [] as string[],
  checkins: ["a2", "a5", "a6"],
  kyc: KYC_CASES.map((k) => ({ ...k })),
  posts: POSTS.map((p) => ({ ...p })),
  thread: SPONSOR_THREAD.map((t) => ({ ...t })),
  integrationStatus: Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.status])),
  autoRenew: true,
  toasts: [] as Toast[],
});

const code = (eventId: string) =>
  `BCC-${eventId.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),

      addApplication: (a) => {
        const id = uid("ap");
        set((s) => ({
          applications: [
            { id, company: a.company, contact: a.contact, tier: a.tier, founding: true, stage: "Interest", received: new Date().toISOString(), note: a.note || `Applied on the website · ${a.sector}, ${a.emirate}`, source: "Website", email: a.email, sector: a.sector, emirate: a.emirate },
            ...s.applications,
          ],
        }));
        return id;
      },

      addCompany: (c) => {
        const id = uid("c");
        const co: Company = {
          id,
          name: c.name,
          sector: c.sector ?? "Other",
          emirate: c.emirate ?? "RAK Mainland",
          licence: c.licence ?? "Pending",
          trn: c.trn,
          tier: c.tier,
          founding: c.founding ?? true,
          status: c.status ?? "Active",
          since: new Date().toISOString(),
          renews: rel(365),
          contacts: c.contacts ?? 1,
          quality: c.quality ?? (c.trn ? 82 : 64),
          owner: c.owner ?? "Priya Nair",
        };
        set((s) => ({ companies: [co, ...s.companies] }));
        return id;
      },

      addSponsor: (x) => {
        const id = uid("s");
        set((s) => ({
          sponsors: [
            { id, name: x.name, level: x.level, amount: x.amount, sector: x.sector, start: rel(30), end: rel(395), rm: x.rm ?? "Omar Al Shehhi", stage: "Proposal", source: x.source, contact: x.contact, email: x.email, note: x.note },
            ...s.sponsors,
          ],
        }));
        return id;
      },

      bookEvent: (eventId, qty) => {
        const ev = eventById(eventId);
        if (!ev) return {};
        const memberSeat = ev.memberPrice;
        const guests = Math.max(0, qty - 1);
        const amount = memberSeat + guests * ev.guestPrice;
        if (amount === 0) {
          const t: Ticket = { id: uid("t"), eventId, qty, holder: ME_MEMBER.name, code: code(eventId), booked: new Date().toISOString() };
          set((s) => ({
            tickets: [t, ...s.tickets],
            extraRegistrations: { ...s.extraRegistrations, [eventId]: (s.extraRegistrations[eventId] ?? 0) + qty },
          }));
          return { ticketId: t.id };
        }
        const n = 224 + get().invoices.length;
        const lines = [{ label: `${ev.title} — member ticket`, qty: 1, unit: memberSeat }];
        if (guests) lines.push({ label: `${ev.title} — guest ticket`, qty: guests, unit: ev.guestPrice });
        const inv: Invoice & { pending?: PendingTicket } = {
          id: uid("inv"),
          number: `BCC-2026-0${n}`,
          billTo: "Thames & Hajar Engineering",
          companyId: "c1",
          b2b: true,
          issued: new Date().toISOString(),
          due: rel(14),
          lines: lines.filter((l) => l.unit > 0 || l.qty > 0),
          status: "Due",
          einvoice: "Queued",
          kind: "Event",
          pending: { eventId, qty },
        };
        set((s) => ({ invoices: [inv, ...s.invoices] }));
        return { invoiceId: inv.id };
      },

      payInvoice: (invoiceId, method) => {
        const inv = get().invoices.find((i) => i.id === invoiceId);
        if (!inv) return;
        const pending = inv.pending;
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.id === invoiceId
              ? { ...i, status: "Paid", method, pending: undefined, einvoice: i.b2b ? "Sent via Peppol" : "Not required" }
              : i,
          ),
          tickets: pending
            ? [
                { id: uid("t"), eventId: pending.eventId, qty: pending.qty, holder: ME_MEMBER.name, code: code(pending.eventId), booked: new Date().toISOString() },
                ...s.tickets,
              ]
            : s.tickets,
          extraRegistrations: pending
            ? { ...s.extraRegistrations, [pending.eventId]: (s.extraRegistrations[pending.eventId] ?? 0) + pending.qty }
            : s.extraRegistrations,
        }));
      },

      settleEInvoice: (invoiceId) =>
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === invoiceId && i.einvoice === "Sent via Peppol" ? { ...i, einvoice: "Accepted" } : i)),
        })),

      moveApplication: (id, stage) => {
        const app = get().applications.find((a) => a.id === id);
        set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, stage } : a)) }));
        // A paid application becomes a member company in the CRM.
        if (app && stage === "Paid" && !get().companies.some((c) => c.name === app.company)) {
          get().addCompany({ name: app.company, tier: app.tier, founding: app.founding, sector: app.sector, emirate: app.emirate, owner: "Priya Nair" });
        }
      },

      resolveDuplicate: (id) => set((s) => ({ resolvedDuplicates: [...s.resolvedDuplicates, id] })),
      fixIssue: (id) => set((s) => ({ fixedIssues: [...s.fixedIssues, id] })),

      toggleCheckin: (id) =>
        set((s) => ({ checkins: s.checkins.includes(id) ? s.checkins.filter((c) => c !== id) : [...s.checkins, id] })),

      setKycStatus: (id, status) =>
        set((s) => ({
          kyc: s.kyc.map((k) =>
            k.id === id
              ? {
                  ...k,
                  status,
                  risk: status === "Clear" ? "Low" : k.risk,
                  checks: status === "Clear" ? k.checks.map((c) => ({ ...c, result: "pass" as const })) : k.checks,
                }
              : k,
          ),
        })),

      addPost: (p) =>
        set((s) => ({ posts: [{ ...p, id: uid("po"), time: new Date().toISOString(), reactions: 0, replies: 0 }, ...s.posts] })),

      sendThread: (body, from) =>
        set((s) => ({ thread: [...s.thread, { id: uid("m"), from, me: true, time: new Date().toISOString(), body }] })),

      connectIntegration: (id) => set((s) => ({ integrationStatus: { ...s.integrationStatus, [id]: "Connected" } })),
      setAutoRenew: (v) => set({ autoRenew: v }),

      toast: (t) => {
        const id = uid("toast");
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismiss(id), 4200);
      },
      dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      reset: () => set({ ...initial() }),
    }),
    {
      name: "bcc-rak-demo",
      version: 3,
      // When the demo data changes shape, start from fresh seed data instead of a stale copy.
      migrate: () => initial() as unknown as State,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { toasts, ...rest } = s;
        return rest;
      },
    },
  ),
);

export function useRegistered(eventId: string, base: number) {
  return useStore((s) => base + (s.extraRegistrations[eventId] ?? 0));
}
