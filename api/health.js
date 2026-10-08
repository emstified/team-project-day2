/**
 * /api/health.js
 * Health monitor for https://mcp.smithery.ai/linpeiyun-emily and its 4 configured MCP servers:
 * 1. eng213035/gachi-ramen
 * 2. eng213035/tokyo-restroom
 * 3. haomingkoo/japan-seasons-mcp
 * 4. kakar-satoshi/japan-holiday-mcp
 */

import {
  probeAndListMcpTools,
  MCP_ENDPOINT,
  OAUTH_ISSUER,
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
          dName.endsWith(`/${toolName}`) ||
          dName.includes(toolName)
      )
    );

    return {
      qualifiedName: srv.id,
      displayName: srv.displayName,
      expectedTools: srv.tools,
      discoveredMatchingTools: matchedTools,
      miroAlignment: srv.miroAlignment,
      status: probe.authenticated
        ? "live_authenticated"
        : probe.reachable
        ? "reachable_oauth_required"
        : "unreachable",
      dataMode: probe.authenticated
        ? "Live Smithery MCP Endpoint Execution"
        : "Simulated Reference Data (Awaiting OAuth Bearer Token)",
    };
  });

  const overallHealthy = probe.reachable && probe.oauthDiscovery.reachable;

  return {
    status: overallHealthy ? "ok" : "degraded",
    endpoint: MCP_ENDPOINT,
    timestamp: new Date().toISOString(),
    totalCheckDurationMs: Date.now() - startedAt,
    gateway: {
      endpoint: probe.endpoint,
      reachable: probe.reachable,
      httpStatus: probe.httpStatus,
      authenticated: probe.authenticated,
      hasTokenConfigured: probe.hasTokenConfigured,
      latencyMs: probe.latencyMs,
      wwwAuthenticate: probe.wwwAuthenticate,
      oauthDiscovery: probe.oauthDiscovery,
      discoveredToolsCount: discoveredNames.length,
      discoveredTools: discoveredNames,
      error: probe.error,
    },
    mcpServers: mcpServersStatus,
    oauthReadiness: {
      issuer: OAUTH_ISSUER,
      dynamicClientRegistration: true,
      pkceS256: true,
      callbackPath: "/auth/callback",
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
