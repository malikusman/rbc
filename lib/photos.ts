/**
 * Photography used across the demo. Images are served from the Unsplash and Pexels CDNs
 * (free licences — see README for credits). If an image can't load (e.g. offline), the
 * component falls back to the illustrated brand artwork underneath.
 */
export type PhotoKey =
  | "jebelJais"
  | "dunes"
  | "desert"
  | "networking"
  | "banquet"
  | "dinner"
  | "coffeeMeeting"
  | "presenter"
  | "auditorium"
  | "roundtable"
  | "cafe";

type Photo = { src: (w: number) => string; alt: string; credit: string; source: "Unsplash" | "Pexels" };

const unsplash = (id: string) => (w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const pexels = (path: string) => (w: number) => `https://images.pexels.com/photos/${path}?auto=compress&cs=tinysrgb&w=${w}`;

export const PHOTOS: Record<PhotoKey, Photo> = {
  jebelJais: { src: unsplash("photo-1680425982087-9f6f25861db1"), alt: "The mountain road up Jebel Jais, Ras Al Khaimah", credit: "Dilip James", source: "Unsplash" },
  dunes: { src: unsplash("photo-1736843879148-6c93485d36b2"), alt: "Sunset over desert dunes in Ras Al Khaimah", credit: "Julia Stepanenko", source: "Unsplash" },
  desert: { src: unsplash("photo-1706620418380-8d07bcd2be02"), alt: "View over the desert plain from Jabal Yanas, Ras Al Khaimah", credit: "Nazik Malik", source: "Unsplash" },
  networking: { src: unsplash("photo-1675716921224-e087a0cca69a"), alt: "People talking at a networking evening", credit: "M Accelerator", source: "Unsplash" },
  banquet: { src: unsplash("photo-1762765685348-4bced247d12c"), alt: "Long tables set for an evening event under a glass roof", credit: "Adrien Olichon", source: "Unsplash" },
  dinner: { src: unsplash("photo-1562050147-fda1cc9a6378"), alt: "Candles and flowers on a dinner table", credit: "Nadia Valko", source: "Unsplash" },
  coffeeMeeting: { src: unsplash("photo-1758519288417-d359ac3c494d"), alt: "Two business people meeting over coffee", credit: "Vitaly Gariev", source: "Unsplash" },
  cafe: { src: unsplash("photo-1497048764944-20ecb62895e1"), alt: "Conversation over coffee in a sunlit café", credit: "Rachael Gorjestani", source: "Unsplash" },
  presenter: { src: pexels("1708912/pexels-photo-1708912.jpeg"), alt: "A speaker presenting to an audience", credit: "Pexels contributor", source: "Pexels" },
  auditorium: { src: pexels("1708936/pexels-photo-1708936.jpeg"), alt: "A business briefing in a lecture theatre", credit: "Pexels contributor", source: "Pexels" },
  roundtable: { src: pexels("8853406/pexels-photo-8853406.jpeg"), alt: "A roundtable discussion with notes and coffee", credit: "Pexels contributor", source: "Pexels" },
};
