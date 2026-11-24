# BCC RAK Hub — demo

A clickable demo of the full platform for the British Chamber of Commerce Ras Al Khaimah: the public website,
online sign-up for members and partners, the member and sponsor portals, and the staff console.

In production the public pages are planned on WordPress + Elementor (GoDaddy) and the portals run alongside at
`portal.britishchamberrak.net`. In this demo the public pages are built in the same app so the whole journey —
visitor → application → staff approval → paying member — can be shown end to end.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Requires Node 20+.

### Or with Docker

```bash
docker compose up --build
# open http://localhost:3000
```

This builds a small production image (Next.js standalone output on Node 22 Alpine). Stop it with `docker compose down`.

For live reload while editing the code inside Docker:

```bash
docker compose --profile dev up dev
# open http://localhost:3001
```

Plain `docker` also works: `docker build -t bcc-rak-hub . && docker run -p 3000:3000 bcc-rak-hub`.
 All data is mock data kept in the browser; use **Reset demo data** (portal switcher, top left) to start over.

## What's inside

| Area | Routes |
| --- | --- |
| Public website | `/`, `/about`, `/membership`, `/sponsorship`, `/events`, `/events/[id]`, `/insights`, `/insights/[slug]`, `/contact`, `/privacy` |
| Sign-up | `/join` (member application, 5 steps with intro-call booking) · `/partner` (sponsorship enquiry) |
| Sign-in / role picker | `/login` |
| Member portal | `/member`, `/member/events`, `/member/events/[id]`, `/member/tickets`, `/member/membership`, `/member/messages`, `/member/billing`, `/member/settings` |
| Checkout (simulated) | `/pay/[invoiceId]` — Apple Pay, Google Pay, card with 3-D Secure, or Aani pay-by-bank. Test card `4242…` succeeds, `4000…` is declined. In production this is RAKBANKpay. |
| Sponsor portal | `/sponsor`, `/sponsor/events`, `/sponsor/benefits`, `/sponsor/messages`, `/sponsor/documents` |
| BCC RAK console | `/admin` (dashboard), `/admin/calendar`, `/admin/crm`, `/admin/crm/[id]`, `/admin/applications`, `/admin/sponsors`, `/admin/events`, `/admin/events/new`, `/admin/events/[id]`, `/admin/events/[id]/check-in`, `/admin/billing`, `/admin/communications`, `/admin/data-hygiene`, `/admin/compliance`, `/admin/integrations`, `/admin/settings` |

Press **⌘K / Ctrl+K** anywhere for the command bar.

## Suggested demo path (about 12 minutes)

0. Start on the **public website** (`/`) → Membership → **Apply now** → complete the application → click "See it in the BCC RAK console". The application is waiting in the pipeline; drag it to **Paid** and it appears in Members & contacts.
1. Sign in as **Member** → home → open *British business breakfast* → **Book and pay** → pay with card → 3-D Secure → ticket + e-invoice status.
2. **My tickets** → Wallet / calendar buttons. **Membership** → hover the card.
3. Switch to **Sponsor** → validity ring, benefits, sponsored-event results, message the relationship manager.
4. Switch to **BCC RAK team** → dashboard → Applications (drag a card) → AML & KYC (clear Atlas Freight) → Events → Check-in mode → Data hygiene (merge duplicates) → Integrations.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Zustand · Lucide icons.
Brand tokens come from the BCC RAK Design System v1.0 (navy `#14213A`, red `#B8322A`, copper `#B5713E`, paper `#F8F6F1`;
Newsreader, Hanken Grotesk, IBM Plex Mono).

| Folder | Contents |
| --- | --- |
| `app/` | Routes for each portal |
| `components/` | UI kit (`ui.tsx`), shell & navigation, charts, calendar, invoice sheet, member widgets |
| `lib/data.ts` | All mock data (members, events, sponsors, invoices, KYC cases, integrations) |
| `lib/store.ts` | Demo state: bookings, payments, pipeline moves, check-ins (persisted to localStorage) |

## Not real yet

Payments, Zoho Books, Microsoft 365, Mailchimp, Calendly, WhatsApp, Wallet passes, screening and UAE Pass are
simulated. In production each one becomes an adapter behind the same screens. Membership prices and sponsor levels
are placeholders until the Chamber confirms them.

## Photography

Photos load from the Unsplash and Pexels CDNs (free licences, no attribution required, credited here as a courtesy).
If the browser is offline, every image falls back to built-in brand artwork.

| Photo | Photographer |
| --- | --- |
| Jebel Jais mountain road | Dilip James (Unsplash) |
| Desert dunes at sunset, RAK | Julia Stepanenko (Unsplash) |
| Desert view from Jabal Yanas, RAK | Nazik Malik (Unsplash) |
| Networking evening | M Accelerator (Unsplash) |
| Banquet tables | Adrien Olichon (Unsplash) |
| Candlelit dinner table | Nadia Valko (Unsplash) |
| Meeting over coffee | Vitaly Gariev (Unsplash) |
| Café conversation | Rachael Gorjestani (Unsplash) |
| Speaker, lecture theatre, roundtable | Pexels contributors |

Before launch, replace these with the Chamber's own event photography (`lib/photos.ts`).
