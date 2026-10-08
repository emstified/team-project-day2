/**
 * /api/mcp.js
 * Checks the connection of the MCP server (https://server.smithery.ai/eng213035/gachi-ramen)
 * and pulls data from its tools:
 * - search_ramen
 * - get_ramen_shop
 * - get_ramen_changes
 */

import {
  MCP_ENDPOINT,
  MCP_WELL_KNOWN,
  ATTACHED_MCP_SERVERS,
  probeAndListMcpTools,
  callSmitheryMcpTool,
  getActiveToken,
} from "./mcpClient.js";

/**
 * Checks the connection and authentication state of https://server.smithery.ai/eng213035/gachi-ramen
 */
export async function checkMcpServerConnection() {
  const probe = await probeAndListMcpTools();
  return {
    connected: probe.reachable,
    authenticated: probe.authenticated,
    endpoint: MCP_ENDPOINT,
    wellKnownUrl: MCP_WELL_KNOWN,
    httpStatus: probe.httpStatus,
    latencyMs: probe.latencyMs,
    checkedAt: probe.checkedAt,
    hasTokenConfigured: Boolean(getActiveToken()),
    wwwAuthenticate: probe.wwwAuthenticate,
    oauthDiscovery: probe.oauthDiscovery,
    attachedServers: ATTACHED_MCP_SERVERS,
    discoveredTools: probe.tools,
    error: probe.error,
  };
}

/**
 * Pulls data from https://server.smithery.ai/eng213035/gachi-ramen for a given tool and arguments.
 */
export async function pullDataFromMcpServer(toolName, args = {}) {
  return await callSmitheryMcpTool(toolName, args);
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const body = req.body || {};
      const toolName = body.toolName || body.tool;
      const args = body.args || body.arguments || {};

      if (!toolName) {
        const status = await checkMcpServerConnection();
        return res.status(200).json(status);
      }

      const data = await pullDataFromMcpServer(toolName, args);
      return res.status(200).json({
        status: "ok",
        endpoint: MCP_ENDPOINT,
        toolName,
        pulledAt: new Date().toISOString(),
        data,
      });
    }

    const connectionStatus = await checkMcpServerConnection();
    return res.status(200).json({
      status: connectionStatus.connected ? "ok" : "unreachable",
      ...connectionStatus,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      endpoint: MCP_ENDPOINT,
      message:
        error instanceof Error
          ? error.message
          : "MCP server connection check failed",
    });
  }
}
