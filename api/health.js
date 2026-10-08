/**
 * /api/health.js
 * Health monitor for https://ramen.gachi-tokusuru.com/mcp
 */

import {
  probeAndListMcpTools,
  MCP_ENDPOINT,
  ATTACHED_MCP_SERVERS,
} from "./mcpClient.js";

export async function checkMcpAndServicesHealth() {
  const startedAt = Date.now();
  const probe = await probeAndListMcpTools();
  const discoveredNames = (probe.tools || []).map((t) => t.name || String(t));

  const mcpServersStatus = ATTACHED_MCP_SERVERS.map((srv) => {
    const matchedTools = srv.tools.filter((toolName) =>
      discoveredNames.some(
        (dName) =>
          dName === toolName ||
          dName.endsWith(`_${toolName}`) ||
          dName.includes(toolName)
      )
    );

    return {
      qualifiedName: srv.id,
      endpoint: srv.endpoint,
      displayName: srv.displayName,
      expectedTools: srv.tools,
      discoveredMatchingTools: matchedTools,
      description: srv.description,
      status: probe.reachable ? "live_connected" : "unreachable",
      dataMode: probe.reachable
        ? `Live MCP Execution (${MCP_ENDPOINT})`
        : "Fallback Reference Mode (MCP Server Unreachable)",
    };
  });

  return {
    status: probe.reachable ? "ok" : "degraded",
    endpoint: MCP_ENDPOINT,
    timestamp: new Date().toISOString(),
    totalCheckDurationMs: Date.now() - startedAt,
    gateway: {
      endpoint: probe.endpoint,
      reachable: probe.reachable,
      httpStatus: probe.httpStatus,
      authenticated: probe.authenticated,
      latencyMs: probe.latencyMs,
      serverInfo: probe.serverInfo,
      pingInfo: probe.pingInfo,
      discoveredToolsCount: discoveredNames.length,
      discoveredTools: discoveredNames,
      error: probe.error,
    },
    mcpServers: mcpServersStatus,
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
