import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  Play,
  LogOut,
} from "lucide-react";

export interface McpToolMapping {
  id: string;
  name: string;
  miroRole: string;
  appFeature: string;
  status: string;
  dataMode: string;
}

export interface DiscoveredMcpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpStatusPayload {
  endpoint: string;
  wellKnownUrl: string;
  checkedAt: string;
  httpStatus: number;
  authenticated: boolean;
  hasServerKeyConfigured: boolean;
  latencyMs?: number;
  wwwAuthenticateHeader: string;
  oauthResourceMetadata: {
    resource?: string;
    authorization_servers?: string[];
    scopes_supported?: string[];
  };
  liveTools: DiscoveredMcpTool[];
  miroMappedTools: McpToolMapping[];
}

interface ProposalMcpViewProps {
  onNavigateTab: (tab: "itineraries" | "builder" | "hosts" | "translate" | "architecture") => void;
}

export const ProposalMcpView: React.FC<ProposalMcpViewProps> = ({ onNavigateTab }) => {
  const [mcpStatus, setMcpStatus] = useState<McpStatusPayload | null>(null);
  const [healthPayload, setHealthPayload] = useState<Record<string, unknown> | null>(null);
  const [showHealthJson, setShowHealthJson] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive MCP Tool Runner state
  const [selectedToolName, setSelectedToolName] = useState("");
  const [toolArgsJson, setToolArgsJson] = useState('{\n  "query": "Kyoto hidden after-hours temples"\n}');
  const [toolRunning, setToolRunning] = useState(false);
  const [toolOutput, setToolOutput] = useState<unknown>(null);
  const [toolError, setToolError] = useState<string | null>(null);

  const fetchMcpStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, healthRes] = await Promise.all([
        fetch("/api/mcp/status"),
        fetch("/api/health.js"),
      ]);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as McpStatusPayload;
      setMcpStatus(data);
      if (data.liveTools?.length > 0 && !selectedToolName) {
        setSelectedToolName(data.liveTools[0].name);
      }
      if (healthRes.ok) {
        const hData = (await healthRes.json()) as Record<string, unknown>;
        setHealthPayload(hData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to probe MCP endpoint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMcpStatus();
  }, []);

  // Listen for OAuth popup completion message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setOauthConnecting(false);
        fetchMcpStatus();
      } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
        setOauthConnecting(false);
        setError(event.data.error || "Smithery OAuth authorization was cancelled.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnectSmitheryOAuth = async () => {
    setOauthConnecting(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/mcp/oauth/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to generate Smithery OAuth URL");
      }

      // Open OAuth provider URL directly in popup per iframe guidelines
      const popup = window.open(data.url, "smithery_oauth_popup", "width=600,height=720");
      if (!popup) {
        setOauthConnecting(false);
        setError("Popup was blocked by the browser. Please allow popups for this site.");
      }
    } catch (err: unknown) {
      setOauthConnecting(false);
      setError(err instanceof Error ? err.message : "OAuth initialization failed");
    }
  };

  const handleDisconnectMcp = async () => {
    await fetch("/api/mcp/disconnect", { method: "POST" });
    setToolOutput(null);
    fetchMcpStatus();
  };

  const handleExecuteMcpTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolName) return;
    setToolRunning(true);
    setToolError(null);
    setToolOutput(null);
    try {
      const parsedArgs = JSON.parse(toolArgsJson || "{}");
      const res = await fetch("/api/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedToolName,
          args: parsedArgs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tool invocation failed");
      setToolOutput(data);
    } catch (err: unknown) {
      setToolError(err instanceof Error ? err.message : "Invalid JSON arguments or tool error");
    } finally {
      setToolRunning(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Section Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          Business Strategy &amp; Exclusive MCP Endpoint Audit · Source of Truth: Master_prompt.MD
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Miro Business Proposal &amp; Smithery MCP Endpoint Integration
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
          Built strictly around your attached Miro Business Model Canvas and exclusively bound to your Smithery MCP endpoint (<code className="font-mono text-xs text-stone-900">https://mcp.smithery.ai/linpeiyun-emily</code>) with live OAuth 2.0 PKCE authentication and <code className="font-mono text-xs text-stone-900">/api/health.js</code> monitoring.
        </p>
      </div>

      {/* 1. Miro Business Canvas Analysis Grid */}
      <section aria-labelledby="miro-analysis-heading" className="space-y-6">
        <div>
          <h2 id="miro-analysis-heading" className="font-serif-display text-2xl font-semibold text-stone-900">
            01. Miro Business Model Canvas Translation
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Direct mapping from every Miro sticky note to working user journeys in this MVP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-stone-500">Customer Segments &amp; Key Propositions</p>
              <h3 className="font-serif-display text-xl font-semibold text-stone-900 mt-1">
                Affluent, Adventurous &amp; Crowd-Weary Travellers
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
                <li>
                  <strong className="text-stone-900 font-medium">Pain Point Solved:</strong> Travellers who are &ldquo;sick of common tourist places that are often crowded&rdquo; in Korea and Japan.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Core USP:</strong> Safe, authentic local experiences at reasonable transparent prices with after-hours access to sights and extraordinary hidden enclaves.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">End-to-End Planning:</strong> Recommends not only places, but also the best transport route and curated architectural accommodation.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("itineraries")}
              className="mt-6 min-h-[44px] px-4 py-2 text-xs font-medium text-[#1E3A5F] border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between whitespace-nowrap"
            >
              <span>Inspect Curated Itineraries</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-stone-500">Key Activities</p>
              <h3 className="font-serif-display text-xl font-semibold text-stone-900 mt-1">
                Weather-Adaptive Routing, After-Hours &amp; TTS
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
                <li>
                  <strong className="text-stone-900 font-medium">Weather Elements Considered:</strong> Instant Clear vs. Rainy indoor sanctuary swaps on every stop so bad weather never ruins a trip.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Individual &amp; Family Customization:</strong> Bespoke itinerary builder tailored by group profile, pace, and personal interests.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Translation (Text-to-Speech):</strong> Live Japanese &amp; Korean polite translation with server-side Gemini neural audio playback.
                </li>
              </ul>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab("builder")}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-medium text-[#1E3A5F] border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between whitespace-nowrap"
              >
                <span>Open Custom Builder</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("translate")}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-medium text-[#1E3A5F] border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between whitespace-nowrap"
              >
                <span>Test Voice TTS</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-stone-500">Partners, Channels &amp; Revenue Model</p>
              <h3 className="font-serif-display text-xl font-semibold text-stone-900 mt-1">
                Local Hobby Groups, WhatsApp/WeChat &amp; Gratitude
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
                <li>
                  <strong className="text-stone-900 font-medium">Key Partners:</strong> Fun local individuals, ground-up hobby groups (vinyl, ceramics, foraging), specialized guides, and boutique tour agencies.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Customer Relationships &amp; Channels:</strong> Direct traveller feedback loop plus instant WhatsApp, WeChat, and Telegram dispatch; Corporate Incentives inquiry flow.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Revenue Streams:</strong> Transparent 12% platform commission, local host Tips / Gratitude selector, and clearly labeled Featured Artisans.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("hosts")}
              className="mt-6 min-h-[44px] px-4 py-2 text-xs font-medium text-[#1E3A5F] border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between whitespace-nowrap"
            >
              <span>Meet Local Hosts &amp; Send Gratitude</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Live MCP Toolkit Assessment & OAuth 2.0 Connection */}
      <section aria-labelledby="mcp-audit-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="mcp-audit-heading" className="font-serif-display text-2xl font-semibold text-stone-900">
              02. Exclusive Smithery MCP Toolkit (mcp.smithery.ai/linpeiyun-emily)
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Real-time JSON-RPC verification, OAuth 2.0 PKCE authorization, and live tool invocation for your endpoint.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!mcpStatus?.authenticated ? (
              <button
                type="button"
                onClick={handleConnectSmitheryOAuth}
                disabled={oauthConnecting}
                className="min-h-[44px] px-4 py-2 text-xs font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {oauthConnecting
                    ? "Waiting for Smithery Auth..."
                    : "Authorize Smithery MCP (OAuth 2.0)"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDisconnectMcp}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-stone-700 border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect MCP Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchMcpStatus}
              disabled={loading}
              className="min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Probing..." : "Re-Verify /api/health.js"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {error}
          </div>
        )}

        {mcpStatus && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                  <span>Endpoint: {mcpStatus.endpoint}</span>
                  <span aria-hidden="true">·</span>
                  <span>HTTP {mcpStatus.httpStatus}</span>
                  {mcpStatus.latencyMs !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Latency: {mcpStatus.latencyMs}ms</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>Checked: {new Date(mcpStatus.checkedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {mcpStatus.authenticated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  )}
                  <p className="text-sm font-medium text-stone-900">
                    {mcpStatus.authenticated
                      ? `Authenticated Smithery MCP Session Active (${mcpStatus.liveTools.length} Live Tools Discovered)`
                      : "OAuth 2.0 Protected MCP Endpoint Verified (HTTP 401 — Click 'Authorize Smithery MCP' Above to Connect)"}
                  </p>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                  Per <code className="font-mono text-stone-800">Master_prompt.MD</code>, this application exclusively targets <code className="font-mono text-stone-800">{mcpStatus.endpoint}</code>. The endpoint uses Smithery Connect Auth (<code className="font-mono text-stone-800">https://connect-auth.smithery.ai</code>, scope: <code className="font-mono text-stone-800">connections:execute</code>) with RFC 7591 Dynamic Client Registration and PKCE S256. Until you authorize via the popup button above (or set <code className="font-mono text-stone-800">SMITHERY_API_KEY</code>), all travel prices, stays, and schedules are transparently labeled as simulated reference data.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={() => setShowHealthJson(!showHealthJson)}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-mono text-stone-800 bg-[#F8F7F4] border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors whitespace-nowrap"
                >
                  {showHealthJson ? "Hide /api/health.js JSON" : "Inspect /api/health.js"}
                </button>
                <a
                  href={mcpStatus.wellKnownUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>View OAuth Metadata</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {showHealthJson && healthPayload && (
              <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                  <span>GET /api/health.js — Live Smithery MCP Monitor</span>
                  <span>Status: {String(healthPayload.status || "ok").toUpperCase()}</span>
                </div>
                <pre className="text-[11px] font-mono overflow-x-auto max-h-72">
                  {JSON.stringify(healthPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Live Discovered Tools & Interactive Runner (when authenticated) */}
            {mcpStatus.authenticated && mcpStatus.liveTools.length > 0 && (
              <div className="p-5 bg-[#F8F7F4] border border-stone-200 rounded-2xl space-y-4">
                <div>
                  <p className="text-xs text-emerald-800 font-medium">
                    Live Tools Discovered on {mcpStatus.endpoint}
                  </p>
                  <h3 className="font-serif-display text-xl font-semibold text-stone-900">
                    Execute Endpoint MCP Tool Directly
                  </h3>
                </div>

                <form onSubmit={handleExecuteMcpTool} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-4 space-y-1.5">
                    <label htmlFor="mcp-tool-select" className="block text-xs font-medium text-stone-700">
                      Discovered Tool ({mcpStatus.liveTools.length})
                    </label>
                    <select
                      id="mcp-tool-select"
                      value={selectedToolName}
                      onChange={(e) => setSelectedToolName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl"
                    >
                      {mcpStatus.liveTools.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <label htmlFor="mcp-tool-args" className="block text-xs font-medium text-stone-700">
                      JSON Arguments
                    </label>
                    <textarea
                      id="mcp-tool-args"
                      rows={2}
                      value={toolArgsJson}
                      onChange={(e) => setToolArgsJson(e.target.value)}
                      className="w-full p-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button
                      type="submit"
                      disabled={toolRunning}
                      className="w-full min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{toolRunning ? "Calling..." : "Call Tool"}</span>
                    </button>
                  </div>
                </form>

                {toolError && <p className="text-xs text-red-700">{toolError}</p>}
                {toolOutput !== null && (
                  <pre className="p-3.5 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                    {JSON.stringify(toolOutput, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Table of 6 Mapped Tools from Miro "Key Resources" */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs text-stone-500">
                    <th className="py-3 pr-4 font-medium">Miro Key Resource / MCP Tool</th>
                    <th className="py-3 px-4 font-medium">Miro Proposal Purpose</th>
                    <th className="py-3 px-4 font-medium">Endpoint Mapping</th>
                    <th className="py-3 pl-4 font-medium">Verification &amp; Data Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {mcpStatus.miroMappedTools.map((tool) => (
                    <tr key={tool.id} className="align-top">
                      <td className="py-3.5 pr-4 font-medium text-stone-900 whitespace-nowrap">
                        {tool.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 text-xs leading-relaxed max-w-xs">
                        {tool.miroRole}
                      </td>
                      <td className="py-3.5 px-4 text-stone-800 text-xs leading-relaxed">
                        {tool.appFeature}
                      </td>
                      <td className="py-3.5 pl-4 text-xs text-stone-600 font-mono">
                        {tool.status} · {tool.dataMode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 3. MVP Scope & Future Roadmap */}
      <section aria-labelledby="mvp-scope-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6">
          <p className="text-xs text-stone-500">Delivered in This Prototype</p>
          <h2 id="mvp-scope-heading" className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
            03. Core End-to-End MVP Scope
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
            <li>1. Exclusive Smithery MCP Client (<code className="font-mono text-xs">https://mcp.smithery.ai/linpeiyun-emily</code>) with OAuth 2.0 Dynamic Client Registration + PKCE popup flow and <code className="font-mono text-xs">/api/health.js</code> monitor.</li>
            <li>2. Curated Korea &amp; Japan off-the-beaten-path itineraries with crowd-avoidance metrics and after-hours access windows.</li>
            <li>3. Weather-adaptive routing with one-tap Clear vs. Rainy Day indoor sanctuary swaps.</li>
            <li>4. Interactive Virtual Path Walker (<code className="font-mono text-xs">map-traveler-mcp</code> concept), transport route comparison, and structured Airbnb-schema stay previews (clearly labeled simulated reference data).</li>
            <li>5. Custom Itinerary Personalizer &amp; Hidden Gem Scout, Local Hobby Groups marketplace with Commission + Gratitude/Tip calculator, and Japanese/Korean Neural TTS.</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6">
          <p className="text-xs text-stone-500">Separated Post-Validation Enhancements</p>
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
            04. Future Phase 2 Enhancements
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
            <li>1. Persistent encrypted database storage for multi-user Smithery OAuth refresh tokens across container restarts.</li>
            <li>2. Direct payment gateway settlement (Stripe / PayNow / Alipay+) for instant escrow of host commissions and gratitude tips.</li>
            <li>3. Two-way webhook sync with WhatsApp Business API and WeChat Official Account for automated itinerary changes when rain warnings trigger.</li>
            <li>4. Native offline pack caching of pre-synthesized Japanese &amp; Korean WAV audio phrases for rural mountain valleys in Nagano and Jeju.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
