import React, { useEffect, useState } from "react";
import { RamenChangeEvent } from "../data/ramenData";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  KeyRound,
} from "lucide-react";

interface FreshnessRadarViewProps {
  mcpAuthenticated: boolean;
  onConnectOAuth: () => void;
  oauthConnecting: boolean;
}

export const FreshnessRadarView: React.FC<FreshnessRadarViewProps> = ({
  mcpAuthenticated,
  onConnectOAuth,
  oauthConnecting,
}) => {
  const [sinceDate, setSinceDate] = useState("2026-09-01");
  const [events, setEvents] = useState<RamenChangeEvent[]>([]);
  const [sourceLabel, setSourceLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [mcpConnectionReport, setMcpConnectionReport] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [showRawMcp, setShowRawMcp] = useState(false);

  const loadChangesAndConnection = async () => {
    setLoading(true);
    try {
      const [changesRes, mcpRes] = await Promise.all([
        fetch(`/api/ramen.js?action=changes&since=${encodeURIComponent(sinceDate)}`),
        fetch("/api/mcp.js"),
      ]);
      if (changesRes.ok) {
        const changesData = await changesRes.json();
        setEvents(changesData.events || []);
        setSourceLabel(changesData.source || "");
      }
      if (mcpRes.ok) {
        const mcpData = await mcpRes.json();
        setMcpConnectionReport(mcpData);
      }
    } catch (_e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChangesAndConnection();
  }, [sinceDate]);

  return (
    <div className="space-y-10 pb-10">
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#B93829] uppercase tracking-wider">
            MCP Tool: get_ramen_changes · Shop Closure &amp; New Opening Verification
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
            Monthly Ramen Freshness &amp; Closure Radar
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-3xl leading-relaxed">
            Nothing ruins a ramen pilgrimage faster than walking 20 minutes to a shuttered shop.{" "}
            <code className="font-mono text-xs bg-stone-200/70 px-1.5 py-0.5 rounded">
              eng213035/gachi-ramen
            </code>{" "}
            audits 62,144 shops monthly to flag new openings, closure candidates, and web-confirmed closures with evidence URLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="since-date" className="text-xs font-medium text-stone-700">
            Changes Since:
          </label>
          <select
            id="since-date"
            value={sinceDate}
            onChange={(e) => setSinceDate(e.target.value)}
            className="min-h-[42px] px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl"
          >
            <option value="2026-09-01">2026-09-01 (All Recent)</option>
            <option value="2026-09-20">2026-09-20 (Last 2 Weeks)</option>
            <option value="2026-09-25">2026-09-25 (Latest Batch)</option>
          </select>
          <button
            type="button"
            onClick={loadChangesAndConnection}
            className="min-h-[42px] px-3.5 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Change Feed Cards */}
      <div className="space-y-4">
        <p className="text-xs font-mono text-stone-500">{sourceLabel}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => {
            const badgeStyle =
              ev.event_type === "new"
                ? "bg-emerald-100 text-emerald-900"
                : ev.event_type === "reopened"
                ? "bg-blue-100 text-blue-900"
                : ev.event_type === "closed_confirmed"
                ? "bg-red-100 text-red-900"
                : "bg-amber-100 text-amber-900";

            return (
              <article
                key={ev.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-mono uppercase font-semibold px-2.5 py-1 rounded-md ${badgeStyle}`}
                    >
                      {ev.event_type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {ev.event_date} · {ev.shop_id}
                    </span>
                  </div>

                  <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                    {ev.shop_name}
                  </h2>

                  <p className="text-xs text-stone-500">
                    {ev.city}, {ev.pref} · Style: <span className="font-mono">{ev.keito}</span>
                  </p>

                  <p className="text-sm text-stone-700 leading-relaxed">{ev.summary}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono">data_as_of: {ev.data_as_of}</span>
                  <a
                    href={ev.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#B93829] hover:underline font-medium"
                  >
                    <span>Source Evidence</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Live MCP Endpoint Status & Inspector (https://server.smithery.ai/eng213035/gachi-ramen) */}
      <section className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {mcpConnectionReport?.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <h2 className="font-serif-display text-xl font-semibold text-stone-900">
                MCP Endpoint Connection Status (/api/mcp.js)
              </h2>
            </div>
            <p className="text-xs font-mono text-stone-600">
              Endpoint: https://server.smithery.ai/eng213035/gachi-ramen
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!mcpAuthenticated && (
              <button
                type="button"
                onClick={onConnectOAuth}
                disabled={oauthConnecting}
                className="min-h-[40px] px-3.5 py-2 text-xs font-medium bg-[#B93829] text-white rounded-xl hover:bg-[#9E2E21] transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {oauthConnecting
                    ? "Connecting OAuth..."
                    : "Authorize gachi-ramen OAuth"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowRawMcp(!showRawMcp)}
              className="min-h-[40px] px-3.5 py-2 text-xs font-medium bg-[#F8F7F4] border border-stone-300 text-stone-800 rounded-xl hover:bg-stone-100 transition-colors"
            >
              {showRawMcp ? "Hide /api/mcp.js JSON" : "Inspect /api/mcp.js JSON"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#F8F7F4] rounded-xl">
            <p className="text-stone-500">Gateway Reachability</p>
            <p className="font-semibold text-stone-900 mt-0.5">
              {mcpConnectionReport?.connected ? "Reachable (HTTP 200/401)" : "Checking..."} ·{" "}
              <span className="font-mono">{String(mcpConnectionReport?.latencyMs || 0)}ms</span>
            </p>
          </div>
          <div className="p-3.5 bg-[#F8F7F4] rounded-xl">
            <p className="text-stone-500">Registered MCP Tools</p>
            <p className="font-mono font-semibold text-stone-900 mt-0.5">
              search_ramen · get_ramen_shop · get_ramen_changes
            </p>
          </div>
          <div className="p-3.5 bg-[#F8F7F4] rounded-xl">
            <p className="text-stone-500">Data Transparency Mode</p>
            <p className="font-semibold text-stone-900 mt-0.5">
              {mcpAuthenticated
                ? "Live Authenticated MCP Stream"
                : "Verified Schema Reference (Labeled)"}
            </p>
          </div>
        </div>

        {showRawMcp && mcpConnectionReport && (
          <pre className="p-4 bg-stone-950 text-stone-100 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
            {JSON.stringify(mcpConnectionReport, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
};
