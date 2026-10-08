/**
 * /api/mcp.js
 * Checks the connection of the MCP server (https://ramen.gachi-tokusuru.com/mcp)
 * and pulls data from its tools:
 * - ping
 * - search_ramen
 * - get_ramen_shop
 * - get_ramen_changes
 * - vibe_search
 */

import {
  MCP_ENDPOINT,
  MCP_HOMEPAGE,
  ATTACHED_MCP_SERVERS,
  probeAndListMcpTools,
  callMcpTool,
} from "./mcpClient.js";

/**
 * Checks the connection and live status of https://ramen.gachi-tokusuru.com/mcp
 */
export async function checkMcpServerConnection() {
  const probe = await probeAndListMcpTools();
  return {
    connected: probe.reachable,
    authenticated: probe.authenticated,
    endpoint: MCP_ENDPOINT,
    homepage: MCP_HOMEPAGE,
    httpStatus: probe.httpStatus,
    latencyMs: probe.latencyMs,
    checkedAt: probe.checkedAt,
    serverInfo: probe.serverInfo,
    pingInfo: probe.pingInfo,
    attachedServers: ATTACHED_MCP_SERVERS,
    discoveredTools: probe.tools,
    error: probe.error,
  };
}

/**
 * Pulls data from https://ramen.gachi-tokusuru.com/mcp for a given tool and arguments.
 */
export async function pullDataFromMcpServer(toolName, args = {}) {
  return await callMcpTool(toolName, args);
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
