import React, { useEffect, useState } from "react";
import { RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export interface McpToolMapping {
  id: string;
  name: string;
  miroRole: string;
  appFeature: string;
  status: string;
  dataMode: string;
}

export interface McpStatusPayload {
  endpoint: string;
  wellKnownUrl: string;
  checkedAt: string;
  httpStatus: number;
  authenticated: boolean;
  hasServerKeyConfigured: boolean;
  wwwAuthenticateHeader: string;
  oauthResourceMetadata: {
    resource?: string;
    authorization_servers?: string[];
    scopes_supported?: string[];
  };
  liveTools: unknown[];
  miroMappedTools: McpToolMapping[];
}

interface ProposalMcpViewProps {
  onNavigateTab: (tab: "itineraries" | "builder" | "hosts" | "translate" | "architecture") => void;
}

export const ProposalMcpView: React.FC<ProposalMcpViewProps> = ({ onNavigateTab }) => {
  const [mcpStatus, setMcpStatus] = useState<McpStatusPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMcpStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as McpStatusPayload;
      setMcpStatus(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to probe MCP endpoint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMcpStatus();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Section Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          Business Strategy & Technical Verification · Source of Truth: Miro Business Model Canvas
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Miro Business Proposal & Smithery MCP Toolkit Audit
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
          Every feature in UraMichi translates a specific sticky note from the attached Korea &amp; Japan Miro Business Model Canvas into a working user journey, paired with verified server-side probing of the attached Smithery MCP endpoint.
        </p>
      </div>

      {/* 1. Miro Business Canvas Analysis Grid */}
      <section aria-labelledby="miro-analysis-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 id="miro-analysis-heading" className="font-serif-display text-2xl font-semibold text-stone-900">
              01. Miro Business Model Canvas Translation
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Direct mapping from your Miro proposal sticky notes to live interactive MVP modules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Customer Segments & Value Propositions */}
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
                  <strong className="text-stone-900 font-medium">Core USP:</strong> Safe, authentic local experiences at reasonable transparent prices with after-hours access to famous sights and extraordinary hidden enclaves.
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

          {/* Key Activities */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-stone-500">Key Activities</p>
              <h3 className="font-serif-display text-xl font-semibold text-stone-900 mt-1">
                Weather-Adaptive Routing, After-Hours &amp; TTS
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
                <li>
                  <strong className="text-stone-900 font-medium">Weather Elements Considered:</strong> Real-time Open-Meteo weather feed with instant Clear vs. Rainy indoor sanctuary swaps on every stop.
                </li>
                <li>
                  <strong className="text-stone-900 font-medium">Individual &amp; Family Customization:</strong> Bespoke AI + Search-grounded itinerary builder tailored by group profile, pace, and interests.
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

          {/* Key Partners, Channels & Revenue Streams */}
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

      {/* 2. Live MCP Toolkit Assessment */}
      <section aria-labelledby="mcp-audit-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="mcp-audit-heading" className="font-serif-display text-2xl font-semibold text-stone-900">
              02. Live MCP Toolkit Assessment (mcp.smithery.ai/linpeiyun-emily)
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Real-time server-side JSON-RPC verification and mapping of the 6 Key Resources defined on your Miro board.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMcpStatus}
            disabled={loading}
            className="min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 self-start sm:self-auto whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Probing MCP Gateway..." : "Re-Verify MCP Endpoint"}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            MCP Probe Error: {error}
          </div>
        )}

        {mcpStatus && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                  <span>Endpoint: {mcpStatus.endpoint}</span>
                  <span aria-hidden="true">·</span>
                  <span>HTTP {mcpStatus.httpStatus}</span>
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
                      ? "Authenticated Smithery MCP Session Active"
                      : "OAuth 2.0 Protected MCP Gateway Verified (HTTP 401 — Bearer Token Required for Live Execution)"}
                  </p>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                  Probing <code className="font-mono text-stone-800">{mcpStatus.endpoint}</code> confirms it is protected by Smithery Connect Auth (<code className="font-mono text-stone-800">{mcpStatus.oauthResourceMetadata.authorization_servers?.[0] || "https://connect-auth.smithery.ai"}</code>, required scope: <code className="font-mono text-stone-800">connections:execute</code>). When <code className="font-mono text-stone-800">SMITHERY_API_KEY</code> is set in server secrets, JSON-RPC calls route directly through Smithery; otherwise, the MVP seamlessly uses live Open-Meteo weather, server-side Gemini 3.8 Flash &amp; TTS, and clearly labeled simulated reference datasets for Airbnb/Yelp/Skyscanner.
                </p>
              </div>
              <a
                href={mcpStatus.wellKnownUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 self-start whitespace-nowrap"
              >
                <span>View OAuth Metadata</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Table of 6 Mapped Tools from Miro "Key Resources" */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs text-stone-500">
                    <th className="py-3 pr-4 font-medium">Miro Key Resource / MCP Tool</th>
                    <th className="py-3 px-4 font-medium">Miro Proposal Purpose</th>
                    <th className="py-3 px-4 font-medium">Implemented MVP Feature</th>
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
            <li>1. Curated Korea &amp; Japan off-the-beaten-path itineraries with crowd-avoidance metrics and after-hours access windows.</li>
            <li>2. Real-time Open-Meteo weather integration with one-tap Clear vs. Rainy Day itinerary adaptation.</li>
            <li>3. Interactive Virtual Path Walker (<code className="font-mono text-xs">map-traveler-mcp</code> concept) for street-level waypoint previews.</li>
            <li>4. Multi-modal transport route comparison &amp; structured Airbnb-schema heritage stay previews (clearly labeled simulated reference data).</li>
            <li>5. Custom AI Itinerary Personalizer &amp; Live Hidden Gem Scout powered by server-side Gemini 3.8 Flash.</li>
            <li>6. Local Hobby Groups &amp; Specialist Guides marketplace with Commission + Gratitude/Tip calculator and WhatsApp/Telegram/WeChat dispatch.</li>
            <li>7. Live Japanese &amp; Korean Translation + Neural Text-to-Speech (<code className="font-mono text-xs">gemini-3.8-flash-lite-tts</code>) audio player.</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6">
          <p className="text-xs text-stone-500">Separated Post-Validation Enhancements</p>
          <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
            04. Future Phase 2 Enhancements
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-600 leading-relaxed">
            <li>1. Live OAuth 2.0 PKCE user flow with <code className="font-mono text-xs">connect-auth.smithery.ai</code> to dynamically bind per-user Smithery MCP tokens.</li>
            <li>2. Direct payment gateway settlement (Stripe / PayNow / Alipay+) for instant escrow of host commissions and gratitude tips.</li>
            <li>3. Two-way webhook sync with WhatsApp Business API and WeChat Official Account for automated itinerary changes when rain warnings trigger.</li>
            <li>4. Native offline pack caching of pre-synthesized Japanese &amp; Korean WAV audio phrases for rural mountain valleys in Nagano and Jeju.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
