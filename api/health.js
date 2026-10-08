/**
 * /api/health.js
 * Health & latency monitor for the Smithery MCP Gateway (https://mcp.smithery.ai/linpeiyun-emily),
 * OAuth 2.0 resource discovery metadata, Open-Meteo Weather API, and Gemini Server-Side AI/TTS services.
 * Compatible with both Express (mounted at /api/health and /api/health.js) and serverless runtimes.
 */

const MCP_ENDPOINT = "https://mcp.smithery.ai/linpeiyun-emily";
const MCP_WELL_KNOWN = "https://mcp.smithery.ai/.well-known/oauth-protected-resource/linpeiyun-emily";
const OPEN_METEO_PROBE =
  "https://api.open-meteo.com/v1/forecast?latitude=35.0116&longitude=135.7681&current=temperature_2m";

export async function checkMcpAndServicesHealth() {
  const startedAt = Date.now();
  const smitheryKey = process.env.SMITHERY_API_KEY || "";
  const geminiKeyConfigured = Boolean(process.env.GEMINI_API_KEY);

  // 1. Probe Smithery MCP JSON-RPC Endpoint
  const mcpProbeStart = Date.now();
  let mcpHttpStatus = 0;
  let mcpReachable = false;
  let mcpAuthenticated = false;
  let mcpWwwAuthenticate = "";
  let mcpToolsDiscovered = [];
  let mcpError = null;

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (smitheryKey) {
      headers["Authorization"] = `Bearer ${smitheryKey}`;
    }

    const mcpRes = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "uramichi-health-monitor", version: "1.0.0" },
        },
      }),
    });

    mcpHttpStatus = mcpRes.status;
    mcpWwwAuthenticate = mcpRes.headers.get("www-authenticate") || "";
    // HTTP 200 (authenticated) or HTTP 401 (OAuth gate responding properly) confirms the MCP server is online
    mcpReachable = mcpRes.ok || mcpRes.status === 401;

    if (mcpRes.ok) {
      mcpAuthenticated = true;
      const toolsRes = await fetch(MCP_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        }),
      });
      if (toolsRes.ok) {
        const toolsJson = await toolsRes.json();
        mcpToolsDiscovered = toolsJson?.result?.tools || [];
      }
    }
  } catch (err) {
    mcpError = err instanceof Error ? err.message : "MCP endpoint unreachable";
  }
  const mcpLatencyMs = Date.now() - mcpProbeStart;

  // 2. Probe Smithery OAuth 2.0 Protected Resource Discovery Metadata
  const wellKnownStart = Date.now();
  let oauthMetadata = null;
  let wellKnownReachable = false;
  try {
    const metaRes = await fetch(MCP_WELL_KNOWN);
    if (metaRes.ok) {
      wellKnownReachable = true;
      oauthMetadata = await metaRes.json();
    }
  } catch (_err) {
    wellKnownReachable = false;
  }
  const wellKnownLatencyMs = Date.now() - wellKnownStart;

  // 3. Probe Live Weather Telemetry (japan-seasons / Weather Elements dependency)
  const weatherStart = Date.now();
  let weatherReachable = false;
  let weatherHttpStatus = 0;
  try {
    const weatherRes = await fetch(OPEN_METEO_PROBE);
    weatherHttpStatus = weatherRes.status;
    weatherReachable = weatherRes.ok;
  } catch (_err) {
    weatherReachable = false;
  }
  const weatherLatencyMs = Date.now() - weatherStart;

  const overallHealthy = mcpReachable && wellKnownReachable && weatherReachable;

  return {
    status: overallHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    totalCheckDurationMs: Date.now() - startedAt,
    mcpGateway: {
      endpoint: MCP_ENDPOINT,
      reachable: mcpReachable,
      httpStatus: mcpHttpStatus,
      authenticated: mcpAuthenticated,
      smitheryKeyConfigured: Boolean(smitheryKey),
      latencyMs: mcpLatencyMs,
      wwwAuthenticate: mcpWwwAuthenticate,
      oauthDiscovery: {
        wellKnownUrl: MCP_WELL_KNOWN,
        reachable: wellKnownReachable,
        latencyMs: wellKnownLatencyMs,
        metadata: oauthMetadata,
      },
      liveToolsCount: mcpToolsDiscovered.length,
      error: mcpError,
    },
    mcpToolkitModules: [
      {
        id: "brave-search-perplexity-mcp",
        name: "Brave Search / Perplexity MCP",
        status: mcpAuthenticated ? "live_mcp" : geminiKeyConfigured ? "active_gemini_fallback" : "degraded",
        operational: mcpAuthenticated || geminiKeyConfigured,
        mode: mcpAuthenticated
          ? "Authenticated Smithery MCP"
          : "Server-Side Gemini 3.8 Flash Search Grounding",
      },
      {
        id: "airbnb-mcp-hasdata",
        name: "Airbnb MCP Server (HasData)",
        status: mcpAuthenticated ? "live_mcp" : "simulated_reference",
        operational: true,
        mode: mcpAuthenticated
          ? "Authenticated Smithery MCP"
          : "Structured Airbnb JSON Schema (Simulated Reference)",
      },
      {
        id: "yelp-mcp-hasdata",
        name: "Yelp MCP Server (HasData)",
        status: mcpAuthenticated ? "live_mcp" : "curated_directory",
        operational: true,
        mode: mcpAuthenticated
          ? "Authenticated Smithery MCP"
          : "Verified After-Hours Venue & Crowd-Index Directory",
      },
      {
        id: "japan-seasons-weather",
        name: "japan-seasons & Open-Meteo Weather Engine",
        status: weatherReachable ? "live" : "fallback_climatology",
        operational: true,
        latencyMs: weatherLatencyMs,
        httpStatus: weatherHttpStatus,
        mode: weatherReachable ? "Live Open-Meteo Telemetry" : "Offline Seasonal Climatology",
      },
      {
        id: "map-traveler-mcp",
        name: "Virtual Travelling (mfukushim/map-traveler-mcp)",
        status: "operational",
        operational: true,
        mode: "Interactive Street-Level Waypoint Simulator",
      },
      {
        id: "skyscanner-transport-routes",
        name: "Skyscanner & Regional Rail Route Matrix",
        status: "simulated_reference",
        operational: true,
        mode: "Multi-Modal Transport Route & Reference Fare Comparison",
      },
    ],
    aiServices: {
      geminiApiKeyConfigured: geminiKeyConfigured,
      itineraryPersonalizerModel: "gemini-3.8-flash",
      translationTtsModel: "gemini-3.8-flash-lite-tts",
      operational: geminiKeyConfigured,
    },
  };
}

export default async function handler(_req, res) {
  try {
    const report = await checkMcpAndServicesHealth();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Health check failed",
    });
  }
}
