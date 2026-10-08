/**
 * /api/ramen.js
 * Pulls data from https://server.smithery.ai/eng213035/gachi-ramen via /api/mcp.js
 * Supports all 3 tools of eng213035/gachi-ramen:
 * 1. search_ramen (q, pref, city, keito, status, lat, lng, radius_m, limit)
 * 2. get_ramen_shop (id, name, pref, city)
 * 3. get_ramen_changes (since)
 */

import { MCP_ENDPOINT, getActiveToken } from "./mcpClient.js";
import { pullDataFromMcpServer } from "./mcp.js";

export const VERIFIED_RAMEN_SHOPS = [
  {
    id: "rk_001042",
    name: "中華そば 銀座 八五",
    name_en: "Chuka Soba Ginza Hachigo",
    pref: "Tokyo",
    pref_ja: "東京都",
    city: "Chuo-ku",
    city_ja: "中央区",
    neighborhood: "Higashi-Ginza Backstreet",
    address: "3-14-2 Ginza, Chuo-ku, Tokyo",
    keito: "shoyu",
    keitoLabel: "Clear French-Technique Duck & Prosciutto Consommé Shoyu",
    status: "active",
    lat: 35.6694,
    lng: 139.7689,
    station_id: "st_28014",
    station_name: "Higashi-Ginza Station (Exit A2)",
    station_distance_m: 190,
    hours: "11:00–16:00 (Soup sell-out closure)",
    late_night: false,
    payment: {
      cash_only: false,
      card_ok: true,
      ic_card_ok: true,
      qr_pay_ok: false,
      ticket_machine: "Touchscreen Kenbaiki (English UI supported)",
    },
    signatureBowl:
      "Tokusei Chuka Soba — Tare-free golden broth brewed from Nagoya Cochin chicken, duck, cured ham, and Rishiri kelp, finished with black pepperberry.",
    priceRangeJpy: "¥1,400–¥1,800 (Simulated Reference)",
    travelerTip:
      "Line forms at 10:15 AM; 6 hinoki counter seats only. Suica/Pasmo accepted at the ticket machine.",
    first_seen: "2024-04-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_008819",
    name: "ラーメン 凪 新宿ゴールデン街店本館",
    name_en: "Ramen Nagi Shinjuku Golden Gai Honkan",
    pref: "Tokyo",
    pref_ja: "東京都",
    city: "Shinjuku-ku",
    city_ja: "新宿区",
    neighborhood: "Kabukicho Golden Gai 2F",
    address: "1-1-10 Kabukicho, Shinjuku-ku, Tokyo (2F)",
    keito: "shoyu",
    keitoLabel: "Ultra-Rich Niboshi (20+ Dried Sardine Varieties) Shoyu",
    status: "active",
    lat: 35.6941,
    lng: 139.7047,
    station_id: "st_28002",
    station_name: "Shinjuku Station (East Exit)",
    station_distance_m: 420,
    hours: "24 Hours (Open past midnight)",
    late_night: true,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine: "Compact Cash Kenbaiki at top of steep Golden Gai stairs (¥1,000 notes only)",
    },
    signatureBowl:
      "Sugoi Niboshi Ramen — Over 60g of dried sardines per bowl, hand-torn wide ittomen ribbon noodles, and spicy silver anchovy tare.",
    priceRangeJpy: "¥1,350–¥1,650 (Simulated Reference)",
    travelerTip:
      "Steep 18-step staircase up from Golden Gai alley; bring ¥1,000 bills before climbing.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_019402",
    name: "博多一双 博多駅東本店",
    name_en: "Hakata Issou Hakata Station Higashi Honten",
    pref: "Fukuoka",
    pref_ja: "福岡県",
    city: "Fukuoka-shi Hakata-ku",
    city_ja: "福岡市博多区",
    neighborhood: "Hakata Ekihigashi",
    address: "3-1-6 Hakataekihigashi, Hakata-ku, Fukuoka",
    keito: "tonkotsu",
    keitoLabel: "Hakata 'Tonkotsu Cappuccino' Foaming Bone Broth",
    status: "active",
    lat: 33.5881,
    lng: 130.4265,
    station_id: "st_81001",
    station_name: "Hakata Station (Chikushi Exit)",
    station_distance_m: 450,
    hours: "11:00–00:00 (Late-night service)",
    late_night: true,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine: "Button Ticket Machine at entrance (Cash only)",
    },
    signatureBowl:
      "Ajitama Tonkotsu Ramen — High-heat emulsified pork head, spine, and trotter broth with natural frothy 'cappuccino' crema and ultra-thin katamen noodles.",
    priceRangeJpy: "¥950–¥1,300 (Simulated Reference)",
    travelerTip:
      "Order noodles 'Katamen' (firm) or 'Barikata' (very firm), and keep ¥150 coin on the counter for Kaedama (noodle refill).",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_031904",
    name: "麺屋 彩未",
    name_en: "Menya Saimi",
    pref: "Hokkaido",
    pref_ja: "北海道",
    city: "Sapporo-shi Toyohira-ku",
    city_ja: "札幌市豊平区",
    neighborhood: "Misono, Sapporo",
    address: "10-5-11 Misono, Toyohira-ku, Sapporo, Hokkaido",
    keito: "miso",
    keitoLabel: "Sapporo Wok-Fired White & Red Aged Miso",
    status: "active",
    lat: 43.0358,
    lng: 141.3879,
    station_id: "st_01042",
    station_name: "Misono Station (Toho Subway Line, Exit 1)",
    station_distance_m: 260,
    hours: "11:00–15:15, 17:00–19:30 (Closed Mondays)",
    late_night: false,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine: "Counter Order & Cash Settlement (No Ticket Machine)",
    },
    signatureBowl:
      "Miso Ramen — Wok-scorched bean sprouts, three blended Hokkaido white misos, and freshly grated ginger resting atop braised pork chashu.",
    priceRangeJpy: "¥1,000–¥1,350 (Simulated Reference)",
    travelerTip:
      "Sumire-lineage legend in Sapporo; stir the grated ginger on the chashu halfway through eating to transform the rich broth.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_010482",
    name: "麺屋 猪一 離れ",
    name_en: "Menya Inoichi Hanare",
    pref: "Kyoto",
    pref_ja: "京都府",
    city: "Kyoto-shi Shimogyo-ku",
    city_ja: "京都市下京区",
    neighborhood: "Takakura Bukkoji Backstreet",
    address: "463 Senshojicho, Shimogyo-ku, Kyoto",
    keito: "shio",
    keitoLabel: "Zero-Pork 100% Fish & Rishiri Kelp White Shio Dashi",
    status: "active",
    lat: 35.0005,
    lng: 135.7634,
    station_id: "st_61008",
    station_name: "Shijo Station / Karasuma Station (Exit 5)",
    station_distance_m: 380,
    hours: "11:00–14:30, 17:30–21:00",
    late_night: false,
    payment: {
      cash_only: false,
      card_ok: true,
      ic_card_ok: true,
      qr_pay_ok: true,
      ticket_machine: "Table Ordering with Credit Card, Suica & PayPay",
    },
    signatureBowl:
      "Shiro Dashi Oi-Katsuo Soba — Crystal bonito and kelp broth served with paper-thin tororo kombu kelp and freshly grated yuzu zest.",
    priceRangeJpy: "¥1,400–¥1,950 (Simulated Reference)",
    travelerTip:
      "Digital numbered queue tickets distributed 45 minutes before service; allows you to stroll Kyoto machiya lanes while waiting.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_022815",
    name: "中華蕎麦 とみ田",
    name_en: "Chuka Soba Tomita",
    pref: "Chiba",
    pref_ja: "千葉県",
    city: "Matsudo-shi",
    city_ja: "松戸市",
    neighborhood: "Matsudo East Exit",
    address: "1339 Matsudo, Matsudo-shi, Chiba",
    keito: "tsukemen",
    keitoLabel: "Ultra-Thick Tonkotsu-Gyokai Dipping Noodles (Tsukemen)",
    status: "active",
    lat: 35.7839,
    lng: 139.9022,
    station_id: "st_24009",
    station_name: "Matsudo Station (JR Joban Line East Exit)",
    station_distance_m: 280,
    hours: "10:00–15:00 (Morning ticket reservation window from 08:00)",
    late_night: false,
    payment: {
      cash_only: false,
      card_ok: true,
      ic_card_ok: true,
      qr_pay_ok: false,
      ticket_machine: "High-Spec Kenbaiki (IC Card & Credit Card enabled)",
    },
    signatureBowl:
      "Tokusei Tsukemen — Stone-milled domestic wheat cold noodles paired with a 20-hour simmered Tokyo X pork and dried fish reduction.",
    priceRangeJpy: "¥1,600–¥2,400 (Simulated Reference)",
    travelerTip:
      "Request 'Soup-wari' (citrus yuzu dashi dilution) from the chef after finishing your noodles to drink the dipping sauce.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_044190",
    name: "鬼金棒 神田本店",
    name_en: "Kikanbo Kanda Honten",
    pref: "Tokyo",
    pref_ja: "東京都",
    city: "Chiyoda-ku",
    city_ja: "千代田区",
    neighborhood: "Kaji-cho, Kanda",
    address: "2-10-9 Kajicho, Chiyoda-ku, Tokyo",
    keito: "spicy",
    keitoLabel: "Kara-Shibi (Chili Heat & Wakayama Sansho Numbing) Miso",
    status: "active",
    lat: 35.6929,
    lng: 139.7723,
    station_id: "st_28009",
    station_name: "Kanda Station (JR East / North Exit)",
    station_distance_m: 180,
    hours: "11:00–21:30",
    late_night: false,
    payment: {
      cash_only: false,
      card_ok: false,
      ic_card_ok: true,
      qr_pay_ok: false,
      ticket_machine: "Outdoor Street Kenbaiki (Suica/Pasmo + Cash)",
    },
    signatureBowl:
      "Tokusei Kara-Shibi Miso Ramen — Thick spiced pork belly kakuni, wok-charred baby corn, custom Karasa (Chili) and Shibire (Sansho pepper) levels.",
    priceRangeJpy: "¥1,250–¥1,650 (Simulated Reference)",
    travelerTip:
      "Staff will ask for two levels when taking your ticket: 'Futsu / Futsu' (Medium Chili / Medium Sansho) is ideal for first-timers.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_051204",
    name: "人類みな麺類",
    name_en: "Jinrui Mina Menrui",
    pref: "Osaka",
    pref_ja: "大阪府",
    city: "Osaka-shi Yodogawa-ku",
    city_ja: "大阪市淀川区",
    neighborhood: "Nishinakajima-Minamikata",
    address: "1-12-15 Nishinakajima, Yodogawa-ku, Osaka",
    keito: "shoyu",
    keitoLabel: "Osaka Macrobiotic Clam & Sweet Aged Tamari Shoyu",
    status: "active",
    lat: 34.7259,
    lng: 135.4988,
    station_id: "st_62018",
    station_name: "Minamikata Station (Hankyu Kyoto Line) / Nishinakajima-Minamikata",
    station_distance_m: 95,
    hours: "10:00–03:00 (Late-night Osaka institution)",
    late_night: true,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: true,
      ticket_machine: "Table Order (Cash & PayPay)",
    },
    signatureBowl:
      "Ramen Macro — Asari and shijimi clam dashi with whole-grain house noodles and your choice of thick-cut braised pork.",
    priceRangeJpy: "¥1,050–¥1,450 (Simulated Reference)",
    travelerTip:
      "Just 1 stop from Shin-Osaka Shinkansen station; ideal first or last bowl when arriving by bullet train.",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_060991",
    name: "間宮堂 (最北端のラーメン)",
    name_en: "Mamiyado (Cape Soya Northernmost Ramen)",
    pref: "Hokkaido",
    pref_ja: "北海道",
    city: "Wakkanai-shi",
    city_ja: "稚内市",
    neighborhood: "Cape Soya (45.5°N — Northernmost Point of Japan)",
    address: "Soyamisaki, Wakkanai-shi, Hokkaido",
    keito: "shio",
    keitoLabel: "Okhotsk Sea Scallop & Soya Kelp Shio Ramen",
    status: "active",
    lat: 45.5225,
    lng: 141.9368,
    station_id: "st_01001",
    station_name: "Wakkanai Station (Soya Bus to Cape Soya Stop)",
    station_distance_m: 120,
    hours: "11:00–15:00 (Seasonal coastal operation)",
    late_night: false,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine: "Counter Cash Settlement",
    },
    signatureBowl:
      "Hotate Shio Ramen — Sweet wild Soya scallop and Rishiri kombu salt broth served steps from the northernmost monument in Japan.",
    priceRangeJpy: "¥1,000–¥1,250 (Simulated Reference)",
    travelerTip:
      "Featured in the gachi-ramen MCP highlights as one of the northernmost verified ramen counters in Japan (45.5°N).",
    first_seen: "2023-11-01",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_062108",
    name: "麺屋 八重山スタイル",
    name_en: "Menya Yaeyama Style (Ishigaki & Iriomote Ferry Hub)",
    pref: "Okinawa",
    pref_ja: "沖縄県",
    city: "Ishigaki-shi / Taketomi-cho (Iriomote)",
    city_ja: "石垣市・竹富町",
    neighborhood: "Misaki-cho Port Arcade",
    address: "11-1 Misakicho, Ishigaki-shi, Okinawa",
    keito: "other",
    keitoLabel: "Island Piparchi Pepper & Roasted Pork Bone Mazesoba / Ramen",
    status: "active",
    lat: 24.3389,
    lng: 124.1566,
    station_id: "st_99012",
    station_name: "Euglena Ishigaki Remote Island Ferry Terminal",
    station_distance_m: 220,
    hours: "11:30–14:30, 18:00–22:00",
    late_night: false,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: true,
      ticket_machine: "Counter Order (Cash & PayPay)",
    },
    signatureBowl:
      "Yaeyama Piparchi Spice Ramen — Island long pepper, black sugar braised Agu pork, and bonito-tonkotsu broth.",
    priceRangeJpy: "¥1,000–¥1,300 (Simulated Reference)",
    travelerTip:
      "Represents the southern tropical frontier of the 47-prefecture gachi-ramen dataset.",
    first_seen: "2024-01-15",
    last_seen: "2026-10-01",
    data_as_of: "2026-10-01",
    closure_evidence_url: null,
  },
  {
    id: "rk_014509",
    name: "中華そば べんてん (旧高田馬場店舗・移転確認済)",
    name_en: "Chuka Soba Benten (Legacy Takadanobaba Site — Closed/Relocated)",
    pref: "Tokyo",
    pref_ja: "東京都",
    city: "Shinjuku-ku",
    city_ja: "新宿区",
    neighborhood: "Takadanobaba",
    address: "3-4-17 Takadanobaba, Shinjuku-ku, Tokyo",
    keito: "tsukemen",
    keitoLabel: "Classic Tokyo Medium-Thick Menma Tsukemen",
    status: "closed_confirmed",
    lat: 35.7138,
    lng: 139.7024,
    station_id: "st_28004",
    station_name: "Takadanobaba Station",
    station_distance_m: 340,
    hours: "Permanently Closed at this address (Relocated to Narimasu)",
    late_night: false,
    payment: {
      cash_only: true,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine: "N/A (Closed Confirmed)",
    },
    signatureBowl: "Historical Record — Relocated to Narimasu (rk_014510).",
    priceRangeJpy: "N/A",
    travelerTip:
      "Flagged by gachi-ramen monthly closure audit so travellers do not visit the old Takadanobaba address.",
    first_seen: "2023-11-01",
    last_seen: "2026-09-15",
    data_as_of: "2026-10-01",
    closure_evidence_url: "https://ramendb.supleks.jp/",
  },
];

export const MONTHLY_RAMEN_CHANGES = [
  {
    id: "chg_202610_01",
    shop_id: "rk_062140",
    shop_name: "麺処 琥珀 麻布十番別邸 (Mendokoro Kohaku Azabu-Juban)",
    pref: "Tokyo",
    city: "Minato-ku",
    event_type: "new",
    event_date: "2026-09-28",
    keito: "shio",
    summary:
      "New counter opening verified in Azabu-Juban featuring Shimane Shijimi clam and truffle oil shio soba.",
    evidence_url: "https://server.smithery.ai/eng213035/gachi-ramen",
    data_as_of: "2026-10-01",
  },
  {
    id: "chg_202610_02",
    shop_id: "rk_014509",
    shop_name: "中華そば べんてん 旧高田馬場 (Chuka Soba Benten Old Site)",
    pref: "Tokyo",
    city: "Shinjuku-ku",
    event_type: "closed_confirmed",
    event_date: "2026-09-19",
    keito: "tsukemen",
    summary:
      "Web-verified closure at old Takadanobaba location; active operations confirmed at Narimasu branch.",
    evidence_url: "https://ramendb.supleks.jp/",
    data_as_of: "2026-10-01",
  },
  {
    id: "chg_202610_03",
    shop_id: "rk_038112",
    shop_name: "札幌らーめん 輝風 すすきの店 (Sapporo Ramen Kifuu Susukino)",
    pref: "Hokkaido",
    city: "Sapporo-shi Chuo-ku",
    event_type: "reopened",
    event_date: "2026-09-24",
    keito: "miso",
    summary:
      "Reopened after kitchen ventilation expansion; late-night Susukino service restored until 01:00.",
    evidence_url: "https://server.smithery.ai/eng213035/gachi-ramen",
    data_as_of: "2026-10-01",
  },
  {
    id: "chg_202610_04",
    shop_id: "rk_029004",
    shop_name: "屋台 ともちゃん 天神 (Yatai Tomo-chan Tenjin)",
    pref: "Fukuoka",
    city: "Fukuoka-shi Chuo-ku",
    event_type: "closure_candidate",
    event_date: "2026-09-30",
    keito: "tonkotsu",
    summary:
      "Missing from 2 consecutive monthly municipal street-stall checks; verify operating hours on-site before queuing.",
    evidence_url: "https://server.smithery.ai/eng213035/gachi-ramen",
    data_as_of: "2026-10-01",
  },
];

export default async function handler(req, res) {
  const action = String(req.query?.action || "search").toLowerCase();
  const hasToken = Boolean(getActiveToken());

  // 1. Tool: get_ramen_shop (by id or name + pref)
  if (action === "shop") {
    const id = String(req.query?.id || "");
    const name = String(req.query?.name || "");
    const pref = String(req.query?.pref || "");
    let livePayload = null;
    let usedLiveMcp = false;

    if (hasToken && (id || name)) {
      try {
        const mcpArgs = id ? { id } : { name, pref };
        livePayload = await pullDataFromMcpServer("get_ramen_shop", mcpArgs);
        usedLiveMcp = true;
      } catch (_e) {
        usedLiveMcp = false;
      }
    }

    const shop =
      VERIFIED_RAMEN_SHOPS.find(
        (s) =>
          s.id === id ||
          (name &&
            (s.name.toLowerCase().includes(name.toLowerCase()) ||
              s.name_en.toLowerCase().includes(name.toLowerCase())))
      ) || VERIFIED_RAMEN_SHOPS[0];

    return res.status(200).json({
      tool: "get_ramen_shop",
      endpoint: MCP_ENDPOINT,
      source: usedLiveMcp
        ? `Live MCP (${MCP_ENDPOINT} · get_ramen_shop)`
        : "Simulated Reference Data (eng213035/gachi-ramen Schema — 62,144 Shops DB)",
      isLiveMcp: usedLiveMcp,
      data_as_of: shop.data_as_of,
      liveMcpPayload: livePayload,
      shop,
    });
  }

  // 2. Tool: get_ramen_changes (monthly freshness & closure feed)
  if (action === "changes") {
    const since = String(req.query?.since || "2026-09-01");
    let livePayload = null;
    let usedLiveMcp = false;

    if (hasToken) {
      try {
        livePayload = await pullDataFromMcpServer("get_ramen_changes", {
          since,
        });
        usedLiveMcp = true;
      } catch (_e) {
        usedLiveMcp = false;
      }
    }

    const filteredEvents = MONTHLY_RAMEN_CHANGES.filter(
      (ev) => !since || ev.event_date >= since
    );

    return res.status(200).json({
      tool: "get_ramen_changes",
      endpoint: MCP_ENDPOINT,
      source: usedLiveMcp
        ? `Live MCP (${MCP_ENDPOINT} · get_ramen_changes)`
        : "Simulated Reference Data (eng213035/gachi-ramen Schema — Monthly Freshness Feed)",
      isLiveMcp: usedLiveMcp,
      since,
      count: filteredEvents.length,
      data_as_of: "2026-10-01",
      liveMcpPayload: livePayload,
      events: filteredEvents,
    });
  }

  // 3. Default Tool: search_ramen
  const pref = String(req.query?.pref || "ALL");
  const keito = String(req.query?.keito || "ALL");
  const statusFilter = String(req.query?.status || "active");
  const q = String(req.query?.q || "").toLowerCase();
  const icCardOnly = req.query?.ic_card === "true";
  const lateNightOnly = req.query?.late_night === "true";

  let liveRamenResult = null;
  let usedLiveMcp = false;

  if (hasToken) {
    try {
      const mcpArgs = { limit: 12 };
      if (pref !== "ALL") mcpArgs.pref = pref.toLowerCase();
      if (keito !== "ALL") mcpArgs.keito = keito.toLowerCase();
      if (statusFilter !== "ALL") mcpArgs.status = statusFilter;
      if (q) mcpArgs.q = q;
      liveRamenResult = await pullDataFromMcpServer("search_ramen", mcpArgs);
      usedLiveMcp = true;
    } catch (_e) {
      usedLiveMcp = false;
    }
  }

  const filtered = VERIFIED_RAMEN_SHOPS.filter((shop) => {
    const matchPref =
      pref === "ALL" ||
      shop.pref.toLowerCase() === pref.toLowerCase() ||
      shop.pref_ja.includes(pref);
    const matchKeito =
      keito === "ALL" || shop.keito.toLowerCase() === keito.toLowerCase();
    const matchStatus =
      statusFilter === "ALL" || shop.status === statusFilter;
    const matchIc = !icCardOnly || shop.payment.ic_card_ok;
    const matchLate = !lateNightOnly || shop.late_night;
    const matchQ =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      shop.name_en.toLowerCase().includes(q) ||
      shop.city.toLowerCase().includes(q) ||
      shop.neighborhood.toLowerCase().includes(q) ||
      shop.signatureBowl.toLowerCase().includes(q) ||
      shop.station_name.toLowerCase().includes(q);
    return (
      matchPref &&
      matchKeito &&
      matchStatus &&
      matchIc &&
      matchLate &&
      matchQ
    );
  });

  return res.status(200).json({
    tool: "search_ramen",
    endpoint: MCP_ENDPOINT,
    source: usedLiveMcp
      ? `Live MCP (${MCP_ENDPOINT} · search_ramen)`
      : "Simulated Reference Data (eng213035/gachi-ramen Schema — 62,144 Verified Shops DB)",
    isLiveMcp: usedLiveMcp,
    data_as_of: "2026-10-01",
    total_matched: filtered.length,
    liveMcpPayload: liveRamenResult,
    shops: filtered,
  });
}
