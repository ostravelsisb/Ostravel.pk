// ============================================================================
// BLOG CONTENT — OS Travels & Tours
// Each post: slug, category, title, excerpt, image, author, date, readTime,
// tags (used as SEO keywords), content blocks (h2/p/list), and optional faqs
// (rendered + emitted as FAQPage JSON-LD on the post page).
// Add a new post by pushing another object here — BlogIndex, category
// filters, and the sitemap generator script all read from this file.
// ============================================================================

export const blogCategories = [
  "All",
  "Visa Guides",
  "Umrah & Hajj",
  "Travel Tips",
  "File Processing",
];

export const blogPosts = [
  {
    slug: "malaysia-visa-guide-from-pakistan",
    category: "Visa Guides",
    title: "Malaysia Visa from Pakistan: Complete 2026 Guide",
    excerpt:
      "Everything Pakistani travelers need to know about the Malaysia eVisa — required documents, bank balance proof, fees, processing time and how to apply through an authorized agent.",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1400&auto=format&fit=crop",
    author: "OS Travels & Tours Desk",
    date: "2026-05-12",
    readTime: "7 min read",
    tags: [
      "Malaysia visa from Pakistan",
      "Malaysia eVisa Pakistan",
      "Malaysia visa requirements",
      "Malaysia visa fee Pakistan",
      "Malaysia visa agent Islamabad",
    ],
    content: [
      { type: "p", text: "Pakistani citizens can travel to Malaysia on an eVisa, a single-entry electronic visa that's processed entirely online and typically approved within a few working days. This guide walks through the requirements, common rejection reasons, and how to avoid delays." },
      { type: "h2", text: "Documents you'll need" },
      { type: "list", items: [
        "Passport valid for at least 6 months from travel date",
        "Recent passport-size photograph on white background",
        "Confirmed return flight ticket",
        "Hotel booking confirmation for the full stay",
        "Bank statement showing sufficient funds for the trip",
      ]},
      { type: "h2", text: "Processing time and fees" },
      { type: "p", text: "Standard eVisa processing takes 3-5 working days once documents are submitted correctly. Fees vary by visa validity and are charged in addition to the embassy's own eVisa fee — ask your agent for the current breakdown before applying." },
      { type: "h2", text: "Common reasons for rejection" },
      { type: "list", items: [
        "Bank statement balance too low or inconsistent with declared trip length",
        "Blurry or non-compliant photograph",
        "Passport with less than 6 months validity",
        "Mismatched names between passport and supporting documents",
      ]},
      { type: "p", text: "Working with an experienced visa consultant reduces rejection risk significantly, since documents get reviewed before submission rather than after a rejection notice arrives." },
    ],
    faqs: [
      { q: "How long does a Malaysia eVisa take to process?", a: "Typically 3-5 working days once your documents are submitted correctly." },
      { q: "Can Pakistani citizens extend a Malaysia tourist visa?", a: "Short extensions are sometimes possible through Malaysian Immigration, but approval isn't guaranteed and depends on your entry conditions." },
    ],
  },
  {
    slug: "umrah-packages-2026-what-to-know",
    category: "Umrah & Hajj",
    title: "Umrah Packages 2026: What's Included and How to Choose",
    excerpt:
      "A breakdown of what economy, standard and VIP Umrah packages typically include — flights, hotel distance from Haram, transport and visa — so you can compare offers properly.",
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1400&auto=format&fit=crop",
    author: "OS Travels & Tours Desk",
    date: "2026-04-28",
    readTime: "6 min read",
    tags: [
      "Umrah packages 2026",
      "Umrah packages from Islamabad",
      "cheap Umrah packages Pakistan",
      "VIP Umrah package",
      "Makkah Madinah hotels near Haram",
    ],
    content: [
      { type: "p", text: "Umrah package prices vary widely — and most of that difference comes down to three things: hotel distance from the Haram, flight routing, and group size. Understanding these lets you compare quotes fairly instead of just looking at the bottom-line price." },
      { type: "h2", text: "What changes between economy, standard and VIP packages" },
      { type: "list", items: [
        "Hotel distance: economy packages often place you a 10-15 minute walk or shuttle ride from the Haram, while VIP packages are usually within very close walking distance",
        "Flight routing: direct flights cost more than packages with one or two stopovers",
        "Room sharing: economy usually means quad-sharing rooms, VIP typically double or single occupancy",
        "Ziyarat tours: standard and VIP packages usually include guided Ziyarat (historical site) tours in Makkah and Madinah",
      ]},
      { type: "h2", text: "Questions to ask before booking" },
      { type: "list", items: [
        "Is the visa fee included in the quoted price?",
        "Is transport between Makkah and Madinah included, and by what class of vehicle?",
        "How many nights in each city, and can that be adjusted?",
        "What's the cancellation and rebooking policy?",
      ]},
      { type: "p", text: "Booking a few months ahead of Ramadan or the winter peak season generally gets better rates and hotel availability than booking last-minute." },
    ],
    faqs: [
      { q: "What's included in a standard Umrah package?", a: "Typically visa processing, return flights, hotel accommodation in Makkah and Madinah, and transport between the two cities." },
      { q: "How far in advance should I book an Umrah package?", a: "For Ramadan or peak season travel, 2-3 months ahead is recommended for better hotel rates and availability." },
    ],
  },
  {
    slug: "schengen-visa-file-processing-explained",
    category: "File Processing",
    title: "Schengen Visa File Processing: How It Works",
    excerpt:
      "What 'file processing' actually means for a Schengen visa application, what documents are checked before submission, and why it reduces rejection risk.",
    image:
      "https://images.unsplash.com/photo-1499591934245-40b55745b905?q=80&w=1400&auto=format&fit=crop",
    author: "OS Travels & Tours Desk",
    date: "2026-04-10",
    readTime: "6 min read",
    tags: [
      "Schengen visa file processing",
      "Schengen visa Pakistan",
      "Schengen visa documents checklist",
      "Schengen visa consultant Islamabad",
    ],
    content: [
      { type: "p", text: "'File processing' refers to the service of reviewing, organizing, and preparing your visa application documents before they're submitted to the embassy or visa application center. It doesn't replace the embassy's own decision — it reduces the chance of rejection due to avoidable paperwork errors." },
      { type: "h2", text: "What gets checked during file processing" },
      { type: "list", items: [
        "Cover letter and travel itinerary consistency",
        "Bank statement formatting and balance adequacy",
        "Hotel and flight booking confirmations",
        "Employment or business documents (NOC, tax returns, registration)",
        "Travel insurance coverage meeting the minimum required amount",
      ]},
      { type: "h2", text: "Why documentation quality matters" },
      { type: "p", text: "Schengen visa officers typically spend only a few minutes per file. Documents that are clearly organized, consistent, and complete are far less likely to raise questions than a disorganized submission — even when both applicants have similar financial profiles." },
    ],
    faqs: [
      { q: "Does file processing guarantee visa approval?", a: "No service can guarantee approval — the embassy makes the final decision. File processing reduces rejection risk from paperwork issues, not from other eligibility factors." },
      { q: "How long does Schengen visa processing take from Pakistan?", a: "Standard processing is usually 15 calendar days from the appointment date, though it can take longer during peak season." },
    ],
  },
  {
    slug: "turkey-visa-for-pakistani-citizens",
    category: "Visa Guides",
    title: "Turkey Visa for Pakistani Citizens: eVisa vs Sticker Visa",
    excerpt:
      "Understanding when Pakistani citizens qualify for Turkey's eVisa versus when a sticker visa from the embassy is required, plus documents and typical timelines.",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1400&auto=format&fit=crop",
    author: "OS Travels & Tours Desk",
    date: "2026-03-22",
    readTime: "5 min read",
    tags: [
      "Turkey visa Pakistan",
      "Turkey e-visa Pakistan",
      "Turkey sticker visa",
      "Turkey visa requirements Pakistani citizens",
    ],
    content: [
      { type: "p", text: "Turkey's eVisa system covers many nationalities, but Pakistani passport holders generally require a sticker visa processed through the Turkish embassy or an authorized visa center rather than the online eVisa — the exact requirement can change, so it's worth confirming current rules before booking flights." },
      { type: "h2", text: "Typical requirements for the sticker visa" },
      { type: "list", items: [
        "Passport valid 6+ months beyond the travel date",
        "Confirmed round-trip flight reservation",
        "Hotel booking for the full duration of stay",
        "Bank statement covering the trip",
        "Travel insurance valid for the Schengen/Turkey region",
      ]},
      { type: "h2", text: "Processing timeline" },
      { type: "p", text: "Sticker visa processing for Pakistani applicants generally takes longer than eVisa-eligible nationalities — plan several weeks ahead rather than booking close to your travel date." },
    ],
    faqs: [
      { q: "Can Pakistani citizens use Turkey's online eVisa?", a: "Requirements change periodically — most Pakistani applicants currently need the sticker visa process rather than the online eVisa. Confirm current rules before applying." },
    ],
  },
  {
    slug: "international-travel-packing-checklist",
    category: "Travel Tips",
    title: "International Travel Packing Checklist for First-Time Flyers",
    excerpt:
      "A practical packing and documentation checklist for anyone flying internationally for the first time — from carry-on rules to what to keep in hand luggage.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
    author: "OS Travels & Tours Desk",
    date: "2026-03-02",
    readTime: "5 min read",
    tags: [
      "international travel checklist",
      "first time flying tips",
      "carry-on packing list",
      "travel documents checklist Pakistan",
    ],
    content: [
      { type: "p", text: "First international trip nerves are normal — most of them come down to not knowing what to prepare in advance. This checklist covers the essentials so nothing gets left behind." },
      { type: "h2", text: "Documents to carry (not check in)" },
      { type: "list", items: [
        "Passport with visa, plus a photocopy stored separately",
        "Printed and digital copies of flight and hotel bookings",
        "Travel insurance policy document",
        "Emergency contact list and embassy/consulate address at destination",
      ]},
      { type: "h2", text: "Packing basics" },
      { type: "list", items: [
        "Check baggage allowance for your specific airline and fare class before packing",
        "Keep valuables, medication and one change of clothes in carry-on",
        "Confirm liquid restrictions for carry-on (usually 100ml containers, sealed bag)",
        "Pack a universal adapter if traveling outside Pakistan's plug standard",
      ]},
    ],
    faqs: [],
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null;
}

export function getRelatedPosts(currentSlug, category, limit = 3) {
  return blogPosts
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}
