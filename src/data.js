export const SITES = [
  {
    id: "parliament",
    name: "Parliament Building",
    emoji: "🏛",
    short: "The seat of Botswana's democratic power",
    history:
      "Built at independence in 1966, the National Assembly of Botswana stands as a proud symbol of Africa's most stable multiparty democracy. Its clean modernist lines reflect a nation that chose dialogue over conflict — Botswana has never experienced a coup. Guided tours reveal the debating chambers where laws that transformed a cattle-herding nation into one of Africa's fastest-growing economies were born.",
    color: "#1A3A2A",
    coords: [-24.6541, 25.9069],
    imgs: [
      "/heritage/parliament/1.jfif",
      "/heritage/parliament/2.jfif",
      "/heritage/parliament/3.jfif",
    ],
  },
  {
    id: "enclave",
    name: "Government Enclave",
    emoji: "🏢",
    short: "The administrative heartbeat of the nation",
    history:
      "The Government Enclave in Gaborone's city centre is where Botswana's public service machinery operates. Conceived during the post-independence planning era of the late 1960s, its tree-lined avenues and civic buildings tell the story of a deliberate, unhurried nation-building project. Riding through on two wheels gives you an intimate look at how governance and daily life intersect in one of Africa's most transparent administrations.",
    color: "#8B3008",
    coords: [-24.6528, 25.9089],
    imgs: [
      "/government%20enclave.jfif",
      "/heritage/enclave/1.jfif",
    ],
  },
  {
    id: "archives",
    name: "Botswana National Archives",
    emoji: "📜",
    short: "The memory of a nation preserved in paper and silence",
    history:
      "The Botswana National Archives and Records Services is the custodian of the nation's documentary heritage. Its collections stretch from pre-colonial correspondence with British Protectorate officials to the landmark Seretse Khama independence files. Photographs, maps, and oral history transcriptions housed here paint a vivid picture of a people who navigated colonial rule through diplomacy and cultural resilience. A visit is a direct encounter with the documents that shaped modern Botswana.",
    color: "#C1440E",
    coords: [-24.6573, 25.9124],
    imgs: [
      "/national%20archives.jfif",
      "/national%20archives1.jfif",
    ],
  },
  {
    id: "gallery",
    name: "Botswana Post Office Gallery",
    emoji: "🎨",
    short: "Where postal history became a canvas for national identity",
    history:
      "Housed within a heritage building that once handled the correspondence of a nascent republic, the Botswana Post Office Gallery celebrates the intersection of communication and culture. Its rotating exhibitions of stamps, philatelic art, and contemporary Botswana visual work chronicle the nation's self-expression since 1966. The gallery is a quiet, surprisingly moving space — each stamp an official declaration of what Botswana chose to show the world.",
    color: "#D4A017",
    coords: [-24.6558, 25.9098],
    imgs: [
      "/post%20office.jfif",
      "/postoffice.jfif",
    ],
  },
  {
    id: "museum",
    name: "National Museum & Art Gallery",
    emoji: "🦁",
    short: "Botswana's story told through artefact and art",
    history:
      "Established in 1968, the Botswana National Museum and Art Gallery is one of Southern Africa's finest cultural institutions. Permanent exhibitions explore the San Bushmen's ancient relationship with the Kalahari, the cattle culture that underpins Tswana identity, and the colonial encounter that produced a uniquely resilient society. The adjacent art gallery showcases contemporary Botswana artists navigating tradition and modernity — a conversation happening in paint, sculpture, and fibre.",
    color: "#1A3A2A",
    coords: [-24.6582, 25.9115],
    imgs: [
      "/museum.jfif",
      "/national%20museum.jfif",
    ],
  },
  {
    id: "monument",
    name: "Three Chiefs Monument & Poso House",
    emoji: "⚔️",
    short: "Where diplomacy saved a nation — twice",
    history:
      "The Three Chiefs Monument commemorates the 1895 journey of Khama III, Sebele I, and Bathoen I to London — three Tswana chiefs who lobbied the British government directly and successfully prevented Bechuanaland from being absorbed into Cecil Rhodes' British South Africa Company. Their diplomatic triumph preserved what would become Botswana. Poso House, nearby, was the first government building of the newly independent republic and remains a landmark of institutional continuity.",
    color: "#C1440E",
    coords: [-24.6549, 25.9078],
    imgs: [
      "/three%20chiefs.jfif",
      "/orapa%20house.jfif",
      "/heritage/monument/1.jfif",
      "/heritage/monument/2.jfif",
      "/heritage/monument/3.jfif",
      "/heritage/monument/4.jfif",
      "/heritage/monument/5.jfif",
      "/heritage/monument/6.jfif",
      "/heritage/monument/7.jfif",
      "/heritage/monument/8.jfif",
      "/heritage/monument/9.jfif",
    ],
  },
];

export const ROUTES_DATA = [
  {
    id: "complete",
    name: "Complete Heritage Route",
    desc: "A guided ride through all 6 heritage sites, with two daily start options and time to hear the stories behind each landmark.",
    price: 250,
    duration: "3–4 hrs",
    distance: "~12 km",
    sites: 6,
    badge: "Flagship",
    badgeColor: "#C1440E",
    when: "Wednesday–Friday · 09:00 or 14:00 · Max 10 riders",
    includes: ["Expert local guide", "All 6 heritage sites", "Site viewing time", "Bike provided", "Route map"],
  },
  {
    id: "loop",
    name: "Casual Saturday",
    desc: "A loose, social ride for friends and families. No rigid schedule, no pressure, just a fun way to spend Saturday together.",
    price: 150,
    duration: "1.5–2 hrs",
    distance: "~12 km",
    sites: 6,
    badge: "Loop",
    badgeColor: "#1A3A2A",
    when: "Saturdays · Casual group ride",
    includes: ["Route map", "Bike provided", "Self-guided"],
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
    includes: ["Route planning assistance", "Bike provided", "Heritage radius confirmed"],
  },
];

export const MAIN_MALL = [-24.6553, 25.9086];

// Nearest-neighbor visiting order from Main Mall, used to draw the Complete
// Route / Heritage Loop trail on the map. Computed from the real coordinates
// above rather than guessed — this is the shortest sensible loop through all
// six sites and back to the start.
export const LOOP_ORDER = ["monument", "parliament", "enclave", "gallery", "museum", "archives"];
