import { rel } from "./utils";

export type DocStatus = "Uploading" | "Reading" | "Extracting" | "Indexed";
export type DocKind = "Contract" | "Trade licence" | "KYC" | "Brand" | "Minutes" | "Report" | "Spreadsheet" | "Other";

export type KnowledgeDoc = {
  id: string;
  name: string;
  kind: DocKind;
  owner: { type: "member" | "sponsor" | "chamber"; id?: string; name: string };
  size: string;
  pages: number;
  uploaded: string;
  uploadedBy: string;
  status: DocStatus;
  progress: number;
  summary: string;
  facts: { label: string; value: string }[];
  text: string; // searchable text Lana uses to answer questions
};

export const SEED_DOCS: KnowledgeDoc[] = [
  {
    id: "doc1",
    name: "Meridian Bank RAK — Platinum sponsorship agreement.pdf",
    kind: "Contract",
    owner: { type: "sponsor", id: "s1", name: "Meridian Bank RAK" },
    size: "1.2 MB",
    pages: 9,
    uploaded: rel(-95, 11, 0),
    uploadedBy: "Omar Al Shehhi",
    status: "Indexed",
    progress: 100,
    summary: "12-month Platinum partnership worth AED 150,000, paid in two instalments, with headline branding, three speaking slots and 40 tickets.",
    facts: [
      { label: "Value", value: "AED 150,000 + VAT" },
      { label: "Term", value: "12 months from signature" },
      { label: "Payment", value: "2 instalments of AED 75,000" },
      { label: "Speaking slots", value: "3" },
      { label: "Complimentary tickets", value: "40" },
      { label: "Notice to renew", value: "60 days before expiry" },
    ],
    text: "platinum partnership agreement meridian bank value aed 150,000 two instalments 75,000 headline branding flagship events stage backdrop lanyards printed programme three speaking slots keynote panel 40 complimentary tickets weekly update features monthly private roundtable twelve senior members quarterly insights report renewal notice 60 days before expiry exclusivity banking sector",
  },
  {
    id: "doc2",
    name: "Thames & Hajar Engineering — trade licence.pdf",
    kind: "Trade licence",
    owner: { type: "member", id: "c1", name: "Thames & Hajar Engineering" },
    size: "380 KB",
    pages: 2,
    uploaded: rel(-64, 10, 20),
    uploadedBy: "Sarah Whitfield",
    status: "Indexed",
    progress: 100,
    summary: "RAK DED licence for engineering consultancy, valid for another 9 months. Two partners listed.",
    facts: [
      { label: "Licence no.", value: "RAK-DED 48213" },
      { label: "Activity", value: "Engineering consultancy" },
      { label: "Expires", value: "In 9 months" },
      { label: "Partners", value: "Sarah Whitfield, Khalid Al Hajar" },
    ],
    text: "trade licence thames hajar engineering rak ded 48213 engineering consultancy partners sarah whitfield khalid al hajar expiry",
  },
  {
    id: "doc3",
    name: "Atlas Freight Forwarding — UBO declaration.pdf",
    kind: "KYC",
    owner: { type: "member", name: "Atlas Freight Forwarding" },
    size: "640 KB",
    pages: 4,
    uploaded: rel(-8, 15, 0),
    uploadedBy: "Yusuf Al Mansoori",
    status: "Indexed",
    progress: 100,
    summary: "Declares two beneficial owners (60% / 40%). One owner’s name is a possible match on a consolidated sanctions list — flagged for review.",
    facts: [
      { label: "Owners", value: "2 (60% / 40%)" },
      { label: "Screening", value: "1 possible match" },
      { label: "Risk", value: "High — escalated" },
    ],
    text: "ultimate beneficial owner declaration atlas freight forwarding yusuf al mansoori 60 percent viktor petrenko 40 percent sanctions screening possible match escalated high risk",
  },
  {
    id: "doc4",
    name: "Board meeting minutes — October.docx",
    kind: "Minutes",
    owner: { type: "chamber", name: "BCC RAK" },
    size: "96 KB",
    pages: 5,
    uploaded: rel(-30, 18, 0),
    uploadedBy: "Brooke Grant",
    status: "Indexed",
    progress: 100,
    summary: "Board approved the launch evening budget, agreed founding status closes at launch, and asked for an e-invoicing provider decision by January.",
    facts: [
      { label: "Decisions", value: "3" },
      { label: "Launch budget", value: "AED 85,000 approved" },
      { label: "Action", value: "Choose e-invoicing provider by January" },
    ],
    text: "board minutes october launch evening budget aed 85,000 approved founding status closes at launch e-invoicing provider decision by january zoho books recommended membership target 25 companies",
  },
  {
    id: "doc5",
    name: "Launch evening — guest feedback.csv",
    kind: "Spreadsheet",
    owner: { type: "chamber", name: "BCC RAK" },
    size: "42 KB",
    pages: 1,
    uploaded: rel(-17, 9, 0),
    uploadedBy: "Priya Nair",
    status: "Indexed",
    progress: 100,
    summary: "77 responses from the soft-launch drinks. Average rating 4.6/5; most-requested topics: e-invoicing, hiring and visas, and a sector breakfast for hospitality.",
    facts: [
      { label: "Responses", value: "77" },
      { label: "Average rating", value: "4.6 / 5" },
      { label: "Top request", value: "E-invoicing briefing" },
    ],
    text: "feedback survey soft launch drinks 77 responses average rating 4.6 requested topics e-invoicing hiring visas hospitality sector breakfast venue praised parking",
  },
  {
    id: "doc6",
    name: "Ras Coast Hotels — brand guidelines.pdf",
    kind: "Brand",
    owner: { type: "sponsor", id: "s2", name: "Ras Coast Hotels & Resorts" },
    size: "4.8 MB",
    pages: 24,
    uploaded: rel(-55, 13, 0),
    uploadedBy: "Noura Al Qasimi",
    status: "Indexed",
    progress: 100,
    summary: "Logo usage, colours and clear-space rules for event branding. White logo on dark backgrounds only.",
    facts: [
      { label: "Primary colour", value: "Deep teal" },
      { label: "Logo on dark", value: "White version only" },
      { label: "Clear space", value: "Height of the ‘R’" },
    ],
    text: "brand guidelines ras coast hotels logo usage white logo dark backgrounds clear space colours deep teal sand typography event branding",
  },
];

/** The steps Lana runs on each new document, shown in the ingestion pipeline. */
export const PIPELINE: { status: DocStatus; label: string }[] = [
  { status: "Uploading", label: "Upload" },
  { status: "Reading", label: "Read & OCR" },
  { status: "Extracting", label: "Extract facts" },
  { status: "Indexed", label: "Ready for questions" },
];

export function guessKind(name: string): DocKind {
  const n = name.toLowerCase();
  if (/licen[cs]e/.test(n)) return "Trade licence";
  if (/(contract|agreement|sponsor)/.test(n)) return "Contract";
  if (/(passport|emirates id|ubo|kyc|owner)/.test(n)) return "KYC";
  if (/(brand|logo|guideline)/.test(n)) return "Brand";
  if (/minute/.test(n)) return "Minutes";
  if (/\.(csv|xlsx?)$/.test(n)) return "Spreadsheet";
  if (/(report|deck)/.test(n)) return "Report";
  return "Other";
}

export function factsFor(kind: DocKind, owner: string): { summary: string; facts: { label: string; value: string }[] } {
  switch (kind) {
    case "Trade licence":
      return { summary: `Trade licence for ${owner}. Licence number, activity, partners and expiry extracted and matched to the CRM record.`, facts: [{ label: "Licence no.", value: "Detected" }, { label: "Expiry", value: "In 11 months" }, { label: "CRM", value: "Record updated" }] };
    case "Contract":
      return { summary: `Agreement with ${owner}. Value, term, payment schedule and deliverables extracted into the partnership record.`, facts: [{ label: "Value", value: "Detected" }, { label: "Term", value: "12 months" }, { label: "Deliverables", value: "Added to benefits tracker" }] };
    case "KYC":
      return { summary: `Identity and ownership document for ${owner}. Names sent for sanctions and PEP screening.`, facts: [{ label: "People found", value: "2" }, { label: "Screening", value: "Clear" }] };
    case "Spreadsheet":
      return { summary: `Tabular data from ${owner}. Columns detected and rows made searchable.`, facts: [{ label: "Rows", value: "Detected" }, { label: "Columns", value: "Mapped" }] };
    default:
      return { summary: `Document from ${owner}, summarised and made searchable.`, facts: [{ label: "Pages", value: "Read" }, { label: "Language", value: "English" }] };
  }
}
