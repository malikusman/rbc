import { rel } from "./utils";
import type { PhotoKey } from "./photos";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type TierId = "individual" | "business" | "corporate";
export type SponsorLevel = "Platinum" | "Gold" | "Silver" | "Partner";
export type EventType = "Networking" | "Briefing" | "Social" | "Leadership" | "Trade";

export type Tier = {
  id: TierId;
  name: string;
  price: number;
  seats: number;
  blurb: string;
  benefits: string[];
};

export type Company = {
  id: string;
  name: string;
  sector: string;
  emirate: string;
  licence: string;
  trn?: string;
  tier?: TierId;
  founding?: boolean;
  status: "Active" | "Renewal due" | "Lapsed" | "Prospect" | "Sponsor";
  since: string;
  renews?: string;
  contacts: number;
  quality: number; // data quality score 0-100
  owner: string;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  companyId: string;
  email: string;
  phone: string;
  tags: string[];
  lastSeen: string;
};

export type ChamberEvent = {
  id: string;
  title: string;
  type: EventType;
  start: string;
  end: string;
  venue: string;
  area: string;
  summary: string;
  description: string;
  memberPrice: number;
  guestPrice: number;
  capacity: number;
  registered: number;
  checkedIn?: number;
  sponsorId?: string;
  hybrid?: boolean;
  art: "dusk" | "dawn" | "sea" | "stone" | "ember";
  photo?: PhotoKey;
  speakers?: { name: string; role: string }[];
  agenda?: { time: string; item: string }[];
};

export type Sponsor = {
  id: string;
  name: string;
  level: SponsorLevel;
  amount: number;
  start: string;
  end: string;
  rm: string;
  sector: string;
  stage: "Active" | "Renewal talks" | "Proposal" | "Signed";
};

export type Benefit = {
  id: string;
  sponsorId: string;
  label: string;
  detail: string;
  total: number;
  delivered: number;
  due?: string;
};

export type InvoiceStatus = "Paid" | "Due" | "Overdue" | "Draft" | "Refunded";
export type EInvoiceStatus = "Accepted" | "Sent via Peppol" | "Queued" | "Rejected" | "Not required";

export type InvoiceLine = { label: string; qty: number; unit: number };

export type Invoice = {
  id: string;
  number: string;
  billTo: string;
  companyId?: string;
  b2b: boolean;
  issued: string;
  due: string;
  lines: InvoiceLine[];
  status: InvoiceStatus;
  einvoice: EInvoiceStatus;
  method?: string;
  kind: "Membership" | "Event" | "Sponsorship";
};

export type AppStage = "Interest" | "Intro call" | "KYC" | "Approved" | "Paid";

export type Application = {
  id: string;
  company: string;
  contact: string;
  tier: TierId;
  founding: boolean;
  stage: AppStage;
  received: string;
  note: string;
  risk?: "Low" | "Medium" | "High";
  source?: "Website";
  email?: string;
  sector?: string;
  emirate?: string;
};

export type KycCase = {
  id: string;
  company: string;
  contact: string;
  opened: string;
  risk: "Low" | "Medium" | "High";
  status: "Clear" | "In review" | "Escalated" | "Awaiting documents";
  checks: { label: string; result: "pass" | "review" | "pending" | "fail"; note: string }[];
  owners: { name: string; share: number; nationality: string }[];
  nextReview: string;
};

export type Duplicate = {
  id: string;
  kind: "Person" | "Company";
  a: { name: string; detail: string; source: string };
  b: { name: string; detail: string; source: string };
  confidence: number;
  reason: string;
};

export type Post = {
  id: string;
  author: string;
  role: string;
  time: string;
  title: string;
  body: string;
  pinned?: boolean;
  topic: "Announcement" | "Events" | "Policy" | "Community";
  reactions: number;
  replies: number;
};

export type ThreadMessage = { id: string; from: string; me: boolean; time: string; body: string };

export type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "Connected" | "Attention" | "Available";
  lastSync?: string;
  detail?: string;
  mark: string; // two-letter monogram
  hue: string;
};

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export const ORG = {
  name: "British Chamber of Commerce Ras Al Khaimah",
  short: "BCC RAK",
  domain: "britishchamberrak.net",
  trn: "100 4829 1736 00003",
  address: "Level 12, RAK Business Centre, Al Nakheel, Ras Al Khaimah, UAE",
};

export const TIERS: Tier[] = [
  {
    id: "individual",
    name: "Individual",
    price: 1500,
    seats: 1,
    blurb: "For British professionals and entrepreneurs living in or moving to RAK.",
    benefits: ["Member pricing at every event", "Weekly Update and member insights", "Member directory listing", "Founding status if you join before launch"],
  },
  {
    id: "business",
    name: "Business",
    price: 5000,
    seats: 3,
    blurb: "For SMEs with a presence in Ras Al Khaimah or planning one.",
    benefits: ["3 named member seats", "Company profile in the directory", "Two complimentary event tickets a quarter", "Introductions to RAK authorities"],
  },
  {
    id: "corporate",
    name: "Corporate",
    price: 12500,
    seats: 10,
    blurb: "For larger organisations who want visibility and a voice in the Chamber.",
    benefits: ["10 named member seats", "Priority speaking opportunities", "Policy roundtable invitations", "Dedicated relationship manager"],
  },
];

export const tierById = (id?: TierId) => TIERS.find((t) => t.id === id);

export const STAFF = {
  admin: { name: "Eleanor Grant", role: "Executive Director", email: "eleanor@britishchamberrak.net" },
  rm: { name: "Omar Al Shehhi", role: "Partnerships Manager", email: "omar@britishchamberrak.net", phone: "+971 7 204 1180" },
  membership: { name: "Priya Nair", role: "Membership Manager" },
  finance: { name: "Daniel Hughes", role: "Finance Lead" },
};

export const ME_MEMBER = {
  name: "Sarah Whitfield",
  role: "Managing Director",
  companyId: "c1",
  email: "sarah@thameshajar.ae",
  phone: "+971 50 412 7781",
  memberNo: "BCC-F-0007",
};

export const ME_SPONSOR = {
  name: "James Okafor",
  role: "Head of Marketing",
  sponsorId: "s1",
  email: "james.okafor@meridianbank.ae",
};

/* ------------------------------------------------------------------ */
/* Companies & people                                                  */
/* ------------------------------------------------------------------ */

export const COMPANIES: Company[] = [
  { id: "c1", name: "Thames & Hajar Engineering", sector: "Engineering", emirate: "RAK Mainland", licence: "RAK-DED 48213", trn: "100 2213 8841 00003", tier: "business", founding: true, status: "Active", since: rel(-64), renews: rel(301), contacts: 3, quality: 96, owner: "Priya Nair" },
  { id: "c2", name: "Albion Logistics RAK", sector: "Logistics", emirate: "RAKEZ", licence: "RAKEZ 0412976", trn: "100 9934 1120 00003", tier: "corporate", founding: true, status: "Active", since: rel(-88), renews: rel(277), contacts: 7, quality: 91, owner: "Priya Nair" },
  { id: "c3", name: "Marlow Hospitality Group", sector: "Hospitality", emirate: "RAK Mainland", licence: "RAK-DED 39102", trn: "100 4410 2287 00003", tier: "corporate", founding: true, status: "Active", since: rel(-81), renews: rel(284), contacts: 9, quality: 88, owner: "Eleanor Grant" },
  { id: "c4", name: "Kensington Legal Middle East", sector: "Legal", emirate: "RAK ICC", licence: "ICC 77120", trn: "100 6672 0091 00003", tier: "business", founding: true, status: "Active", since: rel(-70), renews: rel(295), contacts: 3, quality: 94, owner: "Priya Nair" },
  { id: "c5", name: "Northcote Advisory", sector: "Consulting", emirate: "RAKEZ", licence: "RAKEZ 0419934", trn: "100 1187 4420 00003", tier: "business", status: "Renewal due", since: rel(-340), renews: rel(18), contacts: 2, quality: 72, owner: "Priya Nair" },
  { id: "c6", name: "Pennine Education Partners", sector: "Education", emirate: "RAK Mainland", licence: "RAK-DED 51877", tier: "business", status: "Active", since: rel(-41), renews: rel(324), contacts: 3, quality: 83, owner: "Priya Nair" },
  { id: "c7", name: "Brightwater Energy", sector: "Energy", emirate: "RAKEZ", licence: "RAKEZ 0388120", trn: "100 7781 2209 00003", tier: "corporate", founding: true, status: "Sponsor", since: rel(-92), renews: rel(273), contacts: 6, quality: 97, owner: "Omar Al Shehhi" },
  { id: "c8", name: "Saltmarsh Design Studio", sector: "Creative", emirate: "RAK Mainland", licence: "RAK-DED 52201", tier: "individual", status: "Active", since: rel(-22), renews: rel(343), contacts: 1, quality: 64, owner: "Priya Nair" },
  { id: "c9", name: "Fenwick & Rahman Accountants", sector: "Accounting", emirate: "RAK Mainland", licence: "RAK-DED 30118", trn: "100 3329 7710 00003", tier: "business", founding: true, status: "Sponsor", since: rel(-90), renews: rel(275), contacts: 4, quality: 92, owner: "Omar Al Shehhi" },
  { id: "c10", name: "Hawthorn Recruitment", sector: "Recruitment", emirate: "RAKEZ", licence: "RAKEZ 0420051", tier: "business", status: "Renewal due", since: rel(-352), renews: rel(9), contacts: 2, quality: 58, owner: "Priya Nair" },
  { id: "c11", name: "Clyde Marine Services", sector: "Maritime", emirate: "RAK Maritime City", licence: "RAKMC 2210", trn: "100 2290 6618 00003", tier: "corporate", status: "Active", since: rel(-55), renews: rel(310), contacts: 5, quality: 86, owner: "Eleanor Grant" },
  { id: "c12", name: "Ridgeway Insurance Brokers", sector: "Insurance", emirate: "RAK Mainland", licence: "RAK-DED 47710", tier: "business", status: "Lapsed", since: rel(-410), contacts: 2, quality: 49, owner: "Priya Nair" },
  { id: "c13", name: "Meridian Bank RAK", sector: "Banking", emirate: "RAK Mainland", licence: "CBUAE 1182", trn: "100 0042 1187 00003", tier: "corporate", founding: true, status: "Sponsor", since: rel(-95), renews: rel(270), contacts: 8, quality: 99, owner: "Omar Al Shehhi" },
  { id: "c14", name: "Ras Coast Hotels & Resorts", sector: "Hospitality", emirate: "RAK Mainland", licence: "RAK-DED 22019", trn: "100 5512 0098 00003", tier: "corporate", status: "Sponsor", since: rel(-60), renews: rel(305), contacts: 5, quality: 90, owner: "Omar Al Shehhi" },
  { id: "c15", name: "Oakridge Capital", sector: "Finance", emirate: "RAK ICC", licence: "ICC 80422", tier: undefined, status: "Prospect", since: rel(-6), contacts: 1, quality: 61, owner: "Priya Nair" },
  { id: "c16", name: "Harbourside Medical", sector: "Healthcare", emirate: "RAK Mainland", licence: "RAK-DED 53390", tier: "individual", status: "Active", since: rel(-12), renews: rel(353), contacts: 1, quality: 77, owner: "Priya Nair" },
];

export const companyById = (id?: string) => COMPANIES.find((c) => c.id === id);

export const PEOPLE: Person[] = [
  { id: "p1", name: "Sarah Whitfield", role: "Managing Director", companyId: "c1", email: "sarah@thameshajar.ae", phone: "+971 50 412 7781", tags: ["Founding", "Board nominee"], lastSeen: rel(-1) },
  { id: "p2", name: "Khalid Al Hajar", role: "Partner", companyId: "c1", email: "khalid@thameshajar.ae", phone: "+971 50 211 0932", tags: ["Founding"], lastSeen: rel(-6) },
  { id: "p3", name: "Tom Ashworth", role: "Country Manager", companyId: "c2", email: "tom.ashworth@albionlogistics.ae", phone: "+971 55 870 1123", tags: ["Speaker"], lastSeen: rel(-2) },
  { id: "p4", name: "Hannah Marlow", role: "CEO", companyId: "c3", email: "hannah@marlowgroup.com", phone: "+971 52 330 4410", tags: ["Founding", "VIP"], lastSeen: rel(-3) },
  { id: "p5", name: "Rashid Kensington-Obi", role: "Senior Partner", companyId: "c4", email: "rko@kensingtonlegal.ae", phone: "+971 50 778 2210", tags: ["Speaker"], lastSeen: rel(-9) },
  { id: "p6", name: "Fiona Northcote", role: "Founder", companyId: "c5", email: "fiona@northcote.ae", phone: "+971 56 120 7781", tags: ["Renewal"], lastSeen: rel(-31) },
  { id: "p7", name: "Mariam Al Zaabi", role: "Head of Partnerships", companyId: "c6", email: "mariam@pennine-edu.ae", phone: "+971 50 993 4410", tags: [], lastSeen: rel(-4) },
  { id: "p8", name: "Graham Pike", role: "Operations Director", companyId: "c7", email: "g.pike@brightwater.energy", phone: "+971 55 610 2281", tags: ["Sponsor"], lastSeen: rel(-1) },
  { id: "p9", name: "Lucy Saltmarsh", role: "Creative Director", companyId: "c8", email: "lucy@saltmarsh.studio", phone: "+971 58 220 1197", tags: ["New"], lastSeen: rel(-5) },
  { id: "p10", name: "Imran Rahman", role: "Managing Partner", companyId: "c9", email: "imran@fenwickrahman.ae", phone: "+971 50 441 9902", tags: ["Sponsor", "Founding"], lastSeen: rel(-2) },
  { id: "p11", name: "Chloe Hawthorn", role: "Director", companyId: "c10", email: "chloe@hawthornrec.com", phone: "+971 54 778 0031", tags: ["Renewal"], lastSeen: rel(-44) },
  { id: "p12", name: "Angus McLeod", role: "General Manager", companyId: "c11", email: "angus@clydemarine.ae", phone: "+971 50 336 1209", tags: [], lastSeen: rel(-7) },
  { id: "p13", name: "James Okafor", role: "Head of Marketing", companyId: "c13", email: "james.okafor@meridianbank.ae", phone: "+971 50 118 2290", tags: ["Sponsor"], lastSeen: rel(0) },
  { id: "p14", name: "Noura Al Qasimi", role: "Director of Sales", companyId: "c14", email: "noura@rascoasthotels.com", phone: "+971 52 901 4471", tags: ["Sponsor"], lastSeen: rel(-3) },
  { id: "p15", name: "Edward Lyle", role: "Partner", companyId: "c15", email: "edward@oakridgecap.com", phone: "+44 7700 900412", tags: ["Prospect"], lastSeen: rel(-6) },
  { id: "p16", name: "Dr. Aisha Bello", role: "Medical Director", companyId: "c16", email: "aisha@harbourside.ae", phone: "+971 55 402 8817", tags: ["New"], lastSeen: rel(-1) },
];

/* ------------------------------------------------------------------ */
/* Sponsors                                                            */
/* ------------------------------------------------------------------ */

export const SPONSORS: Sponsor[] = [
  { id: "s1", name: "Meridian Bank RAK", level: "Platinum", amount: 150000, start: rel(-95), end: rel(270), rm: "Omar Al Shehhi", sector: "Banking", stage: "Active" },
  { id: "s2", name: "Ras Coast Hotels & Resorts", level: "Gold", amount: 75000, start: rel(-60), end: rel(305), rm: "Omar Al Shehhi", sector: "Hospitality", stage: "Active" },
  { id: "s3", name: "Brightwater Energy", level: "Gold", amount: 75000, start: rel(-92), end: rel(273), rm: "Eleanor Grant", sector: "Energy", stage: "Active" },
  { id: "s4", name: "Fenwick & Rahman Accountants", level: "Silver", amount: 35000, start: rel(-90), end: rel(275), rm: "Omar Al Shehhi", sector: "Accounting", stage: "Active" },
  { id: "s5", name: "Albion Logistics RAK", level: "Silver", amount: 35000, start: rel(-20), end: rel(345), rm: "Omar Al Shehhi", sector: "Logistics", stage: "Signed" },
  { id: "s6", name: "Kensington Legal Middle East", level: "Partner", amount: 20000, start: rel(-70), end: rel(295), rm: "Eleanor Grant", sector: "Legal", stage: "Active" },
  { id: "s7", name: "Oakridge Capital", level: "Gold", amount: 75000, start: rel(30), end: rel(395), rm: "Omar Al Shehhi", sector: "Finance", stage: "Proposal" },
  { id: "s8", name: "Clyde Marine Services", level: "Silver", amount: 35000, start: rel(14), end: rel(379), rm: "Eleanor Grant", sector: "Maritime", stage: "Renewal talks" },
];

export const sponsorById = (id?: string) => SPONSORS.find((s) => s.id === id);

export const LEVEL_STYLE: Record<SponsorLevel, { ring: string; text: string; bg: string }> = {
  Platinum: { ring: "#14213A", text: "text-navy", bg: "bg-stone" },
  Gold: { ring: "#B5713E", text: "text-copper-ink", bg: "bg-copper-soft" },
  Silver: { ring: "#8A92A1", text: "text-muted", bg: "bg-stone" },
  Partner: { ring: "#2B5EA8", text: "text-info", bg: "bg-info-soft" },
};

export const BENEFITS: Benefit[] = [
  { id: "b1", sponsorId: "s1", label: "Headline branding at flagship events", detail: "Logo on stage backdrop, lanyards and printed programme", total: 4, delivered: 2, due: rel(9) },
  { id: "b2", sponsorId: "s1", label: "Speaking slots", detail: "Keynote or panel seat at Chamber events", total: 3, delivered: 1, due: rel(16) },
  { id: "b3", sponsorId: "s1", label: "Complimentary tickets", detail: "Tickets for clients and staff across the year", total: 40, delivered: 17 },
  { id: "b4", sponsorId: "s1", label: "Weekly Update features", detail: "Sponsored feature in the member newsletter", total: 12, delivered: 5, due: rel(4) },
  { id: "b5", sponsorId: "s1", label: "Website & portal logo placement", detail: "Homepage partner strip and member portal", total: 1, delivered: 1 },
  { id: "b6", sponsorId: "s1", label: "Member data insights report", detail: "Quarterly anonymised member-sector report", total: 4, delivered: 1, due: rel(38) },
  { id: "b7", sponsorId: "s1", label: "Private roundtable", detail: "Hosted roundtable with 12 senior members", total: 1, delivered: 0, due: rel(58) },
];

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export const EVENTS: ChamberEvent[] = [
  {
    id: "e1",
    photo: "banquet",
    title: "Founding members’ launch evening",
    type: "Networking",
    start: rel(9, 19, 0),
    end: rel(9, 22, 0),
    venue: "The Harbour Club, Al Hamra",
    area: "Al Hamra Village",
    summary: "The official launch of the Chamber, with the founding board, members and guests of honour.",
    description:
      "Join the founding board, members and guests for the official launch of the British Chamber of Commerce Ras Al Khaimah. An evening on the waterfront with short remarks from the Chamber’s Executive Director and our Platinum partner, followed by canapés and networking.",
    memberPrice: 0,
    guestPrice: 350,
    capacity: 180,
    registered: 142,
    sponsorId: "s1",
    art: "dusk",
    speakers: [
      { name: "Eleanor Grant", role: "Executive Director, BCC RAK" },
      { name: "Hannah Marlow", role: "CEO, Marlow Hospitality Group" },
      { name: "James Okafor", role: "Head of Marketing, Meridian Bank RAK" },
    ],
    agenda: [
      { time: "19:00", item: "Arrivals and welcome drinks" },
      { time: "19:45", item: "Welcome from the founding board" },
      { time: "20:05", item: "Remarks from Meridian Bank RAK" },
      { time: "20:20", item: "Networking and canapés" },
    ],
  },
  {
    id: "e2",
    photo: "coffeeMeeting",
    title: "British business breakfast",
    type: "Networking",
    start: rel(16, 7, 30),
    end: rel(16, 9, 30),
    venue: "Ras Coast Beach Resort — Terrace",
    area: "Al Marjan",
    summary: "An early, informal breakfast to meet British businesses already working in RAK.",
    description:
      "Our monthly breakfast for British-linked businesses in Ras Al Khaimah. Two short member spotlights, a quick briefing on what’s new in the emirate, and plenty of time to meet people over coffee.",
    memberPrice: 95,
    guestPrice: 175,
    capacity: 80,
    registered: 61,
    sponsorId: "s2",
    art: "dawn",
    speakers: [
      { name: "Tom Ashworth", role: "Country Manager, Albion Logistics RAK" },
      { name: "Mariam Al Zaabi", role: "Head of Partnerships, Pennine Education" },
    ],
    agenda: [
      { time: "07:30", item: "Breakfast and coffee" },
      { time: "08:00", item: "Member spotlights" },
      { time: "08:30", item: "What’s new in RAK: a 10-minute briefing" },
      { time: "08:45", item: "Open networking" },
    ],
  },
  {
    id: "e3",
    photo: "presenter",
    title: "Setting up in RAK: a practical briefing",
    type: "Briefing",
    start: rel(23, 10, 0),
    end: rel(23, 12, 0),
    venue: "RAK Business Centre, Level 12",
    area: "Al Nakheel",
    summary: "Free zone or mainland, licensing, banking and visas — a working session for UK firms.",
    description:
      "A practical, no-jargon session for UK companies considering Ras Al Khaimah. Lawyers, accountants and bankers from our membership walk through company structures, licensing, corporate tax, VAT, e-invoicing and opening a bank account. Join in person or online.",
    memberPrice: 0,
    guestPrice: 120,
    capacity: 60,
    registered: 38,
    sponsorId: "s4",
    hybrid: true,
    art: "stone",
    speakers: [
      { name: "Rashid Kensington-Obi", role: "Senior Partner, Kensington Legal" },
      { name: "Imran Rahman", role: "Managing Partner, Fenwick & Rahman" },
    ],
    agenda: [
      { time: "10:00", item: "Free zone vs mainland" },
      { time: "10:40", item: "Tax, VAT and e-invoicing in 2027" },
      { time: "11:20", item: "Banking and visas: Q&A" },
    ],
  },
  {
    id: "e4",
    photo: "jebelJais",
    title: "Members’ morning on the mountain",
    type: "Social",
    start: rel(30, 6, 30),
    end: rel(30, 11, 0),
    venue: "Jebel Jais Summit Lodge",
    area: "Jebel Jais",
    summary: "A sunrise walk at the UAE’s highest peak, followed by breakfast with a view.",
    description:
      "Swap the boardroom for the mountain. A guided sunrise walk on Jebel Jais, followed by a relaxed breakfast at the summit lodge. Transport from Al Hamra is available.",
    memberPrice: 140,
    guestPrice: 220,
    capacity: 40,
    registered: 40,
    art: "ember",
  },
  {
    id: "e5",
    photo: "dinner",
    title: "Women in Leadership lunch",
    type: "Leadership",
    start: rel(37, 12, 30),
    end: rel(37, 14, 30),
    venue: "Marlow House, Mina Al Arab",
    area: "Mina Al Arab",
    summary: "A conversation with women leading businesses across the Northern Emirates.",
    description: "An intimate lunch and fireside conversation with women leading British and Emirati businesses in the Northern Emirates.",
    memberPrice: 180,
    guestPrice: 260,
    capacity: 50,
    registered: 23,
    sponsorId: "s3",
    art: "sea",
  },
  {
    id: "e6",
    photo: "auditorium",
    title: "UK–RAK trade mission briefing",
    type: "Trade",
    start: rel(44, 15, 0),
    end: rel(44, 17, 0),
    venue: "Online — Microsoft Teams",
    area: "Online",
    summary: "What to expect from the spring UK trade delegation and how members can host.",
    description: "A briefing on the spring trade delegation from the UK, the sectors in focus and how members can host visits or meetings.",
    memberPrice: 0,
    guestPrice: 0,
    capacity: 300,
    registered: 87,
    hybrid: true,
    art: "dawn",
  },
  {
    id: "e7",
    photo: "networking",
    title: "Festive networking evening",
    type: "Social",
    start: rel(12, 18, 30),
    end: rel(12, 21, 30),
    venue: "Ras Coast Beach Resort — Sky Bar",
    area: "Al Marjan",
    summary: "A relaxed end-of-year evening for members and their guests.",
    description: "Celebrate the Chamber’s first season with members, sponsors and friends on the rooftop.",
    memberPrice: 150,
    guestPrice: 250,
    capacity: 120,
    registered: 96,
    sponsorId: "s2",
    art: "ember",
  },
  {
    id: "e8",
    photo: "networking",
    title: "Chamber soft-launch drinks",
    type: "Networking",
    start: rel(-18, 19, 0),
    end: rel(-18, 21, 0),
    venue: "The Harbour Club, Al Hamra",
    area: "Al Hamra Village",
    summary: "An early gathering for founding members and supporters.",
    description: "Our first gathering for founding members and supporters.",
    memberPrice: 0,
    guestPrice: 0,
    capacity: 90,
    registered: 84,
    checkedIn: 77,
    sponsorId: "s1",
    art: "dusk",
  },
  {
    id: "e9",
    photo: "roundtable",
    title: "Free zone or mainland? Roundtable",
    type: "Briefing",
    start: rel(-33, 9, 30),
    end: rel(-33, 11, 30),
    venue: "RAK Business Centre, Level 12",
    area: "Al Nakheel",
    summary: "A roundtable on the choice every new business faces.",
    description: "A roundtable on choosing between free zone and mainland set-ups.",
    memberPrice: 0,
    guestPrice: 80,
    capacity: 40,
    registered: 37,
    checkedIn: 33,
    sponsorId: "s1",
    art: "stone",
  },
  {
    id: "e10",
    photo: "dinner",
    title: "Autumn members’ supper",
    type: "Social",
    start: rel(-9, 19, 30),
    end: rel(-9, 22, 30),
    venue: "Marlow House, Mina Al Arab",
    area: "Mina Al Arab",
    summary: "A seated supper for founding members and their partners.",
    description: "A relaxed three-course supper for founding members and their partners, hosted by Marlow Hospitality Group.",
    memberPrice: 295,
    guestPrice: 395,
    capacity: 70,
    registered: 68,
    checkedIn: 64,
    sponsorId: "s2",
    art: "ember",
  },
  {
    id: "e11",
    photo: "auditorium",
    title: "Corporate tax and VAT clinic",
    type: "Briefing",
    start: rel(-16, 9, 0),
    end: rel(-16, 12, 0),
    venue: "RAK Business Centre, Level 12",
    area: "Al Nakheel",
    summary: "One-to-one clinics with member accountants on corporate tax and VAT.",
    description: "Short one-to-one sessions with member accountants covering corporate tax registration, VAT returns and preparing for e-invoicing.",
    memberPrice: 75,
    guestPrice: 150,
    capacity: 48,
    registered: 44,
    checkedIn: 41,
    sponsorId: "s4",
    art: "stone",
  },
  {
    id: "e12",
    photo: "networking",
    title: "Hospitality & tourism roundtable",
    type: "Networking",
    start: rel(-23, 17, 0),
    end: rel(-23, 19, 30),
    venue: "Ras Coast Beach Resort — Terrace",
    area: "Al Marjan",
    summary: "Hotel and tourism leaders on the season ahead in Ras Al Khaimah.",
    description: "An evening roundtable for hotel, tourism and leisure members on staffing, visitor trends and the season ahead.",
    memberPrice: 120,
    guestPrice: 220,
    capacity: 60,
    registered: 52,
    checkedIn: 47,
    sponsorId: "s2",
    art: "dawn",
  },
];

export const eventRevenue = (e: { memberPrice: number; guestPrice: number; registered: number }) =>
  Math.round(e.registered * 0.7 * e.memberPrice + e.registered * 0.3 * e.guestPrice);

export const eventById = (id?: string) => EVENTS.find((e) => e.id === id);

/* Attendees for check-in on the breakfast */
export const ATTENDEES = [
  { id: "a1", name: "Sarah Whitfield", company: "Thames & Hajar Engineering", ticket: "Member", note: "Founding" },
  { id: "a2", name: "Tom Ashworth", company: "Albion Logistics RAK", ticket: "Speaker", note: "" },
  { id: "a3", name: "Hannah Marlow", company: "Marlow Hospitality Group", ticket: "Member", note: "VIP" },
  { id: "a4", name: "James Okafor", company: "Meridian Bank RAK", ticket: "Sponsor", note: "" },
  { id: "a5", name: "Noura Al Qasimi", company: "Ras Coast Hotels & Resorts", ticket: "Sponsor", note: "Host" },
  { id: "a6", name: "Mariam Al Zaabi", company: "Pennine Education Partners", ticket: "Speaker", note: "" },
  { id: "a7", name: "Edward Lyle", company: "Oakridge Capital", ticket: "Guest", note: "Prospect" },
  { id: "a8", name: "Lucy Saltmarsh", company: "Saltmarsh Design Studio", ticket: "Member", note: "" },
  { id: "a9", name: "Angus McLeod", company: "Clyde Marine Services", ticket: "Member", note: "" },
  { id: "a10", name: "Imran Rahman", company: "Fenwick & Rahman Accountants", ticket: "Sponsor", note: "" },
  { id: "a11", name: "Dr. Aisha Bello", company: "Harbourside Medical", ticket: "Member", note: "Dietary: vegetarian" },
  { id: "a12", name: "Graham Pike", company: "Brightwater Energy", ticket: "Member", note: "" },
];

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

export const INVOICES: Invoice[] = [
  { id: "i1", number: "BCC-2026-0142", billTo: "Thames & Hajar Engineering", companyId: "c1", b2b: true, issued: rel(-64), due: rel(-50), lines: [{ label: "Business membership — Founding (12 months)", qty: 1, unit: 5000 }], status: "Paid", einvoice: "Accepted", method: "Apple Pay", kind: "Membership" },
  { id: "i2", number: "BCC-2026-0188", billTo: "Thames & Hajar Engineering", companyId: "c1", b2b: true, issued: rel(-18), due: rel(-4), lines: [{ label: "Soft-launch drinks — guest ticket", qty: 2, unit: 0 }, { label: "Free zone roundtable — guest ticket", qty: 1, unit: 80 }], status: "Paid", einvoice: "Accepted", method: "Visa •• 4417", kind: "Event" },
  { id: "i3", number: "BCC-2026-0214", billTo: "Thames & Hajar Engineering", companyId: "c1", b2b: true, issued: rel(-3), due: rel(11), lines: [{ label: "Festive networking evening — guest tickets", qty: 2, unit: 250 }], status: "Due", einvoice: "Sent via Peppol", kind: "Event" },
  { id: "i4", number: "BCC-2026-0201", billTo: "Meridian Bank RAK", companyId: "c13", b2b: true, issued: rel(-95), due: rel(-65), lines: [{ label: "Platinum sponsorship — instalment 1 of 2", qty: 1, unit: 75000 }], status: "Paid", einvoice: "Accepted", method: "Bank transfer", kind: "Sponsorship" },
  { id: "i5", number: "BCC-2026-0219", billTo: "Meridian Bank RAK", companyId: "c13", b2b: true, issued: rel(-2), due: rel(28), lines: [{ label: "Platinum sponsorship — instalment 2 of 2", qty: 1, unit: 75000 }], status: "Due", einvoice: "Sent via Peppol", kind: "Sponsorship" },
  { id: "i6", number: "BCC-2026-0207", billTo: "Northcote Advisory", companyId: "c5", b2b: true, issued: rel(-40), due: rel(-10), lines: [{ label: "Business membership renewal (12 months)", qty: 1, unit: 5000 }], status: "Overdue", einvoice: "Accepted", kind: "Membership" },
  { id: "i7", number: "BCC-2026-0211", billTo: "Hawthorn Recruitment", companyId: "c10", b2b: true, issued: rel(-36), due: rel(-6), lines: [{ label: "Business membership renewal (12 months)", qty: 1, unit: 5000 }], status: "Overdue", einvoice: "Sent via Peppol", kind: "Membership" },
  { id: "i8", number: "BCC-2026-0216", billTo: "Lucy Saltmarsh", companyId: "c8", b2b: false, issued: rel(-22), due: rel(-8), lines: [{ label: "Individual membership (12 months)", qty: 1, unit: 1500 }], status: "Paid", einvoice: "Not required", method: "Mastercard •• 0921", kind: "Membership" },
  { id: "i9", number: "BCC-2026-0217", billTo: "Ras Coast Hotels & Resorts", companyId: "c14", b2b: true, issued: rel(-60), due: rel(-30), lines: [{ label: "Gold sponsorship (12 months)", qty: 1, unit: 75000 }], status: "Paid", einvoice: "Accepted", method: "Bank transfer", kind: "Sponsorship" },
  { id: "i10", number: "BCC-2026-0218", billTo: "Clyde Marine Services", companyId: "c11", b2b: true, issued: rel(-55), due: rel(-41), lines: [{ label: "Corporate membership (12 months)", qty: 1, unit: 12500 }], status: "Paid", einvoice: "Accepted", method: "Visa •• 7720", kind: "Membership" },
  { id: "i11", number: "BCC-2026-0220", billTo: "Albion Logistics RAK", companyId: "c2", b2b: true, issued: rel(-1), due: rel(29), lines: [{ label: "Silver sponsorship (12 months)", qty: 1, unit: 35000 }], status: "Due", einvoice: "Queued", kind: "Sponsorship" },
  { id: "i12", number: "BCC-2026-0221", billTo: "Dr. Aisha Bello", companyId: "c16", b2b: false, issued: rel(-12), due: rel(2), lines: [{ label: "Individual membership (12 months)", qty: 1, unit: 1500 }], status: "Paid", einvoice: "Not required", method: "Google Pay", kind: "Membership" },
  { id: "i13", number: "BCC-2026-0222", billTo: "Pennine Education Partners", companyId: "c6", b2b: true, issued: rel(-41), due: rel(-27), lines: [{ label: "Business membership (12 months)", qty: 1, unit: 5000 }], status: "Paid", einvoice: "Accepted", method: "Payment link", kind: "Membership" },
  { id: "i14", number: "BCC-2026-0223", billTo: "Brightwater Energy", companyId: "c7", b2b: true, issued: rel(-92), due: rel(-62), lines: [{ label: "Gold sponsorship (12 months)", qty: 1, unit: 75000 }], status: "Paid", einvoice: "Accepted", method: "Bank transfer", kind: "Sponsorship" },
];

export const invoiceSubtotal = (inv: Pick<Invoice, "lines">) => inv.lines.reduce((s, l) => s + l.qty * l.unit, 0);
export const invoiceVat = (inv: Pick<Invoice, "lines">) => Math.round(invoiceSubtotal(inv) * 0.05 * 100) / 100;
export const invoiceTotal = (inv: Pick<Invoice, "lines">) => invoiceSubtotal(inv) + invoiceVat(inv);

/* Monthly collected revenue (AED) — the Chamber's first months */
export const REVENUE = [
  { m: "Jun", membership: 0, events: 0, sponsorship: 0 },
  { m: "Jul", membership: 18500, events: 0, sponsorship: 0 },
  { m: "Aug", membership: 41000, events: 2400, sponsorship: 75000 },
  { m: "Sep", membership: 63500, events: 6100, sponsorship: 110000 },
  { m: "Oct", membership: 52000, events: 9800, sponsorship: 75000 },
  { m: "Nov", membership: 47500, events: 14200, sponsorship: 35000 },
];

/* ------------------------------------------------------------------ */
/* Pipeline, compliance, data quality                                  */
/* ------------------------------------------------------------------ */

export const APP_STAGES: AppStage[] = ["Interest", "Intro call", "KYC", "Approved", "Paid"];

export const APPLICATIONS: Application[] = [
  { id: "ap1", company: "Oakridge Capital", contact: "Edward Lyle", tier: "corporate", founding: true, stage: "Intro call", received: rel(-6), note: "Call booked via Calendly for Thursday 10:00" },
  { id: "ap2", company: "Cotswold Coffee Roasters", contact: "Ben Hartley", tier: "business", founding: true, stage: "Interest", received: rel(-1), note: "Opening a roastery in Al Hamra in Q2" },
  { id: "ap3", company: "Lowther Wealth Partners", contact: "Isobel Lowther", tier: "business", founding: true, stage: "KYC", received: rel(-11), note: "Awaiting UBO declaration", risk: "Medium" },
  { id: "ap4", company: "Yorkstone Construction", contact: "Mohammed Siddiqui", tier: "corporate", founding: false, stage: "Approved", received: rel(-15), note: "Invoice and payment link sent", risk: "Low" },
  { id: "ap5", company: "Peterson Dental Clinic", contact: "Dr. Claire Peterson", tier: "individual", founding: true, stage: "Interest", received: rel(-2), note: "Referred by Harbourside Medical" },
  { id: "ap6", company: "Atlas Freight Forwarding", contact: "Yusuf Al Mansoori", tier: "business", founding: false, stage: "KYC", received: rel(-8), note: "Sanctions screening: possible match", risk: "High" },
  { id: "ap7", company: "Greenwich Tutors", contact: "Olivia Grant", tier: "individual", founding: true, stage: "Paid", received: rel(-19), note: "Welcome pack sent", risk: "Low" },
  { id: "ap8", company: "Severn Analytics", contact: "Daniel Price", tier: "business", founding: true, stage: "Intro call", received: rel(-4), note: "Moving HQ from Bristol" },
  { id: "ap9", company: "Ellery & Shah Architects", contact: "Ravi Shah", tier: "business", founding: true, stage: "Approved", received: rel(-13), note: "Paying by bank transfer", risk: "Low" },
];

export const KYC_CASES: KycCase[] = [
  {
    id: "k1",
    company: "Atlas Freight Forwarding",
    contact: "Yusuf Al Mansoori",
    opened: rel(-8),
    risk: "High",
    status: "Escalated",
    nextReview: rel(2),
    owners: [
      { name: "Yusuf Al Mansoori", share: 60, nationality: "UAE" },
      { name: "Viktor Petrenko", share: 40, nationality: "—" },
    ],
    checks: [
      { label: "Trade licence verified", result: "pass", note: "RAKEZ 0431187, valid to Aug 2027" },
      { label: "Emirates ID / passport", result: "pass", note: "Both directors verified" },
      { label: "Ultimate beneficial owners", result: "pass", note: "2 owners declared, 100% covered" },
      { label: "Sanctions screening", result: "review", note: "Possible name match for one UBO on a consolidated list" },
      { label: "PEP screening", result: "pass", note: "No politically exposed persons found" },
      { label: "Adverse media", result: "pending", note: "Manual review requested" },
    ],
  },
  {
    id: "k2",
    company: "Lowther Wealth Partners",
    contact: "Isobel Lowther",
    opened: rel(-11),
    risk: "Medium",
    status: "Awaiting documents",
    nextReview: rel(5),
    owners: [{ name: "Isobel Lowther", share: 100, nationality: "UK" }],
    checks: [
      { label: "Trade licence verified", result: "pass", note: "RAK ICC 81204" },
      { label: "Emirates ID / passport", result: "pass", note: "Verified" },
      { label: "Ultimate beneficial owners", result: "pending", note: "UBO declaration requested" },
      { label: "Sanctions screening", result: "pass", note: "Clear" },
      { label: "PEP screening", result: "pass", note: "Clear" },
      { label: "Adverse media", result: "pass", note: "Clear" },
    ],
  },
  {
    id: "k3",
    company: "Yorkstone Construction",
    contact: "Mohammed Siddiqui",
    opened: rel(-15),
    risk: "Low",
    status: "Clear",
    nextReview: rel(350),
    owners: [{ name: "Mohammed Siddiqui", share: 100, nationality: "UK" }],
    checks: [
      { label: "Trade licence verified", result: "pass", note: "RAK-DED 54011" },
      { label: "Emirates ID / passport", result: "pass", note: "Verified" },
      { label: "Ultimate beneficial owners", result: "pass", note: "1 owner, 100% covered" },
      { label: "Sanctions screening", result: "pass", note: "Clear" },
      { label: "PEP screening", result: "pass", note: "Clear" },
      { label: "Adverse media", result: "pass", note: "Clear" },
    ],
  },
  {
    id: "k4",
    company: "Ellery & Shah Architects",
    contact: "Ravi Shah",
    opened: rel(-13),
    risk: "Low",
    status: "Clear",
    nextReview: rel(352),
    owners: [
      { name: "Ravi Shah", share: 50, nationality: "UK" },
      { name: "Tessa Ellery", share: 50, nationality: "UK" },
    ],
    checks: [
      { label: "Trade licence verified", result: "pass", note: "RAK-DED 53870" },
      { label: "Emirates ID / passport", result: "pass", note: "Verified" },
      { label: "Ultimate beneficial owners", result: "pass", note: "2 owners, 100% covered" },
      { label: "Sanctions screening", result: "pass", note: "Clear" },
      { label: "PEP screening", result: "pass", note: "Clear" },
      { label: "Adverse media", result: "pass", note: "Clear" },
    ],
  },
];

export const DUPLICATES: Duplicate[] = [
  { id: "d1", kind: "Person", a: { name: "Sarah Whitfield", detail: "sarah@thameshajar.ae · +971 50 412 7781", source: "Member portal" }, b: { name: "S. Whitfield", detail: "swhitfield@gmail.com · +971 50 412 7781", source: "Event registration" }, confidence: 96, reason: "Same phone number, matching surname and company" },
  { id: "d2", kind: "Company", a: { name: "Albion Logistics RAK", detail: "RAKEZ 0412976", source: "CRM" }, b: { name: "Albion Logistics (RAK) FZ-LLC", detail: "RAKEZ 0412976", source: "Zoho Books" }, confidence: 99, reason: "Identical trade licence number" },
  { id: "d3", kind: "Person", a: { name: "Imran Rahman", detail: "imran@fenwickrahman.ae", source: "CRM" }, b: { name: "Imran Rehman", detail: "imran@fenwickrahman.ae", source: "Mailchimp" }, confidence: 92, reason: "Same email, name spelling differs" },
  { id: "d4", kind: "Person", a: { name: "Chloe Hawthorn", detail: "chloe@hawthornrec.com", source: "CRM" }, b: { name: "Chloe Hawthorne", detail: "c.hawthorne@hawthornrec.com", source: "Event registration" }, confidence: 81, reason: "Similar name and same company domain" },
];

export const HYGIENE_ISSUES = [
  { id: "h1", label: "Missing TRN on B2B companies", count: 6, impact: "Blocks e-invoicing", severity: "high" as const },
  { id: "h2", label: "Bounced email addresses", count: 4, impact: "Members miss renewals", severity: "high" as const },
  { id: "h3", label: "Contacts with no company", count: 11, impact: "Weakens reporting", severity: "medium" as const },
  { id: "h4", label: "No activity in 12 months", count: 9, impact: "Candidates to archive", severity: "low" as const },
  { id: "h5", label: "Phone not in +971 format", count: 14, impact: "WhatsApp reminders fail", severity: "medium" as const },
  { id: "h6", label: "Marketing consent not recorded", count: 7, impact: "Can’t include in newsletter", severity: "medium" as const },
];

/* ------------------------------------------------------------------ */
/* Communication                                                       */
/* ------------------------------------------------------------------ */

export const POSTS: Post[] = [
  { id: "po1", author: "Eleanor Grant", role: "Executive Director", time: rel(-1, 9, 12), title: "Launch evening: final details", body: "Thank you to everyone who has registered for the launch evening. Doors open at 19:00 at The Harbour Club. Valet parking is available, and the dress code is business formal. We look forward to seeing you there.", pinned: true, topic: "Announcement", reactions: 48, replies: 12 },
  { id: "po2", author: "Priya Nair", role: "Membership Manager", time: rel(-3, 14, 40), title: "Founding status closes at launch", body: "Applications received before the launch evening keep founding status for life. If you know a business that should be part of the Chamber from day one, now is the time to introduce them.", topic: "Announcement", reactions: 31, replies: 6 },
  { id: "po3", author: "Imran Rahman", role: "Fenwick & Rahman · Silver partner", time: rel(-5, 11, 5), title: "E-invoicing in 2027: what members need to do", body: "From July 2027 most B2B invoices in the UAE will need to go through an accredited provider. We’ve put together a one-page checklist for members — find it in the Insights section, or bring your questions to the practical briefing.", topic: "Policy", reactions: 27, replies: 9 },
  { id: "po4", author: "Tom Ashworth", role: "Albion Logistics RAK", time: rel(-6, 17, 22), title: "Looking for a warehouse partner in Al Ghail", body: "We’re expanding cold-chain capacity in the north of the emirate and would love to speak to any members with space or local contractors to recommend.", topic: "Community", reactions: 9, replies: 4 },
];

export const SPONSOR_THREAD: ThreadMessage[] = [
  { id: "t1", from: "Omar Al Shehhi", me: false, time: rel(-4, 10, 2), body: "Hi James — the stage backdrop proofs for the launch evening are ready. Could your brand team check the logo lock-up by Thursday?" },
  { id: "t2", from: "James Okafor", me: true, time: rel(-4, 11, 30), body: "Thanks Omar, looks great. One change: please use the white version of the logo on the navy panel. Sending the file now." },
  { id: "t3", from: "Omar Al Shehhi", me: false, time: rel(-3, 9, 15), body: "Done, updated proofs are in Documents. Also, 61 people have registered for the breakfast so far — I’ll share the opted-in attendee list the day after." },
  { id: "t4", from: "Omar Al Shehhi", me: false, time: rel(-1, 16, 48), body: "Quick one: would you like your keynote slot at the launch or the Women in Leadership lunch? Either works for us." },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "Launch evening is in 9 days", body: "Your ticket is ready in My tickets.", time: rel(0, 8, 0), unread: true },
  { id: "n2", title: "Invoice BCC-2026-0214 is due", body: "AED 525.00 for festive evening guest tickets.", time: rel(-3, 9, 0), unread: true },
  { id: "n3", title: "New post from Eleanor Grant", body: "Launch evening: final details", time: rel(-1, 9, 12), unread: false },
];

/* ------------------------------------------------------------------ */
/* Integrations                                                        */
/* ------------------------------------------------------------------ */

export const INTEGRATIONS: Integration[] = [
  { id: "rakbank", name: "RAKBANKpay", category: "Payments", description: "RAKBANK’s merchant gateway: cards, Apple Pay and Google Pay online, Pay By Link, and Aani instant bank payments.", status: "Connected", lastSync: rel(0, 9, 41), detail: "3-D Secure on · settles to the Chamber’s RAKBANK account", mark: "RB", hue: "#B8322A" },
  { id: "ngenius", name: "N-Genius by Network", category: "Payments", description: "Backup UAE acquirer for local debit cards.", status: "Available", mark: "NI", hue: "#1F4E8C" },
  { id: "zoho", name: "Zoho Books", category: "Accounting & e-invoicing", description: "Invoices, payments and VAT sync both ways. Zoho is an accredited ASP for Peppol e-invoicing.", status: "Connected", lastSync: rel(0, 9, 38), detail: "142 invoices synced · e-invoicing live (pilot)", mark: "ZB", hue: "#C8201F" },
  { id: "m365", name: "Microsoft 365", category: "Email & calendar", description: "Staff mailboxes, Outlook calendar sync and Teams links for online events.", status: "Connected", lastSync: rel(0, 9, 30), detail: "4 staff calendars · Teams auto-links on", mark: "MS", hue: "#2B5EA8" },
  { id: "gcal", name: "Google Calendar", category: "Calendar", description: "Members add events to Google Calendar, or subscribe to their personal feed.", status: "Connected", lastSync: rel(0, 9, 0), detail: "312 events added by members", mark: "GC", hue: "#2F7A55" },
  { id: "calendly", name: "Calendly", category: "Scheduling", description: "Intro calls during joining, and sponsor meetings with their relationship manager.", status: "Connected", lastSync: rel(-1, 17, 2), detail: "2 event types · 6 calls booked this month", mark: "CY", hue: "#0057D1" },
  { id: "mailchimp", name: "Mailchimp", category: "Newsletter", description: "The Weekly Update. Segments sync from the CRM every hour.", status: "Attention", lastSync: rel(-1, 6, 0), detail: "4 contacts bounced — review in Data hygiene", mark: "MC", hue: "#8C5714" },
  { id: "whatsapp", name: "WhatsApp Business", category: "Messaging", description: "Event reminders and payment links by WhatsApp.", status: "Connected", lastSync: rel(0, 8, 0), detail: "Reminder templates approved", mark: "WA", hue: "#2F7A55" },
  { id: "wallet", name: "Apple & Google Wallet", category: "Passes", description: "Tickets and membership cards saved to the phone.", status: "Connected", detail: "214 passes issued", mark: "WL", hue: "#14213A" },
  { id: "screening", name: "Sanctions & PEP screening", category: "AML / KYC", description: "Screens applicants and owners against sanctions, PEP and adverse-media lists.", status: "Connected", lastSync: rel(0, 7, 0), detail: "Ongoing monitoring on 64 entities", mark: "AML", hue: "#5B6475" },
  { id: "uaepass", name: "UAE Pass", category: "Identity", description: "Sign in and verify identity with the UAE’s national digital ID.", status: "Available", mark: "UP", hue: "#2B3A57" },
  { id: "godaddy", name: "GoDaddy · WordPress site", category: "Website", description: "The public site (WordPress + Elementor) shows live events and links into the portal.", status: "Connected", lastSync: rel(0, 9, 15), detail: "Events widget + member login button", mark: "GD", hue: "#117A7A" },
  { id: "docusign", name: "Zoho Sign", category: "E-signature", description: "Sponsorship contracts and corporate membership terms signed online.", status: "Available", mark: "ZS", hue: "#8C5A2E" },
];

export const CALENDAR_EXTRAS = [
  { id: "x1", title: "Board meeting", start: rel(5, 16, 0), kind: "Internal" as const },
  { id: "x2", title: "Intro call — Oakridge Capital", start: rel(3, 10, 0), kind: "Call" as const },
  { id: "x3", title: "Sponsor check-in — Meridian Bank", start: rel(2, 11, 30), kind: "Call" as const },
  { id: "x4", title: "Weekly Update send", start: rel(1, 9, 0), kind: "Comms" as const },
  { id: "x5", title: "Weekly Update send", start: rel(8, 9, 0), kind: "Comms" as const },
  { id: "x6", title: "Venue walk-through, Harbour Club", start: rel(6, 15, 0), kind: "Internal" as const },
  { id: "x7", title: "Intro call — Severn Analytics", start: rel(4, 14, 0), kind: "Call" as const },
  { id: "x8", title: "Weekly Update send", start: rel(15, 9, 0), kind: "Comms" as const },
];
