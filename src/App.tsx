import React, { useEffect, useState } from "react";
import {
  RamenShopRecord,
  RamenPilgrimageTrail,
} from "./data/ramenData";
import { RamenFinderView } from "./components/RamenFinderView";
import { RegionalTrailsView } from "./components/RegionalTrailsView";
import { FreshnessRadarView } from "./components/FreshnessRadarView";
import { CounterGuideView } from "./components/CounterGuideView";
import {
  Soup,
  Compass,
  ShieldCheck,
  Ticket,
  Bookmark,
  Trash2,
  CheckCircle2,
  X,
  KeyRound,
  MapPin,
  Banknote,
} from "lucide-react";

type ActiveTab = "finder" | "trails" | "freshness" | "counter";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("finder");
  const [savedShops, setSavedShops] = useState<RamenShopRecord[]>([
    {
      id: "rk_001042",
      name: "中華そば 銀座 八五",
      name_en: "Chuka Soba Ginza Hachigo",
      pref: "Tokyo",
      pref_ja: "東京都",
      city: "Chuo-ku",
      city_ja: "中央区",
      neighborhood: "Higashi-Ginza Backstreet",
      address: "3-14-2 Ginza, Chuo-ku, Tokyo",
      keito: "shoyu",
      keitoLabel: "Clear French-Technique Duck & Prosciutto Consommé Shoyu",
      status: "active",
      lat: 35.6694,
      lng: 139.7689,
      station_id: "st_28014",
      station_name: "Higashi-Ginza Station (Exit A2)",
      station_distance_m: 190,
      hours: "11:00–16:00 (Soup sell-out closure)",
      late_night: false,
      payment: {
        cash_only: false,
        card_ok: true,
        ic_card_ok: true,
        qr_pay_ok: false,
        ticket_machine: "Touchscreen Kenbaiki (English UI supported)",
      },
      signatureBowl:
        "Tokusei Chuka Soba — Tare-free golden broth brewed from Nagoya Cochin chicken, duck, cured ham, and Rishiri kelp.",
      priceRangeJpy: "¥1,400–¥1,800 (Simulated Reference)",
      travelerTip:
        "Line forms at 10:15 AM; 6 hinoki counter seats only. Suica/Pasmo accepted at the ticket machine.",
      first_seen: "2024-04-01",
      last_seen: "2026-10-01",
      data_as_of: "2026-10-01",
      closure_evidence_url: null,
    },
  ]);
  const [crawlDrawerOpen, setCrawlDrawerOpen] = useState(false);
  const [crawlSavedNotice, setCrawlSavedNotice] = useState(false);
  const [travelerNotes, setTravelerNotes] = useState(
    "Arrive 25 mins before opening; carry ¥3,000 in ¥1,000 notes + charged Suica card."
  );

  // Live MCP Connection State (https://server.smithery.ai/eng213035/gachi-ramen)
  const [mcpAuthenticated, setMcpAuthenticated] = useState(false);
  const [oauthConnecting, setOauthConnecting] = useState(false);

  const checkMcpAuthStatus = async () => {
    try {
      const res = await fetch("/api/mcp.js");
      if (res.ok) {
        const data = await res.json();
        setMcpAuthenticated(Boolean(data?.authenticated));
      }
    } catch (_e) {
      // ignore
    }
  };

  useEffect(() => {
    checkMcpAuthStatus();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setOauthConnecting(false);
        checkMcpAuthStatus();
      } else if (event.data?.type === "OAUTH_AUTH_ERROR") {
        setOauthConnecting(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnectSmitheryOAuth = async () => {
    setOauthConnecting(true);
    try {
      const origin = window.location.origin;
      const res = await fetch(
        `/api/mcp/oauth/url?origin=${encodeURIComponent(origin)}`
      );
      const data = await res.json();
      if (res.ok && data.url) {
        const popup = window.open(
          data.url,
          "gachi_ramen_oauth_popup",
          "width=600,height=720"
        );
        if (!popup) {
          setOauthConnecting(false);
        }
      } else {
        setOauthConnecting(false);
      }
    } catch (_e) {
      setOauthConnecting(false);
    }
  };

  const handleToggleSaveShop = (shop: RamenShopRecord) => {
    setCrawlSavedNotice(false);
    setSavedShops((prev) =>
      prev.some((s) => s.id === shop.id)
        ? prev.filter((s) => s.id !== shop.id)
        : [...prev, shop]
    );
  };

  const handleLoadTrailIntoCrawl = async (trail: RamenPilgrimageTrail) => {
    setCrawlSavedNotice(false);
    try {
      const res = await fetch("/api/ramen.js?action=search&pref=ALL&status=ALL");
      if (res.ok) {
        const data = await res.json();
        const allShops = (data.shops || []) as RamenShopRecord[];
        const matched = allShops.filter((s) => trail.shopIds.includes(s.id));
        setSavedShops((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const additions = matched.filter((m) => !existingIds.has(m.id));
          return [...prev, ...additions];
        });
        setCrawlDrawerOpen(true);
      }
    } catch (_e) {
      setCrawlDrawerOpen(true);
    }
  };

  const savedShopIds = savedShops.map((s) => s.id);
  const cashOnlyCount = savedShops.filter((s) => s.payment.cash_only).length;
  const totalStationWalkMeters = savedShops.reduce(
    (sum, s) => sum + (s.station_distance_m || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#141413]">
      {/* Top Bar: Brand Wordmark — 4 Traveller Navigation Tabs — My Ramen Crawl Button */}
      <header className="sticky top-0 z-30 h-14 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab("finder")}
          className="font-serif-display text-2xl font-semibold tracking-tight text-stone-900 whitespace-nowrap flex items-center gap-2"
        >
          <Soup className="w-5 h-5 text-[#B93829]" />
          <span>GachiRamen Japan</span>
        </button>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          {(
            [
              { id: "finder", label: "Ramen Finder (62k DB)" },
              { id: "trails", label: "Regional Trails" },
              { id: "freshness", label: "Freshness & Closures" },
              { id: "counter", label: "Ticket Machine Guide" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === item.id
                  ? "text-stone-950 border-[#B93829]"
                  : "border-transparent hover:text-stone-950"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setCrawlDrawerOpen(true)}
            className="min-h-[40px] px-4 py-2 text-xs font-medium text-white bg-[#B93829] hover:bg-[#9E2E21] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Bookmark className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">My Ramen Crawl ({savedShops.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16">
        {activeTab === "finder" && (
          <RamenFinderView
            savedShopIds={savedShopIds}
            onToggleSaveShop={handleToggleSaveShop}
            onOpenTrails={() => setActiveTab("trails")}
            onConnectOAuth={handleConnectSmitheryOAuth}
            oauthConnecting={oauthConnecting}
          />
        )}

        {activeTab === "trails" && (
          <RegionalTrailsView
            savedShopIds={savedShopIds}
            onLoadTrailIntoCrawl={handleLoadTrailIntoCrawl}
          />
        )}

        {activeTab === "freshness" && (
          <FreshnessRadarView
            mcpAuthenticated={mcpAuthenticated}
            onConnectOAuth={handleConnectSmitheryOAuth}
            oauthConnecting={oauthConnecting}
          />
        )}

        {activeTab === "counter" && <CounterGuideView />}
      </main>

      {/* Footer with MCP Endpoint & Health Links */}
      <footer className="border-t border-stone-200/90 bg-white py-8 px-4 sm:px-8 mb-16 md:mb-0">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-serif-display text-lg font-semibold text-stone-900 mr-2">
              GachiRamen Japan
            </span>
            <span>
              Powered Exclusively by{" "}
              <code className="font-mono text-stone-700">
                https://server.smithery.ai/eng213035/gachi-ramen
              </code>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {!mcpAuthenticated ? (
              <button
                type="button"
                onClick={handleConnectSmitheryOAuth}
                disabled={oauthConnecting}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-stone-700 bg-[#F8F7F4] border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#B93829]" />
                <span>
                  {oauthConnecting
                    ? "Connecting gachi-ramen..."
                    : "Authorize Live gachi-ramen MCP"}
                </span>
              </button>
            ) : (
              <span className="text-emerald-800 font-medium">
                Live MCP Connected (eng213035/gachi-ramen)
              </span>
            )}
            <a
              href="/api/mcp.js"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 underline underline-offset-4"
            >
              MCP Connection (/api/mcp.js)
            </a>
            <a
              href="/api/health.js"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 underline underline-offset-4"
            >
              MCP Health (/api/health.js)
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 backdrop-blur-md border-t border-stone-200 grid grid-cols-4 items-center px-1"
      >
        {(
          [
            { id: "finder", label: "Finder", icon: Soup },
            { id: "trails", label: "Trails", icon: Compass },
            { id: "freshness", label: "Closures", icon: ShieldCheck },
            { id: "counter", label: "Order Guide", icon: Ticket },
          ] as const
        ).map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                isActive ? "text-[#B93829] font-semibold" : "text-stone-500"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* My Ramen Crawl & Pocket Passport Drawer */}
      {crawlDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Saved Ramen Crawl Itinerary"
        >
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <p className="text-xs font-mono text-[#B93829]">
                    End-to-End Japan Ramen Pilgrimage Sheet
                  </p>
                  <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                    My Saved Ramen Crawl ({savedShops.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCrawlDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-xl"
                  aria-label="Close Ramen Crawl Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Readiness Summary */}
              {savedShops.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Banknote className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cash-Only Shops</span>
                    </div>
                    <p className="font-mono font-semibold text-stone-900 text-sm">
                      {cashOnlyCount} of {savedShops.length} shops
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-[#B93829]" />
                      <span>Total Station Walk</span>
                    </div>
                    <p className="font-mono font-semibold text-stone-900 text-sm">
                      {totalStationWalkMeters}m (~{Math.ceil(totalStationWalkMeters / 80)} mins)
                    </p>
                  </div>
                </div>
              )}

              {/* Saved Ramen Shops List */}
              <div className="space-y-3">
                {savedShops.length === 0 ? (
                  <p className="text-xs text-stone-500 p-4 bg-[#F8F7F4] rounded-xl">
                    No ramen shops saved yet. Browse the Ramen Finder or load a Regional Trail to build your Japan Ramen Crawl.
                  </p>
                ) : (
                  savedShops.map((shop, idx) => (
                    <div
                      key={shop.id}
                      className="p-4 bg-[#F8F7F4] rounded-xl flex items-start justify-between gap-3 border border-stone-200/80"
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono text-stone-500">
                          BOWL 0{idx + 1} · {shop.id} · {shop.pref}
                        </p>
                        <h3 className="text-sm font-semibold text-stone-900">
                          {shop.name_en} ({shop.name})
                        </h3>
                        <p className="text-xs text-[#B93829] font-medium">
                          {shop.keitoLabel}
                        </p>
                        <p className="text-xs text-stone-600">
                          {shop.station_name} ({shop.station_distance_m}m) ·{" "}
                          {shop.payment.cash_only ? "Cash Only" : "Suica / IC OK"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSaveShop(shop)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center text-stone-400 hover:text-red-700"
                        aria-label={`Remove ${shop.name_en}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Personal Crawl Notes & Save Action */}
              {savedShops.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <label
                    htmlFor="crawl-notes"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Personal Queueing &amp; Noodle Preference Notes
                  </label>
                  <textarea
                    id="crawl-notes"
                    rows={3}
                    value={travelerNotes}
                    onChange={(e) => setTravelerNotes(e.target.value)}
                    className="w-full p-3 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-800"
                  />

                  {crawlSavedNotice ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Ramen Crawl Pass finalized and copied to your clipboard for offline station navigation!
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const summaryText = savedShops
                          .map(
                            (s, i) =>
                              `${i + 1}. ${s.name_en} (${s.name}) — ${s.station_name} (${s.station_distance_m}m) [${s.id}]`
                          )
                          .join("\n");
                        navigator.clipboard?.writeText(
                          `GachiRamen Japan Crawl:\n${summaryText}\nNotes: ${travelerNotes}`
                        );
                        setCrawlSavedNotice(true);
                      }}
                      className="w-full min-h-[46px] px-5 py-3 text-xs font-medium bg-[#B93829] hover:bg-[#9E2E21] text-white rounded-xl transition-colors"
                    >
                      Finalize &amp; Copy Offline Ramen Crawl Sheet
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
