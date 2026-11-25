import type { PhotoKey } from "./photos";

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  photo: PhotoKey;
  art: "dusk" | "dawn" | "sea" | "stone" | "ember";
  minutes: number;
  author: string;
  body: { h?: string; p: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "introducing-bcc-rak",
    title: "Introducing the British Chamber of Commerce Ras Al Khaimah",
    category: "The Chamber",
    excerpt: "Why we’re building a home for British business in the emirate, and how founding members will shape it.",
    photo: "networking",
    art: "dusk",
    minutes: 3,
    author: "Brooke Grant",
    body: [
      { p: "Ras Al Khaimah has a growing British community, but until now no dedicated place for British businesses to meet, share what works and speak with one voice. The Chamber exists to change that." },
      { h: "What we’ll do", p: "We’ll run a regular programme of breakfasts, briefings and evenings; represent members’ interests with the emirate’s authorities; and offer practical help to companies setting up or growing here." },
      { h: "Founding members", p: "Businesses and individuals who join before the launch evening keep founding status for life. Founding members help set the Chamber’s priorities in its first year and are recognised at every flagship event." },
      { h: "Get involved", p: "Register your interest, book a short call with the team, and we’ll take it from there. Partnership opportunities are open for organisations that want visibility with the community from day one." },
    ],
  },
  {
    slug: "free-zone-or-mainland",
    title: "Free zone or mainland? A first look for UK businesses",
    category: "Setting up",
    excerpt: "The questions to ask before choosing how to license your business in Ras Al Khaimah.",
    photo: "roundtable",
    art: "stone",
    minutes: 4,
    author: "Kensington Legal (member)",
    body: [
      { p: "Most UK companies arriving in Ras Al Khaimah face the same first decision: a mainland licence, a free zone company, or an international business company. Each suits different plans." },
      { h: "Where will your customers be?", p: "If you’ll trade widely with customers inside the UAE, a mainland licence is usually the simplest route. Free zone companies suit businesses focused on international trade, services delivered from the UAE, or holding structures." },
      { h: "Ownership, visas and premises", p: "Rules on ownership, office space and the number of visas you can apply for differ between structures and change over time. Check the current position with the licensing authority before committing." },
      { h: "Tax and e-invoicing", p: "Corporate tax, VAT and the UAE’s new e-invoicing system apply across structures. Smaller businesses (under AED 50 million revenue) must appoint an accredited e-invoicing provider by 31 March 2027 and go live on 1 July 2027." },
      { p: "This article is general information, not legal or tax advice. Members can bring their questions to our practical briefings." },
    ],
  },
  {
    slug: "moving-to-ras-al-khaimah",
    title: "Moving to Ras Al Khaimah: what newcomers ask first",
    category: "Living here",
    excerpt: "Schools, housing, getting around and the weekend — the questions we hear most from British families.",
    photo: "dunes",
    art: "ember",
    minutes: 3,
    author: "BCC RAK team",
    body: [
      { p: "Ras Al Khaimah offers a slower pace than its neighbours, with beaches, desert and mountains within easy reach. Here are the questions newcomers ask us most often." },
      { h: "Where do people live?", p: "Waterfront communities such as Al Hamra and Mina Al Arab are popular with British families, alongside villas in and around the city. Visit a few areas before you sign a lease." },
      { h: "Getting around", p: "Most residents drive. Dubai International is under an hour away by car from the southern communities, and Ras Al Khaimah has its own international airport." },
      { h: "Weekends", p: "The UAE weekend is Saturday and Sunday. Many members head up Jebel Jais — the UAE’s highest peak — or out to the desert and the beach clubs along the coast." },
    ],
  },
];

export const articleBySlug = (slug?: string) => ARTICLES.find((a) => a.slug === slug);

export const MEMBERSHIP_FAQ = [
  { q: "Who can join?", a: "British-owned and British-linked businesses operating in or entering Ras Al Khaimah, and British professionals living in the emirate. Other businesses that work closely with the UK are welcome too." },
  { q: "What does founding status mean?", a: "Members who join before the launch evening keep founding status for life. It’s recognised on your membership card and at Chamber events, and founding members help shape our first-year priorities." },
  { q: "How do I pay?", a: "By card, Apple Pay or Google Pay through our secure checkout, by payment link, or by bank transfer. Business members receive a UAE tax invoice and, from 2027, an e-invoice." },
  { q: "Can colleagues use our membership?", a: "Yes. Business memberships include 3 named seats and Corporate memberships include 10. Each person gets their own login to the member portal." },
  { q: "What happens after I apply?", a: "We’ll book a short call, run standard checks on your company (trade licence and ownership), then send your invoice. Most applications are approved within a week." },
];

export const SPONSOR_LEVELS = [
  {
    level: "Platinum",
    price: 150000,
    blurb: "Headline partner across the Chamber’s year.",
    benefits: ["Headline branding at flagship events", "Three speaking slots", "40 complimentary tickets", "Monthly Weekly Update feature", "Private roundtable with senior members", "Quarterly member insights report"],
  },
  {
    level: "Gold",
    price: 75000,
    blurb: "Own a series of events and stay front of mind.",
    benefits: ["Title partner of an event series", "Two speaking slots", "24 complimentary tickets", "Weekly Update features", "Logo on website and member portal"],
  },
  {
    level: "Silver",
    price: 35000,
    blurb: "Visibility with the community at a focused budget.",
    benefits: ["Partner of one flagship event", "12 complimentary tickets", "Two Weekly Update features", "Logo on website"],
  },
] as const;
