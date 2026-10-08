import React, { useEffect, useState } from "react";
import { CURATED_ITINERARIES } from "./data/travelData";
import { ItinerariesView } from "./components/ItinerariesView";
import { CustomBuilderView, GeneratedCustomPlan } from "./components/CustomBuilderView";
import { LocalScoutView } from "./components/LocalScoutView";
import { LocalHostsView } from "./components/LocalHostsView";
import { TranslateTtsView } from "./components/TranslateTtsView";
import {
  Compass,
  Sparkles,
  Soup,
  Users,
  Languages,
  Briefcase,
  Trash2,
  CheckCircle2,
  X,
  KeyRound,
} from "lucide-react";

type ActiveTab = "itineraries" | "builder" | "scout" | "hosts" | "translate";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("itineraries");
  const [savedItineraryIds, setSavedItineraryIds] = useState<string[]>([
    "kyoto-after-hours-sanctuary",
  ]);
  const [savedCustomPlans, setSavedCustomPlans] = useState<GeneratedCustomPlan[]>([]);
  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);

  // Smithery MCP Live Connection State
  const [mcpAuthenticated, setMcpAuthenticated] = useState(false);
  const [oauthConnecting, setOauthConnecting] = useState(false);

  // End-to-End Concierge Hold Checkout State
  const [travelerName, setTravelerName] = useState("");
  const [travelerContact, setTravelerContact] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<"WhatsApp" | "WeChat" | "Telegram">(
    "WhatsApp"
  );
  const [travelMonth, setTravelMonth] = useState("November 2026 (Autumn Foliage Window)");
  const [gratitudeTipUsd, setGratitudeTipUsd] = useState(30);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
      const res = await fetch(`/api/mcp/oauth/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      if (res.ok && data.url) {
        const popup = window.open(data.url, "smithery_oauth_popup", "width=600,height=720");
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

  const handleToggleSaveItinerary = (id: string) => {
    setBookingConfirmed(false);
    setSavedItineraryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveCustomPlan = (plan: GeneratedCustomPlan) => {
    setBookingConfirmed(false);
    setSavedCustomPlans((prev) => [plan, ...prev]);
  };

  const savedCatalogItems = CURATED_ITINERARIES.filter((it) =>
    savedItineraryIds.includes(it.id)
  );
  const totalSavedCount = savedCatalogItems.length + savedCustomPlans.length;

  const subtotalUsd = savedCatalogItems.reduce((sum, item) => sum + item.referencePriceUsd, 0);
  const commissionUsd = Math.round(subtotalUsd * 0.12);
  const grandTotalUsd = subtotalUsd + commissionUsd + gratitudeTipUsd;

  const handleConfirmTripHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName.trim() || !travelerContact.trim()) return;
    setBookingConfirmed(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#141413]">
      {/* Top Bar Contract: Strictly 1 Row, 3 Zones (Brand Wordmark — 5 Traveller Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 h-14 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab("itineraries")}
          className="font-serif-display text-2xl font-semibold tracking-tight text-stone-900 whitespace-nowrap"
        >
          UraMichi
        </button>

        {/* Zone 2: 5 clean traveller navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          {(
            [
              { id: "itineraries", label: "Itineraries" },
              { id: "builder", label: "Custom Builder" },
              { id: "scout", label: "Ramen & Comfort" },
              { id: "hosts", label: "Local Hosts" },
              { id: "translate", label: "Voice Translate" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === item.id
                  ? "text-stone-950 border-[#1E3A5F]"
                  : "border-transparent hover:text-stone-950"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setTripDrawerOpen(true)}
            className="min-h-[40px] px-4 py-2 text-xs font-medium text-white bg-[#1E3A5F] hover:bg-[#162B47] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">Trip Brief ({totalSavedCount})</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-8 pt-6 pb-24 md:pb-16">
        {activeTab === "itineraries" && (
          <ItinerariesView
            savedItineraryIds={savedItineraryIds}
            onToggleSaveItinerary={handleToggleSaveItinerary}
            onOpenCustomBuilder={() => setActiveTab("builder")}
            onOpenBookingDrawer={() => setTripDrawerOpen(true)}
          />
        )}

        {activeTab === "builder" && (
          <CustomBuilderView
            onSaveCustomPlan={(plan) => {
              handleSaveCustomPlan(plan);
              setTripDrawerOpen(true);
            }}
          />
        )}

        {activeTab === "scout" && <LocalScoutView />}

        {activeTab === "hosts" && <LocalHostsView />}

        {activeTab === "translate" && <TranslateTtsView />}
      </main>

      {/* Quiet Editorial Footer with Smithery MCP Live Auth Trigger */}
      <footer className="border-t border-stone-200/90 bg-white py-8 px-4 sm:px-8 mb-16 md:mb-0">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-serif-display text-lg font-semibold text-stone-900 mr-2">
              UraMichi
            </span>
            <span>
              Korea &amp; Japan Off-the-Beaten-Path &amp; After-Hours Travel Concierge · Simulated Reference Pricing Disclosed
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {!mcpAuthenticated ? (
              <button
                type="button"
                onClick={handleConnectSmitheryOAuth}
                disabled={oauthConnecting}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-stone-700 bg-[#F8F7F4] border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#1E3A5F]" />
                <span>
                  {oauthConnecting ? "Connecting Smithery MCP..." : "Authorize Live Smithery MCP"}
                </span>
              </button>
            ) : (
              <span className="text-emerald-800 font-medium">
                Smithery MCP Connected (linpeiyun-emily)
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

      {/* Mobile Fixed Bottom Navigation Bar (Ergonomic Thumb Zone, <15% Viewport Height) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 backdrop-blur-md border-t border-stone-200 grid grid-cols-5 items-center px-1"
      >
        {(
          [
            { id: "itineraries", label: "Routes", icon: Compass },
            { id: "builder", label: "Builder", icon: Sparkles },
            { id: "scout", label: "Ramen/WC", icon: Soup },
            { id: "hosts", label: "Hosts", icon: Users },
            { id: "translate", label: "Translate", icon: Languages },
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
                isActive ? "text-[#1E3A5F] font-semibold" : "text-stone-500"
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

      {/* End-to-End Trip Brief & Concierge Hold Drawer */}
      {tripDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Saved Trip Brief and Concierge Reservation"
        >
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <p className="text-xs text-stone-500">End-to-End Concierge Brief</p>
                  <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                    Your Korea &amp; Japan Hidden Path Dossier
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setTripDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-xl"
                  aria-label="Close Trip Brief"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Saved Curated Itineraries */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-stone-700">
                  Selected Curated Routes ({savedCatalogItems.length})
                </p>
                {savedCatalogItems.length === 0 && savedCustomPlans.length === 0 && (
                  <p className="text-xs text-stone-500 p-4 bg-[#F8F7F4] rounded-xl">
                    No routes saved yet. Select a curated route or generate a custom itinerary to build your trip brief.
                  </p>
                )}

                {savedCatalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F8F7F4] rounded-xl flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-stone-500">
                        {item.regionLabel} · {item.duration}
                      </p>
                      <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
                      <p className="text-xs text-stone-600">
                        Host: {item.localPartnerName} · Stay: {item.curatedStay.title}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-stone-900 font-medium pt-1">
                        ${item.referencePriceUsd} USD (Simulated Ref)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSaveItinerary(item.id)}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center text-stone-400 hover:text-red-700"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {savedCustomPlans.map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#F8F7F4] rounded-xl flex items-start justify-between gap-3 border border-[#1E3A5F]/30"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#1E3A5F] font-medium">
                        Personalised Route · {plan.days.length} Days
                      </p>
                      <h3 className="text-sm font-semibold text-stone-900">{plan.title}</h3>
                      <p className="text-xs text-stone-600">
                        Stay Area: {plan.recommendedStayArea}
                      </p>
                      <p className="text-xs font-mono text-stone-700">
                        Est. {plan.estimatedDailyBudgetUsd}/day (Simulated)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSavedCustomPlans((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center text-stone-400 hover:text-red-700"
                      aria-label="Remove custom plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Transparent Cost & Gratitude Breakdown */}
              {totalSavedCount > 0 && (
                <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-2.5 text-xs">
                  <p className="font-semibold text-stone-900">
                    Transparent Reference Pricing &amp; Host Gratitude
                  </p>
                  <div className="flex justify-between text-stone-600">
                    <span>Curated Experiences &amp; After-Hours Permits</span>
                    <span className="font-mono tabular-nums">${subtotalUsd} USD</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Platform Curation Commission (12%)</span>
                    <span className="font-mono tabular-nums">${commissionUsd} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 pt-1">
                    <span>Local Host Gratitude / Tip Pledge</span>
                    <div className="flex items-center gap-1">
                      {[0, 20, 30, 50].map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setGratitudeTipUsd(tip)}
                          className={`px-2 py-1 rounded font-mono text-[11px] ${
                            gratitudeTipUsd === tip
                              ? "bg-stone-900 text-white"
                              : "bg-white text-stone-700 border border-stone-200"
                          }`}
                        >
                          +${tip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-semibold text-stone-900">
                    <span>Total Reference Estimate</span>
                    <span className="font-mono tabular-nums">${grandTotalUsd} USD</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Note: All prices are clearly labeled simulated reference estimates for MVP validation. No live payment card is charged.
                  </p>
                </div>
              )}

              {/* Concierge Dispatch Form */}
              {bookingConfirmed ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-semibold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>After-Hours &amp; Local Host Hold Dispatched</span>
                  </div>
                  <p className="leading-relaxed">
                    Thank you, <strong>{travelerName}</strong>. Your weather-adaptive dossier ({totalSavedCount}{" "}
                    route{totalSavedCount === 1 ? "" : "s"}) for <strong>{travelMonth}</strong> has been assigned to our Kyoto &amp; Seoul partner desk.
                  </p>
                  <p className="leading-relaxed">
                    Your dedicated local coordinator will message you via{" "}
                    <strong>{preferredChannel}</strong> ({travelerContact}) to finalize private temple permits and host introductions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmTripHold} className="space-y-3.5">
                  <div>
                    <label htmlFor="hold-name" className="block text-xs font-medium text-stone-700 mb-1">
                      Lead Traveller Name
                    </label>
                    <input
                      id="hold-name"
                      type="text"
                      required
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      placeholder="e.g., Emily Lin"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hold-channel" className="block text-xs font-medium text-stone-700 mb-1">
                        Preferred Channel
                      </label>
                      <select
                        id="hold-channel"
                        value={preferredChannel}
                        onChange={(e) =>
                          setPreferredChannel(
                            e.target.value as "WhatsApp" | "WeChat" | "Telegram"
                          )
                        }
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl"
                      >
                        <option value="WhatsApp">WhatsApp Concierge</option>
                        <option value="WeChat">WeChat Concierge</option>
                        <option value="Telegram">Telegram Concierge</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="hold-contact" className="block text-xs font-medium text-stone-700 mb-1">
                        {preferredChannel} Number / ID
                      </label>
                      <input
                        id="hold-contact"
                        type="text"
                        required
                        value={travelerContact}
                        onChange={(e) => setTravelerContact(e.target.value)}
                        placeholder="+65 9123 4567 or ID"
                        className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="hold-month" className="block text-xs font-medium text-stone-700 mb-1">
                      Target Season / Travel Window
                    </label>
                    <select
                      id="hold-month"
                      value={travelMonth}
                      onChange={(e) => setTravelMonth(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl"
                    >
                      <option value="October–November 2026 (Autumn Momiji & Ginkgo Peak)">
                        Oct–Nov 2026 (Autumn Momiji &amp; Ginkgo Peak)
                      </option>
                      <option value="December 2026–February 2027 (Winter Snow Onsen)">
                        Dec 2026–Feb 2027 (Winter Snow Onsen)
                      </option>
                      <option value="March–April 2027 (Early Dawn Sakura Window)">
                        Mar–Apr 2027 (Early Dawn Sakura Window)
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] px-5 py-3 text-sm font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] transition-colors whitespace-nowrap"
                  >
                    Request Private After-Hours &amp; Host Hold
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
