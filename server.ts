import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import healthHandler, { checkMcpAndServicesHealth } from "./api/health.js";
import {
  MCP_ENDPOINT,
  MCP_WELL_KNOWN,
  createSmitheryOAuthUrl,
  exchangeSmitheryOAuthCode,
  probeAndListMcpTools,
  callSmitheryMcpTool,
  clearActiveToken,
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

const SEASONAL_CLIMATOLOGY: Record<
  string,
  {
    name: string;
    country: "Japan" | "South Korea";
    seasonHighlight: string;
    tempC: number;
    feelsLikeC: number;
    windKph: number;
    condition: string;
    isRainy: boolean;
    advisory: string;
    forecast: {
      date: string;
      maxTemp: number;
      minTemp: number;
      precipProb: number;
      condition: string;
    }[];
  }
> = {
  kyoto: {
    name: "Kyoto",
    country: "Japan",
    seasonHighlight: "Autumn Momiji Peak & Private Temple Night Illumination (Oct–Nov)",
    tempC: 17,
    feelsLikeC: 16,
    windKph: 7,
    condition: "Crisp Twilight Air",
    isRainy: false,
    advisory:
      "Clear evening conditions for after-hours Daitoku-ji courtyard walks; toggle Rainy Swap to preview covered machiya tea sanctuaries.",
    forecast: [
      { date: "Day 1", maxTemp: 19, minTemp: 11, precipProb: 15, condition: "Crisp & Clear" },
      { date: "Day 2", maxTemp: 18, minTemp: 10, precipProb: 20, condition: "Partly Clouded" },
      { date: "Day 3", maxTemp: 16, minTemp: 9, precipProb: 60, condition: "Autumn Mist & Showers" },
    ],
  },
  seoul: {
    name: "Seoul",
    country: "South Korea",
    seasonHighlight: "Seochon Hanok Ginkgo Gold & Changdeokgung Moonlight Window",
    tempC: 15,
    feelsLikeC: 14,
    windKph: 9,
    condition: "Clear Mountain Breeze",
    isRainy: false,
    advisory:
      "Ideal visibility for Changdeokgung Secret Garden moonlight entry and Inwangsan ridge walks.",
    forecast: [
      { date: "Day 1", maxTemp: 17, minTemp: 9, precipProb: 10, condition: "Crisp & Clear" },
      { date: "Day 2", maxTemp: 16, minTemp: 8, precipProb: 25, condition: "High Mountain Clouds" },
      { date: "Day 3", maxTemp: 14, minTemp: 7, precipProb: 55, condition: "Light Rain Showers" },
    ],
  },
  nagano: {
    name: "Nagano",
    country: "Japan",
    seasonHighlight: "Alpine Cedar Foliage & High-Altitude Rotenburo Season",
    tempC: 12,
    feelsLikeC: 11,
    windKph: 6,
    condition: "Alpine Morning Mist",
    isRainy: false,
    advisory:
      "Cool mountain air ideal for open-air rotenburo thermal soaking and Togakushi cedar trails.",
    forecast: [
      { date: "Day 1", maxTemp: 14, minTemp: 5, precipProb: 20, condition: "Alpine Sun & Mist" },
      { date: "Day 2", maxTemp: 13, minTemp: 4, precipProb: 50, condition: "Mountain Showers" },
      { date: "Day 3", maxTemp: 15, minTemp: 6, precipProb: 15, condition: "Crisp & Clear" },
    ],
  },
  jeju: {
    name: "Jeju Island",
    country: "South Korea",
    seasonHighlight: "Silver Eulalia Grass (Eoksae) & Basalt Coastal Haenyeo Harvest",
    tempC: 19,
    feelsLikeC: 19,
    windKph: 14,
    condition: "Golden Coastal Breeze",
    isRainy: false,
    advisory:
      "Mild coastal conditions along Gujwa-eup basalt trails and haenyeo stone hearth dining.",
    forecast: [
      { date: "Day 1", maxTemp: 21, minTemp: 14, precipProb: 15, condition: "Coastal Sun" },
      { date: "Day 2", maxTemp: 20, minTemp: 13, precipProb: 30, condition: "Sea Breeze" },
      { date: "Day 3", maxTemp: 18, minTemp: 12, precipProb: 60, condition: "Passing Island Shower" },
    ],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    seasonHighlight: "Shimokitazawa & Yanaka Twilight Backstreet Craft Season",
    tempC: 18,
    feelsLikeC: 17,
    windKph: 8,
    condition: "Clear Evening Sky",
    isRainy: false,
    advisory:
      "Pleasant evening temperatures for backstreet gallery walks and subterranean jazz kissa sessions.",
    forecast: [
      { date: "Day 1", maxTemp: 20, minTemp: 12, precipProb: 10, condition: "Clear Sky" },
      { date: "Day 2", maxTemp: 19, minTemp: 11, precipProb: 20, condition: "Light Clouds" },
      { date: "Day 3", maxTemp: 17, minTemp: 10, precipProb: 50, condition: "Evening Rain" },
    ],
  },
};

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
      const message = error instanceof Error ? error.message : "Failed to initialize Smithery OAuth";
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
    <h3>Smithery MCP Endpoint Connected</h3>
    <p>Authenticated with https://mcp.smithery.ai/linpeiyun-emily. This window will close automatically.</p>
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

  // 3. Disconnect / Reset Smithery OAuth Session
  app.post("/api/mcp/disconnect", (_req, res) => {
    clearActiveToken();
    res.json({ disconnected: true });
  });

  // 4. Direct Tool Execution on https://mcp.smithery.ai/linpeiyun-emily
  app.post("/api/mcp/call", async (req, res) => {
    const { toolName, args = {} } = req.body || {};
    if (!toolName) {
      res.status(400).json({ error: "toolName is required" });
      return;
    }
    try {
      const result = await callSmitheryMcpTool(toolName, args);
      res.json({
        endpoint: MCP_ENDPOINT,
        toolName,
        executedAt: new Date().toISOString(),
        result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "MCP tool call failed";
      res.status(400).json({ error: message });
    }
  });

  // 5. Comprehensive MCP Status Endpoint (/api/mcp/status)
  app.get("/api/mcp/status", async (_req, res) => {
    const health = await checkMcpAndServicesHealth();
    res.json({
      endpoint: MCP_ENDPOINT,
      wellKnownUrl: MCP_WELL_KNOWN,
      checkedAt: health.timestamp,
      httpStatus: health.mcpGateway.httpStatus,
      authenticated: health.mcpGateway.authenticated,
      hasServerKeyConfigured: health.mcpGateway.hasTokenConfigured,
      latencyMs: health.mcpGateway.latencyMs,
      wwwAuthenticateHeader: health.mcpGateway.wwwAuthenticate,
      oauthResourceMetadata: health.mcpGateway.oauthDiscovery.metadata,
      liveTools: health.mcpGateway.discoveredTools || [],
      miroMappedTools: health.miroToolkitAssessment.map((item) => ({
        id: item.id,
        name: item.miroResource,
        miroRole: item.miroPurpose,
        appFeature: item.endpointToolMatched
          ? `Bound to endpoint tool: ${item.endpointToolMatched}`
          : "Mapped to UraMichi Itinerary, Stay, Season & Route Modules",
        status: item.status,
        dataMode: item.dataClassification,
      })),
    });
  });

  // 6. Seasonal & Weather Intelligence (Strictly uses Smithery MCP endpoint if available, else clearly labeled Simulated Seasonal Climatology)
  app.get("/api/weather", async (req, res) => {
    const cityKey = String(req.query.city || "kyoto").toLowerCase();
    const baseCity = SEASONAL_CLIMATOLOGY[cityKey] || SEASONAL_CLIMATOLOGY.kyoto;

    // Check if Smithery MCP endpoint is authenticated and exposes a seasons/weather tool
    const probe = await probeAndListMcpTools();
    let mcpSeasonData: unknown = null;
    let usedMcpTool: string | null = null;

    if (probe.authenticated && probe.tools.length > 0) {
      const seasonTool = probe.tools.find((t: { name?: string; description?: string }) => {
        const text = `${t.name || ""} ${t.description || ""}`.toLowerCase();
        return (
          text.includes("season") ||
          text.includes("weather") ||
          text.includes("japan") ||
          text.includes("sakura") ||
          text.includes("foliage")
        );
      });
      if (seasonTool?.name) {
        try {
          mcpSeasonData = await callSmitheryMcpTool(seasonTool.name, {
            city: baseCity.name,
            location: baseCity.name,
          });
          usedMcpTool = seasonTool.name;
        } catch (_e) {
          mcpSeasonData = null;
        }
      }
    }

    res.json({
      source: usedMcpTool
        ? `Live Smithery MCP (${MCP_ENDPOINT} · ${usedMcpTool})`
        : "Simulated Seasonal & Weather Reference Data (Connect Smithery MCP for Live Tool Feed)",
      isLive: Boolean(usedMcpTool),
      mcpToolOutput: mcpSeasonData,
      city: baseCity.name,
      country: baseCity.country,
      seasonHighlight: baseCity.seasonHighlight,
      current: {
        tempC: baseCity.tempC,
        feelsLikeC: baseCity.feelsLikeC,
        windKph: baseCity.windKph,
        condition: baseCity.condition,
        isRainy: baseCity.isRainy,
        advisory: baseCity.advisory,
      },
      forecast: baseCity.forecast,
    });
  });

  // 7. Hidden Gems Scout (Uses Smithery MCP search tool when authenticated + Gemini structuring)
  app.post("/api/discover-gems", async (req, res) => {
    const {
      city = "Kyoto",
      interest = "after-hours temples and hidden tea houses",
      weatherMode = "clear",
    } = req.body || {};

    try {
      const probe = await probeAndListMcpTools();
      let mcpContextSnippet = "";
      let usedMcpToolName: string | null = null;

      if (probe.authenticated && probe.tools.length > 0) {
        const searchTool = probe.tools.find((t: { name?: string; description?: string }) => {
          const text = `${t.name || ""} ${t.description || ""}`.toLowerCase();
          return (
            text.includes("search") ||
            text.includes("brave") ||
            text.includes("perplexity") ||
            text.includes("yelp") ||
            text.includes("place")
          );
        });
        if (searchTool?.name) {
          try {
            const mcpRes = await callSmitheryMcpTool(searchTool.name, {
              query: `${city} hidden gems off the beaten path ${interest}`,
              location: city,
            });
            mcpContextSnippet = JSON.stringify(mcpRes).slice(0, 3000);
            usedMcpToolName = searchTool.name;
          } catch (_e) {
            // Continue with curated fallback
          }
        }
      }

      const ai = getAiClient();
      const prompt = `You are an insider Korea & Japan local travel curator for affluent, adventurous travellers who despise crowded tourist traps.
Find 3 real, authentic, lesser-known or after-hours local spots in ${city} focused on: "${interest}".
Weather condition to account for: ${
        weatherMode === "rainy"
          ? "Rainy weather — prioritize atmospheric indoor spaces, covered arcades, subterranean listening bars, or private tea sanctuaries"
          : "Clear weather — include quiet twilight courtyards, backstreet walks, or early/after-hours access sights"
      }.
${
  mcpContextSnippet
    ? `Use this live data retrieved from our Smithery MCP endpoint (${usedMcpToolName}): ${mcpContextSnippet}`
    : ""
}

Return a JSON array of 3 objects with these exact fields:
- name (string): Real name of the spot or neighborhood enclave
- neighborhood (string): Specific district in ${city}
- bestTimeWindow (string): Exact time window to avoid crowds (e.g. "19:30–21:30 After-Hours" or "06:30 Dawn Window")
- crowdComparison (string): Concrete contrast vs mainstream tourist equivalent
- whyExtraordinary (string): 2 sentences on what makes it special and local
- weatherFit (string): Why this spot works well in ${weatherMode} weather
- localHostTip (string): Practical etiquette or insider tip`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                neighborhood: { type: Type.STRING },
                bestTimeWindow: { type: Type.STRING },
                crowdComparison: { type: Type.STRING },
                whyExtraordinary: { type: Type.STRING },
                weatherFit: { type: Type.STRING },
                localHostTip: { type: Type.STRING },
              },
              required: [
                "name",
                "neighborhood",
                "bestTimeWindow",
                "crowdComparison",
                "whyExtraordinary",
                "weatherFit",
                "localHostTip",
              ],
            },
          },
        },
      });

      const gems = JSON.parse(response.text || "[]");
      res.json({
        source: usedMcpToolName
          ? `Live Smithery MCP (${usedMcpToolName}) + Gemini 3.8 Flash`
          : "Simulated / AI-Curated Reference Discovery (Connect Smithery MCP for Live Endpoint Search)",
        city,
        interest,
        weatherMode,
        gems,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to scout hidden gems";
      res.status(500).json({ error: message });
    }
  });

  // 8. Custom Itinerary Personalizer (Korea & Japan Focused)
  app.post("/api/itinerary/personalize", async (req, res) => {
    const {
      destination = "Kyoto & Nagano",
      travelerType = "Couple / Duet",
      durationDays = 3,
      pace = "Unhurried & Immersive",
      weatherPreference = "Auto-Swap for Rain",
      specialFocus = "After-hours temples, private artisan workshops, and subterranean vinyl bars",
    } = req.body || {};

    try {
      const probe = await probeAndListMcpTools();
      let mcpToolsSummary = "Unauthenticated (Using Simulated Reference Pricing & Schedules)";
      if (probe.authenticated && probe.tools.length > 0) {
        mcpToolsSummary = `Connected to ${MCP_ENDPOINT} with tools: ${probe.tools
          .map((t: { name?: string }) => t.name)
          .join(", ")}`;
      }

      const ai = getAiClient();
      const prompt = `Create a bespoke ${durationDays}-day off-the-beaten-path itinerary in ${destination} for ${travelerType} (Pace: ${pace}).
Key requirements from our Miro business proposal:
1. Avoid crowded tourist traps — specify after-hours access windows or quiet local alternatives.
2. Weather-aware planning (${weatherPreference}) — include a rainy-day indoor alternative for each day.
3. Recommend the best transport route between stops and a curated neighborhood stay style.
4. Pair with a local ground-up hobby group or vetted local host experience.
5. Special focus requested: "${specialFocus}".
MCP Endpoint Status: ${mcpToolsSummary}.

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
              recommendedStayArea: { type: Type.STRING },
              transportStrategy: { type: Type.STRING },
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
                    transportRoute: { type: Type.STRING },
                    localHostConnection: { type: Type.STRING },
                  },
                  required: [
                    "dayNumber",
                    "theme",
                    "timeWindow",
                    "primaryExperience",
                    "crowdAvoidanceTactic",
                    "rainyWeatherSwap",
                    "transportRoute",
                    "localHostConnection",
                  ],
                },
              },
            },
            required: [
              "title",
              "summary",
              "recommendedStayArea",
              "transportStrategy",
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
      context = "Polite conversation with a local artisan host",
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
