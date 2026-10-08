/**
 * /api/mcp.js
 * Checks the connection of the Smithery MCP server (https://mcp.smithery.ai/linpeiyun-emily)
 * and pulls data from the 4 attached MCP tools:
 * - eng213035/gachi-ramen
 * - eng213035/tokyo-restroom
 * - haomingkoo/japan-seasons-mcp
 * - kakar-satoshi/japan-holiday-mcp
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
 * Checks the connection and authentication state of the MCP server.
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
 * Pulls data from the MCP server for a given tool and arguments.
 */
export async function pullDataFromMcpServer(toolName, args = {}) {
  return await callSmitheryMcpTool(toolName, args);
}

/**
 * HTTP Handler for /api/mcp and /api/mcp.js
 * - GET: Checks the connection of the MCP server
 * - POST: Pulls data from a specified MCP tool ({ tool, toolName, args })
 */
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

    // Default GET: Check connection of the MCP server
    const connectionStatus = await checkMcpServerConnection();
    return res.status(200).json({
      status: connectionStatus.connected ? "ok" : "unreachable",
      ...connectionStatus,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      endpoint: MCP_ENDPOINT,
      message: error instanceof Error ? error.message : "MCP server connection check failed",
    });
  }
}
