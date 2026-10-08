import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import healthHandler, { checkMcpAndServicesHealth } from "./api/health.js";
import {
  MCP_ENDPOINT,
  createSmitheryOAuthUrl,
  exchangeSmitheryOAuthCode,
  probeAndListMcpTools,
  callSmitheryMcpTool,
  clearActiveToken,
  getActiveToken,
} from "./api/mcpClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Simulated Reference Datasets matching the exact schemas of the 4 Smithery MCP tools
const SIMULATED_SEASONS_BY_CITY: Record<
  string,
  {
    city: string;
    country: "Japan" | "South Korea";
    seasonHighlight: string;
    koyoOrSakuraStatus: string;
    tempC: number;
    condition: string;
    isRainy: boolean;
    advisory: string;
    festivals: { name: string; dates: string; crowdTip: string }[];
    fruitFarms: { name: string; fruit: string; season: string; region: string }[];
    forecast: { date: string; maxTemp: number; minTemp: number; precipProb: number; condition: string }[];
  }
> = {
  kyoto: {
    city: "Kyoto",
    country: "Japan",
    seasonHighlight: "Autumn Momiji (Koyo) Peak & Daitoku-ji Evening Illumination",
    koyoOrSakuraStatus: "Koyo Forecast: Peak crimson maple foliage Nov 12–Nov 28 across Northern Kyoto temples",
    tempC: 17,
    condition: "Crisp Twilight Air",
    isRainy: false,
    advisory:
      "Clear conditions for after-hours temple garden walks; toggle Rainy Swap to preview covered machiya tea sanctuaries.",
    festivals: [
      {
        name: "Jidai Matsuri & Kurama Fire Festival Season",
        dates: "Late October – November",
        crowdTip: "Skip main daytime parade; book private evening sub-temple viewing in Kita Ward.",
      },
    ],
    fruitFarms: [
      {
        name: "Tambabashi Heritage Orchard (Simulated Ref)",
        fruit: "Kyoto Sweet Persimmons (Kaki) & Japanese Pears",
        season: "October – November",
        region: "Southern Kyoto Basin",
      },
    ],
    forecast: [
      { date: "Day 1", maxTemp: 19, minTemp: 11, precipProb: 15, condition: "Crisp & Clear" },
      { date: "Day 2", maxTemp: 18, minTemp: 10, precipProb: 20, condition: "Partly Clouded" },
      { date: "Day 3", maxTemp: 16, minTemp: 9, precipProb: 60, condition: "Autumn Mist & Showers" },
    ],
  },
  tokyo: {
    city: "Tokyo",
    country: "Japan",
    seasonHighlight: "Meiji Gaien Ginkgo Gold & Yanaka Backstreet Craft Season",
    koyoOrSakuraStatus: "Koyo Forecast: Golden ginkgo avenues peak Nov 18–Dec 3; early Kawazu sakura late Feb",
    tempC: 18,
    condition: "Clear Evening Sky",
    isRainy: false,
    advisory:
      "Pleasant evening temperatures for Shimokitazawa vinyl kissa and backstreet ramen walks.",
    festivals: [
      {
        name: "Tori-no-Ichi Rooster Shrine Night Fair",
        dates: "November Evening Cycle",
        crowdTip: "Enter after 21:30 via backstreet approach to avoid main torii queue.",
      },
    ],
    fruitFarms: [
      {
        name: "Mitaka Urban Kiwi & Citrus Farm (Simulated Ref)",
        fruit: "Tokyo Gold Kiwi & Yuzu",
        season: "October – December",
        region: "Western Tokyo",
      },
    ],
    forecast: [
      { date: "Day 1", maxTemp: 20, minTemp: 12, precipProb: 10, condition: "Clear Sky" },
      { date: "Day 2", maxTemp: 19, minTemp: 11, precipProb: 20, condition: "Light Clouds" },
      { date: "Day 3", maxTemp: 17, minTemp: 10, precipProb: 55, condition: "Evening Rain" },
    ],
  },
  nagano: {
    city: "Nagano",
    country: "Japan",
    seasonHighlight: "Togakushi Alpine Cedar & Crimson Ravine Onsen Season",
    koyoOrSakuraStatus: "Koyo Now: High-elevation maples at full peak color across Togakushi & Obuse",
    tempC: 12,
    condition: "Alpine Morning Mist",
    isRainy: false,
    advisory:
      "Cool alpine air ideal for private open-air rotenburo soaking and soba milling.",
    festivals: [
      {
        name: "Obuse的新栗 (New Chestnut) Harvest & Soba Matsuri",
        dates: "October – November",
        crowdTip: "Visit private village soba mill at 08:30 before highway coaches arrive.",
      },
    ],
    fruitFarms: [
      {
        name: "Obuse Shinshu Apple & Shine Muscat Orchard (Simulated Ref)",
        fruit: "San Fuji Apples & Nagano Purple Grapes",
        season: "October – November",
        region: "Kamitakai District, Nagano",
      },
    ],
    forecast: [
      { date: "Day 1", maxTemp: 14, minTemp: 5, precipProb: 20, condition: "Alpine Sun & Mist" },
      { date: "Day 2", maxTemp: 13, minTemp: 4, precipProb: 50, condition: "Mountain Showers" },
      { date: "Day 3", maxTemp: 15, minTemp: 6, precipProb: 15, condition: "Crisp & Clear" },
    ],
  },
  seoul: {
    city: "Seoul",
    country: "South Korea",
    seasonHighlight: "Seochon Hanok Ginkgo Gold & Changdeokgung Moonlight Window",
    koyoOrSakuraStatus: "Autumn Danpung: Peak crimson maples & golden ginkgo along Inwangsan & Secret Garden",
    tempC: 15,
    condition: "Clear Mountain Breeze",
    isRainy: false,
    advisory:
      "Ideal visibility for after-hours Changdeokgung palace lantern walks and Seochon tea courtyards.",
    festivals: [
      {
        name: "Changdeokgung Moonlight Tour & Jongno Craft Week",
        dates: "October – November Evenings",
        crowdTip: "Capped night entry permit eliminates 95% of daytime palace crowds.",
      },
    ],
    fruitFarms: [
      {
        name: "Namyangju Heritage Pear Orchard (Simulated Ref)",
        fruit: "Korean Shingo Pears & Persimmons",
        season: "October – November",
        region: "Gyeonggi-do (40m from Seoul)",
      },
    ],
    forecast: [
      { date: "Day 1", maxTemp: 17, minTemp: 9, precipProb: 10, condition: "Crisp & Clear" },
      { date: "Day 2", maxTemp: 16, minTemp: 8, precipProb: 25, condition: "High Mountain Clouds" },
      { date: "Day 3", maxTemp: 14, minTemp: 7, precipProb: 55, condition: "Light Rain Showers" },
    ],
  },
  jeju: {
    city: "Jeju Island",
    country: "South Korea",
    seasonHighlight: "Silver Eulalia Grass (Eoksae) & Basalt Coastal Haenyeo Harvest",
    koyoOrSakuraStatus: "Hallasan Slopes: Silver grass blooming across eastern volcanic oreum cones",
    tempC: 19,
    condition: "Golden Coastal Breeze",
    isRainy: false,
    advisory:
      "Mild coastal breeze along Gujwa-eup basalt trails and haenyeo stone fire-pit dining.",
    festivals: [
      {
        name: "Jeju Haenyeo Sea-Diver Heritage Gathering",
        dates: "Autumn Coastal Window",
        crowdTip: "Book private village bulteok hearth dinner in Hado-ri away from resort buffets.",
      },
    ],
    fruitFarms: [
      {
        name: "Seogwipo Volcanic Hallabong & Green Tangerine Farm (Simulated Ref)",
        fruit: "Jeju Hallabong & Cheonggyul Tangerines",
        season: "October – January",
        region: "East Seogwipo, Jeju",
      },
    ],
    forecast: [
      { date: "Day 1", maxTemp: 21, minTemp: 14, precipProb: 15, condition: "Coastal Sun" },
      { date: "Day 2", maxTemp: 20, minTemp: 13, precipProb: 30, condition: "Sea Breeze" },
      { date: "Day 3", maxTemp: 18, minTemp: 12, precipProb: 60, condition: "Passing Island Shower" },
    ],
  },
};

// Cabinet Office (内閣府) National Holidays Reference (kakar-satoshi/japan-holiday-mcp schema)
const UPCOMING_JAPAN_HOLIDAYS = [
  {
    date: "2026-10-12",
    nameJa: "スポーツの日",
    nameEn: "Sports Day (Health & Sports Day)",
    isThreeDayWeekend: true,
    crowdImpact: "High domestic rail & shrine congestion 10:00–16:00",
    afterHoursStrategy: "Shift Kyoto & Tokyo shrine visits to 06:30 Dawn or 18:00+ After-Hours charter.",
  },
  {
    date: "2026-11-03",
    nameJa: "文化の日",
    nameEn: "Culture Day",
    isThreeDayWeekend: false,
    crowdImpact: "Peak autumn foliage crowds at public museums and daytime temples",
    afterHoursStrategy: "Book private Nishijin textile studio & Daitoku-ji evening candlelit entry.",
  },
  {
    date: "2026-11-23",
    nameJa: "勤労感謝の日",
    nameEn: "Labour Thanksgiving Day",
    isThreeDayWeekend: true,
    crowdImpact: "Peak Momiji 3-day weekend surge across Kyoto & Hakone",
    afterHoursStrategy: "Route to Nagano Togakushi cedar valley or private Seochon hanok courtyard.",
  },
  {
    date: "2027-01-01",
    nameJa: "元日",
    nameEn: "New Year's Day (Hatsumode)",
    isThreeDayWeekend: true,
    crowdImpact: "Major Hatsumode queues at famous shrines",
    afterHoursStrategy: "Visit neighborhood clan shrines in Yanaka or private ryokan rotenburo.",
  },
  {
    date: "2027-01-11",
    nameJa: "成人の日",
    nameEn: "Coming of Age Day",
    isThreeDayWeekend: true,
    crowdImpact: "Elevated Shinkansen & city center traffic",
    afterHoursStrategy: "Reserve Green Car seats 30 days ahead & schedule twilight walking routes.",
  },
];

// Gachi-Ramen Reference Database (eng213035/gachi-ramen schema)
const SIMULATED_RAMEN_SHOPS = [
  {
    id: "rk_010482",
    name: "Menya Inoichi Hanare (Backstreet Dashi Atelier)",
    city: "Kyoto",
    pref: "Kyoto",
    keito: "Clear Shoyu / Wakayama & Rishiri Kelp Dashi",
    neighborhood: "Shimogyo Backstreet (6 mins from Karasuma)",
    hours: "17:30–22:30 (Best quiet window: 20:45)",
    crowdNote: "Michelin Bib Gourmand lineage; 10 counter seats with zero tour groups",
    signatureBowl: "A4 Wagyu & White Soy Kelp Broth Ramen with freshly grated yuzu peel",
    data_as_of: "2026-10 (Simulated Reference — eng213035/gachi-ramen Schema)",
  },
  {
    id: "rk_004918",
    name: "Chuka Soba Kotetsu (Shimokitazawa Vinyl Alley)",
    city: "Tokyo",
    pref: "Tokyo",
    keito: "Niboshi & Aged Tamari Shoyu",
    neighborhood: "Setagaya · Shimokitazawa Backlane",
    hours: "18:00–00:30 (Ideal after jazz kissa session)",
    crowdNote: "95% local neighborhood musicians & vinyl collectors",
    signatureBowl: "Charcoal-grilled chashu & hand-kneaded high-hydration bamboo-pressed noodles",
    data_as_of: "2026-10 (Simulated Reference — eng213035/gachi-ramen Schema)",
  },
  {
    id: "rk_029310",
    name: "Shinshu Miso Kura-Men Takamura",
    city: "Nagano",
    pref: "Nagano",
    keito: "3-Year Cedar-Barrel Aged Shinshu Miso",
    neighborhood: "Obuse / Nagano Old Post Town Lane",
    hours: "11:30–14:30, 17:30–21:00",
    crowdNote: "Family-friendly tatami alcove available; warm refuge on snowy/rainy alpine days",
    signatureBowl: "Roasted Shinshu miso broth topped with wild mountain bamboo shoots & buttered corn",
    data_as_of: "2026-10 (Simulated Reference — eng213035/gachi-ramen Schema)",
  },
  {
    id: "rk_041209",
    name: "ramen_ya Kamo to Negi Ura-Roji",
    city: "Tokyo",
    pref: "Tokyo",
    keito: "Pure Duck & Roasted Green Onion (Kamo Shoyu)",
    neighborhood: "Ueno / Yanaka Border Backstreet",
    hours: "17:00–23:00",
    crowdNote: "Only 3 ingredients in broth (duck, water, heirloom negi); low crowd after 20:30",
    signatureBowl: "Confit duck breast & charred White Senju negi in crystal duck consommé",
    data_as_of: "2026-10 (Simulated Reference — eng213035/gachi-ramen Schema)",
  },
];

// Tokyo Restroom, Live Train Status & Station Hazard Reference (eng213035/tokyo-restroom schema)
const SIMULATED_STATION_COMFORT = [
  {
    station: "Shinjuku Station",
    city: "Shinjuku-ku, Tokyo",
    restrooms: [
      {
        location: "Tokyo Metro Marunouchi Line B1F · 11m from Exit A8",
        gateAccess: "Outside Ticket Gates (Immediate Street Access)",
        wheelchairAccessible: true,
        diaperTable: true,
        ostomate: true,
        babyChair: true,
        cleanlinessNote: "Newly renovated multipurpose suite; ideal for families & seniors.",
      },
      {
        location: "JR South Gate Concourse 2F · Near Midori-no-Madoguchi",
        gateAccess: "Inside Ticket Gates",
        wheelchairAccessible: true,
        diaperTable: true,
        ostomate: true,
        babyChair: true,
        cleanlinessNote: "Wide stroller entry with automatic sliding door.",
      },
    ],
    trainStatus: {
      line: "JR Yamanote, Chuo & Narita Express / Metro Marunouchi",
      status: "Normal Operation (On Schedule)",
      crowdTip: "Use Car 1 or Car 11 after 19:30 for lowest passenger density.",
    },
    hazardAlert: {
      jmaStatus: "No Active River Flood or Landslide Warnings",
      elevationSafety: "High-ground concourse (37m ASL); designated rain shelter arcade.",
    },
  },
  {
    station: "Shibuya Station (The Tokyo Toilet Architectural Route)",
    city: "Shibuya-ku, Tokyo",
    restrooms: [
      {
        location: "Nabeshima Shoto Park & Jingumae Sanctuary Restrooms (Kengo Kuma / Tadao Ando)",
        gateAccess: "Public Park / Outside Gates (8m walk along quiet backstreet)",
        wheelchairAccessible: true,
        diaperTable: true,
        ostomate: true,
        babyChair: true,
        cleanlinessNote: "Architectural cedar-louvered pavilion maintained 3x daily by Nippon Foundation.",
      },
    ],
    trainStatus: {
      line: "Tokyo Metro Ginza, Hanzomon & Fukutoshin Lines",
      status: "Normal Operation (On Schedule)",
      crowdTip: "Use Exit B1 towards Aoyama/Shoto to bypass Hachiko Crossing crowds completely.",
    },
    hazardAlert: {
      jmaStatus: "No Active JMA Weather Warnings",
      elevationSafety: "Underground B2F drainage vault upgraded; use Hikarie elevator for step-free high ground.",
    },
  },
  {
    station: "Tokyo Station / Kanda Backstreet Corridor",
    city: "Chiyoda-ku, Tokyo",
    restrooms: [
      {
        location: "Marunouchi North Dome 1F Multipurpose Lounge & Kanda North Exit",
        gateAccess: "Outside Ticket Gates (Step-Free Ground Level)",
        wheelchairAccessible: true,
        diaperTable: true,
        ostomate: true,
        babyChair: true,
        cleanlinessNote: "Equipped with private nursing room, warm water washlet, and luggage space.",
      },
    ],
    trainStatus: {
      line: "Hokuriku & Tokaido Shinkansen (Nagano / Kyoto Corridors)",
      status: "Normal Operation (On Schedule)",
      crowdTip: "Enter via Marunouchi North Gate for direct elevator access to Shinkansen platforms.",
    },
    hazardAlert: {
      jmaStatus: "No Active JMA Warnings",
      elevationSafety: "All-weather underground connection to Otemachi & Marunouchi hotels.",
    },
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 0. Health Monitor (/api/health and /api/health.js)
  app.get(["/api/health", "/api/health.js"], (req, res) => {
    healthHandler(req, res);
  });

  // 1. Smithery MCP OAuth 2.0 PKCE Authorization URL Generator
  app.get("/api/mcp/oauth/url", async (req, res) => {
    try {
      const origin = String(req.query.origin || process.env.APP_URL || "http://localhost:3000");
      const authData = await createSmitheryOAuthUrl(origin);
      res.json(authData);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize Smithery OAuth";
      res.status(500).json({ error: message });
    }
  });

  // 2. OAuth 2.0 Popup Callback Route (/auth/callback)
  const oauthCallbackHandler = async (req: express.Request, res: express.Response) => {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const errorParam = String(req.query.error || "");

    if (errorParam) {
      res.send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>Smithery MCP Authorization Declined</h3>
    <p>${errorParam}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorParam)} }, '*');
        setTimeout(() => window.close(), 1200);
      }
    </script>
  </body>
</html>`);
      return;
    }

    try {
      await exchangeSmitheryOAuthCode(code, state);
      await probeAndListMcpTools();

      res.send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>Smithery MCP Connected</h3>
    <p>Authenticated with https://mcp.smithery.ai/linpeiyun-emily. Closing window...</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
</html>`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "OAuth token exchange failed";
      res.status(400).send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>Authentication Error</h3>
    <p>${msg}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(msg)} }, '*');
      }
    </script>
  </body>
</html>`);
    }
  };

  app.get(["/auth/callback", "/auth/callback/"], oauthCallbackHandler);

  // 3. Disconnect Smithery OAuth Session
  app.post("/api/mcp/disconnect", (_req, res) => {
    clearActiveToken();
    res.json({ disconnected: true });
  });

  // 4. Lightweight Connection Status Check for Header Indicator
  app.get("/api/mcp/status", async (_req, res) => {
    const health = await checkMcpAndServicesHealth();
    res.json(health);
  });

  // 5. Seasons, Weather & National Holidays Endpoint
  // Powered by haomingkoo/japan-seasons-mcp + kakar-satoshi/japan-holiday-mcp on https://mcp.smithery.ai/linpeiyun-emily
  app.get("/api/seasons-holidays", async (req, res) => {
    const cityKey = String(req.query.city || "kyoto").toLowerCase();
    const checkDate = String(req.query.date || "2026-11-03");
    const baseData = SIMULATED_SEASONS_BY_CITY[cityKey] || SIMULATED_SEASONS_BY_CITY.kyoto;

    const hasToken = Boolean(getActiveToken());
    let liveWeatherOutput: unknown = null;
    let liveKoyoOutput: unknown = null;
    let liveHolidaysOutput: unknown = null;
    let liveDateHolidayCheck: unknown = null;
    let usedLiveMcp = false;

    if (hasToken) {
      try {
        const [weatherRes, koyoRes, nextHolRes, isHolRes] = await Promise.allSettled([
          callSmitheryMcpTool("weather_forecast", { city: baseData.city }),
          callSmitheryMcpTool("koyo_now", { region: baseData.city }),
          callSmitheryMcpTool("get_next_holidays", { count: 5 }),
          callSmitheryMcpTool("is_holiday", { date: checkDate }),
        ]);

        if (weatherRes.status === "fulfilled") {
          liveWeatherOutput = weatherRes.value;
          usedLiveMcp = true;
        }
        if (koyoRes.status === "fulfilled") {
          liveKoyoOutput = koyoRes.value;
          usedLiveMcp = true;
        }
        if (nextHolRes.status === "fulfilled") {
          liveHolidaysOutput = nextHolRes.value;
          usedLiveMcp = true;
        }
        if (isHolRes.status === "fulfilled") {
          liveDateHolidayCheck = isHolRes.value;
          usedLiveMcp = true;
        }
      } catch (_e) {
        usedLiveMcp = false;
      }
    }

    const matchedHoliday = UPCOMING_JAPAN_HOLIDAYS.find((h) => h.date === checkDate) || null;

    res.json({
      source: usedLiveMcp
        ? `Live Smithery MCP (${MCP_ENDPOINT} · japan-seasons-mcp & japan-holiday-mcp)`
        : "Simulated Reference Data (haomingkoo/japan-seasons-mcp & kakar-satoshi/japan-holiday-mcp Schema)",
      isLiveMcp: usedLiveMcp,
      city: baseData.city,
      country: baseData.country,
      seasonHighlight: baseData.seasonHighlight,
      koyoOrSakuraStatus: baseData.koyoOrSakuraStatus,
      current: {
        tempC: baseData.tempC,
        condition: baseData.condition,
        isRainy: baseData.isRainy,
        advisory: baseData.advisory,
      },
      festivals: baseData.festivals,
      fruitFarms: baseData.fruitFarms,
      forecast: baseData.forecast,
      holidayCheck: {
        checkedDate: checkDate,
        isNationalHoliday: Boolean(matchedHoliday),
        holidayDetail: matchedHoliday,
        upcomingHolidays: UPCOMING_JAPAN_HOLIDAYS,
      },
      liveMcpPayloads: usedLiveMcp
        ? {
            weather_forecast: liveWeatherOutput,
            koyo_now: liveKoyoOutput,
            get_next_holidays: liveHolidaysOutput,
            is_holiday: liveDateHolidayCheck,
          }
        : null,
    });
  });

  // 6. Gachi-Ramen Finder Endpoint (eng213035/gachi-ramen on https://mcp.smithery.ai/linpeiyun-emily)
  app.get("/api/ramen", async (req, res) => {
    const city = String(req.query.city || "ALL");
    const keito = String(req.query.keito || "ALL");
    const q = String(req.query.q || "").toLowerCase();

    const hasToken = Boolean(getActiveToken());
    let liveRamenResult: unknown = null;
    let usedLiveMcp = false;

    if (hasToken) {
      try {
        const mcpArgs: Record<string, unknown> = { limit: 6 };
        if (city !== "ALL") mcpArgs.city = city;
        if (keito !== "ALL") mcpArgs.keito = keito;
        if (q) mcpArgs.q = q;
        liveRamenResult = await callSmitheryMcpTool("search_ramen", mcpArgs);
        usedLiveMcp = true;
      } catch (_e) {
        usedLiveMcp = false;
      }
    }

    const filtered = SIMULATED_RAMEN_SHOPS.filter((shop) => {
      const matchCity = city === "ALL" || shop.city.toLowerCase() === city.toLowerCase();
      const matchKeito =
        keito === "ALL" || shop.keito.toLowerCase().includes(keito.toLowerCase());
      const matchQ =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        shop.signatureBowl.toLowerCase().includes(q) ||
        shop.neighborhood.toLowerCase().includes(q);
      return matchCity && matchKeito && matchQ;
    });

    res.json({
      source: usedLiveMcp
        ? `Live Smithery MCP (${MCP_ENDPOINT} · eng213035/gachi-ramen)`
        : "Simulated Reference Data (eng213035/gachi-ramen Schema — 62,144 Verified Shops DB)",
      isLiveMcp: usedLiveMcp,
      liveMcpPayload: liveRamenResult,
      shops: filtered,
    });
  });

  // 7. Restroom, Family Accessibility, Live Train Status & Station Hazard Endpoint
  // Powered by eng213035/tokyo-restroom on https://mcp.smithery.ai/linpeiyun-emily
  app.get("/api/restrooms-transit", async (req, res) => {
    const stationQuery = String(req.query.station || "Shinjuku").toLowerCase();
    const filterDiaper = req.query.diaper === "true";
    const filterWheelchair = req.query.wheelchair === "true";

    const hasToken = Boolean(getActiveToken());
    let liveToiletData: unknown = null;
    let liveTrainData: unknown = null;
    let liveAlertData: unknown = null;
    let usedLiveMcp = false;

    if (hasToken) {
      try {
        const [toiletRes, trainRes, alertRes] = await Promise.allSettled([
          callSmitheryMcpTool("get_toilet_by_station", { station: stationQuery }),
          callSmitheryMcpTool("get_train_status", { query: stationQuery }),
          callSmitheryMcpTool("get_station_alerts", { station_name: stationQuery }),
        ]);
        if (toiletRes.status === "fulfilled") {
          liveToiletData = toiletRes.value;
          usedLiveMcp = true;
        }
        if (trainRes.status === "fulfilled") {
          liveTrainData = trainRes.value;
          usedLiveMcp = true;
        }
        if (alertRes.status === "fulfilled") {
          liveAlertData = alertRes.value;
          usedLiveMcp = true;
        }
      } catch (_e) {
        usedLiveMcp = false;
      }
    }

    const stations = SIMULATED_STATION_COMFORT.filter((s) =>
      stationQuery === "all" ? true : s.station.toLowerCase().includes(stationQuery)
    ).map((s) => ({
      ...s,
      restrooms: s.restrooms.filter((r) => {
        if (filterDiaper && !r.diaperTable) return false;
        if (filterWheelchair && !r.wheelchairAccessible) return false;
        return true;
      }),
    }));

    res.json({
      source: usedLiveMcp
        ? `Live Smithery MCP (${MCP_ENDPOINT} · eng213035/tokyo-restroom)`
        : "Simulated Reference Data (eng213035/tokyo-restroom Schema — 526 Stations Open Data)",
      isLiveMcp: usedLiveMcp,
      liveMcpPayloads: usedLiveMcp
        ? {
            get_toilet_by_station: liveToiletData,
            get_train_status: liveTrainData,
            get_station_alerts: liveAlertData,
          }
        : null,
      stations: stations.length > 0 ? stations : SIMULATED_STATION_COMFORT,
    });
  });

  // 8. Custom Itinerary Personalizer (Combines Holiday Crowd Avoidance, Weather/Seasons, Family Restroom & Ramen preferences)
  app.post("/api/itinerary/personalize", async (req, res) => {
    const {
      destination = "Kyoto & Nagano (Japan)",
      travelerType = "Multi-Generational Family (4–6 pax)",
      travelDate = "2026-11-03",
      durationDays = 3,
      weatherPreference = "Auto-Swap for Rain & Mist",
      familyRestroomPriority = true,
      ramenStylePreference = "Clear Shoyu / Dashi & Aged Shinshu Miso",
      specialFocus = "After-hours temples, seasonal foliage, and private artisan workshops",
    } = req.body || {};

    try {
      const holidayMatch = UPCOMING_JAPAN_HOLIDAYS.find((h) => h.date === travelDate);
      const holidayContext = holidayMatch
        ? `Travel starts on Japanese National Holiday ${holidayMatch.nameEn} (${holidayMatch.nameJa}, ${holidayMatch.date}). Apply strict after-hours & dawn crowd-avoidance routing.`
        : `Travel starts on ${travelDate} (Non-holiday weekday/weekend window).`;

      const ai = getAiClient();
      const prompt = `Create a bespoke ${durationDays}-day off-the-beaten-path itinerary in ${destination} for ${travelerType}.
Business & MCP Toolkit Context:
1. Holiday Crowd Check (japan-holiday-mcp): ${holidayContext}
2. Seasonal & Weather Elements (japan-seasons-mcp): ${weatherPreference}. Include a rainy-weather indoor swap for each day, plus a seasonal foliage/blossom or fruit-picking highlight.
3. Family Comfort, Safety & Transport (tokyo-restroom): ${
        familyRestroomPriority
          ? "Include step-free train station routing, accessible restroom / diaper table stop notes, and optimal low-crowd train cars."
          : "Include optimal door-to-door regional rail and private taxi routing."
      }
4. Authentic Local Ramen & Dining (gachi-ramen): Recommend a verified backstreet local ramen shop matching "${ramenStylePreference}" away from tourist chains.
5. Local Host Pairing: Connect with a fun local individual or ground-up hobby group.
6. Traveller's personal focus: "${specialFocus}".

Return structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              holidayCrowdAdvisory: { type: Type.STRING },
              recommendedStayArea: { type: Type.STRING },
              transportAndStationComfort: { type: Type.STRING },
              estimatedDailyBudgetUsd: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING },
                    timeWindow: { type: Type.STRING },
                    primaryExperience: { type: Type.STRING },
                    crowdAvoidanceTactic: { type: Type.STRING },
                    rainyWeatherSwap: { type: Type.STRING },
                    ramenAndCulinaryStop: { type: Type.STRING },
                    stationRestroomAndTransitNote: { type: Type.STRING },
                    localHostConnection: { type: Type.STRING },
                  },
                  required: [
                    "dayNumber",
                    "theme",
                    "timeWindow",
                    "primaryExperience",
                    "crowdAvoidanceTactic",
                    "rainyWeatherSwap",
                    "ramenAndCulinaryStop",
                    "stationRestroomAndTransitNote",
                    "localHostConnection",
                  ],
                },
              },
            },
            required: [
              "title",
              "summary",
              "holidayCrowdAdvisory",
              "recommendedStayArea",
              "transportAndStationComfort",
              "estimatedDailyBudgetUsd",
              "days",
            ],
          },
        },
      });

      const plan = JSON.parse(response.text || "{}");
      res.json({
        generatedAt: new Date().toISOString(),
        disclaimer:
          "Simulated Reference Pricing & Schedule — Verify final host availability via Concierge.",
        plan,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to personalize itinerary";
      res.status(500).json({ error: message });
    }
  });

  // 9. Translation & Text-to-Speech (TTS) Bridge for Korea & Japan Local Communication
  app.post("/api/translate-tts", async (req, res) => {
    const {
      text = "",
      targetLang = "ja",
      context = "Polite conversation with a local artisan host or ramen master",
    } = req.body || {};
    if (!text.trim()) {
      res.status(400).json({ error: "Please provide a phrase to translate." });
      return;
    }

    const langLabel =
      targetLang === "ko"
        ? "Korean (Polite Haeyo-che / Honorific)"
        : "Japanese (Polite Teineigo / Keigo)";

    try {
      const ai = getAiClient();

      const translationRes = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Translate the following traveller message into natural ${langLabel} suitable for: "${context}".
Traveller message: "${text}"

Return JSON with:
- translatedText: native script (Japanese Kanji/Kana or Korean Hangul)
- phonetic: clear romanized pronunciation (Romaji or Revised Romanization)
- literalMeaning: brief English nuance explanation
- culturalTip: 1-sentence local etiquette tip when saying this in ${
          targetLang === "ko" ? "South Korea" : "Japan"
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              literalMeaning: { type: Type.STRING },
              culturalTip: { type: Type.STRING },
            },
            required: ["translatedText", "phonetic", "literalMeaning", "culturalTip"],
          },
        },
      });

      const parsed = JSON.parse(translationRes.text || "{}");

      let audioBase64: string | null = null;
      try {
        const ttsRes = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [{ text: parsed.translatedText || text }],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
          },
        });
        audioBase64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (_ttsErr) {
        audioBase64 = null;
      }

      res.json({
        sourceText: text,
        targetLang,
        ...parsed,
        audioWavBase64: audioBase64,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Translation failed";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UraMichi server listening on http://localhost:${PORT}`);
  });
}

startServer();
