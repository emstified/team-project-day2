import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import healthHandler, { checkMcpAndServicesHealth } from "./api/health.js";
import mcpHandler from "./api/mcp.js";
import seasonsHolidaysHandler, {
  UPCOMING_JAPAN_HOLIDAYS,
} from "./api/seasons-holidays.js";
import ramenHandler from "./api/ramen.js";
import restroomsTransitHandler from "./api/restrooms-transit.js";
import {
  createSmitheryOAuthUrl,
  exchangeSmitheryOAuthCode,
  probeAndListMcpTools,
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 0. MCP Server Connection & Data Pull Endpoint (/api/mcp.js, /.api/mcp.js, /api/mcp)
  app.all(
    ["/api/mcp", "/api/mcp.js", "/.api/mcp", "/.api/mcp.js"],
    (req, res) => {
      mcpHandler(req, res);
    }
  );

  // 1. Health Monitor (/api/health, /api/health.js, /.api/health.js)
  app.get(
    ["/api/health", "/api/health.js", "/.api/health", "/.api/health.js"],
    (req, res) => {
      healthHandler(req, res);
    }
  );

  // 2. Smithery MCP OAuth 2.0 PKCE Authorization URL Generator
  app.get("/api/mcp/oauth/url", async (req, res) => {
    try {
      const origin = String(
        req.query.origin || process.env.APP_URL || "http://localhost:3000"
      );
      const authData = await createSmitheryOAuthUrl(origin);
      res.json(authData);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize Smithery OAuth";
      res.status(500).json({ error: message });
    }
  });

  // 3. OAuth 2.0 Popup Callback Route (/auth/callback)
  const oauthCallbackHandler = async (
    req: express.Request,
    res: express.Response
  ) => {
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
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(
          errorParam
        )} }, '*');
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
      const msg =
        err instanceof Error ? err.message : "OAuth token exchange failed";
      res.status(400).send(`<!doctype html>
<html>
  <body style="font-family: sans-serif; padding: 24px; background: #F8F7F4; color: #141413;">
    <h3>Authentication Error</h3>
    <p>${msg}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(
          msg
        )} }, '*');
      }
    </script>
  </body>
</html>`);
    }
  };

  app.get(["/auth/callback", "/auth/callback/"], oauthCallbackHandler);

  // 4. Disconnect Smithery OAuth Session
  app.post("/api/mcp/disconnect", (_req, res) => {
    clearActiveToken();
    res.json({ disconnected: true });
  });

  // 5. Lightweight Connection Status Check
  app.get("/api/mcp/status", async (_req, res) => {
    const health = await checkMcpAndServicesHealth();
    res.json(health);
  });

  // 6. Seasons, Weather & National Holidays Endpoint (haomingkoo/japan-seasons-mcp + kakar-satoshi/japan-holiday-mcp)
  app.get(
    [
      "/api/seasons-holidays",
      "/api/seasons-holidays.js",
      "/.api/seasons-holidays",
      "/.api/seasons-holidays.js",
    ],
    (req, res) => {
      seasonsHolidaysHandler(req, res);
    }
  );

  // 7. Gachi-Ramen Finder Endpoint (eng213035/gachi-ramen)
  app.get(
    ["/api/ramen", "/api/ramen.js", "/.api/ramen", "/.api/ramen.js"],
    (req, res) => {
      ramenHandler(req, res);
    }
  );

  // 8. Restroom, Family Accessibility, Live Train Status & Station Hazard Endpoint (eng213035/tokyo-restroom)
  app.get(
    [
      "/api/restrooms-transit",
      "/api/restrooms-transit.js",
      "/.api/restrooms-transit",
      "/.api/restrooms-transit.js",
    ],
    (req, res) => {
      restroomsTransitHandler(req, res);
    }
  );

  // 9. Custom Itinerary Personalizer (Combines Holiday Crowd Avoidance, Weather/Seasons, Family Restroom & Ramen preferences)
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
      const holidayMatch = UPCOMING_JAPAN_HOLIDAYS.find(
        (h) => h.date === travelDate
      );
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to personalize itinerary";
      res.status(500).json({ error: message });
    }
  });

  // 10. Translation & Text-to-Speech (TTS) Bridge for Korea & Japan Local Communication
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
            required: [
              "translatedText",
              "phonetic",
              "literalMeaning",
              "culturalTip",
            ],
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
        audioBase64 =
          ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
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
      const message =
        error instanceof Error ? error.message : "Translation failed";
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
