import crypto from "crypto";

export const MCP_ENDPOINT = "https://mcp.smithery.ai/linpeiyun-emily";
export const MCP_WELL_KNOWN =
  "https://mcp.smithery.ai/.well-known/oauth-protected-resource/linpeiyun-emily";
export const OAUTH_ISSUER = "https://connect-auth.smithery.ai";
export const OAUTH_REGISTER_URL = "https://connect-auth.smithery.ai/register";
export const OAUTH_AUTHORIZE_URL = "https://connect-auth.smithery.ai/authorize";
export const OAUTH_TOKEN_URL = "https://connect-auth.smithery.ai/token";

// Server-side in-memory store for OAuth PKCE states and active Smithery MCP token/session
const pendingOAuthStates = new Map();
let activeAccessToken = process.env.SMITHERY_API_KEY || "";
let activeRefreshToken = "";
let cachedDiscoveredTools = [];
let lastVerifiedAt = null;
let lastHttpStatus = 401;

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Parses either a standard JSON response or an SSE (text/event-stream) payload from an MCP Streamable HTTP endpoint.
 */
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
            // Continue scanning SSE data lines
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

/**
 * Registers a dynamic OAuth 2.0 client with Smithery Connect Auth and generates a PKCE authorization URL.
 */
export async function createSmitheryOAuthUrl(origin) {
  const cleanOrigin = (origin || process.env.APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const redirectUri = `${cleanOrigin}/auth/callback`;

  // 1. Dynamic Client Registration (RFC 7591)
  const regRes = await fetch(OAUTH_REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "UraMichi Travel Concierge (MCP Client)",
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

  // 2. Generate PKCE verifier & S256 challenge
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

/**
 * Exchanges the authorization code for a Bearer token at https://connect-auth.smithery.ai/token
 */
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

/**
 * Probes https://mcp.smithery.ai/linpeiyun-emily via MCP JSON-RPC (initialize + tools/list)
 */
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
    lastHttpStatus = httpStatus;
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

      // Send initialized notification
      await fetch(MCP_ENDPOINT, {
        method: "POST",
        headers: sessionHeaders,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "notifications/initialized",
        }),
      }).catch(() => {});

      // Fetch available tools from https://mcp.smithery.ai/linpeiyun-emily
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

  // Also check OAuth protected resource metadata
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
 * Calls a specific tool on https://mcp.smithery.ai/linpeiyun-emily via JSON-RPC tools/call
 */
export async function callSmitheryMcpTool(toolName, args = {}) {
  const token = getActiveToken();
  if (!token) {
    throw new Error(
      "Smithery MCP endpoint requires authentication. Click 'Authorize Smithery MCP' or provide a Bearer token."
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
  };

  // Initialize session first
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

  const callRes = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!callRes.ok) {
    const errText = await callRes.text();
    throw new Error(`MCP tools/call (${toolName}) failed: HTTP ${callRes.status} ${errText}`);
  }

  const parsed = await parseMcpResponse(callRes);
  return parsed?.result || parsed;
}
