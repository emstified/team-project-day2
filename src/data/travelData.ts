import heroKyotoImg from "../assets/images/hero_kyoto_afterhours_1791434251692.jpg";
import seoulHanokImg from "../assets/images/seoul_hidden_hanok_1791434264684.jpg";
import japanOnsenImg from "../assets/images/japan_autumn_onsen_1791434278339.jpg";
import jejuTrailImg from "../assets/images/jeju_coastal_trail_1791434289553.jpg";
import tokyoVinylImg from "../assets/images/tokyo_vinyl_bar_1791434299785.jpg";

export const ASSETS = {
  heroKyoto: heroKyotoImg,
  seoulHanok: seoulHanokImg,
  japanOnsen: japanOnsenImg,
  jejuTrail: jejuTrailImg,
  tokyoVinyl: tokyoVinylImg,
};

export interface VirtualWaypoint {
  step: number;
  title: string;
  coordinates: string;
  elevationOrAtmosphere: string;
  streetViewNarrative: string;
  localAudioCue: string;
}

export interface StayRecommendation {
  id: string;
  title: string;
  neighborhood: string;
  propertyType: string;
  referenceNightlyUsd: number;
  rating: string;
  reviewCount: number;
  architecturalHighlight: string;
  structuredJsonPreview: Record<string, unknown>;
}

export interface TransportOption {
  mode: string;
  routeSummary: string;
  duration: string;
  referenceCostUsd: number;
  crowdLevel: "Low" | "Minimal" | "Private";
  whyBest: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  category: string;
  afterHoursAccess: boolean;
  clearWeatherPlan: string;
  rainyWeatherSwap: string;
  yelpBusinessMeta: {
    tradingHours: string;
    localSentiment: string;
    crowdIndex: string;
  };
}

export interface CuratedItinerary {
  id: string;
  title: string;
  subtitle: string;
  country: "Japan" | "South Korea";
  cityKey: "kyoto" | "tokyo" | "nagano" | "seoul" | "jeju";
  regionLabel: string;
  duration: string;
  suitedFor: ("Individual" | "Couple" | "Family")[];
  seasonTag: string;
  crowdAvoidanceScore: string;
  referencePriceUsd: number;
  heroImage: string;
  replacesTouristTrap: string;
  localPartnerName: string;
  localPartnerType: "Professional Specialist Guide" | "Local Ground-Up Hobby Group" | "Fun Local Individual";
  stops: ItineraryStop[];
  transportRoutes: TransportOption[];
  curatedStay: StayRecommendation;
  virtualTravelWaypoints: VirtualWaypoint[];
}

export interface LocalHostPartner {
  id: string;
  name: string;
  roleTitle: string;
  partnerCategory: "Local Ground-Up Hobby Group" | "Fun Local Individual" | "Specialized Tour Guide";
  city: string;
  country: "Japan" | "South Korea";
  specialty: string;
  languages: string[];
  avatarImage: string;
  bio: string;
  signatureSession: string;
  groupCapacity: string;
  referenceFeeUsd: number;
  suggestedGratitudeUsd: number[];
  channels: {
    whatsapp: string;
    telegram: string;
    wechatId: string;
  };
  recentTravelerNote: {
    traveler: string;
    context: string;
    quote: string;
  };
}

export const CURATED_ITINERARIES: CuratedItinerary[] = [
  {
    id: "kyoto-after-hours-sanctuary",
    title: "Daitoku-ji Twilight & Lantern-Lit Nishijin Backstreets",
    subtitle: "Private evening sub-temple entry, hinoki woodblock studio, and subterranean kissa.",
    country: "Japan",
    cityKey: "kyoto",
    regionLabel: "Kyoto · Kita & Kamigyo Wards",
    duration: "3 Days / 2 Nights",
    suitedFor: ["Individual", "Couple", "Family"],
    seasonTag: "Autumn Momiji & Evening Mist",
    crowdAvoidanceScore: "96% Fewer Visitors vs. Higashiyama Midday",
    referencePriceUsd: 640,
    heroImage: ASSETS.heroKyoto,
    replacesTouristTrap: "Replaces overcrowded Kiyomizu-dera & Gion Hanami-koji peak hours",
    localPartnerName: "Kenji Sato & The Kyoto Kodo (Incense) Circle",
    localPartnerType: "Local Ground-Up Hobby Group",
    stops: [
      {
        time: "17:30 – 19:15",
        title: "After-Hours Private Entry: Daitoku-ji Zen Sub-Temple",
        category: "After-Hours Sight",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Walk the raked gravel dry-landscape garden by beeswax candlelight after public gates close at 17:00, guided by the resident caretaker.",
        rainyWeatherSwap:
          "Sit inside the 16th-century tatami hondō overlooking the rain-darkened moss courtyard with stone-milled Uji matcha and monk calligraphy.",
        yelpBusinessMeta: {
          tradingHours: "17:30–19:30 (Private Charter Window)",
          localSentiment: "4.9/5 · Verified Private Sanctuary Access",
          crowdIndex: "Max 6 guests on grounds",
        },
      },
      {
        time: "19:30 – 21:15",
        title: "Nishijin Textile Alleyway & Fourth-Generation Kaiseki Counter",
        category: "Hidden Culinary",
        afterHoursAccess: false,
        clearWeatherPlan:
          "Stroll through quiet wooden weavers' machiya lanes in Nishijin to an 8-seat counter serving seasonal Kyoto vegetables and wild sweetfish.",
        rainyWeatherSwap:
          "Direct covered taxi transfer to an intimate sunken-hearth (irori) townhouse dining room with private warm sake pairing.",
        yelpBusinessMeta: {
          tradingHours: "18:00–22:30 (Closed Wednesdays)",
          localSentiment: "4.8/5 · 90% Local Patronage",
          crowdIndex: "8 seats total · Reservation locked",
        },
      },
      {
        time: "21:30 – 23:00",
        title: "Demachiyanagi Analog Listening Salon",
        category: "Local Hobby Group",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Join local vinyl collectors spinning 1970s Japanese jazz pressings on custom horn speakers beside the Kamogawa delta.",
        rainyWeatherSwap:
          "Extended acoustic listening session inside the soundproofed cedar basement vault with artisanal roasted hojicha cocktails.",
        yelpBusinessMeta: {
          tradingHours: "19:00–00:00",
          localSentiment: "4.9/5 · Kyoto Audiophile Guild Favorite",
          crowdIndex: "Quiet conversational acoustics",
        },
      },
    ],
    transportRoutes: [
      {
        mode: "Regional Rail + Private Electric Sedan",
        routeSummary: "JR Haruka Express (KIX → Kyoto Station) + Reserved MK Electric Taxi to Kita Ward",
        duration: "1h 35m total door-to-door",
        referenceCostUsd: 58,
        crowdLevel: "Minimal",
        whyBest: "Bypasses crowded city bus lines (#205/#206) and delivers luggage directly to your machiya doorstep.",
      },
      {
        mode: "Cross-Border Regional Air + Shinkansen Link",
        routeSummary: "Seoul Gimpo (GMP) → Osaka Kansai (KIX) morning shuttle + Haruka Green Car",
        duration: "3h 15m cross-border link",
        referenceCostUsd: 165,
        crowdLevel: "Low",
        whyBest: "Fastest city-center to city-center corridor when combining Korea & Japan in one itinerary.",
      },
    ],
    curatedStay: {
      id: "stay-kyoto-machiya",
      title: "Kurasaki Cedar Townhouse (1912 Restored Kyo-Machiya)",
      neighborhood: "Murasakino · 4 mins walk from Daitoku-ji",
      propertyType: "Entire Private Heritage Townhouse",
      referenceNightlyUsd: 310,
      rating: "4.96",
      reviewCount: 84,
      architecturalHighlight: "Private tsubo-niwa moss garden, cypress soaking bath, and heated floor tatami study.",
      structuredJsonPreview: {
        provider: "Curated Heritage Stay Reference (Simulated)",
        listing_id: "kyoto-machiya-88219",
        instant_book: false,
        host_verification: "Superhost · Local Architect",
        amenities: ["Cypress Hinoki Bath", "Private Moss Garden", "Pocket Wi-Fi", "Quiet Residential Zone"],
        price_breakdown_usd: { nightly: 310, cleaning_fee: 45, taxes_included: true },
      },
    },
    virtualTravelWaypoints: [
      {
        step: 1,
        title: "Kita-Oji Stone Approach",
        coordinates: "35.0441° N, 135.7460° E",
        elevationOrAtmosphere: "Twilight · 58m Elevation · Pine & Moss Scent",
        streetViewNarrative:
          "You stand before the weathered hinoki gates of Daitoku-ji as tour buses depart. Only the sound of bamboo water chimes echoes along the stone pavement.",
        localAudioCue: "Evening temple bell (Bonshō) resonance at 17:30",
      },
      {
        step: 2,
        title: "Nishijin Orimono Weavers' Lane",
        coordinates: "35.0318° N, 135.7435° E",
        elevationOrAtmosphere: "Lantern Glow · Narrow Latticework Facades",
        streetViewNarrative:
          "Warm amber light spills through wooden koshi lattices. You hear the rhythmic clack of silk jacquard looms from second-story family workshops.",
        localAudioCue: "Rhythmic wooden loom shuttle & quiet cobblestone footsteps",
      },
      {
        step: 3,
        title: "Kamogawa Delta Stepping Stones",
        coordinates: "35.0297° N, 135.7719° E",
        elevationOrAtmosphere: "Night Breeze · River Confluence",
        streetViewNarrative:
          "Descend a narrow staircase into a mahogany-lined vinyl kissa where vacuum tubes glow softly and local collectors trade rare pressings.",
        localAudioCue: "Crackling vinyl needle drop & Bill Evans piano trio",
      },
    ],
  },
  {
    id: "seoul-seochon-moonlight-craft",
    title: "Seochon Hidden Hanok Courtyards & After-Hours Palace Walk",
    subtitle: "Private celadon tea atelier, Changdeokgung Secret Garden dusk access, and Bugaksan fortress ridge.",
    country: "South Korea",
    cityKey: "seoul",
    regionLabel: "Seoul · Jongno-gu (Seochon & Buam-dong)",
    duration: "3 Days / 2 Nights",
    suitedFor: ["Individual", "Couple", "Family"],
    seasonTag: "Golden Ginkgo & Crisp Mountain Air",
    crowdAvoidanceScore: "94% Fewer Visitors vs. Bukchon Hanok Main Street",
    referencePriceUsd: 580,
    heroImage: ASSETS.seoulHanok,
    replacesTouristTrap: "Replaces overcrowded Bukchon Hanok Village & Myeongdong street stalls",
    localPartnerName: "Soo-jin Park & The Seochon Ceramicists Guild",
    localPartnerType: "Professional Specialist Guide",
    stops: [
      {
        time: "16:30 – 18:30",
        title: "Private Seochon Hanok Tea & Celadon Kiln Session",
        category: "Local Hobby Group",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Drink wild Jirisan fermented green tea in a sunlit courtyard beneath a 120-year-old persimmon tree with ceramic artist Soo-jin Park.",
        rainyWeatherSwap:
          "Move onto the warm ondol (heated stone) maru pavilion to listen to rain falling off curved giwa roof tiles while glazing your own tea cup.",
        yelpBusinessMeta: {
          tradingHours: "14:00–19:30 (By Private Appointment)",
          localSentiment: "4.95/5 · Featured in Seoul Craft Biennial",
          crowdIndex: "Private courtyard · Single group only",
        },
      },
      {
        time: "19:00 – 20:45",
        title: "After-Hours Changdeokgung Huwon (Secret Garden) Lantern Walk",
        category: "After-Hours Sight",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Walk the royal forest paths and Buyongji Pond reflections under moonlight with a palace historian, far from daytime tour groups.",
        rainyWeatherSwap:
          "Private after-hours architectural tour of the National Folk Museum & covered royal pavilions followed by traditional court confectionery.",
        yelpBusinessMeta: {
          tradingHours: "19:00–21:00 (Special Night Permit Window)",
          localSentiment: "5.0/5 · UNESCO Heritage Night Access",
          crowdIndex: "Strictly capped permit entry",
        },
      },
      {
        time: "21:00 – 23:00",
        title: "Buam-dong Mountain Foot Traditional Makgeolli Brewery Table",
        category: "Hidden Culinary",
        afterHoursAccess: false,
        clearWeatherPlan:
          "Dine in a quiet hillside courtyard overlooking the illuminated Seoul Fortress Wall, tasting small-batch unpasteurized rice wines.",
        rainyWeatherSwap:
          "Cozy indoor timber tavern famed among local novelists for crispy mung-bean bindaetteok pancakes paired with aged yakju.",
        yelpBusinessMeta: {
          tradingHours: "17:30–23:30",
          localSentiment: "4.85/5 · Zero tour bus access",
          crowdIndex: "Local neighborhood tables",
        },
      },
    ],
    transportRoutes: [
      {
        mode: "AREX Express + Private Kakao Black Van",
        routeSummary: "Incheon T2 → Seoul Station (43m non-stop) + Private Chauffeur to Seochon Alleyway",
        duration: "1h 05m total",
        referenceCostUsd: 52,
        crowdLevel: "Low",
        whyBest: "Avoids steep cobblestone stairs with luggage and drops you right at your hanok courtyard gate.",
      },
      {
        mode: "Gimpo–Haneda / Kansai City-Center Express Shuttle",
        routeSummary: "Seoul Gimpo (GMP) → Tokyo Haneda (HND) city-center express corridor",
        duration: "2h 10m flight",
        referenceCostUsd: 178,
        crowdLevel: "Low",
        whyBest: "Saves 2.5 hours of airport transit compared to Incheon–Narita when pairing Seoul with Tokyo.",
      },
    ],
    curatedStay: {
      id: "stay-seoul-hanok",
      title: "Nuha-dong Pine Courtyard Hanok Residence",
      neighborhood: "Seochon · Foot of Inwangsan Mountain",
      propertyType: "Private Architectural Hanok",
      referenceNightlyUsd: 285,
      rating: "4.94",
      reviewCount: 67,
      architecturalHighlight: "Traditional heated ondol floors, private granite courtyard bath, and view of Inwangsan granite peaks.",
      structuredJsonPreview: {
        provider: "Curated Heritage Stay Reference (Simulated)",
        listing_id: "seoul-seochon-44910",
        instant_book: false,
        host_verification: "Superhost · Heritage Preservationist",
        amenities: ["Ondol Heated Floors", "Granite Soaking Tub", "Tea Ceremony Table", "Private Courtyard"],
        price_breakdown_usd: { nightly: 285, cleaning_fee: 35, taxes_included: true },
      },
    },
    virtualTravelWaypoints: [
      {
        step: 1,
        title: "Nuha-dong Hanok Alleyway",
        coordinates: "37.5794° N, 126.9686° E",
        elevationOrAtmosphere: "Golden Hour · Quiet Granite Alleyways",
        streetViewNarrative:
          "Step off the main boulevard into a labyrinth of low-slung tiled roofs where local painters and potters keep open studio doors.",
        localAudioCue: "Ceramic wind chime & distant mountain magpie call",
      },
      {
        step: 2,
        title: "Buyongji Royal Pond at Dusk",
        coordinates: "37.5825° N, 126.9917° E",
        elevationOrAtmosphere: "Moonlight Reflection · Forest Canopy",
        streetViewNarrative:
          "Cheongsa Chorong (red-and-blue silk lanterns) illuminate the water pavilion of Changdeokgung with not a single daytime crowd in sight.",
        localAudioCue: "Soft gravel footsteps & traditional daegeum flute",
      },
    ],
  },
  {
    id: "nagano-crimson-onsen-retreat",
    title: "Nagano Hidden Cedar Valley & Private Rotenburo Sanctuary",
    subtitle: "Alpine autumn foliage trails, soba milling with mountain elders, and private hot spring charters.",
    country: "Japan",
    cityKey: "nagano",
    regionLabel: "Nagano · Obuse & Togakushi Cedar Forest",
    duration: "4 Days / 3 Nights",
    suitedFor: ["Couple", "Family"],
    seasonTag: "Peak Crimson Momiji Foliage",
    crowdAvoidanceScore: "98% Fewer Visitors vs. Hakone & Lake Kawaguchiko",
    referencePriceUsd: 790,
    heroImage: ASSETS.japanOnsen,
    replacesTouristTrap: "Replaces congested Hakone ropeway lines & crowded Nikko bus hairpins",
    localPartnerName: "Haruka Takahashi & Togakushi Forest Foragers",
    localPartnerType: "Fun Local Individual",
    stops: [
      {
        time: "07:00 – 09:30",
        title: "Dawn Walk Through 400-Year-Old Togakushi Cryptomeria Avenue",
        category: "After-Hours Sight",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Enter the giant cedar avenue at first light with local mountaineer Haruka before day-trippers arrive, spotting wild serow and autumn maples.",
        rainyWeatherSwap:
          "Mist-shrouded shrine kagura ceremonial hall viewing followed by hot roasted chestnut porridge inside a thatched mountain lodge.",
        yelpBusinessMeta: {
          tradingHours: "06:30–09:30 (Dawn Quiet Window)",
          localSentiment: "4.95/5 · Sacred Alpine Trail",
          crowdIndex: "Solitary forest atmosphere",
        },
      },
      {
        time: "12:00 – 14:30",
        title: "Private Buckwheat Stone-Milling & Soba Craft with Village Master",
        category: "Local Hobby Group",
        afterHoursAccess: false,
        clearWeatherPlan:
          "Harvest late-autumn mountain wasabi by a spring-fed stream and hand-cut Togakushi soba noodles in a private farmhouse.",
        rainyWeatherSwap:
          "Full indoor hearthside soba workshop and tempura tasting featuring wild mountain maitake mushrooms.",
        yelpBusinessMeta: {
          tradingHours: "11:00–15:00",
          localSentiment: "4.9/5 · Michelin Bib Gourmand Lineage",
          crowdIndex: "Private family barn table",
        },
      },
      {
        time: "17:00 – 21:00",
        title: "Private Chartered Riverfront Rotenburo & Shinshu Wine Dinner",
        category: "After-Hours Sight",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Soak in a natural mineral stone rotenburo surrounded by crimson maple canopy under crisp alpine stars.",
        rainyWeatherSwap:
          "Covered hinoki timber overhang bath where warm thermal steam meets cool mountain rain.",
        yelpBusinessMeta: {
          tradingHours: "17:00–22:00 (Private Ryokan Key)",
          localSentiment: "5.0/5 · 100% Free-Flowing Gensen Kakenagashi",
          crowdIndex: "Exclusive private bath reservation",
        },
      },
    ],
    transportRoutes: [
      {
        mode: "Hokuriku Shinkansen Kagayaki + Private Alpine Defender",
        routeSummary: "Tokyo Station → Nagano Station (1h 22m) + Private 4WD transfer into Togakushi Valley",
        duration: "2h 05m total",
        referenceCostUsd: 94,
        crowdLevel: "Low",
        whyBest: "Direct bullet train comfort followed by seamless mountain road access without waiting for hourly rural buses.",
      },
    ],
    curatedStay: {
      id: "stay-nagano-ryokan",
      title: "yamaboushi-an Private Onsen Villa",
      neighborhood: "Obuse / Yamada Onsen Gorge",
      propertyType: "Detached Timber Suite with Private Open-Air Bath",
      referenceNightlyUsd: 380,
      rating: "4.98",
      reviewCount: 52,
      architecturalHighlight: "Natural river-stone rotenburo fed by undisturbed volcanic spring, cantilevered over crimson maple ravine.",
      structuredJsonPreview: {
        provider: "Curated Heritage Stay Reference (Simulated)",
        listing_id: "nagano-onsen-77102",
        instant_book: false,
        host_verification: "Third-Generation Ryokan Keeper",
        amenities: ["Private Open-Air Onsen", "Half-Board Kaiseki", "Station Pick-up", "Tattoo-Friendly Private Bath"],
        price_breakdown_usd: { nightly: 380, cleaning_fee: 0, taxes_included: true },
      },
    },
    virtualTravelWaypoints: [
      {
        step: 1,
        title: "Togakushi Zuishinmon Cedar Gate",
        coordinates: "36.7575° N, 138.0751° E",
        elevationOrAtmosphere: "1,200m Elevation · Crisp Cedar & Morning Mist",
        streetViewNarrative:
          "Shafts of morning sunlight pierce a cathedral corridor of 300 giant cedar trees planted in the Edo period.",
        localAudioCue: "Mountain stream rushing over mossy boulders",
      },
    ],
  },
  {
    id: "jeju-basalt-haenyeo-path",
    title: "Jeju Volcanic Basalt Coast & Haenyeo Sea-Diver Hearth",
    subtitle: "Private coastal foraging trail, volcanic stone tea warehouse, and sunset hearth dining with free-divers.",
    country: "South Korea",
    cityKey: "jeju",
    regionLabel: "Jeju Island · Gujwa-eup & Seogwipo East Coast",
    duration: "4 Days / 3 Nights",
    suitedFor: ["Individual", "Couple", "Family"],
    seasonTag: "Silver Eulalia Grass & Golden Coastal Dusk",
    crowdAvoidanceScore: "95% Fewer Visitors vs. Seongsan Ilchulbong Midday",
    referencePriceUsd: 610,
    heroImage: ASSETS.jejuTrail,
    replacesTouristTrap: "Replaces crowded Seongsan tour bus parking lots & commercialized Jungmun resorts",
    localPartnerName: "Min-jae Kim & The Hado-ri Coastal Collective",
    localPartnerType: "Local Ground-Up Hobby Group",
    stops: [
      {
        time: "15:30 – 17:45",
        title: "Unmarked Olle Basalt Ridge & Silver Grass Crater Walk",
        category: "After-Hours Sight",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Hike a quiet eastern volcanic cone (oreum) at golden hour when silver eulalia grass shimmers against the turquoise Korea Strait.",
        rainyWeatherSwap:
          "Explore an acoustic volcanic lava tube sanctuary and architectural basalt art bunker in Seongsan.",
        yelpBusinessMeta: {
          tradingHours: "15:30–18:00 (Late Afternoon Golden Window)",
          localSentiment: "4.9/5 · Local Geologist Guided",
          crowdIndex: "Zero commercial tour groups",
        },
      },
      {
        time: "18:15 – 20:30",
        title: "Private Bulteok (Stone Fire Pit) Dinner with Retired Haenyeo Divers",
        category: "Hidden Culinary",
        afterHoursAccess: true,
        clearWeatherPlan:
          "Gather around a traditional coastal basalt stone hearth as Jeju sea women grill freshly harvested horned turban shells and abalone.",
        rainyWeatherSwap:
          "Dine inside the divers' warm seaside stone communal house over simmering sea urchin and wakame soup while hearing diving folklore.",
        yelpBusinessMeta: {
          tradingHours: "18:00–21:00 (Direct Community Partnership)",
          localSentiment: "5.0/5 · 70% of fee goes directly to Haenyeo guild",
          crowdIndex: "Intimate 6-person stone table",
        },
      },
    ],
    transportRoutes: [
      {
        mode: "Regional Air Hop + Private EV SUV",
        routeSummary: "Seoul Gimpo (GMP) or Busan (PUS) → Jeju (CJU) + Dedicated Hyundai IONIQ 5 Coastal Driver",
        duration: "1h 10m flight + 40m coastal drive",
        referenceCostUsd: 115,
        crowdLevel: "Private",
        whyBest: "Eliminates rental car paperwork and allows effortless one-way hikes along Jeju's volcanic trails.",
      },
    ],
    curatedStay: {
      id: "stay-jeju-stonehouse",
      title: "Jongdal-ri Basalt Doldam Stone House",
      neighborhood: "Gujwa-eup · East Jeju Quiet Fishing Village",
      propertyType: "Restored Volcanic Stone Courtyard Home",
      referenceNightlyUsd: 260,
      rating: "4.97",
      reviewCount: 91,
      architecturalHighlight: "Walled black basalt garden with outdoor volcanic rock bath and tangerine orchard views.",
      structuredJsonPreview: {
        provider: "Curated Heritage Stay Reference (Simulated)",
        listing_id: "jeju-basalt-33019",
        instant_book: false,
        host_verification: "Superhost · Jeju Island Native",
        amenities: ["Volcanic Stone Bath", "Tangerine Orchard", "EV Charger", "Pour-over Coffee Bar"],
        price_breakdown_usd: { nightly: 260, cleaning_fee: 30, taxes_included: true },
      },
    },
    virtualTravelWaypoints: [
      {
        step: 1,
        title: "Hado-ri Basalt Sea Wall",
        coordinates: "33.5162° N, 126.8901° E",
        elevationOrAtmosphere: "Sea Level · Salt Breeze & Black Lava Rock",
        streetViewNarrative:
          "Black volcanic stone walls wind between emerald carrot fields and turquoise tidal pools where haenyeo floats bob gently.",
        localAudioCue: "Sumbi-sori (divers' whistling breath) & ocean surf",
      },
    ],
  },
];

export const LOCAL_HOST_PARTNERS: LocalHostPartner[] = [
  {
    id: "host-kenji-kyoto",
    name: "Kenji Sato",
    roleTitle: "Founder, Kyoto Analog & Incense Collective",
    partnerCategory: "Local Ground-Up Hobby Group",
    city: "Kyoto & Tokyo",
    country: "Japan",
    specialty: "After-Hours Sub-Temples, Jazz Kissa Vinyl Culture & Heritage Craft",
    languages: ["English", "Japanese"],
    avatarImage: ASSETS.tokyoVinyl,
    bio: "Architectural restorer by day and vinyl archivist by night. Kenji opens doors to private Daitoku-ji sub-temples after 5 PM and introduces travellers to Kyoto and Tokyo's most guarded subterranean listening bars.",
    signatureSession: "Twilight Zen Courtyard + 3-Stop Hidden Vinyl & Craft Whisky Walk",
    groupCapacity: "1–4 Travellers (Individual or Small Family)",
    referenceFeeUsd: 180,
    suggestedGratitudeUsd: [15, 30, 50],
    channels: {
      whatsapp: "+81 90-4120-8831",
      telegram: "@kenji_uramichi_jp",
      wechatId: "kenji_kyoto_vinyl",
    },
    recentTravelerNote: {
      traveler: "Marcus & Elena V. · Zurich",
      context: "Booked 3-Night Kyoto After-Hours Itinerary",
      quote:
        "We spent two hours alone in a 400-year-old moss temple at dusk while the main streets were gridlocked. Worth every single yen.",
    },
  },
  {
    id: "host-soojin-seoul",
    name: "Soo-jin Park",
    roleTitle: "Master Ceramicist & Seochon Cultural Historian",
    partnerCategory: "Specialized Tour Guide",
    city: "Seoul",
    country: "South Korea",
    specialty: "Private Hanok Ateliers, Royal Palace Night Walks & Temple Cuisine",
    languages: ["English", "Korean", "Japanese"],
    avatarImage: ASSETS.seoulHanok,
    bio: "Born in Jongno-gu, Soo-jin curates quiet family-friendly and couple journeys through Seochon's working artists' studios, private tea rooms, and after-hours royal palace gardens.",
    signatureSession: "Seochon Private Kiln Tea Ceremony & Changdeokgung Moonlight Path",
    groupCapacity: "1–6 Travellers (Customised for Individuals or Families)",
    referenceFeeUsd: 165,
    suggestedGratitudeUsd: [15, 25, 45],
    channels: {
      whatsapp: "+82 10-8392-4410",
      telegram: "@soojin_seochon_kr",
      wechatId: "soojin_hanok_craft",
    },
    recentTravelerNote: {
      traveler: "Clarissa T. & Family · Singapore",
      context: "Booked Multi-Generational Seoul Hidden Path",
      quote:
        "When rain hit on Day 2, Soo-jin seamlessly pivoted our elderly parents into a private heated hanok tea room and royal court pastry workshop.",
    },
  },
  {
    id: "host-minjae-jeju",
    name: "Min-jae Kim",
    roleTitle: "Coastal Ecologist & Haenyeo Community Liaison",
    partnerCategory: "Fun Local Individual",
    city: "Jeju Island",
    country: "South Korea",
    specialty: "Unmarked Volcanic Oreum Trails, Haenyeo Hearth Dining & Coastal Foraging",
    languages: ["English", "Korean"],
    avatarImage: ASSETS.jejuTrail,
    bio: "An adventurous Jeju native who left Seoul's tech scene to document eastern Jeju's free-diving elders and volcanic geology. Brings foreign travellers to places only village residents know.",
    signatureSession: "Golden Hour Volcanic Crater Walk + Haenyeo Stone Hearth Seafood Feast",
    groupCapacity: "1–5 Travellers",
    referenceFeeUsd: 150,
    suggestedGratitudeUsd: [10, 25, 40],
    channels: {
      whatsapp: "+82 10-5519-0921",
      telegram: "@minjae_jeju_path",
      wechatId: "jeju_minjae_local",
    },
    recentTravelerNote: {
      traveler: "David K. · Melbourne",
      context: "Booked 4-Day Jeju Basalt & Haenyeo Journey",
      quote:
        "Zero tour buses, incredible coastal trails, and eating freshly grilled abalone beside 70-year-old free-divers was the highlight of our decade.",
    },
  },
];

export const PRESET_PHRASES = [
  {
    id: "p1",
    label: "After-Hours Sanctuary Greeting",
    english: "Thank you for welcoming our small group after hours this evening. We deeply appreciate the quiet atmosphere.",
    context: "Greeting a private temple caretaker or gallery keeper in the evening",
  },
  {
    id: "p2",
    label: "Chef's Local Seasonal Selection",
    english: "We have no dietary restrictions and would love to try your seasonal local specialties that tourists rarely order.",
    context: "Ordering at a hidden neighborhood izakaya or Korean makgeolli tavern",
  },
  {
    id: "p3",
    label: "Rainy Weather Taxi Route",
    english: "Could you please drop us at the covered side entrance along the backstreet so we can step out of the rain?",
    context: "Speaking politely to a local taxi driver during wet weather",
  },
  {
    id: "p4",
    label: "Expressing Gratitude to Local Host",
    english: "Today's walk away from the crowds was unforgettable. Please accept this small token of our gratitude.",
    context: "Thanking a local hobby host or specialist guide at the end of a tour",
  },
];
