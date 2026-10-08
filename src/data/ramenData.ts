import heroRamenImg from "../assets/images/hero_tokyo_ramen_counter_1791447673347.jpg";
import shoyuBowlImg from "../assets/images/bowl_shoyu_dashi_1791447687533.jpg";
import tonkotsuBowlImg from "../assets/images/bowl_hakata_tonkotsu_1791447699394.jpg";
import misoBowlImg from "../assets/images/bowl_sapporo_miso_1791447710968.jpg";

export const RAMEN_IMAGES = {
  heroCounter: heroRamenImg,
  shoyu: shoyuBowlImg,
  tonkotsu: tonkotsuBowlImg,
  miso: misoBowlImg,
};

export interface RamenShopRecord {
  id: string;
  name: string;
  name_en: string;
  pref: string;
  pref_ja: string;
  city: string;
  city_ja: string;
  neighborhood: string;
  address: string;
  keito: "shoyu" | "tonkotsu" | "miso" | "shio" | "tsukemen" | "spicy" | "other";
  keitoLabel: string;
  status: "active" | "closed_candidate" | "closed_confirmed";
  lat: number;
  lng: number;
  station_id: string;
  station_name: string;
  station_distance_m: number;
  hours: string;
  late_night: boolean;
  payment: {
    cash_only: boolean;
    card_ok: boolean;
    ic_card_ok: boolean;
    qr_pay_ok: boolean;
    ticket_machine: string;
  };
  signatureBowl: string;
  priceRangeJpy: string;
  travelerTip: string;
  first_seen: string;
  last_seen: string;
  data_as_of: string;
  closure_evidence_url: string | null;
}

export interface RamenChangeEvent {
  id: string;
  shop_id: string;
  shop_name: string;
  pref: string;
  city: string;
  event_type: "new" | "closure_candidate" | "closed_confirmed" | "reopened";
  event_date: string;
  keito: string;
  summary: string;
  evidence_url: string;
  data_as_of: string;
}

export interface RamenPilgrimageTrail {
  id: string;
  title: string;
  region: string;
  prefecture: string;
  durationLabel: string;
  heroImage: string;
  brothFocus: string;
  summary: string;
  bestTransitPass: string;
  cashAdvisory: string;
  shopIds: string[];
  stops: {
    order: number;
    timeSlot: string;
    shopId: string;
    shopNameEn: string;
    shopNameJa: string;
    stationNote: string;
    whatToOrder: string;
  }[];
}

export const RAMEN_PILGRIMAGE_TRAILS: RamenPilgrimageTrail[] = [
  {
    id: "tokyo-craft-shoyu-niboshi",
    title: "Tokyo Backstreet Shoyu, Niboshi & Kanda Spice Trail",
    region: "Kanto · Tokyo Metropolitan",
    prefecture: "Tokyo",
    durationLabel: "1-Day Metro Crawl (3 Iconic Stops)",
    heroImage: shoyuBowlImg,
    brothFocus: "Clear Consommé Shoyu · 20-Sardine Niboshi · Kara-Shibi Miso",
    summary:
      "Experience the three pillars of modern Tokyo ramen craftsmanship: an 11:00 AM Michelin-pedigree duck-and-kelp consommé in Higashi-Ginza, an afternoon numbing sansho miso bowl near Kanda Station, and a late-night dried sardine bowl upstairs in Shinjuku Golden Gai.",
    bestTransitPass: "Tokyo Metro 24-Hour Ticket (Suica / Pasmo IC Card)",
    cashAdvisory: "Bring at least two ¥1,000 bills for the Golden Gai 2F cash-only ticket machine.",
    shopIds: ["rk_001042", "rk_044190", "rk_008819"],
    stops: [
      {
        order: 1,
        timeSlot: "10:30 AM Queue · 11:00 AM Bowl",
        shopId: "rk_001042",
        shopNameEn: "Chuka Soba Ginza Hachigo",
        shopNameJa: "中華そば 銀座 八五",
        stationNote: "190m (2 min walk) from Higashi-Ginza Station Exit A2",
        whatToOrder: "Tokusei Chuka Soba (IC Card & Credit Card accepted at machine)",
      },
      {
        order: 2,
        timeSlot: "16:30 PM Early Dinner Window (No Queue)",
        shopId: "rk_044190",
        shopNameEn: "Kikanbo Kanda Honten",
        shopNameJa: "鬼金棒 神田本店",
        stationNote: "180m (2 min walk) from JR Kanda Station North Exit",
        whatToOrder: "Tokusei Kara-Shibi Miso Ramen — Request 'Futsu / Futsu' spice level",
      },
      {
        order: 3,
        timeSlot: "22:30 PM Late-Night Finale",
        shopId: "rk_008819",
        shopNameEn: "Ramen Nagi Shinjuku Golden Gai Honkan",
        shopNameJa: "ラーメン 凪 新宿ゴールデン街店本館",
        stationNote: "420m (5 min walk) from Shinjuku Station East Exit",
        whatToOrder: "Sugoi Niboshi Ramen (Cash ¥1,000 bill required at top of stairs)",
      },
    ],
  },
  {
    id: "kyushu-kansai-tonkotsu-dashi",
    title: "Shinkansen Westward: Kyoto Kelp, Osaka Clam & Hakata Tonkotsu",
    region: "Kansai to Kyushu · Kyoto, Osaka & Fukuoka",
    prefecture: "Fukuoka",
    durationLabel: "2-Day West Japan Rail Route",
    heroImage: tonkotsuBowlImg,
    brothFocus: "Zero-Pork Shiro Dashi · Macrobiotic Clam Shoyu · Foaming Hakata Tonkotsu",
    summary:
      "Follow the Tokaido-Sanyo Shinkansen corridor from Kyoto's delicate bonito-and-kelp shio broth to Osaka's late-night clam shoyu, culminating in Fukuoka's legendary foaming 'tonkotsu cappuccino' steps from Hakata Station.",
    bestTransitPass: "JR Sanyo-San'in Area Pass or SmartEX Shinkansen IC Link",
    cashAdvisory: "Keep ¥1,000 notes + ¥150 in coins ready for Hakata Kaedama (noodle refills).",
    shopIds: ["rk_010482", "rk_051204", "rk_019402"],
    stops: [
      {
        order: 1,
        timeSlot: "Day 1 · 11:30 AM Kyoto Machiya Lunch",
        shopId: "rk_010482",
        shopNameEn: "Menya Inoichi Hanare",
        shopNameJa: "麺屋 猪一 離れ",
        stationNote: "380m from Shijo / Karasuma Station Exit 5",
        whatToOrder: "Shiro Dashi Oi-Katsuo Soba with freshly shaved bonito & yuzu",
      },
      {
        order: 2,
        timeSlot: "Day 1 · 21:00 PM Shin-Osaka Connection Stop",
        shopId: "rk_051204",
        shopNameEn: "Jinrui Mina Menrui",
        shopNameJa: "人類みな麺類",
        stationNote: "95m from Minamikata Station (1 stop from Shin-Osaka)",
        whatToOrder: "Ramen Macro (Clam Dashi Shoyu) with thick-cut braised chashu",
      },
      {
        order: 3,
        timeSlot: "Day 2 · 19:30 PM Hakata Arrival Bowl",
        shopId: "rk_019402",
        shopNameEn: "Hakata Issou Hakata Station Higashi Honten",
        shopNameJa: "博多一双 博多駅東本店",
        stationNote: "450m from JR Hakata Station Chikushi Exit",
        whatToOrder: "Ajitama Tonkotsu Ramen ordered 'Katamen' (firm noodles)",
      },
    ],
  },
  {
    id: "hokkaido-northern-frontier",
    title: "Hokkaido Wok-Fired Miso & 45.5°N Northernmost Ramen Quest",
    region: "Hokkaido · Sapporo & Cape Soya (Wakkanai)",
    prefecture: "Hokkaido",
    durationLabel: "2-Day Northern Frontier Route",
    heroImage: misoBowlImg,
    brothFocus: "Sapporo Roasted White/Red Miso · Okhotsk Scallop & Soya Kelp Shio",
    summary:
      "Pair Sapporo's most celebrated Sumire-lineage wok-fired ginger miso bowl with a bucket-list journey to Cape Soya (45.5°N) for Japan's northernmost verified bowl of scallop and kombu shio ramen.",
    bestTransitPass: "JR Hokkaido Rail Pass (Sapporo to Wakkanai Limited Express Soya)",
    cashAdvisory: "Both Hokkaido counters are strictly cash-only; withdraw yen at 7-Eleven ATM before boarding.",
    shopIds: ["rk_031904", "rk_060991"],
    stops: [
      {
        order: 1,
        timeSlot: "Day 1 · 11:15 AM Sapporo Misono Lunch",
        shopId: "rk_031904",
        shopNameEn: "Menya Saimi",
        shopNameJa: "麺屋 彩未",
        stationNote: "260m from Misono Subway Station Exit 1 (Toho Line)",
        whatToOrder: "Miso Ramen with grated ginger & wok-seared bean sprouts",
      },
      {
        order: 2,
        timeSlot: "Day 2 · 12:30 PM Cape Soya 45.5°N Coastal Bowl",
        shopId: "rk_060991",
        shopNameEn: "Mamiyado (Cape Soya Northernmost Ramen)",
        shopNameJa: "間宮堂 (最北端のラーメン)",
        stationNote: "120m from Cape Soya Monument Bus Stop, Wakkanai",
        whatToOrder: "Hotate Shio Ramen (Wild Okhotsk Scallop & Soya Kelp)",
      },
    ],
  },
];

export interface KenbaikiButton {
  id: string;
  kanji: string;
  romaji: string;
  english: string;
  typicalPriceJpy: number;
  category: "Base Bowl" | "Topping" | "Refill & Side";
  explanation: string;
}

export const KENBAIKI_TICKET_BUTTONS: KenbaikiButton[] = [
  {
    id: "tokusei",
    kanji: "特製らーめん",
    romaji: "Tokusei Ramen",
    english: "Chef's Special (All-Star Toppings)",
    typicalPriceJpy: 1450,
    category: "Base Bowl",
    explanation:
      "Top-left big button on most ticket machines. Includes extra chashu pork, a seasoned ajitama egg, extra nori seaweed, and menma.",
  },
  {
    id: "nami",
    kanji: "らーめん (並)",
    romaji: "Ramen (Nami)",
    english: "Standard Regular Bowl",
    typicalPriceJpy: 1050,
    category: "Base Bowl",
    explanation:
      "Standard portion (usually 140g–160g dry noodle weight) with classic toppings.",
  },
  {
    id: "tsukemen",
    kanji: "つけ麺",
    romaji: "Tsukemen",
    english: "Chilled Noodles + Rich Dipping Broth",
    typicalPriceJpy: 1250,
    category: "Base Bowl",
    explanation:
      "Thick noodles served cold alongside a concentrated hot dipping soup. Ask for 'Soup-wari' dashi at the end!",
  },
  {
    id: "ajitama",
    kanji: "味玉",
    romaji: "Ajitama",
    english: "Jammy Soy-Marinated Egg",
    typicalPriceJpy: 150,
    category: "Topping",
    explanation:
      "Soft-boiled egg steeped in sweet soy mirin tare. Already included if you picked Tokusei.",
  },
  {
    id: "chashu",
    kanji: "チャーシュー増し",
    romaji: "Chashu-mashi",
    english: "Extra Braised / Seared Pork",
    typicalPriceJpy: 350,
    category: "Topping",
    explanation:
      "Adds 2–4 extra slices of pork belly or sous-vide pork loin.",
  },
  {
    id: "kaedama",
    kanji: "替玉",
    romaji: "Kaedama",
    english: "Second Helping of Noodles (Keep Your Broth!)",
    typicalPriceJpy: 150,
    category: "Refill & Side",
    explanation:
      "Essential in Hakata tonkotsu shops: do NOT finish all your soup—call out 'Kaedama' when 1/3 of your noodles remain.",
  },
];

export const COUNTER_PHRASES = [
  {
    id: "katamen",
    situation: "When handing your paper ticket to the chef",
    japanese: "麺かためでお願いします",
    romaji: "Men katame de onegaishimasu",
    english: "Firm noodles, please (ideal al-dente texture).",
  },
  {
    id: "kaedama-call",
    situation: "Ordering a fresh noodle refill into your remaining broth",
    japanese: "すみません、替玉をかためでお願いします",
    romaji: "Sumimasen, kaedama wo katame de onegaishimasu",
    english: "Excuse me, one noodle refill (firm), please.",
  },
  {
    id: "soup-wari",
    situation: "After finishing Tsukemen dipping noodles",
    japanese: "スープ割りをお願いします",
    romaji: "Suupu-wari wo onegaishimasu",
    english: "Hot dashi broth dilution for my dipping bowl, please.",
  },
  {
    id: "gochisousama",
    situation: "Wiping your counter space & leaving the shop",
    japanese: "ごちそうさまでした！美味しかったです",
    romaji: "Gochisousama deshita! Oishikatta desu",
    english: "Thank you for the feast! It was delicious.",
  },
];
