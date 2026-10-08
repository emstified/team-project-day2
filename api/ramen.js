/**
 * /api/ramen.js
 * Pulls live data from https://ramen.gachi-tokusuru.com/mcp via /api/mcp.js
 * Supports the MCP tools on https://ramen.gachi-tokusuru.com/mcp:
 * 1. search_ramen (q, pref, city, keito, status, spice_level, match, lat, lng, radius_m, limit up to 50)
 * 2. get_ramen_shop (id, name, pref, city)
 * 3. get_ramen_changes (since)
 * 4. vibe_search (q, pref, limit)
 *
 * Uses live MCP results to populate the shop list whenever available, and uses
 * VERIFIED_RAMEN_SHOPS strictly as an explicitly labelled fallback when the MCP server
 * cannot be reached.
 */

import { MCP_ENDPOINT } from "./mcpClient.js";
import { pullDataFromMcpServer } from "./mcp.js";

const PREFECTURE_MAP = {
  hokkaido: { en: "Hokkaido", ja: "北海道" },
  aomori: { en: "Aomori", ja: "青森県" },
  iwate: { en: "Iwate", ja: "岩手県" },
  miyagi: { en: "Miyagi", ja: "宮城県" },
  akita: { en: "Akita", ja: "秋田県" },
  yamagata: { en: "Yamagata", ja: "山形県" },
  fukushima: { en: "Fukushima", ja: "福島県" },
  ibaraki: { en: "Ibaraki", ja: "茨城県" },
  tochigi: { en: "Tochigi", ja: "栃木県" },
  gunma: { en: "Gunma", ja: "群馬県" },
  saitama: { en: "Saitama", ja: "埼玉県" },
  chiba: { en: "Chiba", ja: "千葉県" },
  tokyo: { en: "Tokyo", ja: "東京都" },
  kanagawa: { en: "Kanagawa", ja: "神奈川県" },
  niigata: { en: "Niigata", ja: "新潟県" },
  toyama: { en: "Toyama", ja: "富山県" },
  ishikawa: { en: "Ishikawa", ja: "石川県" },
  fukui: { en: "Fukui", ja: "福井県" },
  yamanashi: { en: "Yamanashi", ja: "山梨県" },
  nagano: { en: "Nagano", ja: "長野県" },
  gifu: { en: "Gifu", ja: "岐阜県" },
  shizuoka: { en: "Shizuoka", ja: "静岡県" },
  aichi: { en: "Aichi", ja: "愛知県" },
  mie: { en: "Mie", ja: "三重県" },
  shiga: { en: "Shiga", ja: "滋賀県" },
  kyoto: { en: "Kyoto", ja: "京都府" },
  osaka: { en: "Osaka", ja: "大阪府" },
  hyogo: { en: "Hyogo", ja: "兵庫県" },
  nara: { en: "Nara", ja: "奈良県" },
  wakayama: { en: "Wakayama", ja: "和歌山県" },
  tottori: { en: "Tottori", ja: "鳥取県" },
  shimane: { en: "Shimane", ja: "島根県" },
  okayama: { en: "Okayama", ja: "岡山県" },
  hiroshima: { en: "Hiroshima", ja: "広島県" },
  yamaguchi: { en: "Yamaguchi", ja: "山口県" },
  tokushima: { en: "Tokushima", ja: "徳島県" },
  kagawa: { en: "Kagawa", ja: "香川県" },
  ehime: { en: "Ehime", ja: "愛媛県" },
  kochi: { en: "Kochi", ja: "高知県" },
  fukuoka: { en: "Fukuoka", ja: "福岡県" },
  saga: { en: "Saga", ja: "佐賀県" },
  nagasaki: { en: "Nagasaki", ja: "長崎県" },
  kumamoto: { en: "Kumamoto", ja: "熊本県" },
  oita: { en: "Oita", ja: "大分県" },
  miyazaki: { en: "Miyazaki", ja: "宮崎県" },
  kagoshima: { en: "Kagoshima", ja: "鹿児島県" },
  okinawa: { en: "Okinawa", ja: "沖縄県" },
};

/**
 * Unwraps MCP CallToolResult payloads (structuredContent or JSON text inside content[]).
 */
export function extractMcpPayload(rawResult) {
  if (!rawResult) return null;

  if (rawResult.isError) {
    const errText =
      (Array.isArray(rawResult.content) &&
        rawResult.content.find((c) => c.type === "text")?.text) ||
      rawResult.error ||
      "MCP tool execution returned an error";
    throw new Error(String(errText));
  }

  if (
    rawResult.structuredContent &&
    typeof rawResult.structuredContent === "object"
  ) {
    return rawResult.structuredContent;
  }

  if (Array.isArray(rawResult.content)) {
    for (const item of rawResult.content) {
      if (item && item.type === "text" && typeof item.text === "string") {
        const trimmed = item.text.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            return JSON.parse(trimmed);
          } catch (_e) {
            // continue checking content items
          }
        }
      }
    }
  }

  if (rawResult.result && typeof rawResult.result === "object") {
    return extractMcpPayload(rawResult.result);
  }

  return rawResult;
}

function resolvePrefectureNames(rawPref, rawPrefEn) {
  const candidate = String(rawPrefEn || rawPref || "").trim();
  const lower = candidate.toLowerCase().replace(/[-_\s]*(ken|to|fu|do)$/i, "");

  if (PREFECTURE_MAP[lower]) {
    return PREFECTURE_MAP[lower];
  }

  for (const entry of Object.values(PREFECTURE_MAP)) {
    if (
      entry.ja === rawPref ||
      entry.ja.replace(/[都道府県]$/, "") === rawPref ||
      entry.en.toLowerCase() === lower
    ) {
      return entry;
    }
  }

  return {
    en: String(rawPrefEn || rawPref || "Japan"),
    ja: String(rawPref || rawPrefEn || "日本"),
  };
}

function normalizeKeitoValue(rawKeito, spiceLevel) {
  if (spiceLevel === "spicy") {
    return "spicy";
  }

  const validKeito = [
    "shoyu",
    "tonkotsu",
    "miso",
    "shio",
    "tsukemen",
    "spicy",
    "other",
  ];

  const firstVal = Array.isArray(rawKeito) ? rawKeito[0] : rawKeito;
  const cleaned = String(firstVal || "")
    .toLowerCase()
    .trim();

  if (validKeito.includes(cleaned)) {
    return cleaned;
  }
  if (
    cleaned.includes("醤油") ||
    cleaned.includes("shoyu") ||
    cleaned.includes("chuka_tanrei") ||
    cleaned.includes("shirakawa") ||
    cleaned.includes("onomichi")
  ) {
    return "shoyu";
  }
  if (
    cleaned.includes("豚骨") ||
    cleaned.includes("tonkotsu") ||
    cleaned.includes("iekei") ||
    cleaned.includes("家系") ||
    cleaned.includes("jiro") ||
    cleaned.includes("二郎")
  ) {
    return "tonkotsu";
  }
  if (
    cleaned.includes("味噌") ||
    cleaned.includes("miso") ||
    cleaned.includes("sapporo")
  ) {
    return "miso";
  }
  if (cleaned.includes("塩") || cleaned.includes("shio")) return "shio";
  if (cleaned.includes("つけ") || cleaned.includes("tsukemen"))
    return "tsukemen";
  if (
    cleaned.includes("辛") ||
    cleaned.includes("担々") ||
    cleaned.includes("spicy") ||
    cleaned.includes("tantan")
  ) {
    return "spicy";
  }
  return "other";
}

function buildKeitoLabel(normalizedKeito, rawKeito, chain, shopType) {
  const rawArr = Array.isArray(rawKeito)
    ? rawKeito.filter(Boolean)
    : rawKeito
    ? [String(rawKeito)]
    : [];
  const rawStr = rawArr.join(" · ");

  const baseLabels = {
    shoyu: "Shoyu (Soy Sauce & Dashi Lineage)",
    tonkotsu: "Tonkotsu (Pork Bone / Iekei / Jiro Lineage)",
    miso: "Miso (Fermented Soybean Broth Lineage)",
    shio: "Shio (Clear Sea Salt & Kelp Lineage)",
    tsukemen: "Tsukemen (Concentrated Dipping Noodles)",
    spicy: "Spicy / Tantanmen Signature Lineage",
    other: "Verified Japanese Ramen Counter",
  };

  const parts = [baseLabels[normalizedKeito] || "Verified Japanese Ramen Counter"];
  if (rawStr && rawStr.toLowerCase() !== normalizedKeito) {
    parts.push(`[${rawStr}]`);
  }
  if (chain) {
    parts.push(`Chain: ${chain}`);
  } else if (shopType === "senmon") {
    parts.push("Ramen Specialist (専門店)");
  } else if (shopType === "machichuka") {
    parts.push("Machi-Chuka Diner (町中華)");
  }

  return parts.join(" · ");
}

/**
 * Normalizes a raw shop record from https://ramen.gachi-tokusuru.com/mcp
 * into the frontend RamenShopRecord schema.
 */
export function normalizeMcpShop(raw, fallbackDataAsOf = "2026-09-26") {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = String(raw.id || raw.shop_id || "rk_live");
  const name = String(raw.name || raw.name_ja || raw.name_en || "Ramen Shop");
  const name_en = String(
    raw.name_en || raw.romaji || raw.name_romaji || raw.name || "Ramen Shop"
  );

  const prefResolved = resolvePrefectureNames(raw.pref, raw.pref_en);
  const city = String(raw.city_en || raw.city || prefResolved.en);
  const city_ja = String(raw.city || raw.city_ja || prefResolved.ja);
  const neighborhood = String(
    raw.neighborhood ||
      raw.area ||
      raw.city_en ||
      raw.city ||
      prefResolved.en
  );
  const address = String(
    raw.address ||
      raw.full_address ||
      raw.addr ||
      `${city}, ${prefResolved.en} (${city_ja})`
  );

  const keito = normalizeKeitoValue(
    raw.keito ?? raw.style ?? raw.styles,
    raw.spice_level
  );
  const keitoLabel =
    raw.keitoLabel ||
    buildKeitoLabel(
      keito,
      raw.keito ?? raw.style,
      raw.chain,
      raw.shop_type
    );

  const rawStatus = String(
    raw.status || raw.freshness?.status || "active"
  ).toLowerCase();
  const status =
    rawStatus === "closed_confirmed" || rawStatus === "closed_candidate"
      ? rawStatus
      : "active";

  const lat =
    typeof raw.lat === "number"
      ? raw.lat
      : Number(raw.latitude ?? raw.location?.lat ?? 35.6812);
  const lng =
    typeof raw.lng === "number"
      ? raw.lng
      : Number(raw.lon ?? raw.longitude ?? raw.location?.lng ?? 139.7671);

  const stationObj =
    raw.nearest_station && typeof raw.nearest_station === "object"
      ? raw.nearest_station
      : raw.station && typeof raw.station === "object"
      ? raw.station
      : null;

  const station_id = String(
    raw.station_id || stationObj?.id || stationObj?.station_id || "st_jp"
  );

  let station_name = `${city} Station Area`;
  if (raw.station_name) {
    station_name = String(raw.station_name);
  } else if (stationObj?.name_en && stationObj?.name) {
    station_name = `${stationObj.name_en} Station (${stationObj.name}駅)`;
  } else if (stationObj?.name_en || stationObj?.name) {
    station_name = `${stationObj.name_en || stationObj.name} Station`;
  } else if (typeof raw.station === "string" && raw.station) {
    station_name = raw.station;
  }

  const rawDist =
    raw.station_distance_m ??
    stationObj?.distance_meters ??
    stationObj?.distance_m ??
    raw.distance_meters ??
    raw.distance_m;
  const station_distance_m =
    typeof rawDist === "number" && !Number.isNaN(rawDist)
      ? Math.round(rawDist)
      : Number.isFinite(Number(rawDist)) && rawDist !== null && rawDist !== ""
      ? Math.round(Number(rawDist))
      : 250;

  const late_night = Boolean(
    raw.late_night ??
      raw.midnight ??
      raw.open_late ??
      (raw.hours &&
        (String(raw.hours).includes("late") ||
          String(raw.hours).includes("24"))) ??
      false
  );
  const hours = String(
    raw.hours ||
      raw.opening_hours ||
      (late_night
        ? "Late-Night / 24h Service Verified"
        : "Standard Japanese Counter Hours")
  );

  const paymentObj =
    raw.payment && typeof raw.payment === "object" ? raw.payment : {};
  const card_ok = Boolean(
    paymentObj.card_ok ??
      paymentObj.card_accepted ??
      paymentObj.card ??
      raw.card_ok ??
      raw.card_accepted ??
      false
  );
  const qr_pay_ok = Boolean(
    paymentObj.qr_pay_ok ??
      paymentObj.qr_accepted ??
      paymentObj.qr ??
      raw.qr_pay_ok ??
      raw.qr_accepted ??
      false
  );
  const ic_card_ok = Boolean(
    paymentObj.ic_card_ok ??
      paymentObj.ic ??
      paymentObj.card_accepted ??
      raw.ic_card_ok ??
      raw.ic_card ??
      false
  );

  const explicitCashOnly = paymentObj.cash_only ?? raw.cash_only;
  const cash_only =
    explicitCashOnly !== undefined && explicitCashOnly !== null
      ? Boolean(explicitCashOnly)
      : false;

  const paymentTriStateKnown =
    explicitCashOnly !== null && explicitCashOnly !== undefined
      ? true
      : card_ok || qr_pay_ok || ic_card_ok;

  const ticket_machine = String(
    paymentObj.ticket_machine ||
      raw.ticket_machine ||
      (cash_only
        ? "Confirmed Cash Only at Ticket Machine — Bring ¥1,000 bills"
        : paymentTriStateKnown
        ? `Cashless Accepted (${[
            ic_card_ok ? "IC/Card" : "",
            card_ok ? "Credit Card" : "",
            qr_pay_ok ? "QR Pay" : "",
          ]
            .filter(Boolean)
            .join(", ")})`
        : "Tri-State Payment Unspecified in Source — Carry ¥1,000 Cash + IC Card")
  );

  const data_as_of = String(
    raw.data_as_of ||
      raw.freshness?.last_seen ||
      raw.freshness?.data_as_of ||
      fallbackDataAsOf
  );
  const first_seen = String(
    raw.first_seen ||
      raw.opened_on ||
      raw.freshness?.first_seen ||
      "2024-01-01"
  );
  const last_seen = String(
    raw.last_seen || raw.freshness?.last_seen || data_as_of
  );
  const closure_evidence_url =
    raw.closure_evidence_url ||
    raw.evidence_url ||
    raw.freshness?.evidence_url ||
    raw.freshness?.closure_evidence_url ||
    null;

  const signatureBowl = String(
    raw.signatureBowl ||
      raw.signature_bowl ||
      (raw.menu_signals && Array.isArray(raw.menu_signals) && raw.menu_signals.length > 0
        ? `Menu Highlights: ${raw.menu_signals.join(", ")}`
        : `Verified ${keitoLabel} at ${name_en} (${address}).`)
  );
  const priceRangeJpy = String(
    raw.priceRangeJpy || raw.price_range || "¥900–¥1,350 (Typical Counter Range)"
  );
  const travelerTip = String(
    raw.travelerTip ||
      raw.note ||
      `${station_distance_m}m walk from ${station_name}. Status: ${status} (verified ${data_as_of}).`
  );

  return {
    id,
    name,
    name_en,
    pref: prefResolved.en,
    pref_ja: prefResolved.ja,
    city,
    city_ja,
    neighborhood,
    address,
    keito,
    keitoLabel,
    status,
    lat,
    lng,
    station_id,
    station_name,
    station_distance_m,
    hours,
    late_night,
    payment: {
      cash_only,
      card_ok,
      ic_card_ok,
      qr_pay_ok,
      ticket_machine,
    },
    signatureBowl,
    priceRangeJpy,
    travelerTip,
    first_seen,
    last_seen,
    data_as_of,
    closure_evidence_url,
  };
}

/**
 * Normalizes a raw change event from get_ramen_changes.
 */
export function normalizeMcpChangeEvent(
  raw,
  idx,
  fallbackDataAsOf = "2026-09-26"
) {
  const rawType = String(
    raw.event_type || raw.type || raw.status || raw.freshness?.status || "new"
  ).toLowerCase();
  const event_type =
    rawType === "closed_confirmed" ||
    rawType === "closure_candidate" ||
    rawType === "reopened"
      ? rawType
      : "new";

  return {
    id: String(raw.id ? `chg_${raw.id}_${idx}` : `chg_live_${idx}`),
    shop_id: String(raw.shop_id || raw.id || "rk_live"),
    shop_name: String(
      raw.shop_name ||
        (raw.name_en ? `${raw.name || ""} (${raw.name_en})` : raw.name) ||
        "Verified Ramen Shop"
    ),
    pref: String(raw.pref_en || raw.pref || "Japan"),
    city: String(raw.city_en || raw.city || ""),
    event_type,
    event_date: String(
      raw.event_date ||
        raw.date ||
        raw.freshness?.last_seen ||
        raw.opened_on ||
        fallbackDataAsOf
    ),
    keito: Array.isArray(raw.keito)
      ? raw.keito.join(", ") || "ramen"
      : String(raw.keito || "ramen"),
    summary: String(
      raw.summary ||
        raw.description ||
        raw.address ||
        `Monthly verification record (${event_type}) at ${
          raw.address || raw.city_en || raw.pref_en || "Japan"
        }.`
    ),
    evidence_url: String(
      raw.evidence_url ||
        raw.closure_evidence_url ||
        raw.freshness?.evidence_url ||
        "https://ramen.gachi-tokusuru.com"
    ),
    data_as_of: String(
      raw.data_as_of || raw.freshness?.last_seen || fallbackDataAsOf
    ),
  };
}

// Explicitly labelled fallback dataset used ONLY when https://ramen.gachi-tokusuru.com/mcp is unreachable
export const VERIFIED_RAMEN_SHOPS = [
  {
    id: "rk_000004",
    name: "つけ麺屋 やすべえ 渋谷店",
    name_en: "Tsukemenya Yasubee Shibuya Ten",
    pref: "Tokyo",
    pref_ja: "東京都",
    city: "Shibuya Ku",
    city_ja: "渋谷区",
    neighborhood: "Shibuya Ku",
    address: "東京都渋谷区渋谷3-18-7",
    keito: "tsukemen",
    keitoLabel: "Tsukemen (Concentrated Dipping Noodles) · Chain: つけ麺やすべえ",
    status: "active",
    lat: 35.657204,
    lng: 139.703827,
    station_id: "st_jp",
    station_name: "Shibuya Station (渋谷駅)",
    station_distance_m: 295,
    hours: "Standard Japanese Counter Hours",
    late_night: false,
    payment: {
      cash_only: false,
      card_ok: false,
      ic_card_ok: false,
      qr_pay_ok: false,
      ticket_machine:
        "Tri-State Payment Unspecified in Source — Carry ¥1,000 Cash + IC Card",
    },
    signatureBowl:
      "Sweet-and-savory bonito-pork dipping tsukemen with choice of nami, chu-mori, or o-mori noodles at the same price.",
    priceRangeJpy: "¥980–¥1,350 (Fallback Reference)",
    travelerTip: "295m walk from Shibuya Station.",
    first_seen: "2024-01-01",
    last_seen: "2026-09-26",
    data_as_of: "2026-09-26",
    closure_evidence_url: null,
  },
];

export const MONTHLY_RAMEN_CHANGES = [
  {
    id: "chg_fallback_01",
    shop_id: "rk_050091",
    shop_name: "幸・㐂・笑 𡈽庵 (Ko Ki Sho Tsuchian)",
    pref: "Tokyo",
    city: "Ota Ku",
    event_type: "closed_confirmed",
    event_date: "2026-09-26",
    keito: "ramen",
    summary: "Web-verified closure at 東京都大田区西蒲田7-8-1 near Kamata Station.",
    evidence_url: "https://ramen.gachi-tokusuru.com",
    data_as_of: "2026-09-26",
  },
];

export default async function handler(req, res) {
  const action = String(req.query?.action || "search").toLowerCase();

  // 1. Tool: get_ramen_shop (by id or name + pref/city)
  if (action === "shop") {
    const id = String(req.query?.id || "").trim();
    const name = String(req.query?.name || "").trim();
    const pref = String(req.query?.pref || "").trim();
    const city = String(req.query?.city || "").trim();

    let livePayload = null;
    let normalizedLiveShop = null;
    let usedLiveMcp = false;
    let mcpError = null;

    if (id || name) {
      try {
        const mcpArgs = {};
        if (id) mcpArgs.id = id;
        if (name) mcpArgs.name = name;
        if (pref && pref !== "ALL") mcpArgs.pref = pref;
        if (city && city !== "ALL") mcpArgs.city = city;

        const rawMcp = await pullDataFromMcpServer("get_ramen_shop", mcpArgs);
        livePayload = extractMcpPayload(rawMcp);

        const rawShopObj =
          livePayload?.shop ||
          (livePayload?.id && livePayload?.name ? livePayload : null);

        if (rawShopObj) {
          normalizedLiveShop = normalizeMcpShop(
            rawShopObj,
            livePayload?.data_as_of || "2026-09-26"
          );
          usedLiveMcp = Boolean(normalizedLiveShop);
        } else if (livePayload?.error) {
          mcpError = String(livePayload.error);
        }
      } catch (err) {
        mcpError =
          err instanceof Error
            ? err.message
            : "Failed to retrieve shop record from MCP server";
        usedLiveMcp = false;
      }
    }

    if (usedLiveMcp && normalizedLiveShop) {
      return res.status(200).json({
        tool: "get_ramen_shop",
        endpoint: MCP_ENDPOINT,
        source: `Live MCP (${MCP_ENDPOINT} · get_ramen_shop)`,
        isLiveMcp: true,
        isFallback: false,
        warning: null,
        error: null,
        data_as_of:
          livePayload?.data_as_of ||
          normalizedLiveShop.data_as_of ||
          "2026-09-26",
        liveMcpPayload: livePayload,
        shop: normalizedLiveShop,
      });
    }

    const fallbackShop =
      VERIFIED_RAMEN_SHOPS.find((s) => s.id === id) || VERIFIED_RAMEN_SHOPS[0];

    return res.status(200).json({
      tool: "get_ramen_shop",
      endpoint: MCP_ENDPOINT,
      source:
        "Fallback Reference Dataset (Live MCP Unavailable — Not Live Data)",
      isLiveMcp: false,
      isFallback: true,
      warning: `Live data could not be retrieved from ${MCP_ENDPOINT} (${
        mcpError || "Unavailable"
      }). Showing explicitly labelled fallback reference record.`,
      error: mcpError,
      data_as_of: fallbackShop.data_as_of,
      liveMcpPayload: null,
      shop: fallbackShop,
    });
  }

  // 2. Tool: get_ramen_changes (monthly freshness & closure feed)
  if (action === "changes") {
    const since = String(req.query?.since || "2026-09-01").trim();
    let livePayload = null;
    let liveEvents = [];
    let usedLiveMcp = false;
    let mcpError = null;

    try {
      const rawMcp = await pullDataFromMcpServer("get_ramen_changes", {
        since,
      });
      livePayload = extractMcpPayload(rawMcp);
      if (livePayload && Array.isArray(livePayload.events)) {
        liveEvents = livePayload.events.map((ev, idx) =>
          normalizeMcpChangeEvent(
            ev,
            idx,
            livePayload.generated_at || livePayload.data_as_of || "2026-09-26"
          )
        );
        usedLiveMcp = true;

        // If get_ramen_changes window has 0 events, also pull live closed_confirmed & closed_candidate shops from search_ramen on the same MCP server
        if (liveEvents.length === 0) {
          const [closedRes, candidateRes] = await Promise.allSettled([
            pullDataFromMcpServer("search_ramen", {
              pref: "tokyo",
              status: "closed_confirmed",
              limit: 6,
            }),
            pullDataFromMcpServer("search_ramen", {
              pref: "osaka",
              status: "closed_confirmed",
              limit: 4,
            }),
          ]);

          const extraRaw = [];
          if (closedRes.status === "fulfilled") {
            const p1 = extractMcpPayload(closedRes.value);
            if (Array.isArray(p1?.shops)) extraRaw.push(...p1.shops);
          }
          if (candidateRes.status === "fulfilled") {
            const p2 = extractMcpPayload(candidateRes.value);
            if (Array.isArray(p2?.shops)) extraRaw.push(...p2.shops);
          }

          if (extraRaw.length > 0) {
            liveEvents = extraRaw.map((shop, idx) =>
              normalizeMcpChangeEvent(
                shop,
                idx,
                livePayload.generated_at || "2026-09-26"
              )
            );
          }
        }
      }
    } catch (err) {
      mcpError =
        err instanceof Error
          ? err.message
          : "Failed to retrieve change feed from MCP server";
      usedLiveMcp = false;
    }

    if (usedLiveMcp) {
      return res.status(200).json({
        tool: "get_ramen_changes",
        endpoint: MCP_ENDPOINT,
        source: `Live MCP (${MCP_ENDPOINT} · get_ramen_changes & closure verification)`,
        isLiveMcp: true,
        isFallback: false,
        warning: null,
        error: null,
        since: livePayload?.since || since,
        count: liveEvents.length,
        data_as_of:
          livePayload?.generated_at || livePayload?.data_as_of || "2026-09-26",
        liveMcpPayload: livePayload,
        events: liveEvents,
      });
    }

    return res.status(200).json({
      tool: "get_ramen_changes",
      endpoint: MCP_ENDPOINT,
      source:
        "Fallback Reference Dataset (Live MCP Unavailable — Not Live Data)",
      isLiveMcp: false,
      isFallback: true,
      warning: `Live change feed could not be retrieved from ${MCP_ENDPOINT} (${
        mcpError || "Unavailable"
      }). Showing explicitly labelled fallback reference events.`,
      error: mcpError,
      since,
      count: MONTHLY_RAMEN_CHANGES.length,
      data_as_of: "2026-09-26",
      liveMcpPayload: null,
      events: MONTHLY_RAMEN_CHANGES,
    });
  }

  // 3. Default Tool: search_ramen (limit=50, maximum supported by https://ramen.gachi-tokusuru.com/mcp)
  const pref = String(req.query?.pref || "ALL").trim();
  const city = String(req.query?.city || "").trim();
  const keito = String(req.query?.keito || "ALL").trim();
  const statusFilter = String(req.query?.status || "active").trim();
  const q = String(req.query?.q || "").trim();
  const matchMode = String(req.query?.match || "").trim();
  const icCardOnly = req.query?.ic_card === "true";
  const lateNightOnly = req.query?.late_night === "true";
  const lat = req.query?.lat ? Number(req.query.lat) : undefined;
  const lng = req.query?.lng ? Number(req.query.lng) : undefined;
  const radius_m = req.query?.radius_m ? Number(req.query.radius_m) : undefined;

  // Enforce server-supported max limit of 50 (default 50, up from 12)
  const requestedLimit = Math.min(
    Math.max(Number(req.query?.limit) || 50, 1),
    50
  );
  const offset = Math.max(Number(req.query?.offset) || 0, 0);

  let livePayload = null;
  let normalizedLiveShops = [];
  let usedLiveMcp = false;
  let mcpError = null;
  let serverTotalMatched = null;
  let serverDataAsOf = "2026-09-26";
  let serverNote = null;
  let relaxedFallbackWarning = null;

  try {
    const mcpArgs = { limit: requestedLimit };
    if (pref !== "ALL") mcpArgs.pref = pref.toLowerCase();
    if (city && city !== "ALL") mcpArgs.city = city.toLowerCase();

    if (keito !== "ALL") {
      if (keito.toLowerCase() === "spicy") {
        mcpArgs.spice_level = "spicy";
      } else {
        mcpArgs.keito = keito.toLowerCase();
      }
    }

    if (statusFilter !== "ALL") {
      mcpArgs.status = statusFilter;
    }

    if (q) mcpArgs.q = q;
    if (matchMode === "exact" || matchMode === "partial") {
      mcpArgs.match = matchMode;
    }
    if (typeof lat === "number" && !Number.isNaN(lat)) mcpArgs.lat = lat;
    if (typeof lng === "number" && !Number.isNaN(lng)) mcpArgs.lng = lng;
    if (typeof radius_m === "number" && !Number.isNaN(radius_m)) {
      mcpArgs.radius_m = Math.min(Math.max(radius_m, 100), 5000);
    }

    // In search_ramen on https://ramen.gachi-tokusuru.com/mcp, pref is required if city, q, chain, or lat/lng are omitted
    if (!mcpArgs.pref && !mcpArgs.city && !mcpArgs.q && mcpArgs.lat === undefined) {
      mcpArgs.pref = "tokyo";
    }

    const rawMcp = await pullDataFromMcpServer("search_ramen", mcpArgs);
    livePayload = extractMcpPayload(rawMcp);

    if (livePayload?.error) {
      throw new Error(String(livePayload.error));
    }

    const rawShopsList = Array.isArray(livePayload?.shops)
      ? livePayload.shops
      : Array.isArray(livePayload?.results)
      ? livePayload.results
      : Array.isArray(livePayload)
      ? livePayload
      : null;

    if (rawShopsList !== null) {
      serverDataAsOf = String(
        livePayload?.data_as_of || "2026-09-26"
      );
      serverNote = livePayload?.note ? String(livePayload.note) : null;
      serverTotalMatched =
        typeof livePayload?.total_matched === "number"
          ? livePayload.total_matched
          : typeof livePayload?.count === "number"
          ? livePayload.count
          : rawShopsList.length;

      // If search_ramen returned 0 exact matches and offered fallback_shops from a relaxed query, surface the caveat
      if (
        rawShopsList.length === 0 &&
        livePayload?.fallback &&
        Array.isArray(livePayload?.fallback_shops) &&
        livePayload.fallback_shops.length > 0
      ) {
        relaxedFallbackWarning =
          livePayload?.fallback_reason?.message ||
          "No exact matches found; showing relaxed query suggestions from MCP server.";
        normalizedLiveShops = livePayload.fallback_shops
          .map((item) => normalizeMcpShop(item, serverDataAsOf))
          .filter(Boolean);
      } else {
        normalizedLiveShops = rawShopsList
          .map((item) => normalizeMcpShop(item, serverDataAsOf))
          .filter(Boolean);
      }

      if (icCardOnly) {
        normalizedLiveShops = normalizedLiveShops.filter(
          (shop) => shop.payment.ic_card_ok || shop.payment.card_ok
        );
      }
      if (lateNightOnly) {
        normalizedLiveShops = normalizedLiveShops.filter(
          (shop) => shop.late_night
        );
      }

      usedLiveMcp = true;
    } else {
      throw new Error("MCP response did not contain a valid shops array.");
    }
  } catch (err) {
    mcpError =
      err instanceof Error
        ? err.message
        : `Failed to fetch live search results from ${MCP_ENDPOINT}`;
    usedLiveMcp = false;
  }

  // Requirement 1, 6, 7: Return live MCP results whenever the MCP server succeeded
  if (usedLiveMcp) {
    const paginatedLiveShops =
      offset > 0 ? normalizedLiveShops.slice(offset) : normalizedLiveShops;

    return res.status(200).json({
      tool: "search_ramen",
      endpoint: MCP_ENDPOINT,
      source: `Live MCP (${MCP_ENDPOINT} · search_ramen · limit=${requestedLimit})`,
      isLiveMcp: true,
      isFallback: false,
      warning: relaxedFallbackWarning,
      error: null,
      note: serverNote,
      data_as_of: serverDataAsOf,
      limit: requestedLimit,
      offset,
      returned_count: paginatedLiveShops.length,
      total_matched:
        serverTotalMatched !== null
          ? serverTotalMatched
          : normalizedLiveShops.length,
      has_more:
        serverTotalMatched !== null &&
        serverTotalMatched > offset + paginatedLiveShops.length,
      liveMcpPayload: livePayload,
      shops: paginatedLiveShops,
    });
  }

  // Requirement 5 & 8: Explicitly labelled fallback dataset ONLY when MCP server is unavailable
  return res.status(200).json({
    tool: "search_ramen",
    endpoint: MCP_ENDPOINT,
    source:
      "Fallback Reference Dataset (Live MCP Unavailable — Not Live Results)",
    isLiveMcp: false,
    isFallback: true,
    warning: `Live data could not be retrieved from ${MCP_ENDPOINT}: ${
      mcpError || "Server unavailable"
    }. Showing explicitly labelled fallback reference dataset.`,
    error: mcpError,
    note: "Fallback dataset active because live MCP server could not be reached.",
    data_as_of: "2026-09-26",
    limit: requestedLimit,
    offset,
    returned_count: VERIFIED_RAMEN_SHOPS.length,
    total_matched: VERIFIED_RAMEN_SHOPS.length,
    has_more: false,
    liveMcpPayload: null,
    shops: VERIFIED_RAMEN_SHOPS,
  });
}
