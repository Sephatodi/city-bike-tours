export const SITES = [
  {
    id: "parliament",
    name: "Parliament Building",
    street: "Government Enclave",
    icon: "landmark",
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
    street: "Government Enclave",
    icon: "building",
    short: "The administrative heartbeat of the nation",
    history:
      "The Government Enclave in Gaborone's city centre is where Botswana's public service machinery operates. Conceived during the post-independence planning era of the late 1960s, its tree-lined avenues and civic buildings tell the story of a deliberate, unhurried nation-building project. Riding through on two wheels gives you an intimate look at how governance and daily life intersect in one of Africa's most transparent administrations.",
    color: "#8B3008",
    coords: [-24.6528, 25.9089],
    imgs: [
      "/government%20enclave.jfif",
      "/heritage/enclave/1.jfif",
      "/museum/gev.jpg",
      "/museum/gev1.jpg",
    ],
  },
  {
    id: "archives",
    name: "Botswana National Archives",
    street: "Independence Avenue",
    icon: "scroll",
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
    street: "Main Mall",
    icon: "palette",
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
    street: "Independence Avenue",
    icon: "landmark",
    short: "Botswana's story told through artefact and art",
    history:
      "Established in 1968, the Botswana National Museum and Art Gallery is one of Southern Africa's finest cultural institutions. Permanent exhibitions explore the San Bushmen's ancient relationship with the Kalahari, the cattle culture that underpins Tswana identity, and the colonial encounter that produced a uniquely resilient society. The adjacent art gallery showcases contemporary Botswana artists navigating tradition and modernity — a conversation happening in paint, sculpture, and fibre.",
    color: "#1A3A2A",
    coords: [-24.6582, 25.9115],
    imgs: [
      "/museum.jfif",
      "/national%20museum.jfif",
      "/museum/museum.jpg",
      "/museum/museum1.jpg",
      "/museum/museum2.jpg",
      "/museum/museum3.jpg",
      "/museum/museum4.jpg",
      "/museum/museum5.jpg",
      "/museum/museum6.jpg",
      "/museum/museum7.jpg",
      "/museum/museum8.jpg",
    ],
  },
  {
    id: "monument",
    name: "Three Chiefs Monument & Poso House",
    street: "Government Enclave",
    icon: "flag",
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
      "/heritage/parliament/TDM.jpg",
      "/heritage/parliament/TDM1.jpg",
      "/heritage/parliament/TDM2.jpg",
      "/heritage/parliament/TDM3.jpg",
      "/heritage/parliament/TDM4.jpg",
      "/heritage/parliament/TDM5.jpg",
      "/heritage/parliament/TDM6.jpg",
      "/heritage/parliament/TDM7.jpg",
      "/heritage/parliament/TDM8.jpg",
      "/The%203%20chiefs/3Dk.jpg",
      "/The%203%20chiefs/3dk1.jpg",
      "/The%203%20chiefs/3dk2.jpg",
      "/The%203%20chiefs/3dk3.jpg",
      "/The%203%20chiefs/3dk4.jpg",
      "/The%203%20chiefs/3dk5.jpg",
      "/The%203%20chiefs/3dk6.jpg",
      "/The%203%20chiefs/3dk8.jpg",
      "/The%203%20chiefs/edk7.jpg",
      "/museum/3dk9.jpg",
    ],
  },
];

export const MAIN_MALL = [-24.6553, 25.9086];

// Visiting order used by the map polyline, from Main Mall and back again.
export const LOOP_ORDER = ["monument", "parliament", "enclave", "gallery", "museum", "archives"];

const sitesById = Object.fromEntries(SITES.map((site) => [site.id, site]));
const radians = (degrees) => (degrees * Math.PI) / 180;
const segmentDistanceKm = ([lat1, lon1], [lat2, lon2]) => {
  const startLat = radians(lat1);
  const endLat = radians(lat2);
  const latitudeDelta = endLat - startLat;
  const longitudeDelta = radians(lon2) - radians(lon1);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(haversine));
};

// Match the map's straight polyline segments; this is not road-routing mileage.
const mapRoutePoints = [MAIN_MALL, ...LOOP_ORDER.map((id) => sitesById[id].coords), MAIN_MALL];
const mapRouteDistanceKm = mapRoutePoints.slice(1).reduce(
  (total, point, index) => total + segmentDistanceKm(mapRoutePoints[index], point),
  0,
);
const mapRouteDistance = `~${mapRouteDistanceKm.toFixed(1)} km`;

export const ROUTES_DATA = [
  {
    id: "complete",
    name: "Heritage City Ride",
    desc: "A guided ride through Gaborone's heritage sites, with a local guide sharing the stories behind each landmark.",
    price: 250,
    duration: "1 hr – 1 hr 30 min",
    distance: mapRouteDistance,
    sites: 6,
    badge: "Guided · Max 10",
    badgeColor: "#C1440E",
    when: "Wednesday–Friday · 09:00 or 14:00 · Max 10 riders per group",
    includes: ["Expert local guide", "All 6 heritage sites", "Site viewing time", "Bike provided", "Route map"],
  },
  {
    id: "loop",
    name: "Casual Saturday",
    desc: "A carefree, social ride for friends, families, and fellow riders. No rigid schedule or pressure—just enjoy the ride together.",
    price: 150,
    duration: "1.5–2 hrs",
    distance: mapRouteDistance,
    sites: 6,
    badge: "Casual · All welcome",
    badgeColor: "#1A3A2A",
    when: "Saturdays · Flexible, informal group ride",
    includes: ["Casual group ride", "Cycling lessons for kids and adults", "Bike provided"],
  },
];

// Cafés and eateries within an easy ride of Main Mall and the heritage sites. Opening hours change,
// so riders are told to check; edit this list to match the stops you actually use on a ride.
// `near` names the heritage stop it is closest to, and `kind` is the short tag shown on the card.
export const FOOD_STOPS = [
  {
    id: "daily-grind",
    name: "The Daily Grind Cafe + Kitchen",
    area: "Plot 133, Independence Avenue",
    near: "National Museum & Art Gallery",
    note: "Breakfast, brunch and good coffee, a short ride from the museum and Main Mall. A favourite for a morning ride break.",
    stop: "Morning refuel",
  },
  {
    id: "museum-cafe",
    name: "Museum Cafe",
    area: "Pula Circle, by the National Museum",
    near: "National Museum & Art Gallery",
    note: "A relaxed spot right beside the museum, easy to reach on bicycles for lunch or a cold drink.",
    stop: "Museum stop",
  },
  {
    id: "agang",
    name: "Agang's Dessert Corner",
    area: "Diamond Square, Main Mall",
    near: "Botswana Post Office Gallery",
    note: "Local and international desserts right on the Main Mall, a sweet reward after the Post Office Gallery.",
    stop: "Sweet stop",
  },
  {
    id: "main-deck",
    name: "Main Deck Restaurant & Bar",
    area: "Above Main Mall",
    near: "Main Mall (start and finish)",
    note: "A big menu with Botswana and international dishes, and a patio overlooking Main Mall, right where every ride starts and ends.",
    stop: "Post-ride meal",
  },
  {
    id: "main-mall-vendors",
    name: "Main Mall street vendors",
    area: "Main Mall, city centre",
    near: "Main Mall (start and finish)",
    note: "Quick, cheap bites and cold drinks from the vendors along the pedestrian mall, ideal before or after the Government Enclave.",
    stop: "Quick bite",
  },
  {
    id: "patio",
    name: "The Patio Cafe & Deli",
    area: "Mokgosi",
    near: "Government Enclave",
    note: "A cosy café and deli with indoor and outdoor seating for breakfast and light meals.",
    stop: "Coffee and a bite",
  },
];
