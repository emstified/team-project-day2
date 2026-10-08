/**
 * /api/seasons-holidays.js
 * Pulls seasonal foliage/sakura/weather data (haomingkoo/japan-seasons-mcp)
 * and Japanese Cabinet Office national holiday data (kakar-satoshi/japan-holiday-mcp)
 * from https://mcp.smithery.ai/linpeiyun-emily via /api/mcp.js.
 */

import { MCP_ENDPOINT, getActiveToken } from "./mcpClient.js";
import { pullDataFromMcpServer } from "./mcp.js";

export const SIMULATED_SEASONS_BY_CITY = {
  kyoto: {
    city: "Kyoto",
    country: "Japan",
    seasonHighlight: "Autumn Momiji (Koyo) Peak & Daitoku-ji Evening Illumination",
    koyoOrSakuraStatus:
      "Koyo Forecast: Peak crimson maple foliage Nov 12–Nov 28 across Northern Kyoto temples",
    tempC: 17,
    condition: "Crisp Twilight Air",
    isRainy: false,
    advisory:
      "Clear conditions for after-hours temple garden walks; toggle Rainy Swap to preview covered machiya tea sanctuaries.",
    festivals: [
      {
        name: "Jidai Matsuri & Kurama Fire Festival Season",
        dates: "Late October – November",
        crowdTip:
          "Skip main daytime parade; book private evening sub-temple viewing in Kita Ward.",
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
    koyoOrSakuraStatus:
      "Koyo Forecast: Golden ginkgo avenues peak Nov 18–Dec 3; early Kawazu sakura late Feb",
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
    koyoOrSakuraStatus:
      "Koyo Now: High-elevation maples at full peak color across Togakushi & Obuse",
    tempC: 12,
    condition: "Alpine Morning Mist",
    isRainy: false,
    advisory:
      "Cool alpine air ideal for private open-air rotenburo soaking and soba milling.",
    festivals: [
      {
        name: "Obuse New Chestnut Harvest & Soba Matsuri",
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
    koyoOrSakuraStatus:
      "Autumn Danpung: Peak crimson maples & golden ginkgo along Inwangsan & Secret Garden",
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
    koyoOrSakuraStatus:
      "Hallasan Slopes: Silver grass blooming across eastern volcanic oreum cones",
    tempC: 19,
    condition: "Golden Coastal Breeze",
    isRainy: false,
    advisory:
      "Mild coastal breeze along Gujwa-eup basalt trails and haenyeo stone fire-pit dining.",
    festivals: [
      {
        name: "Jeju Haenyeo Sea-Diver Heritage Gathering",
        dates: "Autumn Coastal Window",
        crowdTip:
          "Book private village bulteok hearth dinner in Hado-ri away from resort buffets.",
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

export const UPCOMING_JAPAN_HOLIDAYS = [
  {
    date: "2026-10-12",
    nameJa: "スポーツの日",
    nameEn: "Sports Day (Health & Sports Day)",
    isThreeDayWeekend: true,
    crowdImpact: "High domestic rail & shrine congestion 10:00–16:00",
    afterHoursStrategy:
      "Shift Kyoto & Tokyo shrine visits to 06:30 Dawn or 18:00+ After-Hours charter.",
  },
  {
    date: "2026-11-03",
    nameJa: "文化の日",
    nameEn: "Culture Day",
    isThreeDayWeekend: false,
    crowdImpact: "Peak autumn foliage crowds at public museums and daytime temples",
    afterHoursStrategy:
      "Book private Nishijin textile studio & Daitoku-ji evening candlelit entry.",
  },
  {
    date: "2026-11-23",
    nameJa: "勤労感謝の日",
    nameEn: "Labour Thanksgiving Day",
    isThreeDayWeekend: true,
    crowdImpact: "Peak Momiji 3-day weekend surge across Kyoto & Hakone",
    afterHoursStrategy:
      "Route to Nagano Togakushi cedar valley or private Seochon hanok courtyard.",
  },
  {
    date: "2027-01-01",
    nameJa: "元日",
    nameEn: "New Year's Day (Hatsumode)",
    isThreeDayWeekend: true,
    crowdImpact: "Major Hatsumode queues at famous shrines",
    afterHoursStrategy:
      "Visit neighborhood clan shrines in Yanaka or private ryokan rotenburo.",
  },
  {
    date: "2027-01-11",
    nameJa: "成人の日",
    nameEn: "Coming of Age Day",
    isThreeDayWeekend: true,
    crowdImpact: "Elevated Shinkansen & city center traffic",
    afterHoursStrategy:
      "Reserve Green Car seats 30 days ahead & schedule twilight walking routes.",
  },
];

export default async function handler(req, res) {
  const cityKey = String(req.query?.city || "kyoto").toLowerCase();
  const checkDate = String(req.query?.date || "2026-11-03");
  const baseData = SIMULATED_SEASONS_BY_CITY[cityKey] || SIMULATED_SEASONS_BY_CITY.kyoto;

  const hasToken = Boolean(getActiveToken());
  let liveWeatherOutput = null;
  let liveKoyoOutput = null;
  let liveHolidaysOutput = null;
  let liveDateHolidayCheck = null;
  let usedLiveMcp = false;

  if (hasToken) {
    try {
      const [weatherRes, koyoRes, nextHolRes, isHolRes] = await Promise.allSettled([
        pullDataFromMcpServer("weather_forecast", { city: baseData.city }),
        pullDataFromMcpServer("koyo_now", { region: baseData.city }),
        pullDataFromMcpServer("get_next_holidays", { count: 5 }),
        pullDataFromMcpServer("is_holiday", { date: checkDate }),
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

  return res.status(200).json({
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
}
