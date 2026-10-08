/**
 * /api/mcpClient.js
 * Direct MCP JSON-RPC 2.0 client for https://ramen.gachi-tokusuru.com/mcp
 * (Japan Ramen Active Master — 67,000+ active ramen shops across all 47 prefectures, no auth required).
 */

export const MCP_ENDPOINT = "https://ramen.gachi-tokusuru.com/mcp";
export const MCP_HOMEPAGE = "https://ramen.gachi-tokusuru.com";

export const ATTACHED_MCP_SERVERS = [
  {
    id: "japan-ramen-active-master",
    endpoint: MCP_ENDPOINT,
    displayName: "Japan Ramen Active Master (gachi-ramen MCP)",
    tools: [
      "ping",
      "search_ramen",
      "get_ramen_shop",
      "get_ramen_changes",
      "vibe_search",
    ],
    description:
      "67,464+ active ramen shops across all 47 prefectures of Japan. Dual-AI audited romanization, station distances, payment facts, and monthly closure verification.",
  },
];

let cachedDiscoveredTools = [];
let cachedPingData = null;
let lastVerifiedAt = null;

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

export async function probeAndListMcpTools() {
  const startMs = Date.now();
  let httpStatus = 0;
  let reachable = false;
  let authenticated = false;
  let tools = [];
  let serverInfo = null;
  let pingInfo = cachedPingData;
  let errorMsg = null;

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
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
          clientInfo: { name: "gachi-ramen-travel-mvp", version: "1.0.0" },
        },
      }),
    });

    httpStatus = initRes.status;
    reachable = initRes.ok;
    const sessionId = initRes.headers.get("mcp-session-id");

    if (initRes.ok) {
      authenticated = true;
      const initPayload = await parseMcpResponse(initRes);
      serverInfo = initPayload?.result?.serverInfo || null;

      const sessionHeaders = { ...headers };
      if (sessionId) {
        sessionHeaders["mcp-session-id"] = sessionId;
      }

      const [toolsRes, pingRes] = await Promise.all([
        fetch(MCP_ENDPOINT, {
          method: "POST",
          headers: sessionHeaders,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
            params: {},
          }),
        }),
        fetch(MCP_ENDPOINT, {
          method: "POST",
          headers: sessionHeaders,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: { name: "ping", arguments: {} },
          }),
        }),
      ]);

      if (toolsRes.ok) {
        const toolsPayload = await parseMcpResponse(toolsRes);
        tools = toolsPayload?.result?.tools || [];
        cachedDiscoveredTools = tools;
      }

      if (pingRes.ok) {
        const pingPayload = await parseMcpResponse(pingRes);
        const pingResult = pingPayload?.result;
        if (pingResult?.structuredContent) {
          pingInfo = pingResult.structuredContent;
        } else if (Array.isArray(pingResult?.content)) {
          const textItem = pingResult.content.find((c) => c.type === "text");
          if (textItem?.text) {
            try {
              pingInfo = JSON.parse(textItem.text);
            } catch (_e) {
              // ignore
            }
          }
        }
        cachedPingData = pingInfo;
      }
    }
  } catch (err) {
    errorMsg =
      err instanceof Error
        ? err.message
        : `Failed to reach ${MCP_ENDPOINT}`;
  }

  const latencyMs = Date.now() - startMs;
  lastVerifiedAt = new Date().toISOString();

  return {
    endpoint: MCP_ENDPOINT,
    homepage: MCP_HOMEPAGE,
    checkedAt: lastVerifiedAt,
    reachable,
    httpStatus,
    authenticated,
    latencyMs,
    serverInfo,
    pingInfo,
    tools,
    attachedServers: ATTACHED_MCP_SERVERS,
    error: errorMsg,
  };
}

/**
 * Calls a tool on https://ramen.gachi-tokusuru.com/mcp
 * (ping, search_ramen, get_ramen_shop, get_ramen_changes, vibe_search).
 */
export async function callMcpTool(targetToolName, args = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };

  let resolvedName = targetToolName;
  if (cachedDiscoveredTools.length > 0) {
    const match = cachedDiscoveredTools.find(
      (t) =>
        t.name === targetToolName ||
        (t.name && t.name.endsWith(`_${targetToolName}`)) ||
        (t.name && t.name.includes(targetToolName))
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
    throw new Error(
      `MCP tools/call (${resolvedName}) failed: HTTP ${callRes.status} ${errText}`
    );
  }

  const parsed = await parseMcpResponse(callRes);
  if (parsed?.error) {
    throw new Error(parsed.error.message || JSON.stringify(parsed.error));
  }
  return parsed?.result || parsed;
}

// Backwards-compatible alias
export const callSmitheryMcpTool = callMcpTool;
