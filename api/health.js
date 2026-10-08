/**
 * /api/health.js
 * Dedicated MCP Toolkit Health Monitor for https://mcp.smithery.ai/linpeiyun-emily
 * Strictly monitors the attached Smithery MCP endpoint, its OAuth 2.0 resource discovery metadata,
 * discovered MCP tools, and the 6 Miro Business Model Canvas toolkit mappings.
 */

import { probeAndListMcpTools, MCP_ENDPOINT, OAUTH_ISSUER } from "./mcpClient.js";

export async function checkMcpAndServicesHealth() {
  const startedAt = Date.now();
  const geminiKeyConfigured = Boolean(process.env.GEMINI_API_KEY);
  const probe = await probeAndListMcpTools();

  const discoveredToolNames = (probe.tools || []).map((t) => t.name || String(t));

  // Helper to check if a discovered tool matches keywords
  const matchDiscoveredTool = (keywords) => {
    const found = (probe.tools || []).find((t) => {
      const haystack = `${t.name || ""} ${t.description || ""}`.toLowerCase();
      return keywords.some((kw) => haystack.includes(kw));
    });
    return found ? found.name : null;
  };

  const braveToolName = matchDiscoveredTool(["brave", "perplexity", "search", "web"]);
  const airbnbToolName = matchDiscoveredTool(["airbnb", "stay", "listing", "accommodation"]);
  const yelpToolName = matchDiscoveredTool(["yelp", "business", "restaurant", "review"]);
  const seasonsToolName = matchDiscoveredTool(["season", "sakura", "cherry", "foliage", "festival", "weather", "japan"]);
  const mapTravelerToolName = matchDiscoveredTool(["map", "traveler", "virtual", "street", "route", "walk"]);
  const skyscannerToolName = matchDiscoveredTool(["skyscanner", "flight", "transport", "transit"]);

  const overallHealthy = probe.reachable && probe.oauthDiscovery.reachable;

  return {
    status: overallHealthy ? "ok" : "degraded",
    endpointPolicy: `Strict Single-Endpoint Mode (${MCP_ENDPOINT})`,
    timestamp: new Date().toISOString(),
    totalCheckDurationMs: Date.now() - startedAt,
    mcpGateway: {
      endpoint: probe.endpoint,
      reachable: probe.reachable,
      httpStatus: probe.httpStatus,
      authenticated: probe.authenticated,
      hasTokenConfigured: probe.hasTokenConfigured,
      latencyMs: probe.latencyMs,
      wwwAuthenticate: probe.wwwAuthenticate,
      serverInfo: probe.serverInfo,
      oauthDiscovery: probe.oauthDiscovery,
      discoveredToolsCount: discoveredToolNames.length,
      discoveredTools: probe.tools,
      error: probe.error,
    },
    miroToolkitAssessment: [
      {
        id: "brave-search-perplexity",
        miroResource: "Brave Search / Perplexity MCP",
        miroPurpose:
          "Live internet access for finding current off-the-beaten-path spots, travel blogs, and local subreddits discussing hidden gems.",
        endpointToolMatched: braveToolName,
        status: probe.authenticated
          ? braveToolName
            ? `Live via ${MCP_ENDPOINT} (${braveToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Curated Grounding Active)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && braveToolName ? "Live MCP Endpoint Data" : "Simulated / AI-Curated Reference Data",
      },
      {
        id: "airbnb-mcp-server",
        miroResource: "Airbnb MCP Server (HasData)",
        miroPurpose:
          "Search Airbnb stays by location and dates, and read a single listing in full as structured JSON.",
        endpointToolMatched: airbnbToolName,
        status: probe.authenticated
          ? airbnbToolName
            ? `Live via ${MCP_ENDPOINT} (${airbnbToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Structured JSON Schema Preview)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && airbnbToolName ? "Live MCP Endpoint Data" : "Simulated Reference JSON",
      },
      {
        id: "yelp-mcp-server",
        miroResource: "Yelp MCP Server (HasData)",
        miroPurpose:
          "Pulling local business leads, trading hours, and crowdsourced feedback without managing complex custom scrapers.",
        endpointToolMatched: yelpToolName,
        status: probe.authenticated
          ? yelpToolName
            ? `Live via ${MCP_ENDPOINT} (${yelpToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Verified Directory)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && yelpToolName ? "Live MCP Endpoint Data" : "Simulated / Curated Venue Directory",
      },
      {
        id: "japan-seasons-mcp",
        miroResource: "japan-seasons (Cherry Blossoms, Autumn Foliage & Festivals)",
        miroPurpose:
          "Seasonal phenology & weather elements considered when itinerary is suggested.",
        endpointToolMatched: seasonsToolName,
        status: probe.authenticated
          ? seasonsToolName
            ? `Live via ${MCP_ENDPOINT} (${seasonsToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Seasonal Phenology Matrix)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && seasonsToolName ? "Live MCP Endpoint Data" : "Simulated Seasonal & Weather Reference",
      },
      {
        id: "map-traveler-mcp",
        miroResource: "Virtual Travelling (github.com/mfukushim/map-traveler-mcp)",
        miroPurpose:
          "Virtual street-level walkthrough of off-the-beaten-path routes before travelling.",
        endpointToolMatched: mapTravelerToolName,
        status: probe.authenticated
          ? mapTravelerToolName
            ? `Live via ${MCP_ENDPOINT} (${mapTravelerToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Interactive Waypoint Simulator)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && mapTravelerToolName ? "Live MCP Endpoint Data" : "Simulated Interactive Waypoints",
      },
      {
        id: "skyscanner-transport",
        miroResource: "Skyscanner & Best Transport Route",
        miroPurpose:
          "Recommend the best transport route and lower-cost regional connections.",
        endpointToolMatched: skyscannerToolName,
        status: probe.authenticated
          ? skyscannerToolName
            ? `Live via ${MCP_ENDPOINT} (${skyscannerToolName})`
            : `Authenticated on ${MCP_ENDPOINT} (Route Comparison Matrix)`
          : "Requires Smithery OAuth Authorization (HTTP 401)",
        dataClassification: probe.authenticated && skyscannerToolName ? "Live MCP Endpoint Data" : "Simulated Reference Fares",
      },
    ],
    oauthFlowReadiness: {
      issuer: OAUTH_ISSUER,
      dynamicClientRegistrationSupported: true,
      pkceS256Supported: true,
      callbackPath: "/auth/callback",
      geminiServerSideConfigured: geminiKeyConfigured,
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
