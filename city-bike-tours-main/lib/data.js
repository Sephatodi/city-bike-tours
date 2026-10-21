// lib/data.js

// Original SITES data (full format)
export const SITES = [
  {
    id: "parliament",
    key: "parliament", // for compatibility with accordion format
    name: "Parliament Building",
    emoji: "🏛",
    short: "The seat of Botswana's democratic power",
    coords: [-24.6541, 25.9069],
    coordinates: { lat: -24.6541, lng: 25.9069 }, // for accordion format
    history: "Built at independence in 1966, the National Assembly of Botswana stands as a proud symbol of Africa's most stable multiparty democracy. Its clean modernist lines reflect a nation that chose dialogue over conflict — Botswana has never experienced a coup. Guided tours reveal the debating chambers where laws that transformed a cattle-herding nation into one of Africa's fastest-growing economies were born.",
    color: "#1A3A2A",
    imgs: [
      "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383716-6f55494025f8?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383705-c7af6a4eedd0?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "enclave",
    key: "enclave",
    name: "Government Enclave",
    emoji: "🏢",
    short: "The administrative heartbeat of the nation",
    coords: [-24.6528, 25.9089],
    coordinates: { lat: -24.6528, lng: 25.9089 },
    history: "The Government Enclave in Gaborone's city centre is where Botswana's public service machinery operates. Conceived during the post-independence planning era of the late 1960s, its tree-lined avenues and civic buildings tell the story of a deliberate, unhurried nation-building project. Riding through on two wheels gives you an intimate look at how governance and daily life intersect in one of Africa's most transparent administrations.",
    color: "#8B3008",
    imgs: [
      "https://images.unsplash.com/photo-1591005383705-c7af6a4eedd0?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1759130534259-273e015f70f9?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "archives",
    key: "archives",
    name: "Botswana National Archives",
    emoji: "📜",
    short: "The memory of a nation preserved in paper and silence",
    coords: [-24.6573, 25.9124],
    coordinates: { lat: -24.6573, lng: 25.9124 },
    history: "The Botswana National Archives and Records Services is the custodian of the nation's documentary heritage. Its collections stretch from pre-colonial correspondence with British Protectorate officials to the landmark Seretse Khama independence files. Photographs, maps, and oral history transcriptions housed here paint a vivid picture of a people who navigated colonial rule through diplomacy and cultural resilience. A visit is a direct encounter with the documents that shaped modern Botswana.",
    color: "#C1440E",
    imgs: [
      "https://images.unsplash.com/photo-1784253367189-f2d27494f024?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1738145133893-a9c9aa180f8f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "gallery",
    key: "gallery",
    name: "Botswana Post Office Gallery",
    emoji: "🎨",
    short: "Where postal history became a canvas for national identity",
    coords: [-24.6558, 25.9098],
    coordinates: { lat: -24.6558, lng: 25.9098 },
    history: "Housed within a heritage building that once handled the correspondence of a nascent republic, the Botswana Post Office Gallery celebrates the intersection of communication and culture. Its rotating exhibitions of stamps, philatelic art, and contemporary Botswana visual work chronicle the nation's self-expression since 1966. The gallery is a quiet, surprisingly moving space — each stamp an official declaration of what Botswana chose to show the world.",
    color: "#D4A017",
    imgs: [
      "https://images.unsplash.com/photo-1677933182223-87080aa14ed5?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1691755769141-33b3afcb5bfb?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383716-6f55494025f8?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "museum",
    key: "museum",
    name: "National Museum & Art Gallery",
    emoji: "🦁",
    short: "Botswana's story told through artefact and art",
    coords: [-24.6582, 25.9115],
    coordinates: { lat: -24.6582, lng: 25.9115 },
    history: "Established in 1968, the Botswana National Museum and Art Gallery is one of Southern Africa's finest cultural institutions. Permanent exhibitions explore the San Bushmen's ancient relationship with the Kalahari, the cattle culture that underpins Tswana identity, and the colonial encounter that produced a uniquely resilient society. The adjacent art gallery showcases contemporary Botswana artists navigating tradition and modernity — a conversation happening in paint, sculpture, and fibre.",
    color: "#1A3A2A",
    imgs: [
      "https://images.unsplash.com/photo-1759216942476-c8e7f1d09b4f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1784253367189-f2d27494f024?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591005383946-16532ba69aee?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    id: "monument",
    key: "monument",
    name: "Three Chiefs Monument & Poso House",
    emoji: "⚔️",
    short: "Where diplomacy saved a nation — twice",
    coords: [-24.6549, 25.9078],
    coordinates: { lat: -24.6549, lng: 25.9078 },
    history: "The Three Chiefs Monument commemorates the 1895 journey of Khama III, Sebele I, and Bathoen I to London — three Tswana chiefs who lobbied the British government directly and successfully prevented Bechuanaland from being absorbed into Cecil Rhodes' British South Africa Company. Their diplomatic triumph preserved what would become Botswana. Poso House, nearby, was the first government building of the newly independent republic and remains a landmark of institutional continuity.",
    color: "#C1440E",
    imgs: [
      "https://images.unsplash.com/photo-1738145133893-a9c9aa180f8f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1759216942476-c8e7f1d09b4f?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1759130534259-273e015f70f9?w=800&h=600&fit=crop&auto=format",
    ],
  },
];

// Alias for accordion format
export const HERITAGE_SITES = SITES;

export const ROUTES = [
  {
    id: "complete",
    name: "Complete Heritage Route",
    desc: "All 6 heritage sites with guided commentary and site viewing. The full Gaborone story, nothing left out.",
    price: 250,
    duration: "3–4 hrs",
    distance: "~12 km",
    sites: 6,
    badge: "Flagship",
    badgeColor: "#C1440E",
    when: "Every Wednesday 14:30 · Thu–Fri on request",
    availability: "Wed 14:30 · Thu–Fri on request", // for accordion
  },
  {
    id: "loop",
    name: "Heritage Loop",
    desc: "Ride the same iconic circuit at your own pace — same route, no scheduled stops. Perfect for independent riders.",
    price: 150,
    duration: "1.5–2 hrs",
    distance: "~12 km",
    sites: 6,
    badge: "Loop",
    badgeColor: "#1A3A2A",
    when: "Thu–Fri on request",
    availability: "Thu–Fri on request",
  },
  {
    id: "own",
    name: "Your Own Route",
    desc: "Design your path within the heritage radius. Start at Main Mall, explore your way — we confirm it fits the zone.",
    price: 150,
    duration: "Flexible",
    distance: "Within radius",
    sites: "Custom",
    badge: "Custom",
    badgeColor: "#D4A017",
    when: "Thu–Fri on request",
    availability: "Thu–Fri on request",
  },
];

export const MAIN_MALL = [-24.6553, 25.9086];

// Accordion format exports
export const MEETUP = {
  name: "Main Mall",
  note: "Gaborone City Centre",
  coordinates: { lat: -24.6553, lng: 25.9086 },
};

export const LOOP_ORDER = ["parliament", "enclave", "archives", "gallery", "museum", "monument"];

export const OPERATING_SCHEDULE = {
  wednesday: { time: "2:30 PM" },
  thursdayFriday: { window: "9 AM – 5 PM" },
};

export const LESSON_PRICE = 250;