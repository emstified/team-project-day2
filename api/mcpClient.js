import crypto from "crypto";

export const MCP_ENDPOINT = "https://mcp.smithery.ai/linpeiyun-emily";
export const MCP_WELL_KNOWN =
  "https://mcp.smithery.ai/.well-known/oauth-protected-resource/linpeiyun-emily";
export const OAUTH_ISSUER = "https://connect-auth.smithery.ai";
export const OAUTH_REGISTER_URL = "https://connect-auth.smithery.ai/register";
export const OAUTH_AUTHORIZE_URL = "https://connect-auth.smithery.ai/authorize";
export const OAUTH_TOKEN_URL = "https://connect-auth.smithery.ai/token";

export const ATTACHED_MCP_SERVERS = [
  {
    id: "eng213035/gachi-ramen",
    displayName: "gachi-ramen (Nationwide Verified Ramen DB)",
    tools: ["search_ramen", "get_ramen_shop", "get_ramen_changes"],
    miroAlignment:
      "Hidden local culinary spots away from tourist traps; pairs with local ramen hobby groups.",
  },
  {
    id: "eng213035/tokyo-restroom",
    displayName: "Tokyo Restroom, Live Train Status & Station Safety",
    tools: [
      "get_toilet_by_station",
      "get_public_toilet_by_city",
      "get_train_status",
      "get_station_hazard",
      "get_active_alerts",
      "get_station_alerts",
      "get_municipality_context",
      "get_station_context",
    ],
    miroAlignment:
      "Safe local experience, family/individual comfort (wheelchair & baby diaper tables), live transport route status, and JMA weather hazard alerts.",
  },
  {
    id: "haomingkoo/japan-seasons-mcp",
    displayName: "Japan in Seasons (Sakura, Autumn Koyo, Weather & Festivals)",
    tools: [
      "japan_seasonal_answer",
      "sakura_now",
      "koyo_now",
      "sakura_forecast",
      "sakura_spots",
      "sakura_best_dates",
      "koyo_forecast",
      "koyo_spots",
      "koyo_best_dates",
      "weather_forecast",
      "flowers_spots",
      "fruit_seasons",
      "fruit_farms",
      "festivals_list",
      "search",
      "fetch",
    ],
    miroAlignment:
      "Cherry blossoms, autumn foliage, festivals, seasonal fruit farms, and short-range weather elements considered when itinerary is suggested.",
  },
  {
    id: "kakar-satoshi/japan-holiday-mcp",
    displayName: "Japan Holiday MCP (Cabinet Office National Holidays)",
    tools: ["ping", "is_holiday", "get_holidays_in_month", "get_next_holidays"],
    miroAlignment:
      "Detects Japanese national holidays & peak domestic travel dates so itineraries shift sights to after-hours windows to avoid crowds.",
  },
];

const pendingOAuthStates = new Map();
let activeAccessToken = process.env.SMITHERY_API_KEY || "";
let activeRefreshToken = "";
let cachedDiscoveredTools = [];
let lastVerifiedAt = null;

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function parseMcpResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (contentType.includes("text/event-stream")) {
    const lines = rawText.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const dataStr = line.slice(5).trim();
        if (dataStr) {
          try {
            return JSON.parse(dataStr);
          } catch (_e) {
            // Continue scanning SSE stream
          }
        }
      }
    }
  }

  try {
    return JSON.parse(rawText);
  } catch (_e) {
    return { rawText };
  }
}

export function getActiveToken() {
  return activeAccessToken || process.env.SMITHERY_API_KEY || "";
}

export function setActiveToken(token, refreshToken = "") {
  activeAccessToken = token.trim();
  if (refreshToken) {
    activeRefreshToken = refreshToken.trim();
  }
}

export function clearActiveToken() {
  activeAccessToken = "";
  activeRefreshToken = "";
  cachedDiscoveredTools = [];
}

export async function createSmitheryOAuthUrl(origin) {
  const cleanOrigin = (origin || process.env.APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const redirectUri = `${cleanOrigin}/auth/callback`;

  const regRes = await fetch(OAUTH_REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "UraMichi Travel Concierge",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    throw new Error(`Smithery dynamic client registration failed: HTTP ${regRes.status} ${errText}`);
  }

  const clientData = await regRes.json();
  const clientId = clientData.client_id;

  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  const state = base64UrlEncode(crypto.randomBytes(16));

  pendingOAuthStates.set(state, {
    clientId,
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "connections:execute",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    resource: MCP_ENDPOINT,
  });

  return {
    url: `${OAUTH_AUTHORIZE_URL}?${params.toString()}`,
    redirectUri,
    state,
  };
}

export async function exchangeSmitheryOAuthCode(code, state) {
  const session = pendingOAuthStates.get(state);
  if (!session) {
    throw new Error("Invalid or expired OAuth state parameter.");
  }
  pendingOAuthStates.delete(state);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: session.clientId,
    code,
    redirect_uri: session.redirectUri,
    code_verifier: session.codeVerifier,
    resource: MCP_ENDPOINT,
  });

  const tokenRes = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Token exchange failed (HTTP ${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();
  if (tokenData.access_token) {
    setActiveToken(tokenData.access_token, tokenData.refresh_token || "");
  }

  return tokenData;
}

export async function probeAndListMcpTools() {
  const startMs = Date.now();
  const token = getActiveToken();
  let httpStatus = 0;
  let wwwAuthenticate = "";
  let authenticated = false;
  let reachable = false;
  let tools = [];
  let serverInfo = null;
  let errorMsg = null;

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const initRes = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "uramichi-concierge-mvp", version: "1.0.0" },
        },
      }),
    });

    httpStatus = initRes.status;
    wwwAuthenticate = initRes.headers.get("www-authenticate") || "";
    reachable = initRes.ok || initRes.status === 401;
    const sessionId = initRes.headers.get("mcp-session-id");

    if (initRes.ok) {
      authenticated = true;
      const initPayload = await parseMcpResponse(initRes);
      serverInfo = initPayload?.result?.serverInfo || null;

      const sessionHeaders = { ...headers };
      if (sessionId) {
        sessionHeaders["mcp-session-id"] = sessionId;
      }

      await fetch(MCP_ENDPOINT, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
        }),
      }).catch(() => {});

      const toolsRes = await fetch(MCP_ENDPOINT, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        }),
      });

      if (toolsRes.ok) {
        const toolsPayload = await parseMcpResponse(toolsRes);
        tools = toolsPayload?.result?.tools || [];
        cachedDiscoveredTools = tools;
      }
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to reach Smithery MCP endpoint";
  }

  const latencyMs = Date.now() - startMs;
  lastVerifiedAt = new Date().toISOString();

  let oauthMetadata = null;
  let wellKnownReachable = false;
  const wkStart = Date.now();
  try {
    const wkRes = await fetch(MCP_WELL_KNOWN);
    if (wkRes.ok) {
      wellKnownReachable = true;
      oauthMetadata = await wkRes.json();
    }
  } catch (_e) {
    wellKnownReachable = false;
  }
  const wellKnownLatencyMs = Date.now() - wkStart;

  return {
    endpoint: MCP_ENDPOINT,
    wellKnownUrl: MCP_WELL_KNOWN,
    checkedAt: lastVerifiedAt,
    reachable,
    httpStatus,
    authenticated,
    hasTokenConfigured: Boolean(token),
    latencyMs,
    wwwAuthenticate,
    serverInfo,
    tools,
    attachedServers: ATTACHED_MCP_SERVERS,
    oauthDiscovery: {
      wellKnownUrl: MCP_WELL_KNOWN,
      authorizationServer: OAUTH_ISSUER,
      reachable: wellKnownReachable,
      latencyMs: wellKnownLatencyMs,
      metadata: oauthMetadata || {
        resource: MCP_ENDPOINT,
        authorization_servers: [OAUTH_ISSUER],
        scopes_supported: ["connections:execute"],
      },
    },
    error: errorMsg,
  };
}

/**
 * Calls a tool on https://mcp.smithery.ai/linpeiyun-emily, matching either exact name or namespaced suffix.
 */
export async function callSmitheryMcpTool(targetToolSuffix, args = {}) {
  const token = getActiveToken();
  if (!token) {
    throw new Error("Smithery MCP endpoint requires Bearer authorization.");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
  };

  const initRes = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "uramichi-concierge-mvp", version: "1.0.0" },
      },
    }),
  });

  if (!initRes.ok) {
    throw new Error(`MCP initialize failed with HTTP ${initRes.status}`);
  }

  const sessionId = initRes.headers.get("mcp-session-id");
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  // Resolve exact tool name if tools were discovered with prefixes
  let resolvedName = targetToolSuffix;
  if (cachedDiscoveredTools.length > 0) {
    const match = cachedDiscoveredTools.find(
      (t) =>
        t.name === targetToolSuffix ||
        (t.name && t.name.endsWith(`_${targetToolSuffix}`)) ||
        (t.name && t.name.endsWith(`/${targetToolSuffix}`)) ||
        (t.name && t.name.includes(targetToolSuffix))
    );
    if (match?.name) {
      resolvedName = match.name;
    }
  }

  const callRes = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: resolvedName,
        arguments: args,
      },
    }),
  });

  if (!callRes.ok) {
    const errText = await callRes.text();
    throw new Error(`MCP tools/call (${resolvedName}) failed: HTTP ${callRes.status} ${errText}`);
  }

  const parsed = await parseMcpResponse(callRes);
  if (parsed?.error) {
    throw new Error(parsed.error.message || JSON.stringify(parsed.error));
  }
  return parsed?.result || parsed;
}
